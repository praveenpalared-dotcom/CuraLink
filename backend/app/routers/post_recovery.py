from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from backend.app.database import get_db
from backend.app.models.models import PostRecoveryTask, PostRecoveryTaskType, Patient

router = APIRouter(
    prefix="/post-recovery",
    tags=["post_recovery"]
)

@router.get("/patient/{patient_id}")
def get_patient_tasks(patient_id: int, db: Session = Depends(get_db)):
    """Fetch all post-recovery tasks for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    tasks = db.query(PostRecoveryTask).filter(PostRecoveryTask.patient_id == patient_id).order_by(PostRecoveryTask.due_date.asc()).all()
    return tasks

@router.put("/{task_id}/complete")
def mark_task_complete(task_id: int, db: Session = Depends(get_db)):
    """Mark a post-recovery task as completed."""
    task = db.query(PostRecoveryTask).filter(PostRecoveryTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.status == "completed":
        return {"success": True, "message": "Task already completed", "task": task}
        
    task.status = "completed"
    task.completed_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(task)
    
    return {"success": True, "message": "Task marked as completed", "task": task}
