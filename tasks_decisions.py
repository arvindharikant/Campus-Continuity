
import os
import json
import re

from dotenv import load_dotenv
from google import genai

# ---------------------------------------
# 1. LOAD ENVIRONMENT VARIABLES
# ---------------------------------------

load_dotenv()

API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
)

MODEL_NAME = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.8-flash"
)


# ---------------------------------------
# 2. INITIALIZE GEMINI CLIENT SAFELY
# ---------------------------------------

def get_gemini_client():

    if not API_KEY:
        raise RuntimeError(
            "Gemini API key is not configured on the server. "
            "Please configure GEMINI_API_KEY."
        )

    return genai.Client(api_key=API_KEY)


# ---------------------------------------
# 3. EXTRACT TASKS AND DECISIONS
# ---------------------------------------

def extract_tasks_and_decisions(document_text: str):

    if not document_text or not document_text.strip():
        raise ValueError("Document text is empty")

    # -----------------------------------
    # GEMINI ANALYSIS PROMPT
    # -----------------------------------

    prompt = f"""
You are an AI project management assistant.

Analyse this project document.

Extract only information supported by the document.
Never invent tasks, decisions, people or deadlines.

Return ONLY valid JSON in this structure:

{{
  "completed_tasks": [
    {{
      "task": "Task description",
      "responsible_person": "Person or Not specified",
      "evidence": "Supporting information"
    }}
  ],
  "pending_tasks": [
    {{
      "task": "Task description",
      "responsible_person": "Person or Not specified",
      "deadline": "Deadline or Not specified",
      "evidence": "Supporting information"
    }}
  ],
  "important_decisions": [
    {{
      "decision": "Decision description",
      "reason": "Reason or Not specified",
      "evidence": "Supporting information"
    }}
  ]
}}

Use empty lists when no information is available.

PROJECT DOCUMENT:
{document_text[:25000]}
"""

    # -----------------------------------
    # CALL GEMINI API
    # -----------------------------------

    client = get_gemini_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    result = response.text or ""

    # -----------------------------------
    # CLEAN GEMINI JSON RESPONSE
    # -----------------------------------

    result = re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        result.strip(),
        flags=re.IGNORECASE
    )

    # -----------------------------------
    # PARSE JSON RESPONSE
    # -----------------------------------

    try:
        data = json.loads(result)

    except json.JSONDecodeError:
        raise ValueError(
            "Gemini returned invalid JSON. "
            "Please retry the analysis."
        )

    # -----------------------------------
    # RETURN STRUCTURED RESULTS
    # -----------------------------------

    return {
        "completed_tasks": data.get(
            "completed_tasks", []
        ),
        "pending_tasks": data.get(
            "pending_tasks", []
        ),
        "important_decisions": data.get(
            "important_decisions", []
        )
    }
