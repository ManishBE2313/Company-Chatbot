from typing import TypedDict, Sequence
from langgraph.graph import StateGraph, START, END
from langchain_core.documents import Document

# Import our previously created components
from backend.ai.llm.client import get_routing_llm
from backend.ai.prompts.system_prompts import get_supervisor_prompt
from backend.ai.rag.retriever import get_retriever
from backend.ai.agents.domain_agents import (
    hr_agent_node, 
    it_agent_node, 
    finance_agent_node, 
    general_agent_node
)

class GraphState(TypedDict):
    """
    Defines the state structure that is passed between nodes in the graph.
    """
    question: str
    route: str
    context: Sequence[Document]
    answer: str

def supervisor_node(state: GraphState):
    """
    The first node in the workflow. It uses the DeepSeek-R1 routing model
    to analyze the user's question and determine which agent should handle it.
    """
    question = state.get("question")
    llm = get_routing_llm()
    system_prompt = get_supervisor_prompt()
    
    # We pass the question to the supervisor to get the strict routing decision
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question}
    ]
    
    response = llm.invoke(messages)
    route_decision = response.content.strip().lower()
    
    # Fallback to general agent if the model outputs something unexpected
    valid_routes = ["hr_agent", "it_agent", "finance_agent", "general_agent"]
    if route_decision not in valid_routes:
        route_decision = "general_agent"
        
    return {"route": route_decision}

def retrieve_node(state: GraphState):
    """
    Fetches the relevant document chunks from the Qdrant vector database.
    This runs after the supervisor but before the domain agents.
    """
    question = state.get("question")
    retriever = get_retriever()
    
    # Retrieve top k documents based on semantic similarity
    documents = retriever.invoke(question)
    
    return {"context": documents}

def build_graph():
    """
    Constructs the LangGraph workflow, adding nodes and defining the routing logic.
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
    workflow.add_edge(START, "supervisor")
    workflow.add_edge("supervisor", "retriever")
    
    # Define the conditional routing logic
    # The graph will look at the "route" key in the state and move to that specific node
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
    
    # Compile the graph into an executable application
    app = workflow.compile()
    return app