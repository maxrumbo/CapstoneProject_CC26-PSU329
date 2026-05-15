from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.transaction import (
    BalanceSummaryResponse,
    TransactionCreate,
    TransactionResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# ── Helper: hitung saldo user sampai tanggal tertentu ────────────────────────

def _get_balance(user_id: int, db: Session, up_to_date: Optional[date] = None) -> Decimal:
    """
    Balance = total income - total expense milik user.
    Jika up_to_date diberikan, hitung hanya transaksi s.d. tanggal tersebut.
    """
    base_query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if up_to_date:
        base_query = base_query.filter(Transaction.date <= up_to_date)

    total_income = base_query.filter(
        Transaction.type == TransactionType.income
    ).with_entities(func.coalesce(func.sum(Transaction.amount), 0)).scalar()

    total_expense = base_query.filter(
        Transaction.type == TransactionType.expense
    ).with_entities(func.coalesce(func.sum(Transaction.amount), 0)).scalar()

    return Decimal(str(total_income)) - Decimal(str(total_expense))


# ── ENDPOINT 6: Balance Summary (HARUS didefinisikan SEBELUM /{id}) ──────────

@router.get(
    "/summary/balance",
    response_model=APIResponse[BalanceSummaryResponse],
    summary="Hitung saldo user (total income - total expense)",
)
def get_balance_summary(
    up_to_date: Optional[date] = Query(None, description="Hitung saldo sampai tanggal ini (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if up_to_date:
        base_query = base_query.filter(Transaction.date <= up_to_date)

    total_income = Decimal(str(
        base_query.filter(Transaction.type == TransactionType.income)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
    ))
    total_expense = Decimal(str(
        base_query.filter(Transaction.type == TransactionType.expense)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
    ))
    balance = total_income - total_expense

    return APIResponse(
        data=BalanceSummaryResponse(
            user_id=current_user.id,
            total_income=total_income,
            total_expense=total_expense,
            balance=balance,
            as_of_date=up_to_date,
        )
    )


# ── ENDPOINT 1: CREATE transaksi baru ────────────────────────────────────────

@router.post(
    "/",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tambah transaksi baru",
)
def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Cek saldo hanya untuk tipe expense
    if payload.type == TransactionType.expense:
        current_balance = _get_balance(current_user.id, db)
        if payload.amount > current_balance:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Saldo tidak cukup untuk transaksi ini",
            )

    transaction = Transaction(
        user_id=current_user.id,
        description=payload.description,
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        method=payload.method,
        date=payload.date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return APIResponse(
        data=TransactionResponse.model_validate(transaction),
        message="Transaksi berhasil ditambahkan",
    )


# ── ENDPOINT 2: READ LIST transaksi dengan filter & pagination ───────────────

@router.get(
    "/",
    response_model=APIResponse[list[TransactionResponse]],
    summary="Ambil daftar transaksi (dengan filter & pagination)",
)
def get_transactions(
    skip: int = Query(0, ge=0, description="Jumlah data yang dilewati (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Jumlah data yang diambil"),
    start_date: Optional[date] = Query(None, description="Filter dari tanggal (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter sampai tanggal (YYYY-MM-DD)"),
    type: Optional[TransactionType] = Query(None, description="Filter tipe: income atau expense"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if type:
        query = query.filter(Transaction.type == type)

    transactions = (
        query
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return APIResponse(
        data=[TransactionResponse.model_validate(t) for t in transactions]
    )


# ── ENDPOINT 3: READ DETAIL satu transaksi ───────────────────────────────────

@router.get(
    "/{transaction_id}",
    response_model=APIResponse[TransactionResponse],
    summary="Ambil detail satu transaksi",
)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaksi tidak ditemukan",
        )

    # Pastikan transaksi milik user ini
    if transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kamu tidak punya izin untuk mengakses transaksi ini",
        )

    return APIResponse(data=TransactionResponse.model_validate(transaction))


# ── ENDPOINT 4: UPDATE transaksi ─────────────────────────────────────────────

@router.patch(
    "/{transaction_id}",
    response_model=APIResponse[TransactionResponse],
    summary="Edit transaksi tidak tersedia",
)
def update_transaction(
    transaction_id: int,
):
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Transaksi yang sudah dicatat tidak bisa diubah",
    )


# ── ENDPOINT 5: DELETE transaksi ─────────────────────────────────────────────

@router.delete(
    "/{transaction_id}",
    response_model=APIResponse[None],
    summary="Hapus transaksi tidak tersedia",
)
def delete_transaction(
    transaction_id: int,
):
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Transaksi yang sudah dicatat tidak bisa dihapus",
    )
