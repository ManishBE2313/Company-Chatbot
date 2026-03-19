import os
import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Importing existing LLM and Embedding utilities from your codebase
from ai.llm.client import get_worker_llm
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.messages import SystemMessage, HumanMessage

# Initialize the router for job-related endpoints
router = APIRouter(prefix="/api/jobs", tags=["job-setup"])

# ==========================================
# 1. Pydantic Models for Request Validation
# ==========================================
class JobCriteriaPayload(BaseModel):
    """
    Standardized payload expected from the Node.js backend when a new job is created.
    """
    jobId: str = Field(..., description="The UUID of the job from the PostgreSQL database")
    title: str = Field(..., description="The title of the job (e.g., 'Senior Backend Engineer')")
    requirements: dict = Field(..., description="A JSON object containing the must-have skills, experience, etc.")

# ==========================================
# 2. Core Logic / Background Task
# ==========================================
def generate_and_store_job_targets(payload: JobCriteriaPayload):
    """
    Background worker function that generates the ICP and HyDE vectors for a job
    and stores them in the Qdrant vector database.
    """
    try:
        print(f"[Job Setup] Starting target generation for Job ID: {payload.jobId}")
        
        # 1. Initialize the LLM (using your existing fast 8B model)
        llm = get_worker_llm()
        
        # 2. Generate the Ideal Candidate Profile (ICP)
        # We ask the LLM to convert raw requirements into a descriptive paragraph of the perfect hire.
        icp_prompt = f"""
        You are an expert technical recruiter. Based on the following job title and requirements, 
        write a strict, concise 'Ideal Candidate Profile' (ICP) summarizing the exact skills, 
        seniority, and outcomes expected of the perfect candidate. 
        
        Job Title: {payload.title}
        Requirements: {payload.requirements}
        
        Output ONLY the profile description. No introductory text.
        """
        icp_response = llm.invoke([HumanMessage(content=icp_prompt)])
        icp_text = icp_response.content.strip()
        
        # 3. Generate the HyDE (Hypothetical Document Embeddings) Resume
        # We ask the LLM to write a fake, highly realistic resume for this exact job.
        hyde_prompt = f"""
        You are an expert resume writer. Based on the following job title and requirements, 
        write a highly realistic, text-only resume for the PERFECT candidate applying for this role.
        Include realistic past companies, bullet points, and metrics that perfectly align with the requirements.
        
        Job Title: {payload.title}
        Requirements: {payload.requirements}
        
        Output ONLY the resume text. Do not include names or contact info (keep it blind).
        """
        hyde_response = llm.invoke([HumanMessage(content=hyde_prompt)])
        hyde_text = hyde_response.content.strip()

        # 4. Initialize Embeddings (Using your existing HuggingFace BGE setup)
        embeddings_model = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        
        # 5. Generate Vectors (Embed the generated texts into arrays of floats)
        icp_vector = embeddings_model.embed_query(icp_text)
        hyde_vector = embeddings_model.embed_query(hyde_text)

        # 6. Store in Qdrant
        # We use a dedicated collection for job targets so they don't mix with general company docs.
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        client = QdrantClient(url=qdrant_url)
        collection_name = "job_targets"
        
        # Ensure the collection exists; if not, create it. (BGE-small uses 384 dimensions)
        if not client.collection_exists(collection_name):
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            
        # Upsert the two points (ICP and HyDE) into Qdrant, attaching the jobId as metadata.
        # We use consistent UUIDs based on the jobId so we can update them later if the job changes.
        client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{payload.jobId}_icp")),
                    vector=icp_vector,
                    payload={"jobId": payload.jobId, "type": "icp", "text": icp_text}
                ),
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{payload.jobId}_hyde")),
                    vector=hyde_vector,
                    payload={"jobId": payload.jobId, "type": "hyde", "text": hyde_text}
                )
            ]
        )
        
        print(f"[Job Setup] Successfully stored ICP and HyDE vectors for Job ID: {payload.jobId}")

    except Exception as e:
        # In a production system, you might want to log this to an error tracking service
        print(f"[Job Setup Error] Failed to process Job ID {payload.jobId}: {str(e)}")


# ==========================================
# 3. API Endpoint
# ==========================================
@router.post("/setup")
async def setup_job_targets(payload: JobCriteriaPayload, background_tasks: BackgroundTasks):
    """
    Endpoint triggered by the Node.js backend when a new Job Criteria is created or updated.
    We run the LLM generation and vector embedding as a background task to return a fast 202 Accepted response.
    """
    # Add the processing function to FastAPI's background task queue
    background_tasks.add_task(generate_and_store_job_targets, payload)
    
    return {
        "message": "Job setup accepted. Target vectors (ICP & HyDE) are being generated in the background.",
        "jobId": payload.jobId
    }