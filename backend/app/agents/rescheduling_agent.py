import os
import datetime
from sqlalchemy.orm import Session
import google.generativeai as genai
from backend.app.models.models import Appointment, Patient, Doctor, Notification, NotificationType, AppointmentStatus

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

SYSTEM_PROMPT = """
You are the Rescheduling & Communications Agent for MediFlow AI. Your job is to draft a warm, highly professional, and empathetic SMS notification to a patient whose appointment has been pushed back due to a clinical backlog or surgical emergency.
You will be provided:
- Patient Name
- Doctor Name
- Chief Complaint / Symptom
- Delay Amount (minutes)
- New Appointment Time

Draft a concise 2-sentence message notifying them of the delay, acknowledging their symptom, and confirming their new slot.
Do not output any markdown formatting, headers, or quotes. Only return the raw text of the SMS message.
"""

def generate_delay_sms(patient_name: str, doctor_name: str, complaint: str, delay_minutes: int, new_time: datetime.datetime) -> str:
    formatted_time = new_time.strftime("%I:%M %p")
    
    if not api_key:
        # Fallback simulation
        return (
            f"Dear {patient_name}, Dr. {doctor_name} has been delayed by {delay_minutes} minutes due to an emergency. "
            f"We have adjusted your consult for {complaint} to {formatted_time}. Thank you for your patience."
        )

    try:
        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            system_instruction=SYSTEM_PROMPT
        )
        prompt = (
            f"Patient: {patient_name}\n"
            f"Doctor: Dr. {doctor_name}\n"
            f"Symptom: {complaint}\n"
            f"Delay: {delay_minutes} minutes\n"
            f"New Time: {formatted_time}"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error in Rescheduling Agent LLM: {e}")
        return (
            f"Dear {patient_name}, Dr. {doctor_name} is running {delay_minutes} minutes behind. "
            f"Your rescheduled appointment time is {formatted_time}. We apologize for any inconvenience."
        )

def run_rescheduling_agent(db: Session, doctor_id: int, delay_minutes: int) -> list:
    # 1. Fetch doctor details
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return []

    doctor_name = f"{doctor.first_name} {doctor.last_name}"
    now = datetime.datetime.utcnow()

    # 2. Find all upcoming scheduled/confirmed appointments for this doctor today
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status.in_([AppointmentStatus.scheduled, AppointmentStatus.confirmed]),
        Appointment.start_time >= now
    ).all()

    rescheduled_list = []

    for appt in appointments:
        # Shift start and end times
        old_start = appt.start_time
        new_start = old_start + datetime.timedelta(minutes=delay_minutes)
        new_end = appt.end_time + datetime.timedelta(minutes=delay_minutes)

        # Update appointment record in DB
        appt.start_time = new_start
        appt.end_time = new_end
        
        # Fetch patient details
        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        patient_name = f"{patient.first_name} {patient.last_name}" if patient else "Valued Patient"
        complaint = appt.chief_complaint or "regular checkup"

        # 3. Generate customized SMS using AI Rescheduling Agent
        sms_text = generate_delay_sms(patient_name, doctor_name, complaint, delay_minutes, new_start)

        # 4. Insert Notification Log in database
        notification_log = Notification(
            patient_id=appt.patient_id,
            appointment_id=appt.id,
            type=NotificationType.sms,
            recipient_address=patient.phone_number if patient else "N/A",
            message_body=sms_text,
            status="sent",
            sent_at=datetime.datetime.utcnow()
        )
        db.add(notification_log)
        
        rescheduled_list.append({
            "appointment_id": appt.id,
            "patient_name": patient_name,
            "old_time": old_start.isoformat(),
            "new_time": new_start.isoformat(),
            "sms_sent": sms_text
        })

    db.commit()
    return rescheduled_list
