from langchain_core.prompts import ChatPromptTemplate
from backend.ai.llm.client import get_worker_llm
from backend.ai.prompts.system_prompts import get_worker_prompt

def create_domain_node(domain_name):
    """
    Creates a LangGraph node function for a specific domain agent.
    This factory function generates the exact logic needed for HR, IT, or Finance agents.
    
    Args:
        domain_name (str): The specific domain of the agent (e.g., "Human Resources").
        
    Returns:
        function: A callable node function that LangGraph will execute.
    """
    # Initialize the faster Llama 3 worker model
    llm = get_worker_llm()
    
    # Fetch the strict RAG system prompt for this specific domain
    system_prompt = get_worker_prompt(domain_name)
    
    # Define the prompt template expecting the retrieved 'context' and the user's 'question'
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "Context:\n{context}\n\nQuestion:\n{question}")
    ])
    
    # Create the processing chain: Format Prompt -> Send to LLM
    chain = prompt_template | llm
    
    def domain_node_function(state):
        """
        The actual function executed by LangGraph when routing to this specific agent.
        
        Args:
            state (dict): The current state of the graph containing the user question and retrieved documents.
            
        Returns:
            dict: A dictionary containing the final generated answer to update the graph state.
        """
        question = state.get("question")
        context_chunks = state.get("context", [])
        
        # Format the retrieved document chunks into a single readable string for the LLM
        # We extract the 'source' metadata to ensure the LLM can cite its references properly
        formatted_context = "\n\n".join(
            [f"Document: {chunk.metadata.get('source', 'Unknown')}\nContent: {chunk.page_content}" 
             for chunk in context_chunks]
        )
        
        # Invoke the language model with the combined context and question
        response = chain.invoke({
            "context": formatted_context,
            "question": question
        })
        
        # Return the generated text to be stored in the graph's state under the 'answer' key
        return {"answer": response.content}
        
    return domain_node_function

# Instantiate the specific domain nodes required for the routing architecture
hr_agent_node = create_domain_node("Human Resources")
it_agent_node = create_domain_node("IT Support")
finance_agent_node = create_domain_node("Finance and Corporate Expenses")
general_agent_node = create_domain_node("General Information")