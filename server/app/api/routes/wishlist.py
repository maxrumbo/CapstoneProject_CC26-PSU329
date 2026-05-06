from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.base import APIResponse
from app.schemas.wishlist import WishlistCreate, WishlistProgressUpdate, WishlistResponse

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])


_STATUS_MESSAGES = {
    "Ringan": "Target ini cukup ringan untuk dicapai jika kamu konsisten menabung.",
    "Realistis": (
        "Target ini cukup realistis jika kamu menjaga konsistensi tabungan setiap bulan."
    ),
    "Perlu Usaha Lebih": (
        "Target ini membutuhkan komitmen tabungan yang cukup tinggi setiap bulan."
    ),
}


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _calculate(target_price: Decimal, target_months: int) -> dict:
    monthly = _round2(target_price / Decimal(target_months))
    weekly = _round2(monthly / Decimal(4))
    daily = _round2(monthly / Decimal(30))

    if monthly <= Decimal("500000"):
        status_label = "Ringan"
    elif monthly <= Decimal("1500000"):
        status_label = "Realistis"
    else:
        status_label = "Perlu Usaha Lebih"

    return {
        "monthly_saving": monthly,
        "weekly_saving": weekly,
        "daily_saving": daily,
        "status": status_label,
        "message": _STATUS_MESSAGES[status_label],
    }


def _build_response(wishlist: Wishlist) -> WishlistResponse:
    target = Decimal(str(wishlist.target_price))
    progress = Decimal(str(wishlist.progress_amount))

    progress_percent = _round2((progress / target * 100)) if target > 0 else Decimal("0")
    remaining = _round2(max(target - progress, Decimal("0")))

    data = WishlistResponse.model_validate(wishlist)
    data.progress_percent = progress_percent
    data.remaining_amount = remaining
    return data


def _get_wishlist_or_404(wishlist_id: int, user_id: int, db: Session) -> Wishlist:
    wishlist = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()

    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist tidak ditemukan",
        )
    if wishlist.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kamu tidak punya izin untuk mengakses wishlist ini",
        )
    return wishlist


@router.post(
    "/",
    response_model=APIResponse[WishlistResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Simpan wishlist baru & hitung saving otomatis",
)
def create_wishlist(
    payload: WishlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    calc = _calculate(payload.target_price, payload.target_months)

    wishlist = Wishlist(
        user_id=current_user.id,
        item_name=payload.item_name,
        target_price=payload.target_price,
        target_months=payload.target_months,
        monthly_saving=calc["monthly_saving"],
        weekly_saving=calc["weekly_saving"],
        daily_saving=calc["daily_saving"],
        status=calc["status"],
        message=calc["message"],
        progress_amount=Decimal("0"),
    )

    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)

    return APIResponse(
        data=_build_response(wishlist),
        message=f'Wishlist "{wishlist.item_name}" berhasil disimpan 🎯',
    )


@router.get(
    "/",
    response_model=APIResponse[list[WishlistResponse]],
    summary="Ambil daftar wishlist milik user yang sedang login",
)
def get_wishlists(
    skip: int = Query(0, ge=0, description="Jumlah data yang dilewati"),
    limit: int = Query(100, ge=1, le=500, description="Jumlah data yang diambil"),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter: Ringan | Realistis | Perlu Usaha Lebih",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Wishlist).filter(Wishlist.user_id == current_user.id)

    if status_filter:
        valid_statuses = list(_STATUS_MESSAGES.keys())
        if status_filter not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status tidak valid. Pilihan: {', '.join(valid_statuses)}",
            )
        query = query.filter(Wishlist.status == status_filter)

    wishlists = (
        query.order_by(Wishlist.created_at.desc()).offset(skip).limit(limit).all()
    )

    return APIResponse(data=[_build_response(w) for w in wishlists])


@router.get(
    "/{wishlist_id}",
    response_model=APIResponse[WishlistResponse],
    summary="Ambil detail satu wishlist",
)
def get_wishlist(
    wishlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist = _get_wishlist_or_404(wishlist_id, current_user.id, db)
    return APIResponse(data=_build_response(wishlist))


@router.delete(
    "/{wishlist_id}",
    response_model=APIResponse[None],
    summary="Hapus wishlist milik user sendiri",
)
def delete_wishlist(
    wishlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist = _get_wishlist_or_404(wishlist_id, current_user.id, db)

    item_name = wishlist.item_name
    db.delete(wishlist)
    db.commit()

    return APIResponse(message=f'Wishlist "{item_name}" berhasil dihapus')


@router.patch(
    "/{wishlist_id}/progress",
    response_model=APIResponse[WishlistResponse],
    summary="Update progress tabungan menuju target wishlist",
)
def update_progress(
    wishlist_id: int,
    payload: WishlistProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist = _get_wishlist_or_404(wishlist_id, current_user.id, db)

    target = Decimal(str(wishlist.target_price))

    if payload.progress_amount > target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Progress tidak boleh melebihi target harga (Rp {target:,.0f})",
        )

    wishlist.progress_amount = payload.progress_amount
    wishlist.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(wishlist)

    response_data = _build_response(wishlist)

    pct = response_data.progress_percent or Decimal("0")
    if pct >= 100:
        msg = f'🎉 Selamat! Target wishlist "{wishlist.item_name}" sudah tercapai!'
    elif pct >= 75:
        msg = f'💪 Hampir sampai! Progress kamu {pct:.1f}% — terus semangat!'
    elif pct >= 50:
        msg = f'🔥 Sudah setengah jalan! Progress: {pct:.1f}%'
    else:
        msg = f'📈 Progress diperbarui: {pct:.1f}% dari target'

    return APIResponse(data=response_data, message=msg)