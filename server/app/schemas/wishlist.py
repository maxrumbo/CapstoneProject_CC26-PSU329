"""
Naming convention:
  - Python / DB  → snake_case  (item_name, target_price, …)
  - JSON / FE    → camelCase   (itemName, targetPrice, …)

Semua WishlistResponse field di-alias ke camelCase agar konsisten
dengan ekspektasi tim Frontend. `populate_by_name=True` memungkinkan
kode Python internal tetap pakai snake_case.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class WishlistCreate(BaseModel):
    """
    Payload yang dikirim FE saat user menekan "Simpan Wishlist".
    FE mengirim camelCase → kita terima dengan alias.
    """

    item_name: str = Field(
        alias="itemName",
        min_length=1,
        max_length=255,
        description="Nama barang yang ingin dibeli",
    )
    target_price: Decimal = Field(
        alias="targetPrice",
        gt=0,
        description="Harga target dalam Rupiah",
    )
    target_months: int = Field(
        alias="targetMonths",
        gt=0,
        description="Jumlah bulan untuk mencapai target",
    )

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("item_name", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nama barang tidak boleh kosong")
        return v


class WishlistProgressUpdate(BaseModel):
    """
    Payload update progress: jumlah yang sudah berhasil ditabung.
    Nilai ini adalah TOTAL tabungan kumulatif (bukan tambahan).
    """

    progress_amount: Decimal = Field(
        alias="progressAmount",
        ge=0,
        description="Total jumlah yang sudah ditabung (kumulatif)",
    )
    model_config = ConfigDict(populate_by_name=True)


class WishlistResponse(BaseModel):
    """
    Response lengkap yang dikembalikan ke FE.
    Semua field di-alias ke camelCase sesuai konvensi tim Frontend.
    """

    id: int
    user_id: int = Field(serialization_alias="userId")

    item_name: str = Field(serialization_alias="itemName")
    target_price: Decimal = Field(serialization_alias="targetPrice")
    target_months: int = Field(serialization_alias="targetMonths")

    monthly_saving: Decimal = Field(serialization_alias="monthlySaving")
    weekly_saving: Decimal = Field(serialization_alias="weeklySaving")
    daily_saving: Decimal = Field(serialization_alias="dailySaving")

    status: str
    message: str

    progress_amount: Decimal = Field(serialization_alias="progressAmount")

    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    progress_percent: Optional[Decimal] = Field(default=None, serialization_alias="progressPercent")
    remaining_amount: Optional[Decimal] = Field(default=None, serialization_alias="remainingAmount")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        by_alias=True,
    )