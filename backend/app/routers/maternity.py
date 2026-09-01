from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models

router = APIRouter()

@router.get("/patients", response_model=List[schemas.MaternityPatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.MaternityPatient).all()
