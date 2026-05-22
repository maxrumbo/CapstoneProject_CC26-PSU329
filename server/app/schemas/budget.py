from typing import List
from pydantic import BaseModel, Field


class BudgetItemRequest(BaseModel):
    """Request item untuk satu kategori budget"""
    category: str = Field(..., description="Nama kategori")
    amount: float = Field(..., ge=0, description="Budget limit dalam rupiah")


class BudgetSetRequest(BaseModel):
    """Request untuk set/update budget"""
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Bulan dalam format YYYY-MM")
    budgets: List[BudgetItemRequest] = Field(..., description="Daftar budget per kategori")


class BudgetItemResponse(BaseModel):
    """Response item untuk satu kategori budget"""
    category: str
    amount: float
    
    model_config = {"from_attributes": True}


class BudgetSetResponse(BaseModel):
    """Response setelah set budget"""
    month: str
    upserted_count: int = Field(..., description="Jumlah kategori yang diupdate/dibuat")
    budgets: List[BudgetItemResponse]
    
    model_config = {"from_attributes": True}


class BudgetCategoryComparison(BaseModel):
    """Komparasi budget vs spending untuk satu kategori"""
    category: str
    budget: float = Field(0, description="Budget limit yang ditetapkan")
    spent: float = Field(0, description="Total pengeluaran aktual")
    remaining: float = Field(0, description="Sisa budget (budget - spent)")
    percentage: float = Field(0, description="Persentase penggunaan budget (0-100%)")


class BudgetSummaryResponse(BaseModel):
    """Summary budget vs spending untuk satu bulan"""
    month: str
    categories: List[BudgetCategoryComparison]
    total_budget: float = Field(0, description="Total budget semua kategori")
    total_spent: float = Field(0, description="Total pengeluaran semua kategori")
    total_remaining: float = Field(0, description="Total sisa budget")
    
    model_config = {"from_attributes": True}
