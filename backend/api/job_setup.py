from fastapi import APIRouter

# Keep the module importable until job setup endpoints are added back.
router = APIRouter(prefix="/api/ai", tags=["job-setup"])
