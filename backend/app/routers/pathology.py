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
    requests = db.query(models.DiagnosticRequest).all()
    results = []
    for req in requests:
        patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
        doctor = db.query(models.Doctor).filter_by(id=req.doctor_id).first()
        req_dict = req.__dict__.copy()
        if patient:
            req_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        if doctor:
            req_dict['doctor_name'] = f"Dr. {doctor.first_name} {doctor.last_name}"
        results.append(req_dict)
    return results
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
    patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
    doctor = db.query(models.Doctor).filter_by(id=req.doctor_id).first()
    res_dict = db_req.__dict__.copy()
    if patient:
        res_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
    if doctor:
        res_dict['doctor_name'] = f"Dr. {doctor.first_name} {doctor.last_name}"
    return res_dict

@router.put("/requests/{id}/status", response_model=schemas.DiagnosticRequestResponse)
def update_request_status(id: int, status: str, db: Session = Depends(get_db)):
    req = db.query(models.DiagnosticRequest).filter_by(id=id).first()
    if req:
        req.status = status
        db.commit()
        db.refresh(req)
        
        patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
        doctor = db.query(models.Doctor).filter_by(id=req.doctor_id).first()
        res_dict = req.__dict__.copy()
        if patient:
            res_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        if doctor:
            res_dict['doctor_name'] = f"Dr. {doctor.first_name} {doctor.last_name}"
        return res_dict
    return None

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
