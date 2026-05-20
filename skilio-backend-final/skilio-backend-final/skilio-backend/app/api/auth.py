"""
app/api/auth.py
───────────────
Authentication endpoints with:
  - bcrypt timing-safe login (dummy verify on unknown email)
  - JWT access token (30 min, memory-only on client)
  - JWT refresh token (7 days, httpOnly cookie, SHA-256 hashed in DB)
  - Single-use token rotation with reuse detection
  - In-memory rate limiting (10 logins/min, 5 registrations/min per IP)
"""
import secrets
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from threading import Lock

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import get_db, get_current_user
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password
from app.models.password_reset import PasswordResetToken
from app.models.token import RefreshToken
from app.schemas.user import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserResponse,
)
from app.services.email_service import send_password_reset_email

router = APIRouter()
settings = get_settings()

COOKIE = "skilio_refresh"
COOKIE_OPTS = dict(
    httponly=True,
    secure=not settings.debug,   # True in production (HTTPS), False in local dev
    samesite="lax",
    max_age=settings.refresh_token_expire_days * 86400,
    path="/api/auth",
)

# ── Simple in-memory rate limiter ─────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
_rate_lock = Lock()

def _check_rate(key: str, max_per_minute: int) -> None:
    now = time.time()
    window_start = now - 60
    with _rate_lock:
        hits = _rate_store[key]
        # Purge old entries
        _rate_store[key] = [t for t in hits if t > window_start]
        if len(_rate_store[key]) >= max_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in 1 minute.",
                headers={"Retry-After": "60"},
            )
        _rate_store[key].append(now)


def _client_ip(request: Request) -> str:
    """Extract client IP, respecting X-Forwarded-For if behind a proxy."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new parent account",
)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    _check_rate(f"register:{_client_ip(request)}", settings.register_rate_limit_per_minute)
    from app.services.auth_service import create_user, get_user_by_email
    if get_user_by_email(db, user_in.email):
        raise HTTPException(409, "An account with this email already exists")
    return create_user(db, user_in)


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Send a password reset email",
)
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    _check_rate(f"forgot-password:{_client_ip(request)}", 5)
    from app.services.auth_service import get_user_by_email

    generic = ForgotPasswordResponse(
        message="If that email is registered, we sent a password reset link.",
    )
    user = get_user_by_email(db, payload.email.lower())
    if not user or not user.is_active:
        return generic

    db.query(PasswordResetToken).filter_by(user_id=user.id, used=False).update({"used": True})
    raw_token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.password_reset_token_expire_minutes)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=PasswordResetToken.hash_token(raw_token),
            expires_at=expires,
        )
    )
    db.commit()

    reset_url = f"{settings.frontend_url.rstrip('/')}/reset-password?token={raw_token}"
    send_password_reset_email(user.email, reset_url)
    return generic


@router.post(
    "/reset-password",
    response_model=ForgotPasswordResponse,
    summary="Reset password with an emailed token",
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = PasswordResetToken.hash_token(payload.token)
    stored = (
        db.query(PasswordResetToken)
        .filter_by(token_hash=token_hash, used=False)
        .first()
    )
    now = datetime.now(timezone.utc)
    if not stored or _as_utc(stored.expires_at) < now:
        raise HTTPException(400, "Reset link is invalid or has expired")

    user = stored.user
    if not user or not user.is_active:
        raise HTTPException(400, "Reset link is invalid or has expired")

    user.hashed_password = hash_password(payload.password)
    stored.used = True
    db.query(PasswordResetToken).filter_by(user_id=user.id, used=False).update({"used": True})
    db.query(RefreshToken).filter_by(user_id=user.id).update({"revoked": True})
    db.commit()
    return ForgotPasswordResponse(message="Password updated. You can sign in with your new password.")


@router.post(
    "/login",
    response_model=Token,
    summary="Login and receive JWT tokens",
)
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    _check_rate(f"login:{_client_ip(request)}", settings.login_rate_limit_per_minute)
    from app.services.auth_service import authenticate_user
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(403, "Account is deactivated")
    access  = create_access_token(subject=user.email)
    refresh = create_refresh_token(subject=user.email)
    expires = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db.add(RefreshToken(user_id=user.id, token_hash=RefreshToken.hash_token(refresh), expires_at=expires))
    db.commit()
    response.set_cookie(COOKIE, refresh, **COOKIE_OPTS)
    return Token(access_token=access, token_type="bearer")


@router.post(
    "/refresh",
    response_model=Token,
    summary="Rotate refresh token and issue new access token",
)
def refresh_token(
    response: Response,
    db: Session = Depends(get_db),
    skilio_refresh: str | None = Cookie(default=None),
):
    if not skilio_refresh:
        raise HTTPException(401, "No refresh token provided")
    try:
        payload = decode_token(skilio_refresh)
        if payload.get("type") != "refresh":
            raise ValueError("wrong token type")
        email: str = payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid or expired refresh token")

    stored = (
        db.query(RefreshToken)
        .filter_by(token_hash=RefreshToken.hash_token(skilio_refresh), revoked=False)
        .first()
    )
    if not stored:
        # Token already used or revoked — possible replay attack. Wipe ALL tokens.
        from app.services.auth_service import get_user_by_email
        user = get_user_by_email(db, email)
        if user:
            db.query(RefreshToken).filter_by(user_id=user.id).update({"revoked": True})
            db.commit()
        raise HTTPException(401, "Refresh token already used or revoked. Please log in again.")

    # Rotate: revoke old, issue new
    stored.revoked = True
    db.flush()
    new_access  = create_access_token(subject=email)
    new_refresh = create_refresh_token(subject=email)
    expires = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db.add(RefreshToken(user_id=stored.user_id, token_hash=RefreshToken.hash_token(new_refresh), expires_at=expires))
    db.commit()
    response.set_cookie(COOKIE, new_refresh, **COOKIE_OPTS)
    return Token(access_token=new_access, token_type="bearer")


@router.post("/logout", status_code=204, summary="Logout and revoke refresh token")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    skilio_refresh: str | None = Cookie(default=None),
):
    if skilio_refresh:
        stored = db.query(RefreshToken).filter_by(token_hash=RefreshToken.hash_token(skilio_refresh)).first()
        if stored:
            stored.revoked = True
            db.commit()
    response.delete_cookie(COOKIE, path="/api/auth")


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
def read_me(current_user=Depends(get_current_user)):
    return current_user
