from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import health, tasks, notes, sync

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Coyote Notes & To-Do API for macOS and Android sync",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(sync.router)

@app.get("/")
def root():
    return {
        "app": "Coyote API",
        "status": "running",
        "docs": "/docs",
        "port": settings.PORT
    }
