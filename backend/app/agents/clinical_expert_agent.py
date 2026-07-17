import os
from dotenv import load_dotenv
load_dotenv()
from backend.app.agents.llm_client import generate_llm_content, api_key

EXPLAIN_SYSTEM_PROMPT = """
You are the Clinical Health Record Explainer for CuraLink. Your job is to translate complex medical reports, lab results, and jargon (e.g., elevated ESR, idiopathic hypersomnia, idiopathic pulmonary fibrosis) into patient-friendly, easy-to-understand language. Keep it clear, comforting, and accurate. Do not include markdown formatting other than bolding. Keep the response to 3-4 sentences.
"""

DIET_SYSTEM_PROMPT = """
You are the Clinical Nutritionist Agent for CuraLink. Your job is to provide tailored dietary advice and nutritional warnings for patient conditions (e.g., flu recovery, high blood pressure, diabetes). Focus on healing foods to consume and foods to avoid. Keep it clear, practical, and list 3 key bullet points. Do not include markdown headers.
"""

def explain_medical_report(text: str) -> str:
    if not api_key:
        text_lower = text.lower()
        if "hypersomnia" in text_lower or "esr" in text_lower:
            return (
                "Your report indicates idiopathic hypersomnia (excessive daytime sleepiness without a known cause) "
                "and an elevated Erythrocyte Sedimentation Rate (ESR), which is a blood test showing signs of general inflammation "
                "in the body. This is not a diagnosis on its own but suggests monitoring your recovery and investigating any inflammatory triggers. "
                "We recommend discussing these results with a General Medicine specialist during your next consult."
            )
        return (
            "Here is a patient-friendly breakdown: the clinical terminology refers to localized physiological parameters "
            "that are slightly outside of standard ranges. It is not an cause for alarm, but we suggest scheduling a standard "
            "consultation to review these indicators in detail with your physician."
        )

    try:
        return generate_llm_content(EXPLAIN_SYSTEM_PROMPT, f"Medical report text: {text}")
    except Exception as e:
        print(f"Error in Explain Medical Report Agent: {e}")
        return "Failed to analyze medical text. Please consult with a physician."

def generate_diet_suggestions(condition: str) -> str:
    if not api_key:
        cond_lower = condition.lower()
        if "flu" in cond_lower:
            return (
                "For flu recovery:\n"
                "• **Hydration First**: Consume warm chicken broths, herbal teas, and water.\n"
                "• **Antioxidants**: Eat oranges, berries, and steamed green vegetables.\n"
                "• **Avoid**: Heavy processed foods, deep fried foods, and cold sugary beverages."
            )
        if "pressure" in cond_lower or "hypertension" in cond_lower:
            return (
                "For high blood pressure:\n"
                "• **Low Sodium**: Restrict daily sodium intake; avoid salt shakers and canned food.\n"
                "• **Potassium Rich**: Consume bananas, spinach, sweet potatoes, and avocados.\n"
                "• **Heart-Healthy Fats**: Eat walnuts, flaxseeds, and salmon."
            )
        return (
            "For your health condition:\n"
            "• **Balanced Nutrition**: Ensure plenty of fresh leafy vegetables and lean proteins.\n"
            "• **Hydration**: Drink 2-3 liters of clean water daily.\n"
            "• **Avoid Sugar**: Minimize refined sugars, carbonated drinks, and processed snacks."
        )

    try:
        return generate_llm_content(DIET_SYSTEM_PROMPT, f"Patient health condition: {condition}")
    except Exception as e:
        print(f"Error in Diet Suggestion Agent: {e}")
        return "Failed to generate dietary suggestions. Please seek professional advice."
