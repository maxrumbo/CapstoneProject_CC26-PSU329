from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Import models agar SQLAlchemy tahu tabel apa yang perlu dibuat
from app.models import user, transaction, wishlist, budget  # noqa: F401

# Import routers
from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.wishlists import router as wishlists_router
from app.api.routes.budget import router as budget_router
from app.api.routes.profile import router as profile_router

# ── Buat semua tabel di database (jika belum ada) ────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Inisialisasi aplikasi FastAPI ─────────────────────────────────────────────
app = FastAPI(
    title="SAWIT (Sahabat Duwit) API",
    description="Backend API untuk aplikasi manajemen keuangan Gen Z",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# Izinkan request dari frontend React (Vite default port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Tangkap semua error yang tidak ter-handle.
    Jangan expose raw error message ke client di production.
    """
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Terjadi kesalahan di server. Silakan coba lagi.",
            "detail": str(exc),  # Hapus baris ini di production
        },
    )


# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(wishlists_router, prefix="/api")
app.include_router(budget_router, prefix="/api")
app.include_router(profile_router, prefix="/api")


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "OK",
        "message": "SAWIT API berjalan dengan baik 🌴",
        "version": "1.0.0",
        "docs": "/docs",
    }
