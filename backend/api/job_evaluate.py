import json
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage

# Using your existing fast 8B model for quick evaluations
from ai.llm.client import get_worker_llm

router = APIRouter(prefix="/api/jobs", tags=["job-evaluation"])

# ==========================================
# 1. Pydantic Models
# ==========================================
class JobEvaluationRequest(BaseModel):
    title: str = Field(..., description="The proposed job title")
    requirements: dict | str = Field(..., description="The raw JD or JSON requirements")
    department: str = Field(None, description="Department name")
    level: str = Field(None, description="Seniority level (e.g., Junior, Senior)")

# ==========================================
# 2. Evaluation Endpoint
# ==========================================
@router.post("/evaluate-jd")
async def evaluate_job_description(payload: JobEvaluationRequest):
    """
    Evaluates a drafted Job Description for realistic expectations and skill alignment.
    Returns a confidence score and approval status.
    """
    try:
        print(f"[JD Evaluation] Evaluating draft for: {payload.title}")
        
        llm = get_worker_llm()
        
        # Keep the prompt basic for now, but structured so it can be expanded later.
        eval_prompt = f"""
        You are an expert HR AI assistant evaluating a new Job Description drafted by a non-HR manager.
        Your task is to check if the requirements are realistic for the given title and level.
        
        Job Title: {payload.title}
        Level: {payload.level or 'Not specified'}
        Department: {payload.department or 'Not specified'}
        Requirements: {payload.requirements}
        
        Evaluate the job and return ONLY a valid JSON object matching this exact schema:
        {{
            "confidenceScore": <integer 0-100, where 100 is perfectly aligned>,
            "isApproved": <boolean, true if score is >= 80>,
            "mismatchedSkills": ["<string, e.g., 'Asking for 10 years React experience for a Junior role'>"],
            "warnings": ["<string, friendly advice to the manager on how to fix the JD>"]
        }}
        
        Do not include markdown formatting like ```json. Output raw JSON only.
        """
        
        response = llm.invoke([HumanMessage(content=eval_prompt)])
        raw_output = response.content.strip()
        
        # Clean up potential markdown blocks
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
            
        evaluation = json.loads(raw_output.strip())
        
        # Ensure fallback defaults if LLM misses a key
        final_result = {
            "confidenceScore": evaluation.get("confidenceScore", 50),
            "isApproved": evaluation.get("isApproved", False),
            "mismatchedSkills": evaluation.get("mismatchedSkills", []),
            "warnings": evaluation.get("warnings", [])
        }
        
        print(f"[JD Evaluation] Score: {final_result['confidenceScore']} | Approved: {final_result['isApproved']}")
        
        return final_result

    except json.JSONDecodeError as e:
        print(f"[JD Evaluation Error] Failed to parse AI response: {e}")
        # Safe fallback so the frontend doesn't crash, but forces an HR review
        return {
            "confidenceScore": 0,
            "isApproved": False,
            "mismatchedSkills": ["AI evaluation failed to parse."],
            "warnings": ["System encountered an error. This job requires manual HR review."]
        }
    except Exception as e:
        print(f"[JD Evaluation Error] {str(e)}")
        return {"error": "Internal server error during JD evaluation", "details": str(e)}