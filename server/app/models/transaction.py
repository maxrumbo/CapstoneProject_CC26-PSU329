from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime,
    Enum, ForeignKey, Index,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


# Fixed list sesuai transaction.md – hardcode di sini, tidak perlu tabel DB
VALID_CATEGORIES = [
    "Pemasukan",
    "Makanan",
    "Transportasi",
    "Langganan",
    "Belanja",
    "Tagihan",
    "Wishlist",
    "Investasi",
    "Lainnya",
]


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    category = Column(String(100), nullable=True)   # Nullable untuk income
    method = Column(String(100), nullable=True)      # Tunai, Transfer, Kartu Kredit, dst.
    date = Column(Date, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relasi balik ke User
    owner = relationship("User", back_populates="transactions")

    # Index gabungan untuk query performa tinggi
    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "date"),
        Index("idx_transactions_user_type", "user_id", "type"),
    )
