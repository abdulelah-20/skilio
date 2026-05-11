# Security Policy

## Authentication Model

Skilio uses a two-token authentication scheme:

| Token | Type | Lifetime | Storage |
|-------|------|----------|---------|
| Access token | JWT (HS256) | 30 minutes | Client memory / Authorization header |
| Refresh token | JWT (HS256) | 7 days | httpOnly cookie (`skilio_refresh`) |

### Password Hashing
- Passwords are hashed with **bcrypt** via `passlib[bcrypt]`.
- A dummy `verify_password` call is executed on unknown emails to prevent timing-based user enumeration.

### JWT Access Token
- Signed with HS256 using the `SECRET_KEY` environment variable (minimum 32 characters enforced at startup).
- Decoded on every protected request via `decode_access_token()`.
- Contains only the user's email as the subject claim.

### httpOnly Refresh Cookie
- Stored as `skilio_refresh` with `httponly=True`, `samesite="lax"`.
- `secure` flag is **`False` in the current config** — set to `True` before any HTTPS deployment. *(needs verification in production)*
- Path is scoped to `/api/auth` to prevent cookie leakage to other routes.

### Refresh Token Rotation and Reuse Detection
- Each `/api/auth/refresh` call revokes the old token and issues a new one (rotation).
- Refresh tokens are stored in the database as SHA-256 hashes (never plaintext).
- If a previously-revoked token is presented, **all refresh tokens for that user are immediately revoked** — this detects replay attacks and forces re-login.

---

## Child Ownership Guard

All child-scoped routes use the `get_owned_child` dependency, which filters by:

```sql
WHERE children.id = :child_id
  AND children.parent_id = :current_user_id
  AND children.is_active = TRUE
```

Returns HTTP **404** for both "not found" and "wrong owner" cases — prevents resource enumeration (no 403 leak).

The same pattern applies to `get_owned_attempt` (scenario attempts).

---

## Input Validation

| Boundary | Enforcement |
|----------|-------------|
| Email format | Pydantic `EmailStr` |
| Password length | `min_length=8` |
| Password complexity | Must contain at least one digit and one uppercase letter (validator in `UserCreate`) |
| Display name | `min_length=1`, `max_length=50`, blocked characters regex `[<>"';%()&]` |
| Child age | `ge=4`, `le=17` (validated server-side) |
| Request body size | 1 MB cap enforced by `limit_upload_size` middleware (returns 413) |

---

## Rate Limiting

In-memory per-IP sliding window (thread-safe):

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | 10 requests / minute |
| `POST /api/auth/register` | 5 requests / minute |

**Known limitation:** The rate limiter is in-process only — it resets on app restart and does not share state across multiple instances or pods. For production with horizontal scaling, replace with Redis-backed rate limiting. *(needs verification for multi-instance deployments)*

---

## CORS Policy

Origins are configured via the `ALLOWED_ORIGINS` environment variable (comma-separated). Default (development):

```
http://localhost:5173, http://localhost:3000
```

Production example:

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

`allow_credentials=True` is set — CORS origins must be explicit (no wildcard `*`) when credentials are included.

**Note:** Do not add a trailing slash to origins — `https://example.com/` will not match `https://example.com`.

---

## Database Security

- **SQLAlchemy ORM** with parameterized queries throughout — no raw SQL string interpolation.
- **Alembic** manages schema migrations; no DDL executed at runtime.
- All FKs use `ondelete="CASCADE"` or `ondelete="SET NULL"` — no orphaned records.
- Soft-delete pattern for children (`is_active=False`) preserves audit trail.

---

## OWASP Top 10 Mapping

| OWASP 2021 | Skilio Control |
|------------|---------------|
| A01 Broken Access Control | `get_owned_child` / `get_owned_attempt` ownership guards; 404 on wrong-owner |
| A02 Cryptographic Failures | bcrypt for passwords; HS256 JWT; SHA-256 refresh token hashes; httpOnly cookie |
| A03 Injection | SQLAlchemy ORM parameterized queries; Pydantic input validation |
| A04 Insecure Design | Ownership-first data model; child ID always validated against parent |
| A05 Security Misconfiguration | `SECRET_KEY` minimum length enforced; `DEBUG=false` in production; CORS explicit origins |
| A06 Vulnerable Components | `requirements.txt` pinned versions; run `pip-audit` before release |
| A07 Auth Failures | JWT expiry; refresh rotation + reuse detection; bcrypt timing-safe verify |
| A08 Software and Data Integrity | Alembic migration versions tracked; seed is idempotent |
| A09 Logging Failures | Request ID middleware; slow-request logging; startup DB health check |
| A10 SSRF | No outbound HTTP calls in backend *(needs verification if integrations are added)* |

---

## Dependency Audit Commands

```bash
# Check for known vulnerabilities in Python dependencies
pip install pip-audit
pip-audit -r requirements.txt

# Check for outdated packages
pip list --outdated
```

---

## Known Limitations

1. **Rate limiter is in-memory only** — does not survive restarts; not suitable for multi-instance deployments without Redis.
2. **`secure=False` on refresh cookie** — must be changed to `True` for HTTPS production deployments.
3. **No account lockout** — failed login attempts are only rate-limited per IP, not per account.
4. **Swagger UI (`/docs`) is publicly accessible** — consider disabling in production (`docs_url=None`).
5. **No email verification** — accounts are active immediately after registration.
6. **JWT secret shared** — access and refresh tokens use the same `SECRET_KEY`; consider separate secrets for higher-assurance deployments.

---

## Final Security Checklist (Pre-Production)

- [ ] `SECRET_KEY` replaced with a cryptographically random 64+ character value
- [ ] `DEBUG=false` confirmed in environment
- [ ] `ALLOWED_ORIGINS` set to the exact production frontend URL (no trailing slash)
- [ ] Refresh cookie `secure=True` enabled (requires HTTPS)
- [ ] `/docs` and `/redoc` disabled or protected (`docs_url=None, redoc_url=None`)
- [ ] `pip-audit -r requirements.txt` passes with no critical findings
- [ ] Database backups scheduled
- [ ] Alembic migrations tested on a production-equivalent DB before go-live
- [ ] CORS preflight tested from production frontend origin
- [ ] Rate limiter evaluated for production scale (Redis if multi-instance)
