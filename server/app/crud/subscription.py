from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate

MONTHLY_MULTIPLIERS = {
    "daily": Decimal("30"),
    "weekly": Decimal("4"),
    "monthly": Decimal("1"),
    "yearly": Decimal("0.083333333333333333"),
}


def create_subscription(
    db: Session,
    user_id: int,
    payload: SubscriptionCreate,
) -> Subscription:
    subscription = Subscription(
        user_id=user_id,
        name=payload.name,
        amount=payload.amount,
        billing_cycle=payload.billing_cycle,
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
    subscriptions = (
        db.query(Subscription.amount, Subscription.billing_cycle)
        .filter(Subscription.user_id == user_id)
        .all()
    )
    total = Decimal("0")

    for amount, billing_cycle in subscriptions:
        multiplier = MONTHLY_MULTIPLIERS.get(billing_cycle, Decimal("1"))
        total += Decimal(str(amount)) * multiplier

    return total


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
    if payload.billing_cycle is not None:
        subscription.billing_cycle = payload.billing_cycle
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
