import os

from langchain_huggingface import HuggingFaceEmbeddings

from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# from langchain_classic.retrievers import ContextualCompressionRetrieverfrom langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from sentence_transformers import CrossEncoder
from langchain_community.cross_encoders import HuggingFaceCrossEncoder 

COLLECTION_NAME = "company_documents"

def get_retriever():
    """
    Connects to the Qdrant Vector Database, retrieves a large pool of documents,
    and then applies a Cross-Encoder Re-ranker to return the absolute best 3 matches.
    """
    # 1. Load the local open-source embedding model 
    # Updated to use the modern HuggingFaceEmbeddings class
    embeddings = HuggingFaceEmbeddings(
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

    # 4. Create the base retriever
    # We increase 'k' to 20 to cast a wide net
    base_retriever = vector_store.as_retriever(search_kwargs={"k": 10})

    # 5. Initialize the Cross-Encoder Re-ranker
    # SWAPPED: Using a lightweight (~90MB) model to prevent network timeouts during download
    reranker_model = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
    
    # Configure the compressor to only keep the top 3 highest-scoring chunks
    compressor = CrossEncoderReranker(model=reranker_model, top_n=3)

    # 6. Wrap the base retriever and the compressor together
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever
    )

    return compression_retriever