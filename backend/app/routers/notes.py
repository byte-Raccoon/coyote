from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Note
from ..schemas import NoteCreate, NoteUpdate, NoteOut
from ..config import settings

router = APIRouter(prefix="/api/notes", tags=["Notes & Vault"])

@router.get("", response_model=List[NoteOut])
def get_notes(
    folder: Optional[str] = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    if not include_deleted:
        query = query.filter(Note.is_deleted == False)
    if folder:
        query = query.filter(Note.folder == folder)
    return query.order_by(Note.updated_at.desc()).all()

@router.post("", response_model=NoteOut)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    note = Note(
        title=payload.title,
        content=payload.content,
        folder=payload.folder,
        tags=payload.tags,
        device_id=settings.DEVICE_ID,
        version=1
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.patch("/{note_id}", response_model=NoteOut)
def update_note(note_id: str, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)

    note.version += 1
    note.updated_at = datetime.utcnow()
    note.device_id = settings.DEVICE_ID
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.is_deleted = True
    note.version += 1
    note.updated_at = datetime.utcnow()
    note.device_id = settings.DEVICE_ID
    db.commit()
    return {"message": "Note marked as deleted", "id": note_id}
