from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProfileResponse(BaseModel):
    display_name: str
    email:        str
    photo_url:    Optional[str] = None
    created_at:   datetime

    model_config = {"from_attributes": True}


class ProfilePhotoUpdate(BaseModel):
    photo_url: Optional[str] = Field(default=None, max_length=2_500_000)

    @field_validator("photo_url")
    @classmethod
    def photo_url_must_be_image_data_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None

        if not value.startswith("data:image/"):
            raise ValueError("Foto profil harus berupa data URL gambar")

        return value
