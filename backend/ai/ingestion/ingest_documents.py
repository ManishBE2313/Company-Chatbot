import os
from pathlib import Path

from docling.document_converter import DocumentConverter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data"
COLLECTION_NAME = "company_documents"

def load_documents():
    """Parse documents using Docling"""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Data directory not found: {DATA_PATH}. "
            "Place your source documents inside backend/data."
        )

    if not DATA_PATH.is_dir():
        raise NotADirectoryError(f"Expected a directory at: {DATA_PATH}")

    converter = DocumentConverter()
    docs = []

    for path in sorted(DATA_PATH.iterdir()):
        if not path.is_file():
            continue

        print(f"Parsing {path.name} with Docling...")
        result = converter.convert(str(path))
        text = result.document.export_to_text()
        docs.append(Document(page_content=text, metadata={"source": path.name}))

    if not docs:
        raise ValueError(
            f"No documents found in {DATA_PATH}. Add files to backend/data before ingestion."
        )

    return docs

def chunk_documents(documents):
    """Split documents into chunks"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    chunks = splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    return chunks

def get_embedding_model():
    """Load BGE embedding model"""
    return HuggingFaceBgeEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

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

def run_pipeline():
    docs = load_documents()
    chunks = chunk_documents(docs)
    store_in_qdrant(chunks)

if __name__ == "__main__":
    run_pipeline()
