import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ML_HOST: str = os.getenv("ML_HOST", "127.0.0.1")
    ML_PORT: int = int(os.getenv("ML_PORT", "8000"))
    ML_MAX_TRAIN_SECONDS: int = int(os.getenv("ML_MAX_TRAIN_SECONDS", "120"))
    RANDOM_SEED: int = 42

settings = Settings()
