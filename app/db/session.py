from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=2,
    pool_pre_ping=True,   # Reconnect otomatis jika koneksi putus
    echo=False,           # Set True untuk debug SQL query
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency FastAPI – inject ke setiap route yang butuh database.
    Otomatis menutup sesi setelah request selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
