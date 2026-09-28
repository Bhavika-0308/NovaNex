from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./policywise.db"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    ai_api_key: str | None = None
    ai_model: str | None = None
    ai_assistant_module: str | None = None
    frontend_url: str = "http://localhost:5173"
    upload_dir: str = "./storage/policies"
    max_upload_size_mb: int = 10
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
