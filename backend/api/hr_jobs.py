from fastapi import APIRouter, HTTPException
import os
import httpx

router = APIRouter(prefix="/api/hr/jobs", tags=["hr-jobs"])

NODE_API_BASE_URL = os.getenv("ROOT_URL", "http://127.0.0.1:3000").rstrip("/")


@router.get("")
async def list_hr_jobs(status: str | None = None):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{NODE_API_BASE_URL}/api/hr/jobs",
                params={"status": status} if status else None,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Failed to fetch HR jobs: {error}")
