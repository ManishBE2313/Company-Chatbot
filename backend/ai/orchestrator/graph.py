from typing import TypedDict, Sequence, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.documents import Document

# NEW IMPORT: The LangGraph Checkpointer to save conversation states across multiple API calls
from langgraph.checkpoint.memory import MemorySaver

# Import our previously created components
from ai.llm.client import get_routing_llm
from ai.prompts.system_prompts import get_supervisor_prompt
from ai.rag.retriever import get_retriever
from ai.agents.domain_agents import (
    hr_agent_node, 
    it_agent_node, 
    finance_agent_node, 
    general_agent_node
)

class GraphState(TypedDict):
    """
    Defines the state structure that is passed between nodes in the graph.
    UPDATED: Added 'chat_history' to persist previous interactions for Conversational Memory.
    """
    question: str
    route: str
    context: Sequence[Document]
    answer: str
    chat_history: List[Dict[str, str]] # Example format: [{"role": "user", "content": "Hi"}, {"role": "ai", "content": "Hello"}]

def supervisor_node(state: GraphState):
    """
    The first node in the workflow. It uses the routing model
    to analyze the user's question and determine which agent should handle it.
    """
    print("1. Supervisor Node Started...")
    question = state.get("question")
    chat_history = state.get("chat_history", [])
    
    llm = get_routing_llm()
    system_prompt = get_supervisor_prompt()
    
    # We pass the system prompt, the historical context, and the new question 
    # so the supervisor understands follow-up questions (e.g., "Explain that more")
    messages = [{"role": "system", "content": system_prompt}]
    
    # Append past conversation to give the routing model context
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Append the current question
    messages.append({"role": "user", "content": question})
    
    response = llm.invoke(messages)
    route_decision = response.content.strip().lower()
    
    # Fallback to general agent if the model outputs something unexpected
    valid_routes = ["hr_agent", "it_agent", "finance_agent", "general_agent"]
    if route_decision not in valid_routes:
        route_decision = "general_agent"

    print(f"1. Supervisor Node Finished! Route chosen: {route_decision}")    
    return {"route": route_decision}

def retrieve_node(state: GraphState):
    """
    Fetches the relevant document chunks from the Qdrant vector database.
    This runs after the supervisor but before the domain agents.
    """
    print("2. Retriever Node Started...")
    
    # In a conversational RAG setup, the retriever needs the raw question.
    # We will upgrade this to handle conversational context in a future step if needed.
    question = state.get("question")
    retriever = get_retriever()
    
    # Retrieve top documents based on semantic similarity
    documents = retriever.invoke(question)
    print("2. Retriever Node Finished!")
    return {"context": documents}

def build_graph():
    """
    Constructs the LangGraph workflow, adding nodes, defining routing logic,
    and attaching the memory checkpointer.
    """
    workflow = StateGraph(GraphState)
    
    # Add all our worker and logic nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("retriever", retrieve_node)
    workflow.add_node("hr_agent", hr_agent_node)
    workflow.add_node("it_agent", it_agent_node)
    workflow.add_node("finance_agent", finance_agent_node)
    workflow.add_node("general_agent", general_agent_node)
    
    # Define the flow: START -> Supervisor -> Retriever
    workflow.set_entry_point("supervisor")
    workflow.add_edge("supervisor", "retriever")
    
    # Define the conditional routing logic
    workflow.add_conditional_edges(
        "retriever",
        lambda state: state["route"],
        {
            "hr_agent": "hr_agent",
            "it_agent": "it_agent",
            "finance_agent": "finance_agent",
            "general_agent": "general_agent"
        }
    )
    
    # All domain agents output their final answer and end the workflow
    workflow.add_edge("hr_agent", END)
    workflow.add_edge("it_agent", END)
    workflow.add_edge("finance_agent", END)
    workflow.add_edge("general_agent", END)
    
    # NEW LOGIC: Initialize the memory checkpointer
    memory = MemorySaver()
    
    # Compile the graph and attach the memory system
    app = workflow.compile(checkpointer=memory)
    return app