import os
import json
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from api.security import is_prompt_injection
from ai.orchestrator.graph import build_graph
from api.auth import router as auth_router
from api.dependencies import get_current_user
from api.candidate_intake import router as candidate_intake_router
from api.hr_jobs import router as hr_jobs_router
from api.job_setup import router as job_setup_router
from api.batch_intake import router as batch_intake_router
from api.job_evaluate import router as job_evaluate_router
from api.settings_ai import router as settings_ai_router

app = FastAPI(
    title="Knowledge AI API",
    description="API for routing user queries to domain-specific AI agents.",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(candidate_intake_router)
app.include_router(hr_jobs_router)
app.include_router(job_setup_router)
app.include_router(batch_intake_router)
app.include_router(job_evaluate_router)
app.include_router(settings_ai_router)

@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/docs")

cors_origins_str = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
)
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001").strip()

configured_origins = [
    origin.strip()
    for origin in cors_origins_str.split(",")
    if origin.strip()
]

local_dev_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    frontend_url,
]

if not configured_origins or "*" in configured_origins:
    allowed_origins = list(dict.fromkeys(local_dev_origins))
else:
    allowed_origins = list(dict.fromkeys(configured_origins + local_dev_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

workflow_app = build_graph()

class ChatRequest(BaseModel):
    question: str
    thread_id: Optional[str] = "default_thread"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user: dict = Depends(get_current_user)):
    if is_prompt_injection(request.question):
        raise HTTPException(
            status_code=400,
            detail="Security alert: Request blocked due to restricted keyword patterns."
        )

    async def event_generator():
        try:
            initial_state = {
                "question": request.question,
                "route": "",
                "context": [],
                "answer": ""
            }

            secure_thread_id = f"{user.get('sub')}_{request.thread_id}"
            config = {"configurable": {"thread_id": secure_thread_id}}

            valid_agent_nodes = ["hr_agent", "it_agent", "finance_agent", "general_agent"]

            async for event in workflow_app.astream_events(initial_state, config=config, version="v2"):
                kind = event["event"]
                node_name = event.get("metadata", {}).get("langgraph_node", "")

                if kind == "on_chat_model_stream" and node_name in valid_agent_nodes:
                    chunk = event["data"]["chunk"].content
                    if chunk:
                        yield f"data: {json.dumps({'content': chunk})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            print(f"Streaming Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/user/me")
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    return {
        "email": user.get("email") or user.get("sub"),
        "role": user.get("role"),
        "is_sso": user.get("is_sso", False),
    }
