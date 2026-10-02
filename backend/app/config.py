import os

class Settings:
    PROJECT_NAME: str = "Coyote API"
    HOST: str = os.getenv("COYOTE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("COYOTE_PORT", "3335"))
    DATABASE_URL: str = os.getenv("COYOTE_DB_URL", "sqlite:///./coyote.db")
    DEVICE_ID: str = os.getenv("COYOTE_DEVICE_ID", "mac-air-primary")
    CORS_ORIGINS: list = [
        "http://localhost:3333",
        "http://127.0.0.1:3333",
        "*",  # Local LAN access for OnePlus Android
    ]

settings = Settings()
