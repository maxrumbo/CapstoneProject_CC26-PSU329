from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Wrapper standar untuk semua response API SAWIT.
    Gunakan ini agar semua tim (FE, AI, DS) punya format konsisten.

    Sukses:  APIResponse(data=..., message="Berhasil")
    Gagal:   APIResponse(success=False, error="Pesan error")
    """
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[str] = None
