# api/dependencies.py
import os
import httpx
import jwt
from fastapi import Request, HTTPException

# This must match the secret used in api/auth.py
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-enterprise-key")
NODE_API_BASE_URL = os.getenv("ROOT_URL", "http://127.0.0.1:3000").rstrip("/")
VALID_ROLES = {"user", "admin", "superadmin","interviewer"}


async def get_latest_role(email: str, fallback_role: str):
    if not email:
        return fallback_role if fallback_role in VALID_ROLES else "user"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{NODE_API_BASE_URL}/api/hr/user/role",
                params={"email": email},
            )
            response.raise_for_status()
            role = response.json().get("data", {}).get("role")
            if role in VALID_ROLES:
                return role
    except httpx.HTTPError as error:
        print(f"Role refresh failed: {error}")

    return fallback_role if fallback_role in VALID_ROLES else "user"


async def get_current_user(request: Request):
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
        payload["role"] = await get_latest_role(payload.get("sub", ""), payload.get("role", "user"))
        return payload # Returns a dictionary containing user details (e.g., email, role)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
