import os
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings

def get_routing_llm():
    # The Supervisor uses the larger 70B model for smart routing
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0
    )

def get_worker_llm():
    # The Domain Agents use the fast 8B model for reading and writing
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.1-8b-instant",
        temperature=0
    )

def get_embedding_model():
    """
    Returns the free, local embedding model for Layer 2 evaluation.
    Using all-MiniLM-L6-v2 as it is fast, lightweight, and runs locally.
    """
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")