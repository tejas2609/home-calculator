from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    firebase_project_id: str

    firebase_service_account_path: Optional[str] = None

    firebase_service_account_json: Optional[str] = None

    allowed_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            item.strip() for item in self.allowed_origins.split(",") if item.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
