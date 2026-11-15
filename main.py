
import os
import io

import pymupdf
from docx import Document
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from google import genai

# ---------------------------------------
# 1. LOAD ENVIRONMENT VARIABLES
# ---------------------------------------

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")

client = genai.Client(api_key=api_key) if api_key else None

# ---------------------------------------
# 2. CREATE FASTAPI APPLICATION
# ---------------------------------------

app = FastAPI(title="CampusContinuity API")
from tasks_decisions_api import router as tasks_router

app.include_router(tasks_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# 3. HOME ROUTE
# ---------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to CampusContinuity API",
        "status": "running"
    }

# ---------------------------------------
# 4. HEALTH CHECK
# ---------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

# ---------------------------------------
# 5. GEMINI AI SUMMARY
# ---------------------------------------

def generate_ai_summary(extracted_text):

    if client is None:
        return "Gemini API key is not configured. Extracted text is available."

    prompt = f"""
    You are an AI assistant for CampusContinuity,
    a student project knowledge and handover platform.

    Analyse the following project document.

    Prepare a clear report with these sections:

    1. Project Overview
    2. Important Information
    3. Completed Tasks
    4. Pending Tasks
    5. Important Decisions
    6. Blockers and Risks
    7. Dependencies
    8. Suggested Next Steps
    9. Project Handover Summary

    Do not invent information.
    If information is missing, mention "Not specified".

    DOCUMENT CONTENT:
    {extracted_text[:20000]}
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        if response.text:
            return response.text

        return "AI did not return a summary. Extracted text is available."

    except Exception as e:
        return (
            "AI summary temporarily unavailable. "
            "Document text was extracted successfully. "
            f"Reason: {str(e)[:300]}"
        )

# ---------------------------------------
# 6. DOCUMENT UPLOAD
# ---------------------------------------

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a file."
        )

    filename = file.filename.lower()

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File size must be below 10 MB."
        )

    # -----------------------------------
    # PDF EXTRACTION
    # -----------------------------------

    try:

        if filename.endswith(".pdf"):

            pdf = pymupdf.open(
                stream=content,
                filetype="pdf"
            )

            extracted_text = "\n".join(
                page.get_text()
                for page in pdf
            )

            pdf.close()

        # -----------------------------------
        # DOCX EXTRACTION
        # -----------------------------------

        elif filename.endswith(".docx"):

            document = Document(
                io.BytesIO(content)
            )

            extracted_text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

        # -----------------------------------
        # TXT EXTRACTION
        # -----------------------------------

        elif filename.endswith(".txt"):

            extracted_text = content.decode(
                "utf-8-sig",
                errors="replace"
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="Only PDF, DOCX and TXT files are supported."
            )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read document: {str(e)}"
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in the document."
        )

    # -----------------------------------
    # GENERATE AI SUMMARY
    # -----------------------------------

    ai_summary = generate_ai_summary(extracted_text)

    # -----------------------------------
    # RETURN RESULT
    # -----------------------------------

    return {
        "filename": file.filename,
        "status": "Document processed successfully",
        "extracted_text": extracted_text,
        "ai_summary": ai_summary
    }