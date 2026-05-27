from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    photo_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relasi ke transaksi (lazy load)
    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")

    # Relasi ke wishlists
    wishlists = relationship("Wishlist", back_populates="owner", cascade="all, delete-orphan")

    # Relasi ke budgets
    budgets = relationship("UserBudget", back_populates="owner", cascade="all, delete-orphan")

    # Relasi ke subscriptions
    subscriptions = relationship("Subscription", back_populates="owner", cascade="all, delete-orphan")
