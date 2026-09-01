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

class NotificationCategory(str, enum.Enum):
    clinical_trial = "clinical_trial"
    research_update = "research_update"
    ai_suggestion = "ai_suggestion"
    community = "community"
    message = "message"
    reminder = "reminder"
    collaboration = "collaboration"
    system = "system"

class StaffRole(str, enum.Enum):
    doctor = "doctor"
    nurse = "nurse"
    receptionist = "receptionist"
    pharmacist = "pharmacist"
    admin = "admin"
    command_center = "command_center"

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
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # New Hackathon fields
    interests = Column(Text, nullable=True) # e.g., "Cancer, Diabetes"
    diseases = Column(Text, nullable=True) # e.g., "Type 2 Diabetes"
    location = Column(String(100), nullable=True)

    appointments = relationship("Appointment", back_populates="patient")
    notifications = relationship("Notification", back_populates="patient")
    recovery_tasks = relationship("PostRecoveryTask", back_populates="patient")
    saved_searches = relationship("SavedSearch", back_populates="patient")

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
    password_hash = Column(String(255), nullable=True)
    max_weekly_hours = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)

    department = relationship("HospitalDepartment", back_populates="staff")
    schedules = relationship("Schedule", back_populates="staff")
    notifications = relationship("Notification", back_populates="staff")
    saved_searches = relationship("SavedSearch", back_populates="staff")

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
    category = Column(Enum(NotificationCategory), default=NotificationCategory.system)
    recipient_address = Column(String(150), nullable=True)
    message_body = Column(Text, nullable=False)
    action_url = Column(String(255), nullable=True) # Link for Action button
    action_text = Column(String(50), nullable=True) # Text for Action button
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

class PostRecoveryTaskType(str, enum.Enum):
    medicine = "medicine"
    follow_up = "follow_up"
    exercise = "exercise"
    other = "other"

class PostRecoveryTask(Base):
    __tablename__ = "post_recovery_tasks"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(PostRecoveryTaskType), default=PostRecoveryTaskType.medicine)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending", index=True) # pending, completed, missed
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="recovery_tasks")

# --- New Hackathon Models ---

class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    disease = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    phase = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False) # e.g. Recruiting, Completed
    description = Column(Text, nullable=True)
    eligibility_criteria = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ResearchPaper(Base):
    __tablename__ = "research_papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    authors = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    disease_tags = Column(String(255), nullable=True)
    published_date = Column(DateTime, nullable=True)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SavedSearch(Base):
    __tablename__ = "saved_searches"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=True)
    query = Column(String(255), nullable=False)
    category = Column(String(50), nullable=True) # e.g. "Clinical Trials"
    notify_on_new = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="saved_searches")
    staff = relationship("Staff", back_populates="saved_searches")

class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False)
    project_title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sender = relationship("Staff", foreign_keys=[sender_id])
    receiver = relationship("Staff", foreign_keys=[receiver_id])

# --- Orchestration & Integration Models ---

class PatientJourneyStatus(str, enum.Enum):
    registered = "registered"
    triage = "triage"
    waiting = "waiting"
    in_consultation = "in_consultation"
    diagnostics = "diagnostics"
    pharmacy = "pharmacy"
    admitted = "admitted"
    discharged = "discharged"

class PatientJourney(Base):
    __tablename__ = "patient_journeys"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(PatientJourneyStatus), default=PatientJourneyStatus.registered)
    current_department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"), nullable=True)
    emergency_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient")
    department = relationship("HospitalDepartment")

class HospitalEvent(Base):
    __tablename__ = "hospital_events"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    event_type = Column(String(100), nullable=False) # e.g. PATIENT_REGISTERED, TRIAGE_COMPLETED
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"), nullable=True)
    agent_name = Column(String(100), nullable=True) # e.g. Triage Agent
    details = Column(Text, nullable=True) # JSON payload
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class DiagnosticRequest(Base):
    __tablename__ = "diagnostic_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String(200), nullable=False)
    priority = Column(String(50), default="routine") # routine, urgent, stat
    status = Column(String(50), default="requested") # requested, processing, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DiagnosticResult(Base):
    __tablename__ = "diagnostic_results"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("diagnostic_requests.id", ondelete="CASCADE"), nullable=False)
    result_value = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    medication_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    instructions = Column(Text, nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MedicationOrder(Base):
    __tablename__ = "medication_orders"
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="new") # new, packing, dispatched
    dispatched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), nullable=False)
    units_required = Column(Integer, nullable=False)
    urgency = Column(String(50), default="routine") # routine, urgent, critical
    status = Column(String(50), default="requested") # requested, reserved, dispatched
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EmergencyCase(Base):
    __tablename__ = "emergency_cases"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    chief_complaint = Column(Text, nullable=False)
    severity_level = Column(String(50), nullable=False) # low, medium, high, critical
    status = Column(String(50), default="active") # active, stabilized, admitted, discharged
    assigned_bed = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BloodInventory(Base):
    __tablename__ = "blood_inventory"
    id = Column(Integer, primary_key=True, index=True)
    blood_group = Column(String(10), unique=True, nullable=False)
    units_available = Column(Integer, default=0)
    status = Column(String(50), default="Optimal") # Optimal, Low, Critical
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class IncomingAmbulance(Base):
    __tablename__ = "incoming_ambulances"
    id = Column(String(50), primary_key=True, index=True) # e.g. AMB-104
    eta = Column(String(50)) # e.g. 2 mins
    priority = Column(String(50)) # Critical, High
    issue = Column(String(200))
    hr = Column(Integer)
    bp = Column(String(20))
    o2 = Column(String(20))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ResuscitationBay(Base):
    __tablename__ = "resuscitation_bays"
    id = Column(Integer, primary_key=True, index=True)
    bed_name = Column(String(50)) # Resus Bay 1
    patient_name = Column(String(100))
    status = Column(String(50))
    team_lead = Column(String(100))
    time_in_bay = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TraumaQueue(Base):
    __tablename__ = "trauma_queue"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(100))
    triage_level = Column(String(50)) # Red (Immediate), Yellow (Urgent)
    complaint = Column(String(200))
    wait_time = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PediatricPatient(Base):
    __tablename__ = "pediatric_patients"
    id = Column(String(50), primary_key=True, index=True) # PED-401
    name = Column(String(100))
    age = Column(String(50))
    reason = Column(String(200))
    time = Column(String(50))
    status = Column(String(50)) # Checked In, Waiting, Scheduled
    parent = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MaternityPatient(Base):
    __tablename__ = "maternity_patients"
    id = Column(String(50), primary_key=True, index=True) # MAT-201
    name = Column(String(100))
    weeks = Column(String(50))
    status = Column(String(50))
    edd = Column(String(50))
    room = Column(String(50))
    fhr = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
