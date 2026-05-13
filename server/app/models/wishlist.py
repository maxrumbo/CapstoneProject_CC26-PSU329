from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    item_name = Column(String(255), nullable=False)
    target_price = Column(Numeric(15, 2), nullable=False)
    target_months = Column(Integer, nullable=False)

    monthly_saving = Column(Numeric(15, 2), nullable=False)
    weekly_saving = Column(Numeric(15, 2), nullable=False)
    daily_saving = Column(Numeric(15, 2), nullable=False)

    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)

    progress_amount = Column(Numeric(15, 2), nullable=False, default=0)

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

    owner = relationship("User", back_populates="wishlists")

    __table_args__ = (
        Index("idx_wishlists_user_id", "user_id"),
    )
