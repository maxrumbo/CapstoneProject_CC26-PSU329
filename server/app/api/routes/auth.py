from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Menambahkan get_current_user ke baris import
from app.api.dependencies import get_db, get_current_user 
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.base import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Ambil data user yang sedang login",
)
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(data=UserResponse.model_validate(current_user))