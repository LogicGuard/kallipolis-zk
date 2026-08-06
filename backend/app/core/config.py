import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kallipolis ZK Autonomous Security Platform v3.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "kallipolis-v3-super-secret-jwt-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Polygon RPCs
    POLYGON_MAINNET_RPC: str = os.getenv("POLYGON_MAINNET_RPC", "https://polygon-rpc.com")
    POLYGON_ZKEVM_RPC: str = os.getenv("POLYGON_ZKEVM_RPC", "https://zkevm-rpc.com")
    POLYGON_AMOY_RPC: str = os.getenv("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology")
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", os.getenv("API_KEY", ""))
    
    # Storage & Redis
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./kallipolis.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    FIREBASE_PROJECT_ID: Optional[str] = os.getenv("FIREBASE_PROJECT_ID", "kallipolis-v3")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
