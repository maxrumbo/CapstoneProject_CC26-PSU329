from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, field_validator, model_validator

from app.models.transaction import VALID_CATEGORIES, TransactionType


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
        from datetime import date as date_type
        if v > date_type.today():
            raise ValueError("Tanggal tidak boleh di masa depan")
        return v

    @model_validator(mode="after")
    def validate_category_logic(self) -> "TransactionCreate":
        # 1. Pastikan kategori selalu diisi (baik income maupun expense)
        if not self.category:
            raise ValueError("Kategori wajib diisi")
            
        # 2. Pastikan kategori ada di list VALID_CATEGORIES
        if self.category not in VALID_CATEGORIES:
            raise ValueError(
                f"Kategori tidak valid. Pilihan: {', '.join(VALID_CATEGORIES)}"
            )
            
        # 3. Validasi silang tipe dan kategori (Biar datanya rapi)
        if self.type == TransactionType.income and self.category != "Pemasukan":
            raise ValueError("Transaksi income harus menggunakan kategori 'Pemasukan'")
            
        if self.type == TransactionType.expense and self.category == "Pemasukan":
            raise ValueError("Transaksi expense tidak boleh menggunakan kategori 'Pemasukan'")
            
        return self


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
