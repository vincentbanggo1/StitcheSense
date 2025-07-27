from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "stitchesense"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Application
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "StitcheSense API"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields from .env file

settings = Settings()
