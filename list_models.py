
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API key not found. Check your .env file.")
else:
    try:
        client = genai.Client(api_key=api_key)

        print("Checking available Gemini models...\n")

        for model in client.models.list():
            print("Model:", model.name)
            print("Supported actions:", model.supported_actions)
            print("-------------------------")

    except Exception as e:
        print("Error:", e)
