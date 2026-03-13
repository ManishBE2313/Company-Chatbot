# api/dependencies.py
import os
import jwt
from fastapi import Request, HTTPException

# This must match the secret used in api/auth.py
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-enterprise-key")

def get_current_user(request: Request):
    """
    FastAPI Dependency to check for a valid JWT in the HTTP-Only cookies.
    If the cookie is missing or invalid, it blocks the request.
    """
    # Look for the exact cookie name we set during the SSO login callback
    token = request.cookies.get("authcookie1")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")

    try:
        # Decode and verify the JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload # Returns a dictionary containing user details (e.g., email, role)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")