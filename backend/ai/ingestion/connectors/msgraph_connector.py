import os
import requests
import msal
import time
from pathlib import Path

# --- NEW: Token Manager Class for caching ---
class SharePointTokenManager:
    def __init__(self):
        self._cache = {}  # tenant_id -> {token, expires_at}

    def get_token(self, tenant_id: str, client_id: str, client_secret: str) -> str:
        # Return cached token if it is still valid (60-second buffer)
        cached = self._cache.get(tenant_id)
        if cached and cached['expires_at'] > time.time() + 60:
            return cached['token']

        # Acquire new token
        app = msal.ConfidentialClientApplication(
            client_id=client_id,
            client_credential=client_secret,
            authority=f'https://login.microsoftonline.com/{tenant_id}'
        )
        
        # We use .default scope for App-Only (Client Credentials) flow
        result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
        
        if 'access_token' not in result:
            raise Exception(f"Failed to get token: {result.get('error_description')}")

        # Cache the new token
        self._cache[tenant_id] = {
            'token': result['access_token'],
            'expires_at': time.time() + result.get('expires_in', 3599)
        }
        return result['access_token']

# Create a global instance so the cache persists across API calls
token_manager = SharePointTokenManager()

# --- MODIFIED: Wrapper to maintain compatibility with your existing code ---
def get_msgraph_token():
    """Authenticates with Entra ID and returns a cached access token."""
    client_id = os.getenv("SHAREPOINT_CLIENT_ID")
    client_secret = os.getenv("SHAREPOINT_CLIENT_SECRET")
    tenant_id = os.getenv("SHAREPOINT_TENANT_ID") # Do not use "common" for App-Only flow, use your specific tenant ID
    
    if not all([client_id, client_secret, tenant_id]):
         raise ValueError("Missing Microsoft Graph credentials in environment variables.")
         
    return token_manager.get_token(tenant_id, client_id, client_secret)


def download_from_sharepoint(site_id: str, download_path: Path):
    """Downloads files from a SharePoint site to the local directory."""
    print("Connecting to SharePoint...")
    token = get_msgraph_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Microsoft Graph API endpoint to get the root drive of a site
    endpoint = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drive/root:/BlockExcel/People.Blockexcel.employee policies:/children"
    
    response = requests.get(endpoint, headers=headers)
    response.raise_for_status()
    items = response.json().get('value', [])
    
    download_path.mkdir(parents=True, exist_ok=True)
    
    for item in items:
        # Check if the item is a file (not a folder)
        if 'file' in item:
            file_name = item['name']
            download_url = item.get('@microsoft.graph.downloadUrl')
            
            if download_url:
                print(f"Downloading {file_name} from SharePoint...")
                file_response = requests.get(download_url)
                
                # Save it to your local backend/data folder
                local_file_path = download_path / file_name
                with open(local_file_path, 'wb') as f:
                    f.write(file_response.content)
                    
    print("SharePoint sync complete!")