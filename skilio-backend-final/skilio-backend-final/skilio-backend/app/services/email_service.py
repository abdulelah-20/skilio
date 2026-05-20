"""
Small SMTP email adapter.

In development without SMTP_HOST, messages are printed to the backend log so the
password-reset flow remains testable without a third-party email provider.
"""

import logging
from email.message import EmailMessage
import smtplib

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_url: str) -> None:
    settings = get_settings()
    subject = "Reset your Skilio password"
    text = (
        "We received a request to reset your Skilio password.\n\n"
        f"Open this secure link within {settings.password_reset_token_expire_minutes} minutes:\n"
        f"{reset_url}\n\n"
        "If you did not request this, you can ignore this email."
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1035">
      <h2>Reset your Skilio password</h2>
      <p>We received a request to reset your Skilio password.</p>
      <p>
        <a href="{reset_url}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7c3aed;color:white;text-decoration:none;font-weight:700">
          Reset password
        </a>
      </p>
      <p>This link expires in {settings.password_reset_token_expire_minutes} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
    """

    if not settings.smtp_host:
        print("\n  [DEV EMAIL] Password reset email")
        print(f"  To: {to_email}")
        print(f"  Reset URL: {reset_url}\n")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(msg)
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", to_email, exc)
        # Swallow the exception so the caller can still return a success response —
        # the reset token is already saved; the user can request again.
        return
