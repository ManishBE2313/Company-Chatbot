import os
import requests
import msal
from pathlib import Path

def get_msgraph_token():
    """Authenticates with Entra ID and returns an access token."""
    client_id = os.getenv("MS_CLIENT_ID")
    client_secret = os.getenv("MS_CLIENT_SECRET")
    tenant_id = os.getenv("MS_TENANT_ID")
    authority = f"https://login.microsoftonline.com/{tenant_id}"
    
    app = msal.ConfidentialClientApplication(
        client_id, authority=authority, client_credential=client_secret
    )
    
    # Request token for Microsoft Graph API
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Failed to get token: {result.get('error_description')}")

def download_from_sharepoint(site_id: str, download_path: Path):
    """Downloads files from a SharePoint site to the local directory."""
    print("Connecting to SharePoint...")
    token = get_msgraph_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Microsoft Graph API endpoint to get the root drive of a site
    # Microsoft Graph API endpoint pointing to your specific HR folder
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