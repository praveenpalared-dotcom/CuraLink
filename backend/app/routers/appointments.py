from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from backend.app.database import get_db
from backend.app.schemas.schemas import AppointmentCreate, AppointmentResponse, AgentBookingRequest, AgentBookingResponse, DoctorResponse, DepartmentResponse, AppointmentReschedule, PatientResponse, PatientCreate
from backend.app.models.models import Appointment, AppointmentStatus, Doctor, HospitalDepartment, Patient
from backend.app.agents.appointment_agent import run_appointment_agent
from backend.app.agents.triage_agent import triage_symptoms
from backend.app.agents.clinical_expert_agent import explain_medical_report, generate_diet_suggestions

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).filter(Doctor.is_active == True).all()

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(HospitalDepartment).all()

@router.get("/patients", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

@router.get("/patients/{patient_id}/history", response_model=List[AppointmentResponse])
def get_patient_history(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.start_time.desc()).all()

@router.post("/patients", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # Check if patient with this email already exists
    if patient.email:
        existing = db.query(Patient).filter(Patient.email == patient.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A patient with this email address already exists."
            )
    
    # Generate an MRN if not provided
    mrn = patient.medical_record_number
    if not mrn:
        import random
        mrn = 'MRN-' + str(random.randint(100000, 999999))
        
    db_patient = Patient(
        first_name=patient.first_name,
        last_name=patient.last_name,
        email=patient.email,
        phone_number=patient.phone_number,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        medical_record_number=mrn
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.post("/", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        department_id=appointment.department_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status=appointment.status,
        chief_complaint=appointment.chief_complaint
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.post("/book-agent", response_model=AgentBookingResponse)
def book_appointment_agent(payload: AgentBookingRequest, db: Session = Depends(get_db)):
    result = run_appointment_agent(db, payload.patient_id, payload.message)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    return result

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(appointment_id: int, status_str: AppointmentStatus, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appointment.status = status_str
    db.commit()
    db.refresh(appointment)
    return appointment

# Trigger Doctor Delay Rescheduling Agent
from backend.app.agents.rescheduling_agent import run_rescheduling_agent

@router.post("/doctor-delay")
def trigger_doctor_delay(doctor_id: int, delay_minutes: int, db: Session = Depends(get_db)):
    rescheduled = run_rescheduling_agent(db, doctor_id, delay_minutes)
    return {
        "success": True,
        "message": f"Successfully rescheduled {len(rescheduled)} appointments for Doctor ID {doctor_id}.",
        "rescheduled_appointments": rescheduled
    }

@router.put("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(appointment_id: int, payload: AppointmentReschedule, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appointment.start_time = payload.start_time
    appointment.end_time = payload.end_time
    appointment.status = AppointmentStatus.scheduled
    db.commit()
    db.refresh(appointment)
    return appointment

# Pydantic schemas for new CuraLink features
class TriageRequest(BaseModel):
    message: str

class TriageResponse(BaseModel):
    triage_category: str
    urgency_score: int
    target_department: str
    is_emergency: bool
    pre_visit_instructions: str

class ExplainReportRequest(BaseModel):
    text: str

class ExplainReportResponse(BaseModel):
    explanation: str

class DietSuggestionRequest(BaseModel):
    condition: str

class DietSuggestionResponse(BaseModel):
    suggestion: str

@router.post("/triage", response_model=TriageResponse)
def triage_patient_symptoms(payload: TriageRequest):
    try:
        result = triage_symptoms(payload.message)
        return TriageResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Triage agent error: {str(e)}"
        )

@router.post("/explain-report", response_model=ExplainReportResponse)
def explain_patient_report(payload: ExplainReportRequest):
    try:
        explanation = explain_medical_report(payload.text)
        return ExplainReportResponse(explanation=explanation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report explainer error: {str(e)}"
        )

@router.post("/diet-suggestion", response_model=DietSuggestionResponse)
def generate_patient_diet(payload: DietSuggestionRequest):
    try:
        suggestion = generate_diet_suggestions(payload.condition)
        return DietSuggestionResponse(suggestion=suggestion)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diet agent error: {str(e)}"
        )

