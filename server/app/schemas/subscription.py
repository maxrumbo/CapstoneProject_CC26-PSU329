from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_BILLING_CYCLES = {"daily", "weekly", "monthly", "yearly"}


class SubscriptionBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0)
    billing_cycle: str = Field(default="monthly")
    next_billing_date: date

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Nama subscription tidak boleh kosong")
        return value

    @field_validator("billing_cycle")
    @classmethod
    def billing_cycle_supported(cls, value: str) -> str:
        normalized_value = value.strip().lower()
        if normalized_value not in VALID_BILLING_CYCLES:
            raise ValueError("Siklus pembayaran tidak valid")
        return normalized_value


class SubscriptionCreate(SubscriptionBase):
    model_config = ConfigDict(populate_by_name=True)


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(default=None, gt=0)
    billing_cycle: Optional[str] = None
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

    @field_validator("billing_cycle")
    @classmethod
    def billing_cycle_supported(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized_value = value.strip().lower()
        if normalized_value not in VALID_BILLING_CYCLES:
            raise ValueError("Siklus pembayaran tidak valid")
        return normalized_value


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
