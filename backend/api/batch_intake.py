# api/batch_intake.py
import os
import json
import httpx
import base64
import io
import PyPDF2 
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

# Aligning exactly with your provided file structures
from ai.ingestion.connectors.msgraph_connector import get_msgraph_token
from ai.llm.client import get_worker_llm

router = APIRouter(prefix="/api/batch-ingest", tags=["Batch Ingest"])

class BatchImportRequest(BaseModel):
    jobId: str
    folderUrl: str

async def process_batch_resumes(job_id: str, folder_url: str):
    """
    Background Task: Connects to SharePoint via Graph API, loops through PDFs, 
    extracts basic identities using ChatGroq, and posts them to the Node.js backend.
    """
    try:
        print(f"[Batch Ingest] Starting import for Job ID: {job_id}")
        
        # 1. Authenticate using your exact msal token function
        token = get_msgraph_token()
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        
        # 2. Convert the pasted frontend URL into a Microsoft Graph /shares endpoint
        # This allows you to fetch from any shared folder link pasted in the UI
        encoded_url = base64.b64encode(folder_url.encode('utf-8')).decode('utf-8')
        encoded_url = "u!" + encoded_url.rstrip('=').replace('/', '_').replace('+', '-')
        graph_endpoint = f"https://graph.microsoft.com/v1.0/shares/{encoded_url}/driveItem/children"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                # Fetch folder items from SharePoint
                response = await client.get(graph_endpoint, headers=headers)
                response.raise_for_status()
                items = response.json().get('value', [])
                
            except httpx.HTTPStatusError as http_err:
                # Catch 401 Unauthorized or 403 Forbidden
                if http_err.response.status_code in (401, 403):
                    print(f"[Batch Ingest] Unauthorized. Triggering Admin Email for {folder_url}")
                    
                    # Target your newly created Node.js endpoint
                    nodejs_backend_url = os.getenv("NODEJS_BACKEND_URL", "http://127.0.0.1:3000")
                    mail_endpoint = f"{nodejs_backend_url}/api/notifications/sharepoint-grant"
                    
                    mail_payload = {
                        "email": "manish.singh@blockexcel.com", # Target admin
                        "folderUrl": folder_url,
                        "clientId": os.getenv("SHAREPOINT_CLIENT_ID", "MISSING_CLIENT_ID"),
                        "encodedUrl": encoded_url
                    }
                    
                    try:
                        # Capture the response from Node.js
                        mail_response = await client.post(mail_endpoint, json=mail_payload)
                        
                        # Force Python to throw an error if Node.js returns a 404 or 500
                        mail_response.raise_for_status() 
                        
                        print("[Batch Ingest] Admin email triggered successfully.")
                    except httpx.HTTPStatusError as mail_http_err:
                        # This will tell you if Node.js rejected the request!
                        print(f"[Batch Ingest] Node.js rejected the email request: {mail_http_err.response.status_code} - {mail_http_err.response.text}")
                    except Exception as mail_err:
                        print(f"[Batch Ingest] Failed to connect to Node.js for email: {mail_err}")
                        
                    return # Stop processing this batch since we don't have access
                else:
                    raise http_err # Re-raise if it's a 404, 500, etc.

            # Filter for PDF files only
            pdf_files = [item for item in items if 'file' in item and item['name'].lower().endswith('.pdf')]
            
            # Initialize your exact ChatGroq worker (Llama-3.1-8b)
            llm = get_worker_llm()
            nodejs_backend_url = os.getenv("NODEJS_BACKEND_URL", "http://127.0.0.1:3000")
            upload_endpoint = f"{nodejs_backend_url}/api/candidates/upload"

            for file_info in pdf_files:
                try:
                    file_name = file_info['name']
                    download_url = file_info.get('@microsoft.graph.downloadUrl')
                    
                    if not download_url:
                        continue
                        
                    print(f"[Batch Ingest] Downloading and processing {file_name}...")
                    
                    # 3. Download the PDF file into memory (no local saving required)
                    file_response = await client.get(download_url)
                    file_bytes = file_response.content
                    
                    # 4. Extract text from the PDF bytes in memory
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                    raw_text = ""
                    # Read up to the first 3 pages to save tokens and find the identity
                    for page_num in range(min(3, len(pdf_reader.pages))): 
                        raw_text += pdf_reader.pages[page_num].extract_text() or ""
                    
                    # Store a reference URL (fallback to the SharePoint download link)
                    temp_resume_url = file_info.get('webUrl', "https://placeholder-url.com")
                    
                    # 5. Extract Identity using ChatGroq (Llama-3)
                    prompt = f"""
                    Extract the first name, last name, and email from the following resume text.
                    Return ONLY a valid JSON object: {{"firstName": "...", "lastName": "...", "email": "..."}}
                    If email is missing, generate a dummy one like 'unknown_{file_info['id'][:8]}@placeholder.com'.
                    Do not include markdown blocks or any other text.
                    
                    Resume Text:
                    {raw_text[:3000]} 
                    """
                    
                    llm_response = llm.invoke([HumanMessage(content=prompt)])
                    clean_json = llm_response.content.strip()
                    
                    # Clean up Groq markdown if present
                    if clean_json.startswith("```json"):
                        clean_json = clean_json[7:]
                    if clean_json.endswith("```"):
                        clean_json = clean_json[:-3]
                        
                    extracted_data = json.loads(clean_json.strip())
                    
                    # 6. Push to Node.js Candidate Upload Endpoint
                    payload = {
                        "jobId": job_id,
                        "firstName": extracted_data.get("firstName", "Unknown"),
                        "lastName": extracted_data.get("lastName", "Unknown"),
                        "email": extracted_data.get("email", f"unknown_{file_info['id'][:8]}@placeholder.com"),
                        "resumeUrl": temp_resume_url
                    }
                    
                    system_headers = {
                        "Content-Type": "application/json",
                        "x-user-email": "system-sync@company.com" 
                    }
                    
                    await client.post(upload_endpoint, json=payload, headers=system_headers)
                    print(f"[Batch Ingest] Successfully pushed {file_name} to Node.js queue.")
                    
                except Exception as file_err:
                    print(f"[Batch Ingest] Error processing {file_info.get('name')}: {file_err}")

    except Exception as e:
        print(f"[Batch Ingest] Critical failure during bulk import: {e}")


@router.post("/sharepoint-folder", status_code=202)
async def ingest_sharepoint_folder(request: BatchImportRequest, background_tasks: BackgroundTasks):
    """
    Accepts the Job ID and SharePoint Web URL, triggering the background worker.
    """
    background_tasks.add_task(process_batch_resumes, request.jobId, request.folderUrl)
    return {
        "message": "Batch import initiated successfully.",
        "status": "processing_in_background"
    }