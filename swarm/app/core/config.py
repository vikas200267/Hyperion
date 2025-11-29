"""
Hyperion AI Backend - Configuration Settings
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    log_level: str = "info"
    
    # AI Configuration
    google_api_key: str = ""
    crewai_verbose: bool = True
    
    # Cardano Configuration
    cardano_node_url: str = "https://cardano-preprod.blockfrost.io/api"
    cardano_network: str = "preprod"
    blockfrost_api_key: str = ""
    
    # Oracle Configuration
    weather_api_key: str = ""
    weather_api_url: str = "https://api.openweathermap.org/data/2.5"
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]


# Global settings instance
settings = Settings()
