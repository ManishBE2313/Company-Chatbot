import os
from langchain_groq import ChatGroq

def get_routing_llm():
    """
    Initializes the DeepSeek-R1 model via Groq.
    This model is used for complex reasoning, intent detection, and agent routing.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")

    # We use a low temperature (0.1) so the routing decisions are strict and consistent.
    return ChatGroq(
        groq_api_key=groq_api_key,
        model_name="deepseek-r1-distill-llama-70b",
        temperature=0.1, 
        max_tokens=1024
    )

def get_worker_llm():
    """
    Initializes the Llama 3 model via Groq.
    This model is used by domain agents to read context and generate the final answer.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")

    # We use a slightly higher temperature (0.3) for natural language response generation.
    return ChatGroq(
        groq_api_key=groq_api_key,
        model_name="llama3-8b-8192",
        temperature=0.3, 
        max_tokens=1024
    )