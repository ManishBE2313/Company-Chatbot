import json
from langchain_core.messages import HumanMessage
from ai.llm.client import get_worker_llm

def run_tier_3_scoring(structured_cv: dict, icp_text: str) -> dict:
    """
    Tier 3: Deep Scoring and Bias Mitigation Pass.
    Performs a Blind Pass (skills only) and a Full Pass (unredacted),
    then checks for divergence to prevent AI bias.
    """
    print("      -> [Tier 3] Starting Deep Scoring & Bias Mitigation...")
    llm = get_worker_llm()

    # ==========================================
    # 1. The "Blind" Pass Preparation (Redact PII)
    # ==========================================
    # We strip names, university names, and company names. We only leave raw metrics.
    blind_cv = {
        "total_years_exp": structured_cv.get("total_years_exp"),
        "skills": structured_cv.get("skills"),
        # Extract only the job title and duration, hiding the company name
        "roles": [{"role": c.get("role"), "duration_months": c.get("duration_months")} for c in structured_cv.get("companies", [])],
        # Extract only the degree type and field, hiding the University name
        "degrees": [e.get("degree") for e in structured_cv.get("education", [])],
        "red_flags": structured_cv.get("red_flags")
    }

    # ==========================================
    # 2. Score the Blind Profile
    # ==========================================
    blind_prompt = f"""
    You are an unbiased AI hiring assistant.
    Score this completely anonymized candidate profile out of 100 based strictly on how well their skills and experience match the Ideal Candidate Profile (ICP).
    Output ONLY an integer between 0 and 100. Do not include any other text.

    IDEAL CANDIDATE PROFILE:
    {icp_text}

    BLIND CANDIDATE DATA (PII Removed):
    {json.dumps(blind_cv)}
    """
    try:
        blind_response = llm.invoke([HumanMessage(content=blind_prompt)])
        blind_score = int(blind_response.content.strip())
        print(f"      -> [Tier 3] Blind Score calculated: {blind_score}/100")
    except Exception as e:
        print(f"      -> [Tier 3 Warning] Blind scoring failed, defaulting to 50: {e}")
        blind_score = 50

    # ==========================================
    # 3. Score the Full, Unredacted Profile
    # ==========================================
    full_prompt = f"""
    You are an expert technical recruiter. Evaluate this unredacted candidate profile against the Ideal Candidate Profile (ICP).
    Output ONLY a valid JSON object with no markdown formatting.

    SCHEMA REQUIRED:
    {{
      "total_score": <integer 0-100>,
      "strong_points": ["<string>", "<string>"],
      "concerns": ["<string>"],
      "interview_focus_areas": ["<string>"]
    }}

    IDEAL CANDIDATE PROFILE:
    {icp_text}

    UNREDACTED CANDIDATE DATA:
    {json.dumps(structured_cv)}
    """
    try:
        full_response = llm.invoke([HumanMessage(content=full_prompt)])
        raw_output = full_response.content.strip()
        
        # Clean up markdown if the LLM adds it
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        
        evaluation = json.loads(raw_output.strip())
        full_score = evaluation.get("total_score", 0)
        print(f"      -> [Tier 3] Full Context Score calculated: {full_score}/100")
    except Exception as e:
        print(f"      -> [Tier 3 Error] Full scoring JSON parse failed: {e}")
        evaluation = {
            "total_score": blind_score,
            "strong_points": ["Could not generate detailed strengths."],
            "concerns": ["LLM Evaluation failed to parse."],
            "interview_focus_areas": ["Review candidate manually."]
        }
        full_score = blind_score

    # ==========================================
    # 4. The Divergence Check (Legal/Bias Failsafe)
    # ==========================================
    delta = blind_score - full_score
    
    # We must respect the Node.js Webhook ENUM: "Passed", "Rejected", "Interviewing", "Offered"
    if delta >= 15:
        # If the score drops significantly upon seeing the name/university, the AI is likely biased.
        # We force a "Passed" status so they are NOT auto-rejected, placing them on the Admin's desk.
        final_status = "Passed" 
        tags = ["MANUAL-REVIEW-REQUIRED", "high-bias-divergence", f"blind-score:{blind_score}", f"full-score:{full_score}"]
        reasoning = (
            f"⚠️ FLAGGED FOR MANUAL REVIEW: Candidate scored {blind_score}/100 in the Blind Skills Pass, "
            f"but dropped to {full_score}/100 in the Full Context Pass. This {delta}-point divergence suggests "
            f"potential AI bias regarding the candidate's background, name, or education. Human review is legally advised.\n\n"
            f"AI Concerns: {', '.join(evaluation.get('concerns', []))}"
        )
        print("      -> [Tier 3] ⚠️ HIGH DIVERGENCE DETECTED. Flagged for manual review.")
    
    else:
        # Normal routing based on the full score
        final_status = "Passed" if full_score >= 70 else "Rejected"
        tags = [f"final-score:{full_score}", "bias-check:passed"]
        reasoning = (
            f"Score: {full_score}/100. Bias Check Passed (Delta: {delta}).\n\n"
            f"Strengths: {', '.join(evaluation.get('strong_points', []))}\n\n"
            f"Focus Areas: {', '.join(evaluation.get('interview_focus_areas', []))}"
        )

    return {
        "status": final_status,
        "aiScore": full_score,
        "aiTags": tags,
        "aiReasoning": reasoning
    }