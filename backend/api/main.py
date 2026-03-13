import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from the .env file before anything else
load_dotenv()

# Import the security guardrail and the LangGraph workflow builder
from api.security import is_prompt_injection
from ai.orchestrator.graph import build_graph

# Initialize the FastAPI application
app = FastAPI(
    title="Knowledge AI API",
    description="API for routing user queries to domain-specific AI agents.",
    version="1.0.0"
)

@app.get("/", include_in_schema=False)
def read_root():
    """Redirect the root URL directly to the Swagger UI docs."""
    return RedirectResponse(url="/docs")

# --- MODIFIED CORS CONFIGURATION ---
# Fetch allowed CORS origins from the .env file.
# Expects a comma-separated list like: "http://localhost:3000,https://www.your-website.com"
# Defaults to "" to handle the wildcard check below.
cors_origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "")

if not cors_origins_str or cors_origins_str.strip() == "*":
    # If no specific origins are provided, allow everything (Good for local testing)
    allowed_origins = ["*"]
    allow_credentials = False # Security rule: Cannot use credentials if origins = "*"
else:
    # If specific websites are provided, allow only them (Good for Production)
    allowed_origins = [origin.strip() for origin in cors_origins_str.split(",")]
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
    # NEW: Allow the client to pass a unique session ID for conversational memory.
    # If none is provided, it defaults to "default_thread".
    thread_id: Optional[str] = "default_thread"

# Define the data structure returned to the client (Kept for reference, though we stream now)
class ChatResponse(BaseModel):
    question: str
    answer: str
    route_taken: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Accepts a user question, processes it through the LangGraph AI workflow,
    and returns the final retrieved answer streaming token-by-token.
    """
    # Evaluate the user input for malicious prompt injection patterns.
    # If detected, immediately halt execution and return a 400 Bad Request.
    if is_prompt_injection(request.question):
        raise HTTPException(
            status_code=400, 
            detail="Security alert: Request blocked due to restricted keyword patterns."
        )

    async def event_generator():
        try:
            # Initialize the graph state for this specific interaction.
            # LangGraph's MemorySaver will automatically fetch the existing chat_history 
            # for this thread_id and merge it with this new question.
            initial_state = {
                "question": request.question,
                "route": "",
                "context": [],
                "answer": ""
            }
            
            # NEW: Create the configuration dictionary containing the thread_id.
            # This tells LangGraph exactly which memory bucket to read from and write to.
            config = {"configurable": {"thread_id": request.thread_id}}
            
            # We only want to stream text from the actual answering agents, NOT the routing supervisor
            valid_agent_nodes = ["hr_agent", "it_agent", "finance_agent", "general_agent"]

            # Execute the LangGraph workflow with the memory configuration using astream_events
            async for event in workflow_app.astream_events(initial_state, config=config, version="v2"):
                kind = event["event"]
                node_name = event.get("metadata", {}).get("langgraph_node", "")

                # If the event is the AI typing a word, AND it's coming from a final agent...
                if kind == "on_chat_model_stream" and node_name in valid_agent_nodes:
                    chunk = event["data"]["chunk"].content
                    if chunk:
                        # Yield it immediately to the frontend in SSE JSON format
                        yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # When the graph finishes, tell the frontend to close the connection
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            # Catch all other unhandled internal processing errors and stream the error
            print(f"Streaming Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # Return the continuous stream instead of a single blocked response
    return StreamingResponse(event_generator(), media_type="text/event-stream")