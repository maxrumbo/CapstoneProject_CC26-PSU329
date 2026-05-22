from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.crud import subscription as subscription_crud
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionSummaryResponse,
    SubscriptionUpdate,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


def _get_subscription_or_404(
    subscription_id: int,
    user_id: int,
    db: Session,
):
    subscription = subscription_crud.get_subscription_by_id(db, subscription_id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription tidak ditemukan",
        )
    if subscription.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kamu tidak punya izin untuk mengakses subscription ini",
        )
    return subscription


@router.post(
    "/",
    response_model=APIResponse[SubscriptionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tambah subscription baru",
)
def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = subscription_crud.create_subscription(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    return APIResponse(
        data=SubscriptionResponse.model_validate(subscription),
        message="Subscription berhasil ditambahkan",
    )


@router.get(
    "/",
    response_model=APIResponse[list[SubscriptionResponse]],
    summary="Ambil daftar subscription milik user yang sedang login",
)
def get_subscriptions(
    skip: int = Query(0, ge=0, description="Jumlah data yang dilewati"),
    limit: int = Query(100, ge=1, le=500, description="Jumlah data yang diambil"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscriptions = subscription_crud.get_subscriptions_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    return APIResponse(
        data=[SubscriptionResponse.model_validate(item) for item in subscriptions]
    )


@router.get(
    "/summary",
    response_model=APIResponse[SubscriptionSummaryResponse],
    summary="Ambil total biaya subscription user",
)
def get_subscription_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_cost = subscription_crud.get_total_cost(db=db, user_id=current_user.id)
    return APIResponse(
        data=SubscriptionSummaryResponse(
            user_id=current_user.id,
            total_cost=total_cost,
        )
    )


@router.put(
    "/{subscription_id}",
    response_model=APIResponse[SubscriptionResponse],
    summary="Update subscription milik user",
)
def update_subscription(
    subscription_id: int,
    payload: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.model_dump(exclude_unset=True) == {}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payload update tidak boleh kosong",
        )

    subscription = _get_subscription_or_404(subscription_id, current_user.id, db)
    updated = subscription_crud.update_subscription(
        db=db,
        subscription=subscription,
        payload=payload,
    )
    return APIResponse(
        data=SubscriptionResponse.model_validate(updated),
        message="Subscription berhasil diperbarui",
    )


@router.delete(
    "/{subscription_id}",
    response_model=APIResponse[None],
    summary="Hapus subscription milik user",
)
def delete_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = _get_subscription_or_404(subscription_id, current_user.id, db)
    subscription_crud.delete_subscription(db=db, subscription=subscription)
    return APIResponse(message="Subscription berhasil dihapus")
