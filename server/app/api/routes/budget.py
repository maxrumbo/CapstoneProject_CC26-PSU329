from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.crud import budget as budget_crud
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.budget import (
    BudgetSetRequest,
    BudgetSetResponse,
    BudgetSummaryResponse,
)

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.post(
    "/set",
    response_model=APIResponse[BudgetSetResponse],
    status_code=status.HTTP_200_OK,
    summary="Set atau update budget per kategori untuk bulan tertentu (UPSERT)",
)
def set_budget(
    payload: BudgetSetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = budget_crud.upsert_budgets(
        db=db,
        user_id=current_user.id,
        month=payload.month,
        items=payload.budgets,
    )
    return APIResponse(
        data=result,
        message=f"Budget bulan {payload.month} berhasil disimpan ({result.upserted_count} kategori)",
    )


@router.get(
    "/summary/{month}",
    response_model=APIResponse[BudgetSummaryResponse],
    summary="Komparasi budget vs pengeluaran riil per kategori dalam satu bulan",
)
def get_budget_summary(
    month: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import re
    if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", month):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Format bulan tidak valid. Gunakan YYYY-MM, contoh: 2026-05",
        )

    categories = budget_crud.get_budget_summary(
        db=db,
        user_id=current_user.id,
        month=month,
    )

    return APIResponse(
        data=BudgetSummaryResponse(month=month, categories=categories),
    )
