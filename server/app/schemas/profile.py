from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProfileResponse(BaseModel):
    display_name: str
    email:        str
    photo_url:    Optional[str] = None
    created_at:   datetime

    model_config = {"from_attributes": True}


_ALLOWED_IMAGE_TYPES = {"png", "jpeg", "webp"}
# 1.5 MB original → ~2 097 152 base64 chars + small prefix overhead
_MAX_DATA_URL_LENGTH = 2_100_000


class ProfilePhotoUpdate(BaseModel):
    photo_url: Optional[str] = Field(default=None, max_length=_MAX_DATA_URL_LENGTH)

    @field_validator("photo_url")
    @classmethod
    def photo_url_must_be_image_data_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None

        valid_prefixes = [f"data:image/{t};base64," for t in _ALLOWED_IMAGE_TYPES]
        if not any(value.startswith(prefix) for prefix in valid_prefixes):
            raise ValueError(
                "Foto profil harus berupa data URL gambar dengan format "
                "data:image/<png|jpeg|webp>;base64,<data>"
            )

        return value
