import datetime
from sqlalchemy.orm import Session
from backend.app.models.models import (
    HospitalEvent, PatientJourney, PatientJourneyStatus,
    DiagnosticRequest, Prescription, BloodRequest, EmergencyCase
)

class HospitalOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def emit_event(
        self,
        event_type: str,
        patient_id: int = None,
        department_id: int = None,
        agent_name: str = None,
        details: str = None
    ):
        """Emit a hospital-wide event."""
        event = HospitalEvent(
            patient_id=patient_id,
            event_type=event_type,
            department_id=department_id,
            agent_name=agent_name,
            details=details,
            timestamp=datetime.datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        
        # Determine follow-up actions based on event type
        self.process_event(event)
        return event

    def process_event(self, event: HospitalEvent):
        """React to events and update the shared patient journey or trigger agents."""
        if not event.patient_id:
            return

        journey = self.db.query(PatientJourney).filter_by(patient_id=event.patient_id).first()
        if not journey:
            journey = PatientJourney(patient_id=event.patient_id, status=PatientJourneyStatus.registered)
            self.db.add(journey)
            self.db.commit()

        # Update Journey State
        if event.event_type == "PATIENT_REGISTERED":
            journey.status = PatientJourneyStatus.registered
        elif event.event_type == "TRIAGE_COMPLETED":
            journey.status = PatientJourneyStatus.triage
        elif event.event_type == "ROUTED_TO_DEPARTMENT":
            journey.status = PatientJourneyStatus.waiting
            journey.current_department_id = event.department_id
        elif event.event_type == "CONSULTATION_STARTED":
            journey.status = PatientJourneyStatus.in_consultation
        elif event.event_type == "DIAGNOSTIC_REQUESTED":
            journey.status = PatientJourneyStatus.diagnostics
        elif event.event_type == "PRESCRIPTION_CREATED":
            journey.status = PatientJourneyStatus.pharmacy
        elif event.event_type == "ADMITTED_TO_WARD":
            journey.status = PatientJourneyStatus.admitted
        elif event.event_type == "DISCHARGED":
            journey.status = PatientJourneyStatus.discharged
        
        self.db.commit()
        
        # Here we would notify WebSocket clients (Dashboard updates)
        # e.g., ws_manager.broadcast_to_department(...)

