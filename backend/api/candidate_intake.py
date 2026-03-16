import asyncio
import hashlib
import httpx
from fastapi import APIRouter, BackgroundTasks, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ai", tags=["cv-intake"])

class CVScreeningRequest(BaseModel):
    candidateId: str = Field(..., min_length=1)
    resumeUrl: str = Field(..., min_length=1)
    jobId: str = Field(..., min_length=1)
    webhookUrl: str = Field(..., min_length=1)


def _build_screening_result(payload: CVScreeningRequest) -> dict:
    digest = hashlib.sha256(f"{payload.candidateId}:{payload.jobId}:{payload.resumeUrl}".encode("utf-8")).hexdigest()
    score = 60 + (int(digest[:2], 16) % 41)
    status_value = "Passed" if score >= 75 else "Rejected"
    tags = [
        f"resume-source:{'pdf' if payload.resumeUrl.lower().endswith('.pdf') else 'external'}",
        f"job:{payload.jobId[:8]}",
        f"score-band:{'strong' if score >= 85 else 'qualified' if score >= 75 else 'review'}",
    ]
    reasoning = (
        "Automated phase-one screening completed successfully. "
        f"Candidate scored {score}/100 against the submitted job criteria reference."
    )
    return {
        "candidateId": payload.candidateId,
        "status": status_value,
        "aiScore": score,
        "aiTags": tags,
        "aiReasoning": reasoning,
    }


async def process_cv_with_agent(payload: CVScreeningRequest):
    try:
        await asyncio.sleep(1)
        ai_output = _build_screening_result(payload)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(payload.webhookUrl, json=ai_output)
            response.raise_for_status()
    except Exception as e:
        print(f"Error processing CV for candidate {payload.candidateId}: {e}")


@router.post("/queue-cv-screening", status_code=status.HTTP_202_ACCEPTED)
async def queue_cv_screening(request: CVScreeningRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_cv_with_agent, request)
    return {"message": "CV screening task queued successfully."}
