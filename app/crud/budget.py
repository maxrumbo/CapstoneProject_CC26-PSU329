from decimal import Decimal
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.budget import UserBudget
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetItemRequest, BudgetItemResponse, BudgetCategoryComparison, BudgetSetResponse


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
    
    for budget in budgets:
        # Calculate total spending untuk kategori ini dalam bulan tersebut
        # Extract tahun-bulan dari date untuk filtering
        spent_query = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.category == budget.category,
                Transaction.type == TransactionType.expense,
                func.to_char(Transaction.date, 'YYYY-MM') == month,
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
