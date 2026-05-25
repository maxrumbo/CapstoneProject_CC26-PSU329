import calendar
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.crud import budget as budget_crud
from app.models.user import User
from app.schemas.base import APIResponse
from app.services.financial_advisor import get_financial_advice

router = APIRouter(prefix="/advice", tags=["Financial Advice"])


@router.get(
    "/",
    response_model=APIResponse,
    summary="Dapatkan saran keuangan personal dari Gemini AI",
)
def get_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now()
    month_str = now.strftime("%Y-%m")
    day_of_month = now.day
    days_in_month = calendar.monthrange(now.year, now.month)[1]

    # Ambil total budget bulan ini
    budget_categories = budget_crud.get_budget_summary(
        db=db, user_id=current_user.id, month=month_str
    )
    total_budget = sum(cat.budget for cat in budget_categories)

    if total_budget <= 0:
        raise HTTPException(
            status_code=400,
            detail="Kamu belum set budget bulan ini. Set budget dulu ya! 💰"
        )

    # Ambil total pengeluaran & top kategori bulan ini
    spending_data = budget_crud.get_monthly_spending_summary(
        db=db, user_id=current_user.id, month=month_str
    )
    total_spent = spending_data["total_spent"]
    top_categories = spending_data["top_categories"]

    # Panggil Gemini
    try:
        advice = get_financial_advice(
            budget=total_budget,
            total_spent=total_spent,
            day_of_month=day_of_month,
            days_in_month=days_in_month,
            top_categories=top_categories,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Layanan AI sedang tidak tersedia: {str(e)}"
        )

    return APIResponse(
        data={
            "advice": advice,
            "meta": {
                "total_budget": total_budget,
                "total_spent": total_spent,
                "remaining": total_budget - total_spent,
                "day_of_month": day_of_month,
                "days_in_month": days_in_month,
                "month": month_str,
            }
        },
        message="Saran keuangan berhasil dihasilkan"
    )