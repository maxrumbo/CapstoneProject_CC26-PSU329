from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 jam
    DEMO_USER_ENABLED: bool = True
    DEMO_USER_EMAIL: str = "sawit@sawit.id"
    DEMO_USER_PASSWORD: str = "sawit123"
    DEMO_USER_DISPLAY_NAME: str = "Demo SAWIT"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
