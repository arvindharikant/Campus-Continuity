
import os
import time
from dotenv import load_dotenv
from google import genai

# Load API key
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API key not found. Check your .env file.")
    raise SystemExit

# Connect to Gemini
client = genai.Client(api_key=api_key)

model_name = "gemini-3.8-flash"

# Retry if Gemini is temporarily unavailable
for attempt in range(3):

    try:
        print(f"\nConnecting to Gemini... Attempt {attempt + 1}/3")

        response = client.models.generate_content(
            model=model_name,
            contents="Introduce CampusContinuity in two simple sentences."
        )

        print("\nSUCCESS! Gemini is working.")
        print("\nGemini Response:")
        print(response.text)

        break

    except Exception as error:

        error_message = str(error)

        if "503" in error_message or "UNAVAILABLE" in error_message:

            print("Gemini server is busy. Retrying...")

            if attempt < 2:
                time.sleep(5 * (attempt + 1))
            else:
                print("Gemini is still unavailable.")
                print("Please try again after some time.")

        else:
            print("\nAPI Error:")
            print(error_message)
            break
