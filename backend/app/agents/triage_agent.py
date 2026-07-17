import os
import json
from dotenv import load_dotenv
load_dotenv()
from backend.app.agents.llm_client import generate_llm_content, api_key

SYSTEM_PROMPT = """
You are the Patient Triage & Routing Agent for MediFlow AI. Your job is to assess the severity of a patient's symptoms and recommend the appropriate clinic routing.
Analyze the symptoms and output ONLY valid JSON matching this schema:
{
  "triage_category": "routine" | "urgent" | "emergency",
  "urgency_score": integer, (1 to 10, where 10 is a critical life-threatening emergency),
  "target_department": "General Medicine" | "Ophthalmology" | "Pediatrics" | "Orthopedics" | "Cardiology" | "Dermatology",
  "is_emergency": boolean,
  "pre_visit_instructions": string
}

Do not include any explanation or markdown formatting in your response. Only return raw JSON.
"""

def triage_symptoms(message: str) -> dict:
    if not api_key:
        # Fallback simulation
        msg_lower = message.lower()
        if "chest pain" in msg_lower or "stroke" in msg_lower or "heart" in msg_lower or "cardio" in msg_lower or "chest" in msg_lower:
            return {
                "triage_category": "emergency",
                "urgency_score": 9,
                "target_department": "Cardiology",
                "is_emergency": True,
                "pre_visit_instructions": "Please seek emergency services immediately. Dial 911 or head to the nearest Emergency Room."
            }
        
        # Pediatric fallback
        if "child" in msg_lower or "daughter" in msg_lower or "son" in msg_lower or "kid" in msg_lower:
            return {
                "triage_category": "routine",
                "urgency_score": 3,
                "target_department": "Pediatrics",
                "is_emergency": False,
                "pre_visit_instructions": "Keep the child hydrated. Bring any pediatric history charts with you to the consult."
            }

        # Dermatology fallback
        if "skin" in msg_lower or "rash" in msg_lower or "derm" in msg_lower or "acne" in msg_lower:
            return {
                "triage_category": "routine",
                "urgency_score": 2,
                "target_department": "Dermatology",
                "is_emergency": False,
                "pre_visit_instructions": "Avoid picking or scratching the affected skin area. Keep it clean and dry."
            }

        # Orthopedic fallback
        if "knee" in msg_lower or "back" in msg_lower or "fracture" in msg_lower or "bone" in msg_lower or "pain" in msg_lower:
            return {
                "triage_category": "urgent",
                "urgency_score": 5,
                "target_department": "Orthopedics",
                "is_emergency": False,
                "pre_visit_instructions": "Rest the affected joint. Elevate and apply a cold compress if swelling occurs."
            }

        return {
            "triage_category": "routine",
            "urgency_score": 2,
            "target_department": "General Medicine",
            "is_emergency": False,
            "pre_visit_instructions": "Drink plenty of water and rest before your appointment."
        }

    try:
        text = generate_llm_content(SYSTEM_PROMPT, f"Symptoms complaint: {message}")
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error in Triage Agent: {e}")
        return {
            "triage_category": "routine",
            "urgency_score": 2,
            "target_department": "General Medicine",
            "is_emergency": False,
            "pre_visit_instructions": "Rest and monitor your symptoms."
        }
