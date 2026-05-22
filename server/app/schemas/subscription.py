from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SubscriptionBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0)
    next_billing_date: date

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Nama subscription tidak boleh kosong")
        return value


class SubscriptionCreate(SubscriptionBase):
    model_config = ConfigDict(populate_by_name=True)


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(default=None, gt=0)
    next_billing_date: Optional[date] = None

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Nama subscription tidak boleh kosong")
        return value


class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionSummaryResponse(BaseModel):
    user_id: int
    total_cost: Decimal

    model_config = ConfigDict(from_attributes=True)
