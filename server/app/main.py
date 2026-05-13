from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.core.security import hash_password, verify_password

<<<<<<< HEAD
from app.models import transaction, user, wishlist  # noqa: F401
from app.models.user import User
=======
# Tambahkan budget di sini biar ORM-nya sinkron
from app.models import transaction, user, wishlist, budget  # noqa: F401
>>>>>>> origin/server

from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.wishlist import router as wishlist_router
# Import router baru yang nanti isinya dibikinin Claude
from app.api.routes.budget import router as budget_router
from app.api.routes.profile import router as profile_router

Base.metadata.create_all(bind=engine)


def ensure_demo_user() -> None:
    if not settings.DEMO_USER_ENABLED:
        return

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL).first()
        if existing_user:
            updated = False
            if existing_user.display_name != settings.DEMO_USER_DISPLAY_NAME:
                existing_user.display_name = settings.DEMO_USER_DISPLAY_NAME
                updated = True

            if not verify_password(settings.DEMO_USER_PASSWORD, existing_user.hashed_password):
                existing_user.hashed_password = hash_password(settings.DEMO_USER_PASSWORD)
                updated = True

            if updated:
                db.commit()
            return

        demo_user = User(
            email=settings.DEMO_USER_EMAIL,
            hashed_password=hash_password(settings.DEMO_USER_PASSWORD),
            display_name=settings.DEMO_USER_DISPLAY_NAME,
        )
        db.add(demo_user)
        db.commit()
    finally:
        db.close()

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
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_demo_user_on_startup():
    ensure_demo_user()


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
