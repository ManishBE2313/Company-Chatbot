import os

from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

COLLECTION_NAME = "company_documents"

def get_retriever():
    """
    Connects to the Qdrant Vector Database and retrieves 
    the top 3 most relevant document chunks for a given query.
    """
    # 1. Load the local open-source embedding model 
    # (This converts text into numbers so the AI can search by meaning, not just keywords)
    embeddings = HuggingFaceBgeEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # 2. Connect to the Qdrant database (defaulting to localhost)
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    client = QdrantClient(url=qdrant_url)

    # 3. Connect to the specific collection holding our documents
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )

    # 4. Return it as a retriever, asking for the top 3 best matches
    return vector_store.as_retriever(search_kwargs={"k": 3})
