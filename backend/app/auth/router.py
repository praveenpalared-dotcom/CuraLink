from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Patient, Staff
from backend.app.auth.security import verify_password, create_access_token
from backend.app.schemas.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.session_type == "patient":
        record = db.query(Patient).filter(Patient.email == payload.email).first()
        if not record or not record.password_hash or not verify_password(payload.password, record.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token({"sub": str(record.id), "role": "patient", "session_type": "patient"})
        user = {
            "id": record.id,
            "first_name": record.first_name,
            "last_name": record.last_name,
            "email": record.email,
            "phone_number": record.phone_number,
            "date_of_birth": str(record.date_of_birth),
            "gender": record.gender,
            "medical_record_number": record.medical_record_number,
        }
        return LoginResponse(access_token=token, session_type="patient", role="patient", user=user)

    if payload.session_type == "hospital":
        record = db.query(Staff).filter(Staff.email == payload.email).first()
        if not record or not record.password_hash or not verify_password(payload.password, record.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token({"sub": str(record.id), "role": record.role.value, "session_type": "hospital"})
        user = {
            "id": record.id,
            "email": record.email,
            "name": f"{record.first_name} {record.last_name}",
        }
        return LoginResponse(access_token=token, session_type="hospital", role=record.role.value, user=user)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session_type must be 'patient' or 'hospital'.")
