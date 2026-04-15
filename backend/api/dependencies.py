import os
import httpx
import jwt
from fastapi import Request, HTTPException

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-enterprise-key")
NODE_API_BASE_URL = os.getenv("ROOT_URL", "http://127.0.0.1:3000").rstrip("/")
JWT_ISSUER = os.getenv("JWT_ISSUER", "company-chatbot-auth-service")
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "company-chatbot-apps")
AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "authcookie1")
VALID_ROLES = {"user", "admin", "superadmin", "interviewer"}


def get_request_token(request: Request):
    cookie_token = request.cookies.get(AUTH_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()

    return None


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
    token = get_request_token(request)

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
        )
        email = payload.get("email") or payload.get("sub") or ""
        payload["email"] = email
        payload["role"] = await get_latest_role(email, payload.get("role", "user"))
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
