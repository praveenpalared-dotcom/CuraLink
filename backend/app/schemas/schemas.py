import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from backend.app.models.models import AppointmentStatus, NotificationType, NotificationCategory, StaffRole, PatientJourneyStatus

# Department schemas
class DepartmentBase(BaseModel):
    name: str
    building_floor: Optional[str] = None
    avg_treatment_time_minutes: Optional[int] = 30

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Patient schemas
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    date_of_birth: datetime.date
    gender: Optional[str] = None
    medical_record_number: Optional[str] = None
    interests: Optional[str] = None
    diseases: Optional[str] = None
    location: Optional[str] = None

class PatientCreate(PatientBase):
    password: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Doctor schemas
class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    department_id: Optional[int] = None
    specialty: str
    is_active: Optional[bool] = True

class DoctorResponse(DoctorBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    department_id: int
    start_time: datetime.datetime
    end_time: datetime.datetime
    status: Optional[AppointmentStatus] = AppointmentStatus.scheduled
    chief_complaint: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    ai_no_show_probability: float
    created_at: datetime.datetime
    patient: Optional[PatientResponse] = None
    doctor: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True

# Agent request/response schemas
class AgentBookingRequest(BaseModel):
    patient_id: int
    message: str

class AgentBookingResponse(BaseModel):
    success: bool
    appointment_id: Optional[int] = None
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    message: str

# Queue schemas
class QueueStatusResponse(BaseModel):
    id: int
    appointment_id: Optional[int]
    department_id: int
    check_in_time: datetime.datetime
    called_to_room_time: Optional[datetime.datetime] = None
    completed_time: Optional[datetime.datetime] = None
    estimated_wait_minutes: int
    current_position: int
    appointment: Optional[AppointmentResponse] = None

    class Config:
        from_attributes = True

class DepartmentWaitTimeResponse(BaseModel):
    department_id: int
    department_name: str
    active_patients_waiting: int
    average_service_time_minutes: int
    estimated_wait_minutes: int

class AppointmentReschedule(BaseModel):
    start_time: datetime.datetime
    end_time: datetime.datetime

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    session_type: str  # "patient" or "hospital"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    session_type: str
    role: str
    user: dict

# --- New Hackathon Schemas ---

class NotificationBase(BaseModel):
    type: NotificationType = NotificationType.app
    category: NotificationCategory = NotificationCategory.system
    message_body: str
    action_url: Optional[str] = None
    action_text: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: int
    patient_id: Optional[int] = None
    staff_id: Optional[int] = None
    status: str
    is_read: bool
    sent_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ClinicalTrialBase(BaseModel):
    title: str
    disease: str
    location: str
    phase: str
    status: str
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None

class ClinicalTrialResponse(ClinicalTrialBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ResearchPaperBase(BaseModel):
    title: str
    authors: str
    summary: str
    disease_tags: Optional[str] = None
    published_date: Optional[datetime.datetime] = None
    link: Optional[str] = None

class ResearchPaperResponse(ResearchPaperBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SavedSearchBase(BaseModel):
    query: str
    category: Optional[str] = None
    notify_on_new: Optional[bool] = True

class SavedSearchResponse(SavedSearchBase):
    id: int
    patient_id: Optional[int] = None
    staff_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SavedSearchCreate(SavedSearchBase):
    patient_id: Optional[int] = None
    staff_id: Optional[int] = None

class CollaborationRequestBase(BaseModel):
    project_title: str
    message: str

class CollaborationRequestResponse(CollaborationRequestBase):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CollaborationRequestCreate(CollaborationRequestBase):
    sender_id: int
    receiver_id: int

# --- Orchestration Schemas ---

class PatientJourneyResponse(BaseModel):
    id: int
    patient_id: int
    status: PatientJourneyStatus
    current_department_id: Optional[int] = None
    emergency_status: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class HospitalEventResponse(BaseModel):
    id: int
    patient_id: Optional[int] = None
    event_type: str
    department_id: Optional[int] = None
    agent_name: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class DiagnosticRequestCreate(BaseModel):
    patient_id: int
    doctor_id: int
    test_name: str
    priority: Optional[str] = "routine"

class DiagnosticRequestResponse(DiagnosticRequestCreate):
    id: int
    status: str
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DiagnosticResultCreate(BaseModel):
    request_id: int
    result_value: str
    notes: Optional[str] = None

class DiagnosticResultResponse(DiagnosticResultCreate):
    id: int
    completed_at: datetime.datetime

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_id: int
    medication_name: str
    dosage: str
    instructions: Optional[str] = None

class PrescriptionResponse(PrescriptionCreate):
    id: int
    status: str
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class MedicationOrderResponse(BaseModel):
    id: int
    prescription_id: int
    status: str
    dispatched_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class BloodRequestCreate(BaseModel):
    patient_id: int
    blood_group: str
    units_required: int
    urgency: Optional[str] = "routine"

class BloodRequestResponse(BloodRequestCreate):
    id: int
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class EmergencyCaseCreate(BaseModel):
    patient_id: Optional[int] = None
    chief_complaint: str
    severity_level: str

class EmergencyCaseResponse(EmergencyCaseCreate):
    id: int
    status: str
    assigned_bed: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class BloodInventoryBase(BaseModel):
    blood_group: str
    units_available: int
    status: str

class BloodInventoryResponse(BloodInventoryBase):
    id: int
    updated_at: datetime.datetime
    class Config:
        from_attributes = True

class IncomingAmbulanceBase(BaseModel):
    id: str
    eta: str
    priority: str
    issue: str
    hr: int
    bp: str
    o2: str

class IncomingAmbulanceResponse(IncomingAmbulanceBase):
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class ResuscitationBayBase(BaseModel):
    bed_name: str
    patient_name: str
    status: str
    team_lead: str
    time_in_bay: str

class ResuscitationBayResponse(ResuscitationBayBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class TraumaQueueBase(BaseModel):
    patient_name: str
    triage_level: str
    complaint: str
    wait_time: str

class TraumaQueueResponse(TraumaQueueBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class PediatricPatientBase(BaseModel):
    id: str
    name: str
    age: str
    reason: str
    time: str
    status: str
    parent: str

class PediatricPatientResponse(PediatricPatientBase):
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class MaternityPatientBase(BaseModel):
    id: str
    name: str
    weeks: str
    status: str
    edd: str
    room: str
    fhr: str

class MaternityPatientResponse(MaternityPatientBase):
    created_at: datetime.datetime
    class Config:
        from_attributes = True
