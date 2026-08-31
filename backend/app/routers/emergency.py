from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models
from backend.app.orchestration.orchestrator import HospitalOrchestrator

router = APIRouter()

@router.get("/cases", response_model=List[schemas.EmergencyCaseResponse])
def get_cases(db: Session = Depends(get_db)):
    return db.query(models.EmergencyCase).all()

@router.post("/cases", response_model=schemas.EmergencyCaseResponse)
def create_case(req: schemas.EmergencyCaseCreate, db: Session = Depends(get_db)):
    db_req = models.EmergencyCase(**req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    # Emit event
    orchestrator = HospitalOrchestrator(db)
    orchestrator.emit_event(
        event_type="EMERGENCY_CASE_CREATED",
        patient_id=req.patient_id,
        details=f"Emergency case created. Severity: {req.severity_level}"
    )
    return db_req
