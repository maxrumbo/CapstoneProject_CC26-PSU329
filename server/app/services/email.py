import logging
from typing import Optional

import requests
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_dev_mode() -> bool:
    """Check if running in development mode."""
    if isinstance(settings.OTP_DEV_MODE, bool):
        return settings.OTP_DEV_MODE
    if isinstance(settings.OTP_DEV_MODE, str):
        return settings.OTP_DEV_MODE.lower() in ("true", "1", "yes", "on")
    return False


def _apps_script_ready() -> bool:
    return bool(settings.APPS_SCRIPT_EMAIL_WEBHOOK_URL and settings.APPS_SCRIPT_EMAIL_SECRET)


def send_email(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: Optional[str] = None,
) -> None:
    """Send email through Google Apps Script, or log it in dev mode."""
    if _is_dev_mode():
        logger.info("[EMAIL:DEV] To: %s", to_email)
        logger.info("[EMAIL:DEV] Subject: %s", subject)
        logger.info("[EMAIL:DEV] Body:\n%s", text_body)
        if html_body:
            logger.debug("[EMAIL:DEV] HTML Body:\n%s", html_body)
        return

    if settings.EMAIL_PROVIDER.strip().lower() != "apps_script":
        logger.error("Unsupported EMAIL_PROVIDER: %s", settings.EMAIL_PROVIDER)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi provider email tidak dikenali.",
        )

    if not _apps_script_ready():
        logger.error("Google Apps Script email configuration incomplete")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi Google Apps Script email belum lengkap",
        )

    payload = {
        "secret": settings.APPS_SCRIPT_EMAIL_SECRET,
        "to": to_email,
        "subject": subject,
        "text": text_body,
        "html": html_body or "",
        "fromName": settings.EMAIL_FROM_NAME,
    }

    try:
        response = requests.post(
            settings.APPS_SCRIPT_EMAIL_WEBHOOK_URL,
            json=payload,
            timeout=20,
        )
    except requests.Timeout as exc:
        logger.error("Timeout connecting to Google Apps Script email webhook: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Koneksi ke layanan email timeout. Coba lagi nanti.",
        ) from exc
    except requests.RequestException as exc:
        logger.error("Network error connecting to Google Apps Script email webhook: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal terhubung ke layanan email. Periksa konfigurasi Apps Script.",
        ) from exc

    response_body = _parse_apps_script_response(response)
    if response.status_code >= 400 or not response_body.get("success"):
        detail = response_body.get("error") or response.text[:200] or f"HTTP {response.status_code}"
        logger.error("Google Apps Script email error: %s", detail)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gagal mengirim email via Google Apps Script: {detail}",
        )

    logger.info(
        "Email sent successfully via Google Apps Script to %s. Remaining quota: %s",
        to_email,
        response_body.get("remainingQuota", "unknown"),
    )


def _parse_apps_script_response(response: requests.Response) -> dict:
    try:
        body = response.json()
    except ValueError:
        return {"success": False, "error": response.text[:200]}

    if isinstance(body, dict):
        return body
    return {"success": False, "error": "Response layanan email tidak valid"}


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
