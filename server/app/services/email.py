import smtplib
from email.message import EmailMessage

from fastapi import HTTPException, status

from app.core.config import settings


def _smtp_ready() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def send_email(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str | None = None,
) -> None:
    if settings.OTP_DEV_MODE:
        print(f"[EMAIL:DEV] To: {to_email}\nSubject: {subject}\n{text_body}")
        return

    if not _smtp_ready():

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi SMTP belum lengkap",
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message.set_content(text_body)

    if html_body:
        message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=20,
        ) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal mengirim email. Coba lagi nanti.",
        ) from exc


def send_otp_email(email: str, code: str, purpose: str) -> None:
    purpose_label = {
        "reset_password": "reset password",
        "change_password": "ganti password",
        "signup": "pendaftaran",
    }.get(purpose, purpose)
    subject = f"Kode OTP SAWIT untuk {purpose_label}"
    text_body = (
        f"Kode OTP SAWIT kamu adalah {code}.\n\n"
        f"Kode ini berlaku selama {settings.OTP_EXPIRE_MINUTES} menit."
    )
    html_body = (
        "<p>Kode OTP SAWIT kamu adalah:</p>"
        f"<h2>{code}</h2>"
        f"<p>Kode ini berlaku selama {settings.OTP_EXPIRE_MINUTES} menit.</p>"
    )
    send_email(email, subject, text_body, html_body)


def send_verification_email(
    email: str,
    display_name: str,
    verification_link: str,
) -> None:
    subject = "Verifikasi email SAWIT"
    text_body = (
        f"Halo {display_name},\n\n"
        "Klik link berikut untuk verifikasi email dan langsung masuk ke dashboard SAWIT:\n"
        f"{verification_link}\n\n"
        f"Link ini berlaku selama {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} menit."
    )
    html_body = (
        f"<p>Halo {display_name},</p>"
        "<p>Klik tombol berikut untuk verifikasi email dan langsung masuk ke dashboard SAWIT.</p>"
        f'<p><a href="{verification_link}">Verifikasi email</a></p>'
        f"<p>Link ini berlaku selama {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} menit.</p>"
    )
    send_email(email, subject, text_body, html_body)
