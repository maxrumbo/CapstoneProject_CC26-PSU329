from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserBudget(Base):
    __tablename__ = "user_budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    month = Column(String(7), nullable=False)  # Format: YYYY-MM
    category = Column(String(100), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)  # Budget limit per kategori
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
    owner = relationship("User", back_populates="budgets")

    # Index gabungan untuk query performa tinggi
    __table_args__ = (
        Index("idx_budgets_user_month", "user_id", "month"),
        Index("idx_budgets_user_category", "user_id", "category"),
    )
