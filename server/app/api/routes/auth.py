from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Menambahkan get_current_user ke baris import
from app.api.dependencies import get_db, get_current_user
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.otp import OtpCode
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordWithOtp,
    OtpRequest,
    OtpRequestResponse,
    RegisterWithOtp,
    ResetPasswordWithOtp,
)
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.base import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_otp_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def create_otp(db: Session, email: str, purpose: str) -> tuple[str, datetime]:
    code = f"{secrets.randbelow(1_000_000):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    otp = OtpCode(
        email=email.lower(),
        purpose=purpose,
        code_hash=hash_otp_code(code),
        expires_at=expires_at,
    )
    db.add(otp)
    db.commit()
    return code, expires_at


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


def send_otp_email(email: str, code: str, purpose: str) -> None:
    # Stub dev: log to server console. Replace with real email provider.
    print(f"[OTP:{purpose}] {email} -> {code}")



@router.post(
    "/register",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Cek apakah email sudah dipakai
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return APIResponse(
        data=UserResponse.model_validate(user),
        message=f"Selamat datang, {user.display_name}! Akun berhasil dibuat.",
    )


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
    send_otp_email(email, code, payload.purpose)

    return APIResponse(
        data=OtpRequestResponse(
            expires_at=expires_at,
            otp_code=code if settings.OTP_DEV_MODE else None,
        ),
        message="OTP dikirim ke email.",
    )




@router.post(
    "/register-otp",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru dengan OTP",
)
def register_with_otp(payload: RegisterWithOtp, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    verify_otp(db, payload.email, "signup", payload.code)

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
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
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # "sub" di JWT berisi user_id (sebagai string — standar JWT)
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
    user = db.query(User).filter(User.email == payload.email).first()
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
    send_otp_email(current_user.email, code, "change_password")

    return APIResponse(
        data=OtpRequestResponse(
            expires_at=expires_at,
            otp_code=code if settings.OTP_DEV_MODE else None,
        ),
        message="OTP dikirim ke email.",
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