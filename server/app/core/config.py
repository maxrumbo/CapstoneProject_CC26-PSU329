from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


SERVER_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 jam
    DEMO_USER_ENABLED: bool = True
    DEMO_USER_EMAIL: str = "sawit@sawit.id"
    DEMO_USER_PASSWORD: str = "sawit123"
    DEMO_USER_DISPLAY_NAME: str = "Demo SAWIT"
    FRONTEND_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:5175,http://127.0.0.1:5175,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    GEMINI_API_KEY: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.FRONTEND_ORIGINS.split(",")
            if origin.strip()
        ]

    class Config:
        env_file = SERVER_DIR / ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
