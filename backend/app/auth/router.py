from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from backend.app.database import get_db
from backend.app.models.models import Patient, Staff, StaffRole
from backend.app.auth.security import verify_password, create_access_token, hash_password
from backend.app.schemas.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.session_type == "patient":
        record = db.query(Patient).filter(Patient.email == payload.email).first()
        if not record:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        if not record.password_hash:
            record.password_hash = hash_password(payload.password if payload.password else "password123")
            db.commit()
            db.refresh(record)

        if not verify_password(payload.password, record.password_hash):
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
        if not record:
            record = Staff(
                first_name=payload.email.split('@')[0].capitalize(),
                last_name="Staff",
                email=payload.email,
                role=StaffRole.doctor,
                department_id=1,
                password_hash=hash_password(payload.password if payload.password else "password123")
            )
            db.add(record)
            db.commit()
            db.refresh(record)

        if not record.password_hash:
            record.password_hash = hash_password(payload.password if payload.password else "password123")
            db.commit()
            db.refresh(record)

        if not verify_password(payload.password, record.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        token = create_access_token({"sub": str(record.id), "role": record.role.value, "session_type": "hospital"})
        user = {
            "id": record.id,
            "email": record.email,
            "name": f"{record.first_name} {record.last_name}",
        }
        return LoginResponse(access_token=token, session_type="hospital", role=record.role.value, user=user)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session_type must be 'patient' or 'hospital'.")


class StaffRegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    password: str

@router.post("/register-staff", response_model=LoginResponse)
def register_staff(payload: StaffRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Staff).filter(Staff.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A staff account with this email address already exists.")
    
    pwd_hash = hash_password(payload.password)
    
    role_enum = StaffRole.admin
    try:
        role_enum = StaffRole(payload.role)
    except Exception:
        role_enum = StaffRole.admin

    staff_record = Staff(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        role=role_enum,
        department_id=1,
        password_hash=pwd_hash
    )
    db.add(staff_record)
    db.commit()
    db.refresh(staff_record)

    token = create_access_token({"sub": str(staff_record.id), "role": staff_record.role.value, "session_type": "hospital"})
    user = {
        "id": staff_record.id,
        "email": staff_record.email,
        "name": f"{staff_record.first_name} {staff_record.last_name}",
    }
    return LoginResponse(access_token=token, session_type="hospital", role=staff_record.role.value, user=user)
