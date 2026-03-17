import json
from langchain_core.messages import HumanMessage

# Import your existing fast Llama 3 model
from ai.llm.client import get_worker_llm

def extract_structured_cv(cv_text: str) -> dict:
    """
    Tier 2: Structured Extraction.
    Takes messy raw CV text and forces the LLM to output a clean, structured JSON object.
    If extraction fails, it falls back safely.
    """
    print("      -> [Tier 2] Starting Structured Extraction...")
    
    llm = get_worker_llm()
    
    # We use a strict prompt to force the LLM to act as a data parser.
    # Notice we ask for exact data types (float, int, arrays) to ensure predictability.
    prompt = f"""
    You are an expert HR data extraction AI.
    Your sole task is to extract facts from the provided resume text and output ONLY a valid JSON object.
    Do not include markdown formatting like ```json. Do not include introductory text. 
    Just output the raw JSON object.

    SCHEMA REQUIRED:
    {{
      "candidate_name": "<string, extract their full name if present>",
      "total_years_exp": <float, calculate total years of professional experience>,
      "companies": [
        {{
          "name": "<string, company name>", 
          "role": "<string, job title>", 
          "duration_months": <integer, approximate months worked>
        }}
      ],
      "skills": ["<string>", "<string>"],
      "education": [
        {{"degree": "<string>", "field": "<string>"}}
      ],
      "red_flags": ["<string, extract potential issues like 'employment gap > 6 months' or 'job hopping', or leave empty>"]
    }}

    RESUME TEXT:
    {cv_text}
    """
    
    try:
        # Send the prompt to the Llama 3 model
        response = llm.invoke([HumanMessage(content=prompt)])
        raw_output = response.content.strip()
        
        # Sometimes LLMs stubbornly wrap output in markdown blocks despite instructions.
        # This safely strips ```json and ``` if they exist.
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
            
        # Parse the string into a Python Dictionary
        structured_data = json.loads(raw_output.strip())
        
        print("      -> [Tier 2] Extraction Successful.")
        return structured_data

    except json.JSONDecodeError as e:
        # Failure Handling: If the LLM hallucinates and breaks the JSON, 
        # we do not crash the server. We return a safe fallback object.
        print(f"      -> [Tier 2 Error] Failed to parse JSON: {e}")
        return {
            "candidate_name": "Unknown",
            "total_years_exp": 0.0,
            "companies": [],
            "skills": [],
            "education": [],
            "red_flags": ["Extraction Failed: Requires Manual Review"]
        }
    except Exception as e:
        print(f"      -> [Tier 2 Error] LLM failure: {e}")
        return None