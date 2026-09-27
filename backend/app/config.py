from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    app_env: str = Field(default="development", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    qdrant_mode: str = Field(default="edge", alias="QDRANT_MODE")
    qdrant_path: str = Field(default="./data/qdrant", alias="QDRANT_PATH")
    qdrant_url: Optional[str] = Field(default=None, alias="QDRANT_URL")
    qdrant_api_key: Optional[str] = Field(default=None, alias="QDRANT_API_KEY")

    sqlite_path: str = Field(default="./data/edgemind.db", alias="SQLITE_PATH")

    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")

    cloud_sync_enabled: bool = Field(default=False, alias="CLOUD_SYNC_ENABLED")
    cloud_sync_url: Optional[str] = Field(default=None, alias="CLOUD_SYNC_URL")
    cloud_sync_api_key: Optional[str] = Field(default=None, alias="CLOUD_SYNC_API_KEY")

    jev_enabled: bool = Field(default=False, alias="JEV_ENABLED")
    jev_api_url: Optional[str] = Field(default=None, alias="JEV_API_URL")
    jev_api_key: Optional[str] = Field(default=None, alias="JEV_API_KEY")

    hybrid_alpha: float = Field(default=0.7, alias="HYBRID_ALPHA")
    hybrid_beta: float = Field(default=0.3, alias="HYBRID_BETA")

    sync_retry_max_attempts: int = Field(default=5, alias="SYNC_RETRY_MAX_ATTEMPTS")
    sync_retry_base_delay: float = Field(default=1.0, alias="SYNC_RETRY_BASE_DELAY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()