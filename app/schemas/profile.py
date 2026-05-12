from datetime import datetime
from pydantic import BaseModel


class ProfileResponse(BaseModel):
    display_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
