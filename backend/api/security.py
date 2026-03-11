# "Input Guardrail." This is often a very small, 
# fast check that analyzes the prompt for manipulative 
# language (like "ignore," "forget," or "system prompt")

import re

def is_prompt_injection(user_input: str) -> bool:
    """
    Evaluates the user input against known prompt injection patterns.
    Returns True if a potential injection is detected, otherwise False.
    """
    # Convert input to lowercase for uniform matching
    normalized_input = user_input.lower()

    # Define a list of common heuristic patterns used in jailbreak attempts
    suspicious_patterns = [
        r"ignore all previous",
        r"forget your instructions",
        r"system prompt",
        r"you are now",
        r"bypass rules",
        r"do not follow",
        r"new instructions",
        r"disregard previous"
    ]

    # Iterate through patterns and search for a match in the user input
    for pattern in suspicious_patterns:
        if re.search(pattern, normalized_input):
            return True

    return False