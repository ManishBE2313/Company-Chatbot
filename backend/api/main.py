# main.py
import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from the .env file before anything else
load_dotenv()

# Import the security guardrail, LangGraph workflow, and our NEW auth modules
from api.security import is_prompt_injection
from ai.orchestrator.graph import build_graph
from api.auth import router as auth_router            # <--- NEW
from api.dependencies import get_current_user         # <--- NEW

# Initialize the FastAPI application
app = FastAPI(
    title="Knowledge AI API",
    description="API for routing user queries to domain-specific AI agents.",
    version="1.0.0"
)

# --- NEW: Register the Auth Router ---
app.include_router(auth_router)

@app.get("/", include_in_schema=False)
def read_root():
    """Redirect the root URL directly to the Swagger UI docs."""
    return RedirectResponse(url="/docs")

# --- MODIFIED CORS CONFIGURATION ---
cors_origins_str = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()

# Browsers reject credentialed requests when CORS returns a wildcard origin.
# To support the auth cookie used by `/api/chat`, we normalize local dev
# origins into an explicit allowlist even if the env file contains `*`.
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

allow_credentials = True

# Configure CORS dynamically based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------

# Build the LangGraph application once at startup
workflow_app = build_graph()

# Define the data structure expected from the client request
class ChatRequest(BaseModel):
    question: str
    thread_id: Optional[str] = "default_thread"

# --- NEW: Added the `user` dependency to protect the route ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user: dict = Depends(get_current_user)):
    """
    Accepts a user question, processes it through the LangGraph AI workflow,
    and returns the final retrieved answer streaming token-by-token.
    Requires a valid JWT session cookie from the SSO login.
    """
    # Evaluate the user input for malicious prompt injection patterns.
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
            
            # Using the logged-in user's email AND thread_id to separate chat histories securely
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
