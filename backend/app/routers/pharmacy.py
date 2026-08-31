from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models
from backend.app.orchestration.orchestrator import HospitalOrchestrator

router = APIRouter()

@router.get("/prescriptions", response_model=List[schemas.PrescriptionResponse])
def get_prescriptions(db: Session = Depends(get_db)):
    return db.query(models.Prescription).all()

@router.post("/prescriptions", response_model=schemas.PrescriptionResponse)
def create_prescription(req: schemas.PrescriptionCreate, db: Session = Depends(get_db)):
    db_req = models.Prescription(**req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    # Emit event
    orchestrator = HospitalOrchestrator(db)
    orchestrator.emit_event(
        event_type="PRESCRIPTION_CREATED",
        patient_id=req.patient_id,
        details=f"Prescription created for {req.medication_name}"
    )
    return db_req
