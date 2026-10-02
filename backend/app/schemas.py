from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Base Sync Metadata Schema
class SyncMetadata(BaseModel):
    id: Optional[str] = None
    device_id: Optional[str] = "unknown"
    version: int = 1
    is_deleted: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "daily" # daily, weekly, yearly
    is_completed: bool = False
    due_date: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[str] = None
    is_deleted: Optional[bool] = None

class TaskOut(TaskBase, SyncMetadata):
    class Config:
        from_attributes = True

# Note Schemas
class NoteBase(BaseModel):
    title: str
    content: str = ""
    folder: str = "general" # journal, academic, dsa, ideas, general
    tags: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder: Optional[str] = None
    tags: Optional[str] = None
    is_deleted: Optional[bool] = None

class NoteOut(NoteBase, SyncMetadata):
    class Config:
        from_attributes = True

# Sync Batch Schemas
class SyncPushPayload(BaseModel):
    device_id: str
    tasks: List[TaskOut] = []
    notes: List[NoteOut] = []

class SyncPullResponse(BaseModel):
    server_time: datetime
    tasks: List[TaskOut] = []
    notes: List[NoteOut] = []
