from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.profile import ProfileResponse

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get(
    "",
    response_model=APIResponse[ProfileResponse],
    summary="Ambil profil user yang sedang login",
)
def get_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(data=ProfileResponse.model_validate(current_user))
