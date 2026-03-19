import os
import io
from pathlib import Path
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

def download_from_gdrive(folder_id: str, download_path: Path):
    print("Connecting to Google Drive...")
    
    # 1. Get the folder where gdrive_connector.py currently lives
    current_dir = Path(__file__).parent
    
    # 2. Build the exact path to the JSON file inside that same folder
    cred_path = current_dir / 'google-credentials.json'
    
    if not cred_path.exists():
        raise FileNotFoundError(f"Google credentials not found at {cred_path}")

    # 3. Authenticate with Google Drive (Requires 'readonly' scope to download)
    scopes = ['https://www.googleapis.com/auth/drive.readonly']
    creds = Credentials.from_service_account_file(str(cred_path), scopes=scopes)
    service = build('drive', 'v3', credentials=creds)
    
    # 4. Query files in the specific folder 
    # (Filters out sub-folders and items in the trash)
    query = f"'{folder_id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    
    if not files:
        print("No files found in the specified Google Drive folder.")
        return

    # Ensure the local backend/data directory exists
    download_path.mkdir(parents=True, exist_ok=True)
    
    # 5. Loop through and download each file
    for file in files:
        file_id = file['id']
        file_name = file['name']
        print(f"Downloading {file_name} from Google Drive...")
        
        request = service.files().get_media(fileId=file_id)
        local_file_path = download_path / file_name
        
        # Download the file in chunks (safest way for large PDFs/documents)
        with io.FileIO(str(local_file_path), 'wb') as fh:
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
                
    print("Google Drive sync complete!")