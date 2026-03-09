import os
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

def get_embeddings_model():
    """
    Initializes the BGE embedding model.
    This model converts the user's text question into a vector so it can be 
    matched against the document vectors in the database.
    """
    model_name = "BAAI/bge-small-en-v1.5"
    
    # Using CPU for local POC. Can be changed to 'cuda' if a GPU is available.
    model_kwargs = {'device': 'cpu'}
    # Normalizing embeddings ensures better cosine similarity search results
    encode_kwargs = {'normalize_embeddings': True}
    
    return HuggingFaceBgeEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )

def get_retriever():
    """
    Connects to the Qdrant vector database and returns a retrieval interface.
    This assumes Person B (Data Pipeline) has already ingested documents 
    into a collection named 'company_knowledge'.
    """
    # Qdrant connection details. For a local POC, it usually runs on localhost:6333
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    collection_name = "company_knowledge"
    
    # Initialize the Qdrant client
    client = QdrantClient(url=qdrant_url)
    embeddings = get_embeddings_model()
    
    # Connect LangChain to the existing Qdrant collection
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings
    )
    
    # Return a retriever configured to fetch the top 5 most relevant document chunks
    return vector_store.as_retriever(search_kwargs={"k": 5})