import os
import re

from docling.document_converter import DocumentConverter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_core.documents import Document


DATA_FOLDER = "data"
COLLECTION_NAME = "company_knowledge"


def get_embedding_model():

    return HuggingFaceBgeEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )


def load_documents():

    files = []

    for file in os.listdir(DATA_FOLDER):

        if file.endswith((".pdf", ".docx", ".txt")):
            files.append(os.path.join(DATA_FOLDER, file))

    return files


def parse_document(file_path):

    converter = DocumentConverter()

    result = converter.convert(file_path)

    document = result.document

    return document.export_to_markdown()


def clean_text(text):

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def chunk_text(text, chunk_size=500, overlap=100):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - overlap

    return chunks


def run_pipeline():

    embeddings = get_embedding_model()

    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")

    client = QdrantClient(url=qdrant_url)

    docs = []

    files = load_documents()

    for file in files:

        print("Processing:", file)

        text = parse_document(file)

        text = clean_text(text)

        chunks = chunk_text(text)

        for chunk in chunks:

            docs.append(
                Document(
                    page_content=chunk,
                    metadata={"source": file}
                )
            )


    QdrantVectorStore.from_documents(
        docs,
        embeddings,
        url=qdrant_url,
        collection_name=COLLECTION_NAME
    )

    print("Documents successfully ingested into Qdrant")


if __name__ == "__main__":
    run_pipeline()