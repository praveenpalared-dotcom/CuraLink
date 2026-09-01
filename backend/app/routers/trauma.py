from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas import schemas
from backend.app.models import models

router = APIRouter()

@router.get("/ambulances", response_model=List[schemas.IncomingAmbulanceResponse])
def get_ambulances(db: Session = Depends(get_db)):
    return db.query(models.IncomingAmbulance).all()

@router.get("/bays", response_model=List[schemas.ResuscitationBayResponse])
def get_bays(db: Session = Depends(get_db)):
    return db.query(models.ResuscitationBay).all()

@router.get("/queue", response_model=List[schemas.TraumaQueueResponse])
def get_queue(db: Session = Depends(get_db)):
    return db.query(models.TraumaQueue).all()
