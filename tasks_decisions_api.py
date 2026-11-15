from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from tasks_decisions import extract_tasks_and_decisions

router = APIRouter()


class DocumentRequest(BaseModel):
    document_text: str


@router.post("/extract-tasks-decisions")
async def extract_tasks(request: DocumentRequest):
    try:
        result = extract_tasks_and_decisions(
            request.document_text
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )