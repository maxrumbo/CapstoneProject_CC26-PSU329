from decimal import Decimal
from datetime import date
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.budget import UserBudget
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetItemRequest, BudgetItemResponse, BudgetCategoryComparison, BudgetSetResponse


def _get_month_range(month: str) -> tuple[date, date]:
    year, month_number = map(int, month.split("-"))
    start_date = date(year, month_number, 1)

    if month_number == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month_number + 1, 1)

    return start_date, end_date


def upsert_budgets(
    db: Session,
    user_id: int,
    month: str,
    items: List[BudgetItemRequest],
) -> BudgetSetResponse:
    """
    Insert atau update budget untuk bulan tertentu (UPSERT operation).
    
    Args:
        db: Database session
        user_id: ID user yang membuat budget
        month: Bulan dalam format YYYY-MM
        items: List budget items yang akan diupsert
        
    Returns:
        BudgetSetResponse dengan info jumlah kategori yang diupdate
    """
    upserted_count = 0
    budget_items = []
    
    for item in items:
        # Cari budget existing untuk kategori dan bulan ini
        existing_budget = db.query(UserBudget).filter(
            and_(
                UserBudget.user_id == user_id,
                UserBudget.month == month,
                UserBudget.category == item.category,
            )
        ).first()
        
        if existing_budget:
            # Update existing budget
            existing_budget.amount = Decimal(str(item.amount))
            db.merge(existing_budget)
        else:
            # Create new budget
            new_budget = UserBudget(
                user_id=user_id,
                month=month,
                category=item.category,
                amount=Decimal(str(item.amount)),
            )
            db.add(new_budget)
        
        upserted_count += 1
        budget_items.append(BudgetItemResponse(
            category=item.category,
            amount=float(item.amount),
        ))
    
    db.commit()
    
    return BudgetSetResponse(
        month=month,
        upserted_count=upserted_count,
        budgets=budget_items,
    )


def get_budget_summary(
    db: Session,
    user_id: int,
    month: str,
) -> List[BudgetCategoryComparison]:
    """
    Dapatkan summary budget vs spending untuk satu bulan.
    Bandingkan budget yang ditetapkan dengan pengeluaran aktual per kategori.
    
    Args:
        db: Database session
        user_id: ID user
        month: Bulan dalam format YYYY-MM (contoh: 2026-05)
        
    Returns:
        List BudgetCategoryComparison untuk setiap kategori
    """
    # Get semua budget untuk bulan ini
    budgets = db.query(UserBudget).filter(
        and_(
            UserBudget.user_id == user_id,
            UserBudget.month == month,
        )
    ).all()
    
    categories = []
    start_date, end_date = _get_month_range(month)
    
    for budget in budgets:
        # Calculate total spending untuk kategori ini dalam bulan tersebut
        # Extract tahun-bulan dari date untuk filtering
        spent_query = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.category == budget.category,
                Transaction.type == TransactionType.expense,
                Transaction.date >= start_date,
                Transaction.date < end_date,
            )
        ).scalar()
        
        spent = float(spent_query or 0)
        budget_amount = float(budget.amount)
        remaining = budget_amount - spent
        percentage = min((spent / budget_amount * 100) if budget_amount > 0 else 0, 100)
        
        categories.append(BudgetCategoryComparison(
            category=budget.category,
            budget=budget_amount,
            spent=spent,
            remaining=remaining,
            percentage=round(percentage, 2),
        ))
    
    return categories

def get_monthly_spending_summary(
    db: Session,
    user_id: int,
    month: str,
) -> dict:
    start_date, end_date = _get_month_range(month)

    total_spent_query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= start_date,
            Transaction.date < end_date,
        )
    ).scalar()
    total_spent = float(total_spent_query or 0)

    category_totals = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= start_date,
            Transaction.date < end_date,
        )
    ).group_by(Transaction.category)\
     .order_by(func.sum(Transaction.amount).desc())\
     .all()

    top_categories = [
        row.category for row in category_totals[:3] if row.category
    ]

    return {
        "total_spent": total_spent,
        "top_categories": top_categories,
        "category_breakdown": [
            {"category": row.category, "total": float(row.total)}
            for row in category_totals
        ]
    }