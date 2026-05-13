from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.base import APIResponse

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileResponse(BaseModel):
    display_name: str
    email:        str
    created_at:   datetime

    model_config = {"from_attributes": True}


@router.get(
    "",
    response_model=APIResponse[ProfileResponse],
    summary="Ambil profil user yang sedang login",
)
def get_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(data=ProfileResponse.model_validate(current_user))
