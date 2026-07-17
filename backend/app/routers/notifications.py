from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.models import Notification, Patient, Staff

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

@router.get("/patient/{patient_id}")
def get_patient_notifications(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    notifications = db.query(Notification).filter(
        Notification.patient_id == patient_id
    ).order_by(Notification.created_at.desc() if hasattr(Notification, 'created_at') else Notification.id.desc()).all()
    
    return notifications

@router.get("/staff/{staff_id}")
def get_staff_notifications(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    notifications = db.query(Notification).filter(
        Notification.staff_id == staff_id
    ).order_by(Notification.created_at.desc() if hasattr(Notification, 'created_at') else Notification.id.desc()).all()
    
    return notifications

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return {"success": True, "message": "Notification marked as read"}
