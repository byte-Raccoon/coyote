from datetime import datetime
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def get_health():
    return {
        "status": "ok",
        "service": "coyote-backend",
        "version": "0.1.0",
        "port": settings.PORT,
        "device_id": settings.DEVICE_ID,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
