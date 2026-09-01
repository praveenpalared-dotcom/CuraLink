from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models

router = APIRouter()

@router.get("/inventory", response_model=List[schemas.BloodInventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(models.BloodInventory).all()

@router.put("/inventory/{id}/dispatch", response_model=schemas.BloodInventoryResponse)
def dispatch_units(id: int, units: int, db: Session = Depends(get_db)):
    inv = db.query(models.BloodInventory).filter_by(id=id).first()
    if inv and inv.units_available >= units:
        inv.units_available -= units
        if inv.units_available < 10:
            inv.status = "Critical"
        elif inv.units_available < 20:
            inv.status = "Low"
        else:
            inv.status = "Optimal"
        db.commit()
        db.refresh(inv)
    return inv

@router.get("/requests", response_model=List[schemas.BloodRequestResponse])
def get_requests(db: Session = Depends(get_db)):
    requests = db.query(models.BloodRequest).all()
    results = []
    for req in requests:
        patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
        req_dict = req.__dict__.copy()
        if patient:
            req_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        else:
            req_dict['patient_name'] = "Unknown Patient"
        results.append(req_dict)
    return results

@router.put("/requests/{id}/status", response_model=schemas.BloodRequestResponse)
def update_request_status(id: int, status: str, db: Session = Depends(get_db)):
    req = db.query(models.BloodRequest).filter_by(id=id).first()
    if req:
        req.status = status
        db.commit()
        db.refresh(req)
        
        patient = db.query(models.Patient).filter_by(id=req.patient_id).first()
        req_dict = req.__dict__.copy()
        if patient:
            req_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        else:
            req_dict['patient_name'] = "Unknown Patient"
        return req_dict
    return None
