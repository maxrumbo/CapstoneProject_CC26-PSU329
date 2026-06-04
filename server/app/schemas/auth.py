from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.password import validate_password_strength


OtpPurpose = Literal["signup", "reset_password", "change_password"]


class OtpRequest(BaseModel):
    email: EmailStr
    purpose: OtpPurpose


class OtpRequestResponse(BaseModel):
    expires_at: datetime
    otp_code: Optional[str] = None




class RegisterWithOtp(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    code: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


class ResetPasswordWithOtp(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


class ChangePasswordWithOtp(BaseModel):
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


