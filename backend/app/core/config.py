import json
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "TrainingPundit — Cloud LMS 2.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "trainingpundit-v2-ultra-secure-signing-key-9f8e7d6c5b4a3"
    FERNET_MASTER_KEY: str = "bHdtYS12Mi1tYXN0ZXItZmVybmV0LWtleS0zMi1ieXRlcy1zYWZlPQ=="
    DATABASE_URL: str = "sqlite+aiosqlite:///./lwma_v2.db"
    LEGACY_SQLITE_PATH: str = "E:/website/learn-with-maruf-ahmed/db.sqlite3"
    CORS_ORIGINS: str = '["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            parsed = json.loads(self.CORS_ORIGINS)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
