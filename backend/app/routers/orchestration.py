from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models
from backend.app.orchestration.orchestrator import HospitalOrchestrator

router = APIRouter()

@router.get("/patient-journey/{patient_id}", response_model=schemas.PatientJourneyResponse)
def get_patient_journey(patient_id: int, db: Session = Depends(get_db)):
    journey = db.query(models.PatientJourney).filter_by(patient_id=patient_id).first()
    if not journey:
        # Auto-create if missing for demonstration
        journey = models.PatientJourney(patient_id=patient_id, status=models.PatientJourneyStatus.registered)
        db.add(journey)
        db.commit()
        db.refresh(journey)
    return journey

@router.get("/events/{patient_id}", response_model=List[schemas.HospitalEventResponse])
def get_hospital_events(patient_id: int, db: Session = Depends(get_db)):
    return db.query(models.HospitalEvent).filter_by(patient_id=patient_id).order_by(models.HospitalEvent.timestamp.desc()).all()

@router.post("/events/emit", response_model=schemas.HospitalEventResponse)
def emit_event(
    event_type: str,
    patient_id: int = None,
    department_id: int = None,
    agent_name: str = None,
    details: str = None,
    db: Session = Depends(get_db)
):
    orchestrator = HospitalOrchestrator(db)
    return orchestrator.emit_event(event_type, patient_id, department_id, agent_name, details)
