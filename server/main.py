from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

from app.core.config import settings
from app.db.base import Base
from app.db.migrations import ensure_subscription_billing_cycle, ensure_user_photo_url
from app.db.session import engine

# Import models agar SQLAlchemy tahu tabel apa yang perlu dibuat
from app.models import user, transaction, wishlist, budget, subscription, otp  # noqa: F401

# Import routers
from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.wishlist import router as wishlist_router
from app.api.routes.budget import router as budget_router
from app.api.routes.profile import router as profile_router
from app.api.routes.subscriptions import router as subscriptions_router
from app.api.routes.advice import router as advice_router

# ── Buat semua tabel di database (jika belum ada) ────────────────────────────
Base.metadata.create_all(bind=engine)
ensure_subscription_billing_cycle(engine)
ensure_user_photo_url(engine)


def ensure_email_verified_column() -> None:
    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "email_verified_at" in columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE")
        )
        connection.execute(
            text(
                "UPDATE users "
                "SET email_verified_at = created_at "
                "WHERE email_verified_at IS NULL"
            )
        )


ensure_email_verified_column()

# ── Inisialisasi aplikasi FastAPI ─────────────────────────────────────────────
app = FastAPI(
    title="SAWIT (Sahabat Duwit) API",
    description="Backend API untuk aplikasi manajemen keuangan Gen Z",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# Izinkan request dari frontend React lokal dan domain frontend production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        *settings.cors_origins,
        "https://sahabatduwit.vercel.app",
        "https://sahabatduwit-hbkc5ebhh-maxrumbos-projects.vercel.app",
        "https://capstone-project-cc-26-psu-329-nn3mfak7p-maxrumbos-projects.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
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
app.include_router(wishlist_router, prefix="/api")
app.include_router(budget_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(subscriptions_router, prefix="/api")
app.include_router(advice_router, prefix="/api")


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "OK",
        "message": "SAWIT API berjalan dengan baik 🌴",
        "version": "1.0.0",
        "docs": "/docs",
    }

