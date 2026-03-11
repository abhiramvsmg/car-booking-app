from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cab Booking Platform"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "secret-key-for-development-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "cab_booking"
    DATABASE_URL: Optional[str] = None

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # External APIs
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Auth
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    CLERK_SECRET_KEY: str = ""
    
    # Redis
    REDIS_URL: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
