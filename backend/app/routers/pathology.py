from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models
from backend.app.orchestration.orchestrator import HospitalOrchestrator

router = APIRouter()

@router.get("/requests", response_model=List[schemas.DiagnosticRequestResponse])
def get_requests(db: Session = Depends(get_db)):
    return db.query(models.DiagnosticRequest).all()

@router.post("/requests", response_model=schemas.DiagnosticRequestResponse)
def create_request(req: schemas.DiagnosticRequestCreate, db: Session = Depends(get_db)):
    db_req = models.DiagnosticRequest(**req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    # Emit event
    orchestrator = HospitalOrchestrator(db)
    orchestrator.emit_event(
        event_type="DIAGNOSTIC_REQUESTED",
        patient_id=req.patient_id,
        details=f"Test requested: {req.test_name}"
    )
    return db_req

@router.post("/results", response_model=schemas.DiagnosticResultResponse)
def add_result(res: schemas.DiagnosticResultCreate, db: Session = Depends(get_db)):
    db_res = models.DiagnosticResult(**res.model_dump())
    db.add(db_res)
    req = db.query(models.DiagnosticRequest).filter_by(id=res.request_id).first()
    if req:
        req.status = "completed"
    db.commit()
    db.refresh(db_res)
    # Emit event
    if req:
        orchestrator = HospitalOrchestrator(db)
        orchestrator.emit_event(
            event_type="DIAGNOSTIC_RESULT_AVAILABLE",
            patient_id=req.patient_id,
            details=f"Result available for {req.test_name}"
        )
    return db_res
