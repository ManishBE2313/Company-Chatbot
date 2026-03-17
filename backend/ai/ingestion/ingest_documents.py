import os
import re
import hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from qdrant_client import QdrantClient
from docling.document_converter import DocumentConverter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.models import Filter, FieldCondition, MatchValue



BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data"
COLLECTION_NAME = "company_documents"




# -----------------------------
# Fast File Hashing
# -----------------------------


def file_hash(path: Path) -> str:
   """Generate MD5 hash without loading entire file into memory"""
   hash_md5 = hashlib.md5()


   with open(path, "rb") as f:
       for chunk in iter(lambda: f.read(4096), b""): # 4096 is chunk size loaded in memory
           hash_md5.update(chunk)


   return hash_md5.hexdigest()




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
# Parse Single File
# -----------------------------


def parse_file(path: Path):


   converter = DocumentConverter()


   h = file_hash(path)


   print(f"Parsing {path.name}")


   result = converter.convert(str(path))
   text = result.document.export_to_text()


   text = clean_text(text)
   text = redact_sensitive_data(text)


   return Document(
       page_content=text,
       metadata={
           "source": path.name,
           "file_hash": h
       }
   )




# -----------------------------
# Load Documents (Parallel)
# -----------------------------


def load_documents():


   if not DATA_PATH.exists():
       raise FileNotFoundError(f"Data directory not found: {DATA_PATH}")


   files = [p for p in DATA_PATH.iterdir() if p.is_file()]


   with ThreadPoolExecutor(max_workers=4) as executor: #four files can be parsed at the same time.
       docs = list(executor.map(parse_file, files))


   if not docs:
       raise ValueError("No documents found in data directory")


   return docs




# -----------------------------
# Chunking
# -----------------------------


def chunk_documents(documents):


   splitter = RecursiveCharacterTextSplitter(
       chunk_size=800,      # larger chunks = fewer embeddings
       chunk_overlap=150
   )


   chunks = splitter.split_documents(documents)


   print(f"Created {len(chunks)} chunks")


   return chunks




# -----------------------------
# Embedding Model (Load Once)
# -----------------------------


def get_embedding_model():


   return HuggingFaceBgeEmbeddings(
       model_name="BAAI/bge-small-en-v1.5",
       model_kwargs={"device": "cpu"},
       encode_kwargs={
           "normalize_embeddings": True,
           "batch_size": 32
       },
   )


#load embedding model only once
EMBEDDINGS = get_embedding_model()


def document_exists(client, file_hash):
   """Check if a document with the same hash already exists in Qdrant"""


   # Get list of existing collections
   collections = client.get_collections().collections
   collection_names = [c.name for c in collections]


   # If collection does not exist yet, nothing exists
   if COLLECTION_NAME not in collection_names:
       return False


   result = client.scroll(
       collection_name=COLLECTION_NAME,
       scroll_filter={
           "must": [
               {
                   "key": "metadata.file_hash",
                   "match": {"value": file_hash}
               }
           ]
       },
       limit=1
   )


   points = result[0]


   return len(points) > 0

#deletion
def get_qdrant_documents(client):
    """Return dictionary of source -> file_hash currently stored in Qdrant"""

    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME not in collection_names:
        return {}

    docs = {}

    points, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        limit=1000
    )

    for p in points:
        source = p.payload["metadata"]["source"]
        file_hash = p.payload["metadata"]["file_hash"]
        docs[source] = file_hash

    return docs

def delete_document(client, source):
    """Delete all vectors belonging to a document"""

    print(f"Deleting vectors for removed/updated file: {source}")

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="metadata.source",
                    match=MatchValue(value=source)
                )
            ]
        )
    )

# -----------------------------
# Store in Qdrant
# -----------------------------


def store_in_qdrant(chunks):

    if not chunks:
        raise ValueError("No chunks were generated from the source documents.")

    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")

    print(f"Connecting to Qdrant at {qdrant_url}")

    client = QdrantClient(url=qdrant_url)

    # documents currently in Qdrant
    qdrant_docs = get_qdrant_documents(client)

    # documents currently in folder
    current_docs = {}

    for chunk in chunks:
        source = chunk.metadata["source"]
        file_hash = chunk.metadata["file_hash"]
        current_docs[source] = file_hash

    filtered_chunks = []

    # -------------------------
    # Detect UPDATED documents
    # -------------------------

    for source, file_hash in current_docs.items():

        if source in qdrant_docs:

            # unchanged document
            if qdrant_docs[source] == file_hash:
                print(f"Skipping unchanged document: {source}")
                continue

            # updated document
            else:
                delete_document(client, source)

        # add chunks for new or updated document
        for c in chunks:
            if c.metadata["source"] == source:
                filtered_chunks.append(c)

    # -------------------------
    # Detect DELETED documents
    # -------------------------

    deleted_docs = set(qdrant_docs.keys()) - set(current_docs.keys())

    for source in deleted_docs:
        delete_document(client, source)

    if not filtered_chunks:
        print("No new or updated documents to upload.")
        return

    print(f"Uploading {len(filtered_chunks)} chunks to Qdrant...")

    QdrantVectorStore.from_documents(
        documents=filtered_chunks,
        embedding=EMBEDDINGS,
        url=qdrant_url,
        collection_name=COLLECTION_NAME,
    )

    print("Data successfully stored in Qdrant")

# -----------------------------
# Run Pipeline
# -----------------------------


def run_pipeline():


   docs = load_documents()


   chunks = chunk_documents(docs)


   store_in_qdrant(chunks)




if __name__ == "__main__":
   run_pipeline()

