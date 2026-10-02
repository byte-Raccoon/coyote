import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SyncableModel:
    """Base mixin containing sync fields according to Coyote Decision D010."""
    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(64), nullable=False, default="unknown")
    version = Column(Integer, nullable=False, default=1)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

class Task(SyncableModel, Base):
    __tablename__ = "tasks"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(32), nullable=False, default="daily") # daily, weekly, yearly
    is_completed = Column(Boolean, nullable=False, default=False)
    due_date = Column(String(64), nullable=True)

class Note(SyncableModel, Base):
    __tablename__ = "notes"

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False, default="")
    folder = Column(String(32), nullable=False, default="general") # journal, academic, dsa, ideas, general
    tags = Column(String(255), nullable=True)

class Target(SyncableModel, Base):
    __tablename__ = "targets"

    title = Column(String(255), nullable=False)
    category = Column(String(32), nullable=False, default="dsa") # dsa, academic
    target_count = Column(Integer, nullable=False, default=10)
    current_count = Column(Integer, nullable=False, default=0)
    period = Column(String(32), nullable=False, default="weekly")
