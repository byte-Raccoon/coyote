from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskOut
from ..config import settings

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskOut])
def get_tasks(
    category: Optional[str] = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if not include_deleted:
        query = query.filter(Task.is_deleted == False)
    if category:
        query = query.filter(Task.category == category)
    return query.order_by(Task.created_at.desc()).all()

@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        is_completed=payload.is_completed,
        due_date=payload.due_date,
        device_id=settings.DEVICE_ID,
        version=1,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.version += 1
    task.updated_at = datetime.utcnow()
    task.device_id = settings.DEVICE_ID
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_deleted = True
    task.version += 1
    task.updated_at = datetime.utcnow()
    task.device_id = settings.DEVICE_ID
    db.commit()
    return {"message": "Task marked as deleted", "id": task_id}
