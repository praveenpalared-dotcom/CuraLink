import os
import json
import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv()
from backend.app.agents.llm_client import generate_llm_content, api_key
from backend.app.models.models import Doctor, HospitalDepartment, Appointment, AppointmentStatus, Patient, QueueStatus
from backend.app.agents.triage_agent import triage_symptoms
from backend.app.agents.clinical_expert_agent import explain_medical_report, generate_diet_suggestions

CLASSIFICATION_SYSTEM_PROMPT = """
You are the Intent Router for MediFlow AI. Your job is to classify the patient's message into one of these categories:
1. "book_appointment" - User wants to book a new appointment or see a doctor/specialty.
2. "check_queue" - User wants to check their current wait time, queue position, or check-in status.
3. "reschedule_appointment" - User wants to change, move, or reschedule an existing appointment.
4. "explain_report" - User wants an explanation of medical terms, symptoms, or lab reports.
5. "diet_suggestions" - User wants diet, nutrition advice, or foods to eat/avoid.
6. "general_chat" - Greeting, thanking, or general off-topic conversation.

Respond with ONLY a JSON object matching this schema:
{
  "intent": "book_appointment" | "check_queue" | "reschedule_appointment" | "explain_report" | "diet_suggestions" | "general_chat",
  "reason": "short explanation of classification"
}
Do not include any explanation or markdown formatting in your response. Only return raw JSON.
"""

SYSTEM_PROMPT = """
You are the Appointment Parser Agent for MediFlow AI. Your job is to extract scheduling parameters from the patient's unstructured text input and return structured JSON.
You MUST output ONLY valid JSON matching this schema:
{
  "specialty_requested": string or null (e.g., "Ophthalmology", "Pediatrics", "Orthopedics", "General Medicine", "Cardiology", "Dermatology"),
  "preferred_day": string or null (e.g., "Friday", "Monday", "2026-07-04"),
  "preferred_time_of_day": "morning" | "afternoon" | "evening" | null,
  "urgency_level": "routine" | "urgent" | "emergency",
  "symptoms_summary": string
}

Do not include any explanation or markdown formatting in your response. Only return raw JSON.
"""

RESCHEDULE_PROMPT = """
You are the Rescheduling Assistant for MediFlow AI. Your job is to extract rescheduling parameters from the patient's request and return structured JSON.
You MUST output ONLY valid JSON matching this schema:
{
  "preferred_day": string or null (e.g., "Friday", "Monday", "2026-07-04"),
  "preferred_time_of_day": "morning" | "afternoon" | "evening" | null
}
Do not include any explanation or markdown formatting. Only return raw JSON.
"""

def classify_intent(message: str) -> str:
    if not api_key:
        msg_lower = message.lower()
        if "reschedule" in msg_lower or "move" in msg_lower or "change" in msg_lower:
            return "reschedule_appointment"
        elif "queue" in msg_lower or "wait" in msg_lower or "position" in msg_lower or "line" in msg_lower:
            return "check_queue"
        elif "explain" in msg_lower or "report" in msg_lower or "symptom" in msg_lower or "chest" in msg_lower or "pain" in msg_lower:
            return "explain_report"
        elif "diet" in msg_lower or "eat" in msg_lower or "food" in msg_lower or "nutri" in msg_lower:
            return "diet_suggestions"
        elif "hello" in msg_lower or msg_lower == "hi" or msg_lower.startswith("hi ") or "thank" in msg_lower:
            return "general_chat"
        else:
            return "book_appointment"

    try:
        text = generate_llm_content(CLASSIFICATION_SYSTEM_PROMPT, message)
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        parsed = json.loads(text.strip())
        return parsed.get("intent", "book_appointment")
    except Exception as e:
        print(f"Error classifying intent: {e}")
        return "book_appointment"

def parse_booking_request(message: str) -> dict:
    if not api_key:
        print("GEMINI_API_KEY not configured. Using rule-based parsing simulation.")
        msg_lower = message.lower()
        if "eye" in msg_lower or "ophthalm" in msg_lower:
            specialty = "Ophthalmology"
        elif "child" in msg_lower or "pediatric" in msg_lower or "son" in msg_lower or "daughter" in msg_lower or "kid" in msg_lower:
            specialty = "Pediatrics"
        elif "knee" in msg_lower or "back" in msg_lower or "bone" in msg_lower or "joint" in msg_lower or "ortho" in msg_lower or "fracture" in msg_lower:
            specialty = "Orthopedics"
        elif "heart" in msg_lower or "cardio" in msg_lower or "chest" in msg_lower:
            specialty = "Cardiology"
        elif "skin" in msg_lower or "rash" in msg_lower or "derm" in msg_lower or "acne" in msg_lower:
            specialty = "Dermatology"
        else:
            specialty = "General Medicine"

        return {
            "specialty_requested": specialty,
            "preferred_day": "Friday" if "friday" in message.lower() else "tomorrow",
            "preferred_time_of_day": "morning" if "morning" in message.lower() else "afternoon",
            "urgency_level": "urgent" if "urgent" in message.lower() else "routine",
            "symptoms_summary": message
        }

    try:
        text = generate_llm_content(SYSTEM_PROMPT, message)
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error parsing with Gemini: {e}")
        return {
            "specialty_requested": "General Medicine",
            "preferred_day": "tomorrow",
            "preferred_time_of_day": "morning",
            "urgency_level": "routine",
            "symptoms_summary": message
        }

def generate_booking_confirmation_message(doctor_name: str, specialty: str, formatted_time: str, triage_cat: str, urgency_score: int, recommended_dept: str, pre_visit: str) -> str:
    if not api_key:
        triage_info = f"\n\n[AI Triage Rating: {triage_cat.upper()} (Priority Score: {urgency_score}/10)]\n*Recommended Clinic: {recommended_dept}*\n\nPre-visit Care: {pre_visit}"
        return f"MediFlow has booked your appointment with {doctor_name} ({specialty}) for {formatted_time}.{triage_info}"
    
    try:
        prompt = (
            f"Doctor Name: {doctor_name}\n"
            f"Specialty: {specialty}\n"
            f"Appointment Time: {formatted_time}\n"
            f"Triage Rating: {triage_cat}\n"
            f"Priority Score: {urgency_score}/10\n"
            f"Recommended Clinic: {recommended_dept}\n"
            f"Pre-visit Care Instructions: {pre_visit}"
        )
        system_instruction = (
            "You are the Booking Confirmation Agent for MediFlow AI. Your job is to draft a warm, highly professional "
            "booking confirmation message for the patient, detailing their upcoming appointment, recommended clinic, triage status, "
            "and pre-visit care instructions. Do not use generic template text. Keep it concise, professional, and clear. Do not include markdown formatting or quotes."
        )
        return generate_llm_content(system_instruction, prompt)
    except Exception as e:
        print(f"Error generating confirmation message: {e}")
        triage_info = f"\n\n[AI Triage Rating: {triage_cat.upper()} (Priority Score: {urgency_score}/10)]\n*Recommended Clinic: {recommended_dept}*\n\nPre-visit Care: {pre_visit}"
        return f"MediFlow has booked your appointment with {doctor_name} ({specialty}) for {formatted_time}.{triage_info}"

def run_appointment_agent(db: Session, patient_id: int, message: str) -> dict:
    intent = classify_intent(message)
    print(f"Classified assistant intent: {intent}")

    if intent == "check_queue":
        q_item = db.query(QueueStatus).join(Appointment).filter(
            Appointment.patient_id == patient_id,
            QueueStatus.completed_time == None
        ).first()

        if q_item:
            dept_name = q_item.department.name if q_item.department else "General Medicine"
            position = q_item.current_position
            wait_time = q_item.estimated_wait_minutes
            
            if api_key:
                try:
                    system_instruction = (
                        "You are the Queue Telemetry Communicator for MediFlow AI. Your job is to draft a polite, reassuring update "
                        "for the patient about their current queue position and estimated wait time. Be professional and brief (2-3 sentences)."
                    )
                    prompt = f"Patient ID: {patient_id}, Department: {dept_name}, Position in Line: #{position}, Estimated Wait: {wait_time} minutes."
                    msg_text = generate_llm_content(system_instruction, prompt)
                except Exception:
                    msg_text = f"You are currently #{position} in line for the {dept_name} department. Your estimated wait time is {wait_time} minutes."
            else:
                msg_text = f"You are currently #{position} in line for the {dept_name} department. Your estimated wait time is {wait_time} minutes."
            
            return {
                "success": True,
                "message": msg_text
            }
        else:
            if api_key:
                try:
                    system_instruction = "You are the concierge assistant. Inform the patient politely that they do not have any active check-in tokens at the moment and explain how they can check in by choosing an appointment from their dashboard."
                    msg_text = generate_llm_content(system_instruction, "No active queue item found.")
                except Exception:
                    msg_text = "You do not have any active check-in tokens in the queue. To check in, please select a scheduled appointment from your dashboard and click 'Check In Lobby'."
            else:
                msg_text = "You do not have any active check-in tokens in the queue. To check in, please select a scheduled appointment from your dashboard and click 'Check In Lobby'."
            
            return {
                "success": True,
                "message": msg_text
            }

    elif intent == "reschedule_appointment":
        appt = db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.status.in_([AppointmentStatus.scheduled, AppointmentStatus.confirmed])
        ).order_by(Appointment.start_time.asc()).first()

        if appt:
            # Parse rescheduling details
            preferred_day = "tomorrow"
            preferred_time_of_day = "morning"
            if api_key:
                try:
                    text = generate_llm_content(RESCHEDULE_PROMPT, message)
                    if text.startswith("```json"):
                        text = text[7:]
                    if text.endswith("```"):
                        text = text[:-3]
                    parsed = json.loads(text.strip())
                    preferred_day = parsed.get("preferred_day") or "tomorrow"
                    preferred_time_of_day = parsed.get("preferred_time_of_day") or "morning"
                except Exception as e:
                    print(f"Error parsing reschedule details: {e}")
            
            today = datetime.datetime.now()
            target_date = today + datetime.timedelta(days=1)
            
            if preferred_day.lower() == "friday":
                days_ahead = 4 - today.weekday()
                if days_ahead <= 0: days_ahead += 7
                target_date = today + datetime.timedelta(days=days_ahead)
            elif "today" in preferred_day.lower():
                target_date = today
            
            hour = 9
            if preferred_time_of_day == "afternoon":
                hour = 14
            elif preferred_time_of_day == "evening":
                hour = 17

            new_start_time = datetime.datetime(target_date.year, target_date.month, target_date.day, hour, 0)
            new_end_time = new_start_time + datetime.timedelta(minutes=30)

            # Check conflicts
            conflict = db.query(Appointment).filter(
                Appointment.doctor_id == appt.doctor_id,
                Appointment.id != appt.id,
                Appointment.status != AppointmentStatus.cancelled,
                Appointment.start_time == new_start_time
            ).first()

            if conflict:
                new_start_time = new_start_time + datetime.timedelta(minutes=30)
                new_end_time = new_start_time + datetime.timedelta(minutes=30)

            # Update DB
            appt.start_time = new_start_time
            appt.end_time = new_end_time
            appt.status = AppointmentStatus.scheduled
            db.commit()
            db.refresh(appt)

            doctor_name = f"Dr. {appt.doctor.first_name} {appt.doctor.last_name}" if appt.doctor else "your physician"
            formatted_time = new_start_time.strftime("%A, %B %d at %I:%M %p")
            
            if api_key:
                try:
                    system_instruction = (
                        "You are the Rescheduling Assistant for MediFlow AI. Inform the patient politely and warmly that their appointment "
                        "has been successfully rescheduled. Keep it brief and clear. Do not include quotes."
                    )
                    prompt = f"Rescheduled appointment details: Doctor: {doctor_name}, Specialty: {appt.department.name}, New Time: {formatted_time}."
                    msg_text = generate_llm_content(system_instruction, prompt)
                except Exception:
                    msg_text = f"Your appointment with {doctor_name} has been rescheduled to {formatted_time}."
            else:
                msg_text = f"Your appointment with {doctor_name} has been rescheduled to {formatted_time}."
            
            return {
                "success": True,
                "appointment_id": appt.id,
                "doctor_name": doctor_name,
                "specialty": appt.department.name,
                "start_time": new_start_time,
                "message": msg_text
            }
        else:
            if api_key:
                try:
                    system_instruction = "Politely inform the patient that they do not have any upcoming active appointments to reschedule."
                    msg_text = generate_llm_content(system_instruction, "No upcoming appointments found.")
                except Exception:
                    msg_text = "You do not have any upcoming scheduled appointments to reschedule. If you want to book one, please ask to book an appointment."
            else:
                msg_text = "You do not have any upcoming scheduled appointments to reschedule. If you want to book one, please ask to book an appointment."
            
            return {
                "success": True,
                "message": msg_text
            }

    elif intent == "explain_report":
        explanation = explain_medical_report(message)
        return {
            "success": True,
            "message": explanation
        }

    elif intent == "diet_suggestions":
        suggestions = generate_diet_suggestions(message)
        return {
            "success": True,
            "message": suggestions
        }

    elif intent == "general_chat":
        if api_key:
            try:
                system_instruction = "You are the CuraLink Clinical Assistant. Answer the patient's greeting or general question politely, warmly, and briefly. Guide them on how you can assist them (booking, rescheduling, queue status, medical explanation, diet suggestions)."
                msg_text = generate_llm_content(system_instruction, message)
            except Exception:
                msg_text = "Hello! I am your CuraLink Clinical Assistant. How can I help you today?"
        else:
            msg_text = "Hello! I am your CuraLink Clinical Assistant. How can I help you today?"
        return {
            "success": True,
            "message": msg_text
        }

    else:
        # Default: book_appointment
        # 1. Invoke the Triage Agent to classify symptoms and department routing
        triage_result = triage_symptoms(message)
        recommended_dept = triage_result.get("target_department", "General Medicine")
        triage_cat = triage_result.get("triage_category", "routine")
        urgency_score = triage_result.get("urgency_score", 3)
        pre_visit = triage_result.get("pre_visit_instructions", "")

        # 2. Parse general scheduling preferences using the Appointment Agent
        parsed = parse_booking_request(message)
        day = parsed.get("preferred_day") or "tomorrow"
        time_of_day = parsed.get("preferred_time_of_day") or "morning"
        
        # 3. Find matching department
        dept = db.query(HospitalDepartment).filter(HospitalDepartment.name.ilike(f"%{recommended_dept}%")).first()
        dept_id = dept.id if dept else 1

        # Find active doctors in that department
        doctors = db.query(Doctor).filter(Doctor.department_id == dept_id, Doctor.is_active == True).all()
        if not doctors:
            # Fallback to any doctor
            doctors = db.query(Doctor).filter(Doctor.is_active == True).all()
            if not doctors:
                return {
                    "success": False,
                    "message": "No active doctors are currently available. Please contact reception."
                }

        selected_doctor = doctors[0]

        # 4. Calculate target time slot
        today = datetime.datetime.now()
        target_date = today + datetime.timedelta(days=1)
        
        if day.lower() == "friday":
            days_ahead = 4 - today.weekday()
            if days_ahead <= 0: days_ahead += 7
            target_date = today + datetime.timedelta(days=days_ahead)
        elif "today" in day.lower():
            target_date = today
        
        hour = 9
        if time_of_day == "afternoon":
            hour = 14
        elif time_of_day == "evening":
            hour = 17

        start_time = datetime.datetime(target_date.year, target_date.month, target_date.day, hour, 0)
        end_time = start_time + datetime.timedelta(minutes=30)

        # 5. Check for conflicts
        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == selected_doctor.id,
            Appointment.status != AppointmentStatus.cancelled,
            Appointment.start_time == start_time
        ).first()

        if conflict:
            start_time = start_time + datetime.timedelta(minutes=30)
            end_time = start_time + datetime.timedelta(minutes=30)

        # 6. Save appointment with Triage parameters
        new_app = Appointment(
            patient_id=patient_id,
            doctor_id=selected_doctor.id,
            department_id=dept_id,
            start_time=start_time,
            end_time=end_time,
            status=AppointmentStatus.scheduled,
            chief_complaint=parsed.get("symptoms_summary", message),
            ai_no_show_probability=0.10 if triage_cat == 'urgent' else 0.20
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)

        doctor_name = f"Dr. {selected_doctor.first_name} {selected_doctor.last_name}"
        formatted_time = start_time.strftime("%A, %B %d at %I:%M %p")
        
        # 7. Generate Dynamic AI Booking Confirmation message
        sms_text = generate_booking_confirmation_message(
            doctor_name=doctor_name,
            specialty=selected_doctor.specialty,
            formatted_time=formatted_time,
            triage_cat=triage_cat,
            urgency_score=urgency_score,
            recommended_dept=recommended_dept,
            pre_visit=pre_visit
        )
        
        return {
            "success": True,
            "appointment_id": new_app.id,
            "doctor_name": doctor_name,
            "specialty": selected_doctor.specialty,
            "start_time": start_time,
            "message": sms_text
        }
