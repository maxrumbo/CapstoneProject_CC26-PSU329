from decimal import Decimal
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate


def create_subscription(
    db: Session,
    user_id: int,
    payload: SubscriptionCreate,
) -> Subscription:
    subscription = Subscription(
        user_id=user_id,
        name=payload.name,
        amount=payload.amount,
        next_billing_date=payload.next_billing_date,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def get_subscriptions_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> List[Subscription]:
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.next_billing_date.asc(), Subscription.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_total_cost(
    db: Session,
    user_id: int,
) -> Decimal:
    total = (
        db.query(func.coalesce(func.sum(Subscription.amount), 0))
        .filter(Subscription.user_id == user_id)
        .scalar()
    )
    return Decimal(str(total))


def get_subscription_by_id(
    db: Session,
    subscription_id: int,
) -> Optional[Subscription]:
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()


def update_subscription(
    db: Session,
    subscription: Subscription,
    payload: SubscriptionUpdate,
) -> Subscription:
    if payload.name is not None:
        subscription.name = payload.name
    if payload.amount is not None:
        subscription.amount = payload.amount
    if payload.next_billing_date is not None:
        subscription.next_billing_date = payload.next_billing_date

    db.commit()
    db.refresh(subscription)
    return subscription


def delete_subscription(
    db: Session,
    subscription: Subscription,
) -> None:
    db.delete(subscription)
    db.commit()
