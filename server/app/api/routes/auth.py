from datetime import datetime, timedelta, timezone
import hashlib
import logging
import secrets
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.otp import OtpCode
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordWithOtp,
    OtpRequest,
    OtpRequestResponse,
    RegisterWithOtp,
    ResendVerificationRequest,
    ResetPasswordWithOtp,
)
from app.schemas.base import APIResponse
from app.schemas.user import TokenResponse, UserLogin, UserRegister, UserResponse
from app.services.email import send_otp_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


def hash_otp_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def mark_existing_codes_consumed(db: Session, email: str, purpose: str) -> None:
    now = datetime.now(timezone.utc)
    (
        db.query(OtpCode)
        .filter(
            OtpCode.email == email.lower(),
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .update({"consumed_at": now}, synchronize_session=False)
    )


def create_otp(db: Session, email: str, purpose: str) -> tuple[str, datetime]:
    code = f"{secrets.randbelow(1_000_000):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )
    mark_existing_codes_consumed(db, email, purpose)
    otp = OtpCode(
        email=email.lower(),
        purpose=purpose,
        code_hash=hash_otp_code(code),
        expires_at=expires_at,
    )
    db.add(otp)
    db.commit()
    return code, expires_at


def create_email_verification_token(db: Session, email: str) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
    )
    mark_existing_codes_consumed(db, email, "email_verification")
    verification = OtpCode(
        email=email.lower(),
        purpose="email_verification",
        code_hash=hash_otp_code(token),
        expires_at=expires_at,
    )
    db.add(verification)
    db.commit()
    return token, expires_at


def build_verification_link(request: Request, token: str) -> str:
    return f"{request.url_for('verify_email')}?token={quote(token)}"


def send_user_verification_email(request: Request, db: Session, user: User) -> None:
    token, _ = create_email_verification_token(db, user.email)
    verification_link = build_verification_link(request, token)
    send_verification_email(user.email, user.display_name, verification_link)


def send_verification_or_auto_verify(
    request: Request,
    db: Session,
    user: User,
) -> tuple[bool, str]:
    try:
        send_user_verification_email(request, db, user)
        return True, "Cek email untuk verifikasi akun."
    except HTTPException as exc:
        if settings.EMAIL_DELIVERY_REQUIRED:
            raise

        logger.warning(
            "Email verification delivery failed for %s; auto-verifying because "
            "EMAIL_DELIVERY_REQUIRED=false. Detail: %s",
            user.email,
            exc.detail,
        )
        user.email_verified_at = datetime.now(timezone.utc)
        mark_existing_codes_consumed(db, user.email, "email_verification")
        db.commit()
        db.refresh(user)
        return False, (
            "Layanan email sedang tidak tersedia. Akun otomatis diverifikasi "
            "untuk sementara."
        )


def send_otp_or_return_fallback(email: str, code: str, purpose: str) -> tuple[bool, str]:
    try:
        send_otp_email(email, code, purpose)
        return True, "OTP dikirim ke email."
    except HTTPException as exc:
        if settings.EMAIL_DELIVERY_REQUIRED:
            raise

        logger.warning(
            "OTP delivery failed for %s; returning fallback code because "
            "EMAIL_DELIVERY_REQUIRED=false. Detail: %s",
            email,
            exc.detail,
        )
        return False, (
            "Layanan email sedang tidak tersedia. Gunakan kode OTP dari response ini."
        )


def verify_otp(db: Session, email: str, purpose: str, code: str) -> None:
    now = datetime.now(timezone.utc)
    otp = (
        db.query(OtpCode)
        .filter(
            OtpCode.email == email.lower(),
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
            OtpCode.expires_at > now,
        )
        .order_by(OtpCode.created_at.desc())
        .first()
    )

    if not otp or otp.code_hash != hash_otp_code(code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode OTP tidak valid atau kedaluwarsa",
        )

    otp.consumed_at = now
    db.commit()


@router.post(
    "/register",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru",
)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        if existing.email_verified_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email sudah terdaftar",
            )

        existing.hashed_password = hash_password(payload.password)
        existing.display_name = payload.display_name
        
        if settings.OTP_DEV_MODE:
            existing.email_verified_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            return APIResponse(
                data=UserResponse.model_validate(existing),
                message="Registrasi diperbarui. Akun otomatis terverifikasi (Dev Mode).",
            )
            
        db.commit()
        db.refresh(existing)
        email_sent, verification_message = send_verification_or_auto_verify(
            request,
            db,
            existing,
        )

        return APIResponse(
            data=UserResponse.model_validate(existing),
            message=(
                "Registrasi diperbarui. "
                + (
                    "Link verifikasi baru dikirim ke email."
                    if email_sent
                    else verification_message
                )
            ),
        )

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
    )
    
    if settings.OTP_DEV_MODE:
        user.email_verified_at = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        db.refresh(user)
        return APIResponse(
            data=UserResponse.model_validate(user),
            message="Registrasi berhasil. Akun otomatis terverifikasi (Dev Mode).",
        )

    db.add(user)
    db.commit()
    db.refresh(user)

    email_sent, verification_message = send_verification_or_auto_verify(
        request,
        db,
        user,
    )

    return APIResponse(
        data=UserResponse.model_validate(user),
        message=(
            "Registrasi berhasil. "
            + (
                "Cek email untuk verifikasi akun."
                if email_sent
                else verification_message
            )
        ),
    )


@router.post(
    "/resend-verification",
    response_model=APIResponse[None],
    summary="Kirim ulang link verifikasi email",
)
def resend_verification(
    payload: ResendVerificationRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email tidak ditemukan",
        )

    if user.email_verified_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah diverifikasi",
        )

    email_sent, verification_message = send_verification_or_auto_verify(
        request,
        db,
        user,
    )
    return APIResponse(
        message=(
            "Link verifikasi dikirim ulang ke email."
            if email_sent
            else verification_message
        )
    )


@router.get(
    "/verify-email",
    summary="Verifikasi email dan redirect ke frontend dengan token login",
)
def verify_email(token: str, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    verification = (
        db.query(OtpCode)
        .filter(
            OtpCode.purpose == "email_verification",
            OtpCode.code_hash == hash_otp_code(token),
            OtpCode.consumed_at.is_(None),
            OtpCode.expires_at > now,
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link verifikasi tidak valid atau kedaluwarsa",
        )

    user = db.query(User).filter(User.email == verification.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User untuk link verifikasi tidak ditemukan",
        )

    if user.email_verified_at is None:
        user.email_verified_at = now
    verification.consumed_at = now
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    redirect_url = (
        f"{settings.FRONTEND_VERIFY_EMAIL_URL}"
        f"#access_token={quote(access_token)}&token_type=bearer"
    )
    return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)


@router.post(
    "/request-otp",
    response_model=APIResponse[OtpRequestResponse],
    summary="Kirim OTP untuk signup atau reset password",
)
def request_otp(payload: OtpRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(User).filter(User.email == email).first()

    if payload.purpose == "signup" and existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    if payload.purpose == "reset_password" and not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email tidak ditemukan",
        )

    code, expires_at = create_otp(db, email, payload.purpose)
    email_sent, otp_message = send_otp_or_return_fallback(
        email,
        code,
        payload.purpose,
    )

    return APIResponse(
        data=OtpRequestResponse(
            expires_at=expires_at,
            otp_code=code if settings.OTP_DEV_MODE or not email_sent else None,
        ),
        message=otp_message,
    )


@router.post(
    "/register-otp",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru dengan OTP (deprecated)",
)
def register_with_otp(payload: RegisterWithOtp, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    verify_otp(db, email, "signup", payload.code)

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
        email_verified_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return APIResponse(
        data=UserResponse.model_validate(user),
        message=f"Selamat datang, {user.display_name}! Akun berhasil dibuat.",
    )


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="Login dan dapatkan JWT token",
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email belum diverifikasi. Cek email untuk link verifikasi.",
        )

    token = create_access_token(data={"sub": str(user.id)})

    return APIResponse(
        data=TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        ),
        message="Login berhasil",
    )


@router.post(
    "/reset-password",
    response_model=APIResponse[None],
    summary="Reset password dengan OTP",
)
def reset_password(payload: ResetPasswordWithOtp, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email tidak ditemukan",
        )

    verify_otp(db, payload.email, "reset_password", payload.code)
    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return APIResponse(message="Password berhasil diperbarui.")


@router.post(
    "/profile/request-otp",
    response_model=APIResponse[OtpRequestResponse],
    summary="Kirim OTP untuk ganti password dari profil",
)
def request_profile_otp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    code, expires_at = create_otp(db, current_user.email, "change_password")
    email_sent, otp_message = send_otp_or_return_fallback(
        current_user.email,
        code,
        "change_password",
    )

    return APIResponse(
        data=OtpRequestResponse(
            expires_at=expires_at,
            otp_code=code if settings.OTP_DEV_MODE or not email_sent else None,
        ),
        message=otp_message,
    )


@router.post(
    "/profile/change-password",
    response_model=APIResponse[None],
    summary="Ganti password dari profil dengan OTP",
)
def change_password_with_otp(
    payload: ChangePasswordWithOtp,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_otp(db, current_user.email, "change_password", payload.code)
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return APIResponse(message="Password berhasil diperbarui.")


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Ambil data user yang sedang login",
)
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(data=UserResponse.model_validate(current_user))
