"""
Faredown Backend Configuration Settings
Environment variables and application configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Application
    APP_NAME: str = "Faredown Backend API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://user:password@localhost:5432/faredown_db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://faredown.com",
        "https://www.faredown.com",
        "https://55e69d5755db4519a9295a29a1a55930-aaf2790235d34f3ab48afa56a.fly.dev",
        "*"  # Allow all origins for development
    ]
    
    # External APIs
    AMADEUS_API_KEY: str = os.getenv("AMADEUS_API_KEY", "")
    AMADEUS_API_SECRET: str = os.getenv("AMADEUS_API_SECRET", "")
    BOOKING_COM_API_KEY: str = os.getenv("BOOKING_COM_API_KEY", "")
    
    # AI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = "gpt-3.5-turbo"
    
    # Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_FOLDER: str = "uploads"
    
    # Bargain Engine Settings
    BARGAIN_SESSION_TIMEOUT: int = 600  # 10 minutes in seconds
    MAX_BARGAIN_ATTEMPTS: int = 3
    MIN_MARKUP_PERCENTAGE: float = 5.0
    MAX_MARKUP_PERCENTAGE: float = 20.0
    
    # Currency Settings
    EXCHANGE_RATE_API_KEY: str = os.getenv("EXCHANGE_RATE_API_KEY", "")
    DEFAULT_CURRENCY: str = "INR"
    
    # Redis Configuration (for caching and sessions)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Validation
if not settings.SECRET_KEY or settings.SECRET_KEY == "your-secret-key-change-in-production":
    if settings.ENVIRONMENT == "production":
        raise ValueError("SECRET_KEY must be set in production environment")

if settings.ENVIRONMENT == "production" and not settings.DATABASE_URL.startswith("postgresql://"):
    raise ValueError("DATABASE_URL must be a valid PostgreSQL URL in production")

print(f"🔧 Configuration loaded for {settings.ENVIRONMENT} environment")
