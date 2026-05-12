from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.base import Base
from app.db.session import engine

# Tambahkan budget di sini biar ORM-nya sinkron
from app.models import transaction, user, wishlist, budget  # noqa: F401

from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.wishlist import router as wishlist_router
# Import router baru yang nanti isinya dibikinin Claude
from app.api.routes.budget import router as budget_router
from app.api.routes.profile import router as profile_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAWIT (Sahabat Duwit) API",
    description="Backend API untuk aplikasi manajemen keuangan Gen Z",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Terjadi kesalahan di server. Silakan coba lagi.",
            "detail": str(exc),
        },
    )


app.include_router(auth_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")
# Daftarin router baru ke FastAPI
app.include_router(budget_router, prefix="/api")
app.include_router(profile_router, prefix="/api")


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "OK",
        "message": "SAWIT API berjalan dengan baik 🌴",
        "version": "1.0.0",
        "docs": "/docs",
    }