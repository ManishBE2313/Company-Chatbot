import os
import re
import hashlib
from pathlib import Path
from dotenv import load_dotenv
# This calculates the path to your backend folder and finds the .env file there
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

from docling.document_converter import DocumentConverter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from connectors.msgraph_connector import download_from_sharepoint
from connectors.gdrive_connector import download_from_gdrive

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data"
COLLECTION_NAME = "company_documents"


# -----------------------------
# Document Hashing
# -----------------------------

def file_hash(path: Path) -> str:
    """Generate MD5 hash for a file to avoid duplicate ingestion"""
    with open(path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()




# -----------------------------
# Cleaning
# -----------------------------

def clean_text(text: str) -> str:
    """Remove noisy artifacts from parsed documents"""

    # Remove page numbers like "Page 1", "Page 2"
    text = re.sub(r'Page\s*\d+', '', text, flags=re.IGNORECASE)

    # Remove multiple newlines
    text = re.sub(r'\n+', '\n', text)

    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove repeated header lines (very common in PDFs)
    lines = text.split("\n")
    unique_lines = []
    prev = None

    for line in lines:
        if line.strip() != prev:
            unique_lines.append(line)
        prev = line.strip()

    text = "\n".join(unique_lines)

    return text.strip()


# -----------------------------
# Sensitive Data Redaction
# -----------------------------


def redact_sensitive_data(text: str) -> str:
    """Replace sensitive information with placeholders"""

    patterns = {
        # Emails
        "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',

        # Phone numbers (international + Indian)
        "phone": r'(\+?\d{1,3}[\s\-]?)?\d{10}',

        # Credit card numbers
        "credit_card": r'\b(?:\d[ -]*?){13,16}\b',

        # Salary patterns like "Salary: 50000" or "$50000"
        "salary": r'(salary\s*[:\-]?\s*\$?\d+|\$\d{2,})'
    }

    text = re.sub(patterns["email"], "xxx@gmail.com", text)
    text = re.sub(patterns["phone"], "9999999999", text)
    text = re.sub(patterns["credit_card"], "CONFIDENTIAL_CARD", text)
    text = re.sub(patterns["salary"], "salary: confidential", text, flags=re.IGNORECASE)

    return text

# -----------------------------
# Load and Parse Documents
# -----------------------------

def load_documents():
    """Parse documents using Docling with cleaning and redaction"""

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Data directory not found: {DATA_PATH}. "
            "Place your source documents inside backend/data."
        )

    converter = DocumentConverter()
    docs = []

    seen_hashes = set()

    for path in sorted(DATA_PATH.iterdir()):
        if not path.is_file():
            continue

        # ---- HASH CHECK ----
        h = file_hash(path)

        if h in seen_hashes:
            print(f"Skipping duplicate file: {path.name}")
            continue

        seen_hashes.add(h)

        print(f"Parsing {path.name} with Docling...")

        result = converter.convert(str(path))
        text = result.document.export_to_text()

        # ---- CLEANING ----
        text = clean_text(text)

        # ---- REDACTION ----
        text = redact_sensitive_data(text)

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "source": path.name,
                    "file_hash": h
                }
            )
        )

    if not docs:
        raise ValueError(
            f"No documents found in {DATA_PATH}. Add files to backend/data before ingestion."
        )

    return docs

# -----------------------------
# Chunking
# -----------------------------

def chunk_documents(documents):
    """Split documents into chunks"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    chunks = splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    return chunks


# -----------------------------
# Embedding Model
# -----------------------------

def get_embedding_model():
    """Load BGE embedding model"""
    return HuggingFaceBgeEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

# -----------------------------
# Store in Qdrant
# -----------------------------

def store_in_qdrant(chunks):
    """Store embeddings in Qdrant"""
    if not chunks:
        raise ValueError("No chunks were generated from the source documents.")

    embeddings = get_embedding_model()
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")

    print(f"Uploading vectors to Qdrant at {qdrant_url}...")

    QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        url=qdrant_url,
        collection_name=COLLECTION_NAME,
    )

    print("Data successfully stored in Qdrant")

# Run the pipeline

def run_pipeline():
    # 1. Fetch from Google Drive
    folder_id = os.getenv("GDRIVE_FOLDER_ID")
    if folder_id:
        download_from_gdrive(folder_id=folder_id, download_path=DATA_PATH)
    else:
        print("Warning: No GDRIVE_FOLDER_ID found in .env. Skipping Google Drive sync.")

    # 2. Fetch from SharePoint
    # site_id = os.getenv("SHAREPOINT_SITE_ID")
    # if site_id:
    #     download_from_sharepoint(site_id=site_id, download_path=DATA_PATH)
    # else:
    #     print("Warning: No SHAREPOINT_SITE_ID found in .env. Skipping SharePoint sync.")
    
    # 3. Process ALL files (Google Drive, SharePoint, and Local Manual Files)
    # Docling will read everything currently sitting in the DATA_PATH folder.
    docs = load_documents()
    chunks = chunk_documents(docs)
    store_in_qdrant(chunks)

if __name__ == "__main__":
    run_pipeline()
