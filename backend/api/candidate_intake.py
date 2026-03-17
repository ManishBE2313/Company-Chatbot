import os
from pathlib import Path
import httpx
import tempfile
import fitz  # PyMuPDF library for extracting text from PDFs
from fastapi import APIRouter, BackgroundTasks, status
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from langchain_huggingface import HuggingFaceEmbeddings

# ---> NEW IMPORTS: Our dedicated agents for Tier 2 and Tier 3 <---
from ai.agents.extraction_agent import extract_structured_cv
from ai.agents.scoring_agent import run_tier_3_scoring

router = APIRouter(prefix="/api/ai", tags=["cv-intake"])

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent

def resolve_local_resume_path(resume_path: str) -> Path | None:
    requested_name = Path(resume_path).name
    candidate_paths = [
        Path(resume_path),
        BACKEND_DIR / resume_path,
        PROJECT_ROOT / resume_path,
        BACKEND_DIR / "uploads" / requested_name,
        PROJECT_ROOT / "uploads" / requested_name,
    ]

    for candidate_path in candidate_paths:
        if candidate_path.exists() and candidate_path.is_file():
            return candidate_path.resolve()

    normalized_requested_name = requested_name.replace(" ", "")
    for uploads_dir in (BACKEND_DIR / "uploads", PROJECT_ROOT / "uploads"):
        if not uploads_dir.exists():
            continue
        for candidate_path in uploads_dir.iterdir():
            if not candidate_path.is_file():
                continue
            if candidate_path.name.replace(" ", "") == normalized_requested_name:
                return candidate_path.resolve()

    return None

class CVScreeningRequest(BaseModel):
    applicationId: str = Field(..., min_length=1)
    candidateId: str = Field(..., min_length=1)
    resumeUrl: str = Field(..., min_length=1)
    jobId: str = Field(..., min_length=1)
    webhookUrl: str = Field(..., min_length=1)

# Renamed to pipeline to reflect the full multi-tier flow
async def process_cv_pipeline(payload: CVScreeningRequest):
    """
    Tier 1 Screening: Downloads the CV, extracts text, embeds it, and compares it 
    to the Job's ICP and HyDE vectors in Qdrant.
    Tier 2: Extracts structured JSON.
    Tier 3: Deep Scores the JSON and runs Bias Mitigation.
    """
    try:
        print(f"[{payload.applicationId}] Starting Semantic Screening Pipeline...")

        cv_text = ""
        pdf_to_open = None
        temp_pdf_path = None
        resume_path = payload.resumeUrl.strip()

        # Check if the URL is an external link (http/https) or a local file path
        if resume_path.startswith("http://") or resume_path.startswith("https://"):
            # 1. Download the CV from the URL
            print(f"      -> Downloading CV from web URL...")
            async with httpx.AsyncClient() as client:
                response = await client.get(resume_path)
                response.raise_for_status()
                pdf_bytes = response.content

            # We create a temporary file to hold the PDF data
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
                temp_pdf.write(pdf_bytes)
                temp_pdf_path = temp_pdf.name
            
            pdf_to_open = temp_pdf_path
        else:
            print(f"      -> Reading CV from local system: {resume_path}")
            local_resume_path = resolve_local_resume_path(resume_path)
            if not local_resume_path:
                raise FileNotFoundError(f"Could not find local resume file at: {resume_path}")
            pdf_to_open = str(local_resume_path)

        try:
            # 2. Open the PDF file and extract text from all pages
            doc = fitz.open(pdf_to_open)
            for page in doc:
                cv_text += page.get_text()
            doc.close()
        finally:
            # CRITICAL: Always delete the temporary file from the server to prevent disk bloat
            # (Notice we only delete if temp_pdf_path exists, protecting your local files!)
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

        print(f"\n[DEBUG EXTRACTED TEXT]: {cv_text[:200]}...\n")

        if not cv_text.strip():
            raise ValueError("Could not extract any text from the provided PDF.")

        # 3. Embed the Candidate's CV text into a vector
        embeddings_model = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        cv_vector = embeddings_model.embed_query(cv_text)

        # 4. Query Qdrant for the Job's Target Vectors (ICP and HyDE)
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        q_client = QdrantClient(url=qdrant_url)
        collection_name = "job_targets"

        # Search the database for vectors matching THIS specific Job ID
        if q_client.collection_exists(collection_name):
            query_response = q_client.query_points(
                collection_name=collection_name,
                query=cv_vector,
                query_filter=Filter(
                    must=[
                        FieldCondition(
                            key="jobId",
                            match=MatchValue(value=payload.jobId)
                        )
                    ]
                ),
                limit=2,  # We only expect 2 targets per job: ICP and HyDE
            )
            search_result = getattr(query_response, "points", None) or getattr(query_response, "result", [])
        else:
            print(f"[{payload.applicationId}] Warning: Qdrant collection '{collection_name}' does not exist yet.")
            search_result = []

        # 5. Calculate Semantic Score & Extract ICP Text
        if not search_result:
            print(f"[{payload.applicationId}] Warning: No job targets found for {payload.jobId}")
            avg_score = 0.0
            icp_text = "Standard company requirements apply."
        else:
            # Average the cosine similarity scores of the ICP and HyDE matches
            total_score = sum(hit.score for hit in search_result)
            avg_score = total_score / len(search_result)
            
            # ---> ADDED: Extract the actual ICP text from the Qdrant payload so Tier 3 can read it later <---
            icp_hit = next((hit for hit in search_result if hit.payload.get("type") == "icp"), None)
            icp_text = icp_hit.payload.get("text") if icp_hit else "Standard company requirements apply."

        # Convert the cosine similarity (0.0 to 1.0) into a 0-100 percentage score
        normalized_score = int(max(0, min(100, avg_score * 100)))

        # TIER 1 THRESHOLD: 
        # Semantic scores can be numerically low even for decent matches. 
        # A threshold of 40 is a safe "cheap filter" to drop completely irrelevant resumes (e.g., a chef applying for a coding job).
        if normalized_score >= 40:
            print(f"      -> [Tier 1] ✅ Candidate passed semantic check ({normalized_score}/100). Proceeding to Tier 2.")
            
            # ==========================================
            # TIER 2: Structured JSON Extraction
            # ==========================================
            structured_cv = extract_structured_cv(cv_text)
            import json
            print(f"\n[DEBUG TIER 2 JSON]: {json.dumps(structured_cv, indent=2)}\n")
            
            if not structured_cv:
                # Fallback if the LLM completely crashed (failsafe to ensure they aren't auto-rejected)
                status_value = "Passed" 
                tags = ["tier-2:failed", "MANUAL-REVIEW-REQUIRED"]
                reasoning = "The AI failed to parse the formatting of this resume. Human review is required."
            else:
                # ==========================================
                # TIER 3: Deep Scoring & Bias Mitigation
                # ==========================================
                tier_3_result = run_tier_3_scoring(structured_cv, icp_text)
                
                # Apply the Deep Score overrides
                status_value = tier_3_result["status"]
                normalized_score = tier_3_result["aiScore"] # Update the AI score to the true deep score
                tags = tier_3_result["aiTags"]
                reasoning = tier_3_result["aiReasoning"]
        else:
            status_value = "Rejected"
            tags = ["tier-1:rejected", f"semantic-score:{normalized_score}"]
            reasoning = "Rejected at Tier 1. The candidate's CV does not semantically match the core requirements of the job."

        ai_output = {
            "applicationId": payload.applicationId,
            "status": status_value,
            "aiScore": normalized_score,
            "aiTags": tags,
            "aiReasoning": reasoning,
        }

        # 6. Send the result via Webhook back to the Node.js backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(payload.webhookUrl, json=ai_output)
            resp.raise_for_status()

        print(f"[{payload.applicationId}] Pipeline complete. Webhook sent. Final Score: {normalized_score}")

    except Exception as e:
        print(f"Error processing CV for application {payload.applicationId}: {e}")

@router.post("/queue-cv-screening", status_code=status.HTTP_202_ACCEPTED)
async def queue_cv_screening(request: CVScreeningRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_cv_pipeline, request)
    return {"message": "CV screening task queued successfully."}