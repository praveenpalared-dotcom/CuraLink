import os
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

# Load .env file from the backend directory relative to this file
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

groq_api_key = os.getenv("GROQ_API_KEY")
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
api_key = groq_api_key or openrouter_api_key

if groq_api_key:
    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_api_key)
    default_model = "llama-3.3-70b-versatile"
elif openrouter_api_key:
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=openrouter_api_key)
    default_model = "google/gemini-2.5-flash"
else:
    client = None
    default_model = None

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_api_with_retry(system_instruction: str, prompt: str) -> str:
    if not client:
        raise Exception("LLM API Key not configured (neither GROQ_API_KEY nor OPENROUTER_API_KEY)")
    
    response = client.chat.completions.create(
        model=default_model,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content.strip()

def generate_llm_content(system_instruction: str, prompt: str) -> str:
    return _call_api_with_retry(system_instruction, prompt)
