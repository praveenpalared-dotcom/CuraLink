import datetime
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric, Enum
from sqlalchemy.orm import relationship
from backend.app.database import Base

class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    confirmed = "confirmed"
    checked_in = "checked_in"
    in_consultation = "in_consultation"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"

class NotificationType(str, enum.Enum):
    sms = "sms"
    email = "email"
    whatsapp = "whatsapp"
    app = "app"

class StaffRole(str, enum.Enum):
    doctor = "doctor"
    nurse = "nurse"
    receptionist = "receptionist"
    admin = "admin"

class HospitalDepartment(Base):
    __tablename__ = "hospital_departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    building_floor = Column(String(50))
    avg_treatment_time_minutes = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    doctors = relationship("Doctor", back_populates="department")
    staff = relationship("Staff", back_populates="department")
    appointments = relationship("Appointment", back_populates="department")
    queue_statuses = relationship("QueueStatus", back_populates="department")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True)
    phone_number = Column(String(20), nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String(20))
    medical_record_number = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointments = relationship("Appointment", back_populates="patient")
    notifications = relationship("Notification", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone_number = Column(String(20))
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"))
    specialty = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("HospitalDepartment", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.scheduled, index=True)
    chief_complaint = Column(Text)
    ai_no_show_probability = Column(Numeric(3, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    department = relationship("HospitalDepartment", back_populates="appointments")
    queue_status = relationship("QueueStatus", back_populates="appointment", uselist=False)
    notifications = relationship("Notification", back_populates="appointment")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    role = Column(Enum(StaffRole), nullable=False)
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"))
    max_weekly_hours = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)

    department = relationship("HospitalDepartment", back_populates="staff")
    schedules = relationship("Schedule", back_populates="staff")
    notifications = relationship("Notification", back_populates="staff")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False)
    shift_start = Column(DateTime, nullable=False)
    shift_end = Column(DateTime, nullable=False)
    is_on_call = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    staff = relationship("Staff", back_populates="schedules")

class QueueStatus(Base):
    __tablename__ = "queue_status"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True)
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="CASCADE"), nullable=False)
    check_in_time = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    called_to_room_time = Column(DateTime)
    completed_time = Column(DateTime)
    estimated_wait_minutes = Column(Integer, default=0)
    current_position = Column(Integer, nullable=False)

    appointment = relationship("Appointment", back_populates="queue_status")
    department = relationship("HospitalDepartment", back_populates="queue_statuses")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"))
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.app)
    recipient_address = Column(String(150), nullable=True)
    message_body = Column(Text, nullable=False)
    status = Column(String(50), default="pending", index=True)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime)

    patient = relationship("Patient", back_populates="notifications")
    staff = relationship("Staff", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Numeric(12, 2), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    meta_json = Column(Text) # Storing as text (JSON stringified) for SQLite compatibility
