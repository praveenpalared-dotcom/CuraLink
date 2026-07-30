from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.models import (
    ClinicalTrial, ResearchPaper, SavedSearch, CollaborationRequest, Patient, Staff
)
from backend.app.schemas.schemas import (
    ClinicalTrialResponse, ResearchPaperResponse, 
    SavedSearchCreate, SavedSearchResponse,
    CollaborationRequestCreate, CollaborationRequestResponse
)

router = APIRouter(
    prefix="/research",
    tags=["research"]
)

@router.get("/trials", response_model=List[ClinicalTrialResponse])
def get_trials(disease: Optional[str] = None, location: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ClinicalTrial)
    if disease:
        query = query.filter(ClinicalTrial.disease.ilike(f"%{disease}%"))
    if location:
        query = query.filter(ClinicalTrial.location.ilike(f"%{location}%"))
    return query.order_by(ClinicalTrial.created_at.desc()).all()

@router.get("/papers", response_model=List[ResearchPaperResponse])
def get_papers(tag: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ResearchPaper)
    if tag:
        query = query.filter(ResearchPaper.disease_tags.ilike(f"%{tag}%"))
    return query.order_by(ResearchPaper.created_at.desc()).all()

@router.get("/saved_searches/patient/{patient_id}", response_model=List[SavedSearchResponse])
def get_patient_saved_searches(patient_id: int, db: Session = Depends(get_db)):
    return db.query(SavedSearch).filter(SavedSearch.patient_id == patient_id).order_by(SavedSearch.created_at.desc()).all()

@router.post("/saved_searches", response_model=SavedSearchResponse)
def create_saved_search(search: SavedSearchCreate, db: Session = Depends(get_db)):
    db_search = SavedSearch(
        patient_id=search.patient_id,
        staff_id=search.staff_id,
        query=search.query,
        category=search.category,
        notify_on_new=search.notify_on_new
    )
    db.add(db_search)
    db.commit()
    db.refresh(db_search)
    return db_search

@router.get("/collaborations/staff/{staff_id}", response_model=List[CollaborationRequestResponse])
def get_collaborations(staff_id: int, db: Session = Depends(get_db)):
    return db.query(CollaborationRequest).filter(
        (CollaborationRequest.sender_id == staff_id) | (CollaborationRequest.receiver_id == staff_id)
    ).order_by(CollaborationRequest.created_at.desc()).all()

@router.post("/collaborations", response_model=CollaborationRequestResponse)
def create_collaboration_request(req: CollaborationRequestCreate, db: Session = Depends(get_db)):
    db_req = CollaborationRequest(
        sender_id=req.sender_id,
        receiver_id=req.receiver_id,
        project_title=req.project_title,
        message=req.message
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.put("/collaborations/{collab_id}/status")
def update_collaboration_status(collab_id: int, status: str, db: Session = Depends(get_db)):
    collab = db.query(CollaborationRequest).filter(CollaborationRequest.id == collab_id).first()
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration request not found")
    collab.status = status
    db.commit()
    db.refresh(collab)
    return collab
