# backend/api/auth.py
import os
import secrets
import httpx
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from urllib.parse import urlencode

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Microsoft SSO Configuration ---
MS_CLIENT_ID = os.getenv("MS_CLIENT_ID", "your_ms_client_id")
MS_CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET", "your_ms_client_secret")
MS_TENANT_ID = os.getenv("MS_TENANT_ID", "common") # Use "common" for multi-tenant or your specific Tenant ID
MS_REDIRECT_URI = os.getenv("MS_REDIRECT_URI", "http://localhost:8000/api/auth/callback")

# Microsoft Endpoints
MS_AUTH_URL = f"https://login.microsoftonline.com/{MS_TENANT_ID}/oauth2/v2.0/authorize"
MS_TOKEN_URL = f"https://login.microsoftonline.com/{MS_TENANT_ID}/oauth2/v2.0/token"
MS_GRAPH_URL = "https://graph.microsoft.com/v1.0/me"

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-enterprise-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
NODE_API_BASE_URL = os.getenv("ROOT_URL", "http://127.0.0.1:3000").rstrip("/")
VALID_ROLES = {"user", "admin", "superadmin"}

oauth_states = set()


def create_jwt_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")


async def upsert_user_and_get_role(client: httpx.AsyncClient, email: str, first_name: str, last_name: str | None):
    try:
        response = await client.post(
            f"{NODE_API_BASE_URL}/api/hr/user/upsert",
            json={
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        role = response.json().get("data", {}).get("role")
        if role in VALID_ROLES:
            return role
    except httpx.HTTPError as error:
        print(f"User upsert failed: {error}")

    return "user"


@router.get("/sso/login")
async def sso_login_initiator():
    """
    Redirects the user to the Microsoft login page.
    """
    state = secrets.token_urlsafe(32)
    oauth_states.add(state)

    params = {
        "client_id": MS_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": MS_REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid profile email User.Read",
        "state": state,
        "prompt": "select_account"
    }

    auth_url = f"{MS_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def sso_login_callback(request: Request, code: str = None, state: str = None, error: str = None, error_description: str = None):
    """
    Handles the callback from Microsoft Entra ID.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"Microsoft SSO failed: {error_description or error}")

    if state not in oauth_states:
        raise HTTPException(status_code=400, detail="Invalid state parameter (CSRF protection)")
    oauth_states.remove(state)

    try:
        async with httpx.AsyncClient() as client:
            # 1. Exchange Auth Code for Access Token
            token_data = {
                "client_id": MS_CLIENT_ID,
                "scope": "openid profile email User.Read",
                "code": code,
                "redirect_uri": MS_REDIRECT_URI,
                "grant_type": "authorization_code",
                "client_secret": MS_CLIENT_SECRET
            }
            token_res = await client.post(MS_TOKEN_URL, data=token_data)
            token_res.raise_for_status()
            tokens = token_res.json()

            # 2. Fetch User Info from Microsoft Graph API
            user_info_res = await client.get(
                MS_GRAPH_URL,
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            user_info_res.raise_for_status()
            user_info = user_info_res.json()

            # Microsoft Graph usually returns the email in userPrincipalName or mail
            email = user_info.get("mail") or user_info.get("userPrincipalName")
            if not email:
                raise HTTPException(status_code=400, detail="Email not provided by Microsoft")

            email_from_sso = email.upper()
            first_name = user_info.get("givenName") or user_info.get("displayName") or email.split("@")[0]
            last_name = user_info.get("surname")
            user_role = await upsert_user_and_get_role(client, email_from_sso, first_name, last_name)

    except httpx.HTTPError as e:
        print(f"Microsoft Token/Graph Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with Microsoft Services")

    # 3. Generate our internal Chatbot Token
    app_token = create_jwt_token(
        {"sub": email_from_sso, "role": user_role, "is_sso": True},
        timedelta(hours=12)
    )

    redirect_response = RedirectResponse(url=FRONTEND_URL)

    cookie_settings = {
        "httponly": True,
        "samesite": "lax",
        "secure": False, # Change to True in Production
        "path": "/",
        "max_age":  12 * 60 * 60 # 12 hours in seconds
    }

    redirect_response.set_cookie(key="authcookie1", value=app_token, **cookie_settings)

    return redirect_response


@router.post("/logout")
async def logout():
    """
    Clears the chatbot session cookie.
    """
    response = JSONResponse({"success": True})
    response.delete_cookie(
        key="authcookie1",
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return response
