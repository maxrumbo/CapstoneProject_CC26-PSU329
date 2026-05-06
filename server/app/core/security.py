from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings

# Inisialisasi CryptContext dengan pbkdf2_sha256 sebagai primary scheme (stable)
# bcrypt sebagai deprecated untuk backward compatibility
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="bcrypt",
    pbkdf2_sha256__default_rounds=29000,
)

# Konstanta maksimal byte untuk extra safety
BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """
    Hash password menggunakan pbkdf2_sha256 (stable, tanpa 72-byte limitation).
    
    Args:
        password: Plain text password dari user
        
    Returns:
        Hashed password string yang siap disimpan ke database
    """
    # Truncate ke 500 karakter (reasonable limit) untuk security
    safe_password = password[:500]
    return pwd_context.hash(safe_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password terhadap hashed password.
    
    Args:
        plain_password: Password plain dari user input
        hashed_password: Hashed password dari database
        
    Returns:
        Boolean: True jika password match, False jika tidak
    """
    # Truncate ke 500 karakter (reasonable limit) untuk security
    safe_password = plain_password[:500]
    return pwd_context.verify(safe_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Buat JWT access token dengan expiration time.
    
    Args:
        data: Payload data untuk encode ke token
        expires_delta: Custom expiration time delta, jika tidak ada gunakan default
        
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode dan validasi JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload dictionary
        
    Raises:
        HTTPException: Jika token tidak valid atau expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid",
            headers={"WWW-Authenticate": "Bearer"},
        )   