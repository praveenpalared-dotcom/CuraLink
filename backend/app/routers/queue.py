import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas.schemas import QueueStatusResponse, DepartmentWaitTimeResponse
from backend.app.models.models import QueueStatus, Appointment, AppointmentStatus, HospitalDepartment

router = APIRouter(prefix="/queue", tags=["Queue Intelligence"])

@router.get("/", response_model=List[QueueStatusResponse])
def get_queue(db: Session = Depends(get_db)):
    return db.query(QueueStatus).filter(QueueStatus.completed_time == None).order_by(QueueStatus.current_position).all()

@router.post("/check-in", response_model=QueueStatusResponse)
def check_in_patient(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.status == AppointmentStatus.checked_in:
        # Already checked in
        existing_queue = db.query(QueueStatus).filter(QueueStatus.appointment_id == appointment_id).first()
        if existing_queue:
            return existing_queue

    # Count how many are ahead of them in this department
    waiting_count = db.query(QueueStatus).filter(
        QueueStatus.department_id == appointment.department_id,
        QueueStatus.completed_time == None
    ).count()

    # Create queue log
    q_item = QueueStatus(
        appointment_id=appointment.id,
        department_id=appointment.department_id,
        check_in_time=datetime.datetime.utcnow(),
        current_position=waiting_count + 1,
        estimated_wait_minutes=(waiting_count * 20) # 20 mins per patient ahead standard simulation
    )
    
    # Update appointment status
    appointment.status = AppointmentStatus.checked_in
    
    db.add(q_item)
    db.commit()
    db.refresh(q_item)
    return q_item

@router.get("/department/{department_id}/wait-time", response_model=DepartmentWaitTimeResponse)
def get_department_wait_time(department_id: int, db: Session = Depends(get_db)):
    dept = db.query(HospitalDepartment).filter(HospitalDepartment.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    waiting_patients = db.query(QueueStatus).filter(
        QueueStatus.department_id == department_id,
        QueueStatus.completed_time == None
    ).all()

    active_waiting = len(waiting_patients)
    avg_service_time = dept.avg_treatment_time_minutes or 30
    # Simple queue calculation
    estimated_wait = active_waiting * avg_service_time

    return DepartmentWaitTimeResponse(
        department_id=department_id,
        department_name=dept.name,
        active_patients_waiting=active_waiting,
        average_service_time_minutes=avg_service_time,
        estimated_wait_minutes=estimated_wait
    )

@router.post("/{queue_id}/call-room", response_model=QueueStatusResponse)
def call_to_room(queue_id: int, db: Session = Depends(get_db)):
    q_item = db.query(QueueStatus).filter(QueueStatus.id == queue_id).first()
    if not q_item:
        raise HTTPException(status_code=404, detail="Queue position not found")
    
    q_item.called_to_room_time = datetime.datetime.utcnow()
    
    # Update appointment status
    if q_item.appointment_id:
        appt = db.query(Appointment).filter(Appointment.id == q_item.appointment_id).first()
        if appt:
            appt.status = AppointmentStatus.in_consultation
            
    db.commit()
    db.refresh(q_item)
    return q_item

@router.post("/{queue_id}/complete", response_model=QueueStatusResponse)
def complete_consultation(queue_id: int, db: Session = Depends(get_db)):
    q_item = db.query(QueueStatus).filter(QueueStatus.id == queue_id).first()
    if not q_item:
        raise HTTPException(status_code=404, detail="Queue position not found")
    
    q_item.completed_time = datetime.datetime.utcnow()
    
    # Update appointment status
    if q_item.appointment_id:
        appt = db.query(Appointment).filter(Appointment.id == q_item.appointment_id).first()
        if appt:
            appt.status = AppointmentStatus.completed
            
    # Shift remaining queue positions down by 1 in this department
    remaining = db.query(QueueStatus).filter(
        QueueStatus.department_id == q_item.department_id,
        QueueStatus.completed_time == None
    ).order_by(QueueStatus.current_position).all()

    for idx, item in enumerate(remaining):
        item.current_position = idx + 1
        item.estimated_wait_minutes = idx * 20
        
    db.commit()
    db.refresh(q_item)
    return q_item
