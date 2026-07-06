import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from backend.app.models.models import AppointmentStatus, NotificationType, StaffRole

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

class PatientCreate(PatientBase):
    pass

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

