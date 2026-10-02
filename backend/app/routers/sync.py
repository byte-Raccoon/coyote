from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Task, Note
from ..schemas import SyncPushPayload, SyncPullResponse, TaskOut, NoteOut

router = APIRouter(prefix="/api/sync", tags=["Synchronization"])

@router.get("/pull", response_model=SyncPullResponse)
def pull_changes(since: Optional[datetime] = None, db: Session = Depends(get_db)):
    task_query = db.query(Task)
    note_query = db.query(Note)

    if since:
        task_query = task_query.filter(Task.updated_at > since)
        note_query = note_query.filter(Note.updated_at > since)

    return SyncPullResponse(
        server_time=datetime.utcnow(),
        tasks=task_query.all(),
        notes=note_query.all()
    )

@router.post("/push")
def push_changes(payload: SyncPushPayload, db: Session = Depends(get_db)):
    processed_tasks = 0
    processed_notes = 0

    # Process incoming tasks
    for incoming_task in payload.tasks:
        existing = db.query(Task).filter(Task.id == incoming_task.id).first()
        if not existing:
            new_task = Task(
                id=incoming_task.id,
                title=incoming_task.title,
                description=incoming_task.description,
                category=incoming_task.category,
                is_completed=incoming_task.is_completed,
                due_date=incoming_task.due_date,
                device_id=payload.device_id,
                version=incoming_task.version,
                is_deleted=incoming_task.is_deleted,
                created_at=incoming_task.created_at or datetime.utcnow(),
                updated_at=incoming_task.updated_at or datetime.utcnow()
            )
            db.add(new_task)
            processed_tasks += 1
        else:
            # Conflict resolution: higher version or newer updated_at wins
            if incoming_task.version > existing.version or (
                incoming_task.version == existing.version and (
                    incoming_task.updated_at and incoming_task.updated_at > existing.updated_at
                )
            ):
                existing.title = incoming_task.title
                existing.description = incoming_task.description
                existing.category = incoming_task.category
                existing.is_completed = incoming_task.is_completed
                existing.due_date = incoming_task.due_date
                existing.device_id = payload.device_id
                existing.version = incoming_task.version
                existing.is_deleted = incoming_task.is_deleted
                existing.updated_at = incoming_task.updated_at or datetime.utcnow()
                processed_tasks += 1

    # Process incoming notes
    for incoming_note in payload.notes:
        existing = db.query(Note).filter(Note.id == incoming_note.id).first()
        if not existing:
            new_note = Note(
                id=incoming_note.id,
                title=incoming_note.title,
                content=incoming_note.content,
                folder=incoming_note.folder,
                tags=incoming_note.tags,
                device_id=payload.device_id,
                version=incoming_note.version,
                is_deleted=incoming_note.is_deleted,
                created_at=incoming_note.created_at or datetime.utcnow(),
                updated_at=incoming_note.updated_at or datetime.utcnow()
            )
            db.add(new_note)
            processed_notes += 1
        else:
            if incoming_note.version > existing.version or (
                incoming_note.version == existing.version and (
                    incoming_note.updated_at and incoming_note.updated_at > existing.updated_at
                )
            ):
                existing.title = incoming_note.title
                existing.content = incoming_note.content
                existing.folder = incoming_note.folder
                existing.tags = incoming_note.tags
                existing.device_id = payload.device_id
                existing.version = incoming_note.version
                existing.is_deleted = incoming_note.is_deleted
                existing.updated_at = incoming_note.updated_at or datetime.utcnow()
                processed_notes += 1

    db.commit()

    return {
        "status": "ok",
        "processed_tasks": processed_tasks,
        "processed_notes": processed_notes,
        "server_time": datetime.utcnow().isoformat() + "Z"
    }
