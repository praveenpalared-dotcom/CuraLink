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
    prescriptions = db.query(models.Prescription).all()
    results = []
    for req in prescriptions:
        patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
        doctor = db.query(models.Doctor).filter_by(id=req.doctor_id).first()
        req_dict = req.__dict__.copy()
        if patient:
            req_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        if doctor:
            req_dict['doctor_name'] = f"Dr. {doctor.first_name} {doctor.last_name}"
        results.append(req_dict)
    return results
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
    patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
    doctor = db.query(models.Doctor).filter_by(id=req.doctor_id).first()
    res_dict = db_req.__dict__.copy()
    if patient:
        res_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
    if doctor:
        res_dict['doctor_name'] = f"Dr. {doctor.first_name} {doctor.last_name}"
    return res_dict
