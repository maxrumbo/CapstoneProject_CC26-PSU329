import smtplib
import logging
from email.message import EmailMessage
from typing import Optional

from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


def _smtp_ready() -> bool:
    """Check if SMTP configuration is complete."""
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def _is_dev_mode() -> bool:
    """Check if running in development mode."""
    # Handle various truthy values for OTP_DEV_MODE
    if isinstance(settings.OTP_DEV_MODE, bool):
        return settings.OTP_DEV_MODE
    if isinstance(settings.OTP_DEV_MODE, str):
        return settings.OTP_DEV_MODE.lower() in ('true', '1', 'yes', 'on')
    return False


def send_email(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: Optional[str] = None,
) -> None:
    """
    Send email via SMTP or print to console in dev mode.
    
    In dev mode (OTP_DEV_MODE=true), emails are printed to console.
    In production, emails are sent via SMTP.
    """
    # Priority 1: Check dev mode first
    if _is_dev_mode():
        logger.info(f"[EMAIL:DEV] To: {to_email}")
        logger.info(f"[EMAIL:DEV] Subject: {subject}")
        logger.info(f"[EMAIL:DEV] Body:\n{text_body}")
        if html_body:
            logger.debug(f"[EMAIL:DEV] HTML Body:\n{html_body}")
        return

    # Priority 2: Check if SMTP is configured
    if not _smtp_ready():
        logger.error("SMTP configuration incomplete")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi SMTP belum lengkap",
        )

    # Priority 3: Try to send via SMTP with better error handling
    try:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message.set_content(text_body)

        if html_body:
            message.add_alternative(html_body, subtype="html")

        # Attempt SMTP connection with timeout
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=20,
        ) as server:
            # Enable TLS if configured
            if settings.SMTP_USE_TLS:
                server.starttls()
            
            # Authenticate if credentials provided
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            
            # Send the message
            server.send_message(message)
            logger.info(f"Email sent successfully to {to_email}")

    except smtplib.SMTPAuthenticationError as exc:
        logger.error(f"SMTP authentication failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal autentikasi SMTP. Periksa kredensial email.",
        ) from exc
    except smtplib.SMTPException as exc:
        logger.error(f"SMTP error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal mengirim email via SMTP. Coba lagi nanti.",
        ) from exc
    except OSError as exc:
        logger.error(f"Network error connecting to SMTP: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal terhubung ke server email. Periksa konfigurasi SMTP.",
        ) from exc
    except Exception as exc:
        logger.error(f"Unexpected error sending email: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal mengirim email. Coba lagi nanti.",
        ) from exc


def send_otp_email(email: str, code: str, purpose: str) -> None:
    """Send OTP code via email."""
    purpose_label = {
        "reset_password": "reset password",
        "change_password": "ganti password",
        "signup": "pendaftaran",
    }.get(purpose, purpose)
    
    subject = f"Kode OTP SAWIT untuk {purpose_label}"
    text_body = (
        f"Kode OTP SAWIT kamu adalah {code}.\n\n"
        f"Kode ini berlaku selama {settings.OTP_EXPIRE_MINUTES} menit.\n\n"
        "Jangan bagikan kode ini kepada siapa pun."
    )
    html_body = (
        "<p>Kode OTP SAWIT kamu adalah:</p>"
        f"<h2 style='font-size: 32px; letter-spacing: 2px;'>{code}</h2>"
        f"<p>Kode ini berlaku selama {settings.OTP_EXPIRE_MINUTES} menit.</p>"
        "<p><strong>Jangan bagikan kode ini kepada siapa pun.</strong></p>"
    )
    send_email(email, subject, text_body, html_body)


def send_verification_email(
    email: str,
    display_name: str,
    verification_link: str,
) -> None:
    """Send email verification link."""
    subject = "Verifikasi email SAWIT"
    text_body = (
        f"Halo {display_name},\n\n"
        "Klik link berikut untuk verifikasi email dan langsung masuk ke dashboard SAWIT:\n"
        f"{verification_link}\n\n"
        f"Link ini berlaku selama {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} menit.\n\n"
        "Jika Anda tidak membuat akun ini, abaikan email ini."
    )
    html_body = (
        f"<p>Halo {display_name},</p>"
        "<p>Klik tombol berikut untuk verifikasi email dan langsung masuk ke dashboard SAWIT.</p>"
        f'<p><a href="{verification_link}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verifikasi Email</a></p>'
        f"<p>Link ini berlaku selama {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} menit.</p>"
        "<p>Jika Anda tidak membuat akun ini, abaikan email ini.</p>"
    )
    send_email(email, subject, text_body, html_body)

