import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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

# Add this tiny function at the top of your routes
@app.get("/", include_in_schema=False)
def read_root():
    """Redirect the root URL directly to the Swagger UI docs."""
    return RedirectResponse(url="/docs")

# Fetch allowed CORS origins from the .env file.
# Expects a comma-separated list like: "http://localhost:3000,http://localhost:8080"
# Defaults to "*" only if the variable is completely missing.
cors_origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Configure CORS dynamically based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build the LangGraph application once at startup
workflow_app = build_graph()

# Define the data structure expected from the client request
class ChatRequest(BaseModel):
    question: str

# Define the data structure returned to the client
class ChatResponse(BaseModel):
    question: str
    answer: str
    route_taken: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Accepts a user question, processes it through the LangGraph AI workflow,
    and returns the final retrieved answer and the route taken.
    """
    try:
        # --- NEW SECURITY GUARDRAIL ---
        # Evaluate the user input for malicious prompt injection patterns.
        # If detected, immediately halt execution and return a 400 Bad Request.
        if is_prompt_injection(request.question):
            raise HTTPException(
                status_code=400, 
                detail="Security alert: Request blocked due to restricted keyword patterns."
            )
        # ------------------------------

        # Initialize the graph state
        initial_state = {
            "question": request.question,
            "route": "",
            "context": [],
            "answer": ""
        }
        
        # Execute the LangGraph workflow
        final_state = workflow_app.invoke(initial_state)
        
        # Return the extracted outputs
        return ChatResponse(
            question=final_state.get("question", request.question),
            answer=final_state.get("answer", "No answer generated."),
            route_taken=final_state.get("route", "unknown")
        )
        
    except HTTPException as he:
        # Explicitly catch HTTPExceptions (like our security block) 
        # so they return the correct status code (e.g., 400) to the client.
        raise he
    except Exception as e:
        # Catch all other unhandled internal processing errors as 500s.
        raise HTTPException(status_code=500, detail=str(e))