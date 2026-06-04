from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, field_validator, model_validator

from app.models.transaction import (
    INCOME_CATEGORY,
    TransactionType,
)

APP_TIMEZONE = ZoneInfo("Asia/Jakarta")


class TransactionCreate(BaseModel):
    description: str
    amount: Decimal
    type: TransactionType
    category: Optional[str] = None
    method: Optional[str] = None
    date: date

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Deskripsi tidak boleh kosong")
        if len(v) > 255:
            raise ValueError("Deskripsi maksimal 255 karakter")
        return v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Nominal harus lebih dari 0")
        return v

    @field_validator("date")
    @classmethod
    def date_not_future(cls, v: date) -> date:
        today = datetime.now(APP_TIMEZONE).date()
        if v > today:
            raise ValueError("Tanggal tidak boleh di masa depan")
        return v

    @field_validator("category")
    @classmethod
    def normalize_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None

        v = v.strip()
        return v or None

    @model_validator(mode="after")
    def validate_category_logic(self) -> "TransactionCreate":
        if self.type == TransactionType.income:
            if not self.category:
                self.category = INCOME_CATEGORY
            if self.category != INCOME_CATEGORY:
                raise ValueError("Transaksi income harus menggunakan kategori 'Pemasukan'")
            return self

        self.category = None

        return self


class TransactionCategoryPredictionRequest(BaseModel):
    description: str

    @field_validator("description")
    @classmethod
    def prediction_description_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Deskripsi tidak boleh kosong")
        if len(v) > 255:
            raise ValueError("Deskripsi maksimal 255 karakter")
        return v


class TransactionCategoryPredictionResponse(BaseModel):
    category: str
    confidence: float
    model_label: str


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount: Decimal
    type: TransactionType
    category: Optional[str]
    method: Optional[str]
    date: date
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BalanceSummaryResponse(BaseModel):
    user_id: int
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal          # income - expense (bisa negatif = deficit)
    as_of_date: Optional[date]  # None = semua data, ada = filter sampai tanggal ini
