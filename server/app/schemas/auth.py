from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, field_validator


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
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v


class ResetPasswordWithOtp(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v


class ChangePasswordWithOtp(BaseModel):
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v


