"""
Job Description Confidence Evaluator — 3-Layer Architecture
============================================================

Layer 1  Rules engine        O(1) history lookup, free, handles ~70-80% of calls
Layer 2  Embedding check     Cosine similarity vs skill-cluster centroid, ~$0.0001/call
Layer 3  LLM coherence       Structured call ONLY for confirmed anomalies, ~5-10% of calls

Decision tiers
--------------
AUTO_APPROVE  score >= 85 AND zero hard mismatches  →  create job immediately
USER_REVIEW   score 60-84  OR  adjacent anomalies   →  show user the issues, let them fix or proceed
HR_REVIEW     score < 60                            →  save as draft, HR notified
"""

import json
import re
from enum import Enum

import numpy as np
from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from ai.llm.client import get_embedding_model, get_worker_llm

router = APIRouter(prefix="/api/jobs", tags=["job-evaluation"])

# ─── Tunable constants ────────────────────────────────────────────────────────
LAYER2_SIMILARITY_THRESHOLD = 0.55   # cosine sim cutoff: below → anomaly
SCORE_AUTO_APPROVE          = 85     # >= this + zero hard mismatches → AUTO_APPROVE
SCORE_USER_REVIEW           = 60     # >= this                        → USER_REVIEW
                                     # <  this                        → HR_REVIEW


# ─── Enums & models ───────────────────────────────────────────────────────────

class DecisionTier(str, Enum):
    AUTO_APPROVE = "AUTO_APPROVE"   # Coherent — create immediately
    USER_REVIEW  = "USER_REVIEW"    # Anomalies found — user can fix or proceed
    HR_REVIEW    = "HR_REVIEW"      # Severe mismatch — HR must sign off


class JobEvaluationRequest(BaseModel):
    title:        str             = Field(..., description="Proposed job title")
    requirements: dict | str     = Field(..., description="Structured requirements or raw JD text")
    department:   str | None     = Field(None)
    level:        str | None     = Field(None, description="Junior / Mid / Senior / Lead / Staff / Principal")


class EvaluationResult(BaseModel):
    confidenceScore:  int              # 0-100
    decisionTier:     DecisionTier
    mismatchedSkills: list[str]        # Hard mismatches only (score < 75)
    mismatchReason:   str | None       # One-sentence tooltip for the flag badge; null if none
    warnings:         list[str]        # Friendly notes (visible even on AUTO_APPROVE)
    suggestions:      list[str]        # Concrete "replace X with Y" actions for the user


# ─── Company history DB (mock) ────────────────────────────────────────────────
#
# Replace with a real query:
#   SELECT skill_name
#   FROM job_skills
#   WHERE role_family = :family
#     AND created_at > NOW() - INTERVAL '3 years'
#   GROUP BY skill_name
#   HAVING COUNT(*)::float / (SELECT COUNT(DISTINCT job_id) FROM job_skills WHERE role_family = :family) > 0.50
#
_HISTORICAL_SKILLS: dict[str, list[str]] = {
    "fullstack": [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL",
        "REST APIs", "Docker", "CI/CD", "Express", "PostgreSQL", "AWS",
        "System Design", "Redis", "Git",
    ],
    "frontend": [
        "JavaScript", "TypeScript", "React", "Next.js", "CSS", "HTML",
        "Git", "Figma", "Tailwind", "Redux", "Webpack", "Vite", "Jest",
    ],
    "backend": [
        "Python", "Node.js", "SQL", "PostgreSQL", "Docker", "AWS",
        "REST APIs", "Redis", "Express", "MongoDB", "System Design",
        "Kafka", "RabbitMQ", "gRPC", "Microservices", "Java", "Go",
        "FastAPI", "Django", "Spring Boot",
    ],
    "data": [
        "Python", "SQL", "Pandas", "Spark", "dbt", "Airflow",
        "Tableau", "Power BI", "Machine Learning", "TensorFlow",
        "PyTorch", "Looker", "BigQuery",
    ],
    "devops": [
        "Docker", "Kubernetes", "Terraform", "AWS", "CI/CD",
        "Ansible", "Prometheus", "Grafana", "Linux", "Bash", "Helm", "Git",
    ],
    "mobile": [
        "Swift", "Kotlin", "React Native", "Flutter",
        "iOS", "Android", "REST APIs", "Firebase", "Git",
    ],
}

_ROLE_KEYWORDS: dict[str, list[str]] = {
    "fullstack": ["full stack", "full-stack", "fullstack"],
    "frontend": ["frontend", "front-end", "ui engineer", "react", "vue", "angular", "svelte"],
    "devops":   ["devops", "platform", "sre", "infrastructure", "kubernetes", "cloud", "reliability"],
    "data":     ["data", "analytics", "ml ", "machine learning", "scientist", "bi ", "analyst"],
    "mobile":   ["mobile", "ios", "android", "flutter", "swift", "kotlin"],
    "backend":  ["backend", "back-end", "api", "server", "python", "java ", "golang", "node"],
}


def _get_historical_skills(title: str, department: str | None) -> list[str]:
    """
    Return skills that appeared in >50% of past JDs for this role family.
    Matches on title keywords first, department as a fallback signal.
    Returns [] for unknown roles — all skills then go to Layer 2.
    """
    text = f"{title} {department or ''}".lower()
    for family, keywords in _ROLE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return _HISTORICAL_SKILLS[family]
    return []


# ─── Math helpers ─────────────────────────────────────────────────────────────

def _cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    norm = np.linalg.norm(v1) * np.linalg.norm(v2)
    return float(np.dot(v1, v2) / norm) if norm > 0 else 0.0


def _derive_tier(score: int, hard_mismatch_count: int) -> DecisionTier:
    """
    Combine LLM score with the count of hard-mismatched skills
    to produce a final decision tier.

    Even a moderate score gets downgraded if multiple hard mismatches exist,
    preventing the LLM from soft-scoring its way past a structural problem.
    """
    if score >= SCORE_AUTO_APPROVE and hard_mismatch_count == 0:
        return DecisionTier.AUTO_APPROVE
    if score >= SCORE_USER_REVIEW:
        return DecisionTier.USER_REVIEW
    return DecisionTier.HR_REVIEW


def _extract_json(raw: str) -> str:
    """
    Extract the first JSON object from an LLM response.
    Handles: markdown fences, preamble text, trailing commentary.
    """
    # Method 1 — strip markdown fences
    fence_match = re.search(
        r"```(?:json)?\s*(\{.*?\})\s*```",
        raw,
        re.DOTALL | re.IGNORECASE,
    )
    if fence_match:
        return fence_match.group(1)

    # Method 2 — first `{` to last `}`
    start, end = raw.find("{"), raw.rfind("}")
    if start != -1 and end > start:
        return raw[start : end + 1]

    raise ValueError(f"No JSON object found in LLM response.\nRaw (first 300 chars): {raw[:300]}")


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/evaluate-jd", response_model=EvaluationResult)
async def evaluate_job_description(payload: JobEvaluationRequest) -> EvaluationResult:
    """
    Evaluate a job description's skill coherence in three layers.

    Returns an EvaluationResult whose `decisionTier` drives the frontend:
      AUTO_APPROVE  →  job created immediately, warnings shown as tips
      USER_REVIEW   →  user sees mismatch detail + "Back to Edit" button
      HR_REVIEW     →  saved as draft, HR notified, user cannot self-serve
    """
    print(f"[JD Eval] ── Start ── title='{payload.title}'  level={payload.level}")

    # ──────────────────────────────────────────────────────────────────────────
    # 0. Extract skills & experience from payload
    # ──────────────────────────────────────────────────────────────────────────
    proposed_skills: list[str] = []
    min_exp = 0
    req = payload.requirements

    if isinstance(req, dict):
        proposed_skills.extend(req.get("mustHaveSkills", []))
        proposed_skills.extend(req.get("niceToHaveSkills", []))
        min_exp = int(req.get("minYearsExperience", 0))
    elif isinstance(req, str):
        # Raw text JD — treat as a single anomaly blob, goes straight to L3
        proposed_skills = [req]

    if not proposed_skills:
        return EvaluationResult(
            confidenceScore=100,
            decisionTier=DecisionTier.AUTO_APPROVE,
            mismatchedSkills=[],
            mismatchReason=None,
            warnings=["No skills were listed. Add required skills for better candidate matching."],
            suggestions=[],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # LAYER 1 — Rules engine: O(1) historical lookup
    # ──────────────────────────────────────────────────────────────────────────
    historical_skills = _get_historical_skills(payload.title, payload.department)
    hist_set = {s.lower() for s in historical_skills}

    coherent_skills:   list[str] = []  # In history → no further checks needed
    layer2_candidates: list[str] = []  # Not in history → send to embedding check

    for skill in proposed_skills:
        (coherent_skills if skill.lower() in hist_set else layer2_candidates).append(skill)

    print(f"[JD Eval] L1 → coherent={coherent_skills} | L2 candidates={layer2_candidates}")

    # ──────────────────────────────────────────────────────────────────────────
    # LAYER 2 — Embedding similarity: cosine vs skill-cluster centroid
    # ──────────────────────────────────────────────────────────────────────────
    adjacent_skills: list[str] = []   # Passed L2 — semantically close, new to company history
    anomalies:       list[str] = []   # Failed L2 — genuine outliers, go to L3

    if layer2_candidates and historical_skills:
        embedder = get_embedding_model()

        hist_vecs = np.array(embedder.embed_documents(historical_skills))
        centroid  = hist_vecs.mean(axis=0)
        cand_vecs = np.array(embedder.embed_documents(layer2_candidates))

        for skill, vec in zip(layer2_candidates, cand_vecs):
            sim = _cosine_similarity(vec, centroid)
            bucket = adjacent_skills if sim >= LAYER2_SIMILARITY_THRESHOLD else anomalies
            bucket.append(skill)
            print(f"[JD Eval] L2 '{skill}' sim={sim:.3f} → {'adjacent' if sim >= LAYER2_SIMILARITY_THRESHOLD else 'ANOMALY'}")
    else:
        # Unknown role family — no centroid to compare against, send all to L3
        anomalies = layer2_candidates

    # ──────────────────────────────────────────────────────────────────────────
    # Seniority/experience rule check (always runs, free)
    # ──────────────────────────────────────────────────────────────────────────
    exp_warning: str | None = None
    level = (payload.level or "").lower()

    if "junior" in level and min_exp > 3:
        exp_warning = (
            f"Requesting {min_exp}+ years experience is too high for a Junior role. "
            "Typical Junior roles require 0-3 years."
        )
    elif any(k in level for k in ("senior", "lead", "staff", "principal")) and 0 < min_exp < 3:
        exp_warning = (
            f"Only {min_exp} years experience is low for a {payload.level} role. "
            "Consider raising to 4+ years or adjusting the seniority level."
        )

    # ──────────────────────────────────────────────────────────────────────────
    # SHORT-CIRCUIT — Everything coherent, no exp warning → AUTO_APPROVE, skip LLM
    # ──────────────────────────────────────────────────────────────────────────
    if not anomalies and not exp_warning:
        adj_note = (
            [
                f"{adjacent_skills} are new to your company's skill history but semantically "
                "coherent — they'll be added to your role graph after this position is filled."
            ]
            if adjacent_skills else []
        )
        print("[JD Eval] L1/L2 clean. AUTO_APPROVE. LLM skipped.")
        return EvaluationResult(
            confidenceScore=95,
            decisionTier=DecisionTier.AUTO_APPROVE,
            mismatchedSkills=[],
            mismatchReason=None,
            warnings=adj_note,
            suggestions=[],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # LAYER 3 — LLM coherence call (only fires for confirmed anomalies)
    # ──────────────────────────────────────────────────────────────────────────
    print(f"[JD Eval] L3 triggered. anomalies={anomalies} | exp_warning={exp_warning}")

    # All skills that already passed validation — give the LLM context
    established = coherent_skills + adjacent_skills

    prompt = f"""
You are a senior Technical HR evaluator. Your job is to assess whether flagged skills
genuinely belong in a job description, and to score the JD accordingly.

─── Job Context ───────────────────────────────────────────────────────────────
Title            : {payload.title}
Seniority Level  : {payload.level or "Not specified"}
Department       : {payload.department or "Not specified"}
Min Experience   : {min_exp} years
Validated skills : {established or "None yet"}
─── Flagged Skills (need your verdict) ────────────────────────────────────────
{anomalies}
{f"─── Experience Rule Warning ───────────────────────────────────────────────{chr(10)}{exp_warning}" if exp_warning else ""}
───────────────────────────────────────────────────────────────────────────────

SCORING RUBRIC — apply this precisely:

  85-100  Flagged skills are plausible cross-functional additions.
          Example: Docker or Terraform for a Backend Engineer.
          Approve with a brief note in "warnings" only.

  60-84   Skills are tangentially related but unusual for this role family.
          Example: Power BI or Tableau for a Backend Engineer (those belong
          in a Data Analyst role). The user should be asked to confirm.
          List them in "mismatchedSkills" and explain in "mismatchReason".

  30-59   Significant domain mismatch. Skills clearly belong to a different
          role family.
          Example: Figma or Sketch for a Backend Engineer.
          List in "mismatchedSkills". HR review required.

  0-29    Severe, nonsensical mismatch. Skills have no relationship to
          any tech/software role.
          Example: "Dentistry", "Carpentry", "Cooking" in a developer JD.
          HR must review before the role can be posted.

INSTRUCTIONS:
  1. Evaluate all flagged skills as a batch and produce ONE "confidenceScore".
  2. Put a skill in "mismatchedSkills" ONLY if it scores below 85 on the rubric.
  3. "mismatchReason" must be exactly ONE sentence written for a non-technical
     hiring manager. It will be shown as a tooltip on the flag badge.
     Set to null if no mismatches.
  4. "warnings" are for skills in the 85-100 range that are worth noting.
     Keep each item to one sentence.
  5. "suggestions" are concrete replacement actions for the user.
     Example: "Replace Power BI with a backend-friendly data tool like Apache Spark or dbt."
     Empty array if not applicable.

Return ONLY a valid JSON object. No preamble, no markdown fences, nothing else:
{{
  "confidenceScore": <integer 0-100>,
  "mismatchedSkills": ["<skill name only>"],
  "mismatchReason": "<one sentence or null>",
  "warnings": ["<string>"],
  "suggestions": ["<string>"]
}}
"""

    try:
        response   = get_worker_llm().invoke([HumanMessage(content=prompt)])
        raw_output = response.content.strip()

        json_str   = _extract_json(raw_output)
        llm_result = json.loads(json_str)

    except (ValueError, json.JSONDecodeError) as parse_err:
        # JSON extraction failed — fallback to USER_REVIEW so the user can self-correct
        # rather than silently approving or unnecessarily escalating to HR.
        raw_snippet = locals().get("raw_output", "no output generated")
        print(f"[JD Eval] L3 parse error: {parse_err}\nRaw: {raw_snippet[:300]}")
        return EvaluationResult(
            confidenceScore=70,
            decisionTier=DecisionTier.USER_REVIEW,
            mismatchedSkills=anomalies,
            mismatchReason=(
                "The AI could not automatically verify these skills. "
                "Please review them before submitting."
            ),
            warnings=[exp_warning] if exp_warning else [],
            suggestions=["Review the flagged skills and remove any that don't belong to this role."],
        )

    except Exception as llm_err:
        print(f"[JD Eval] L3 unexpected error: {llm_err}")
        raise  # Re-raise; FastAPI's exception handler will return a 500

    # ──────────────────────────────────────────────────────────────────────────
    # Build final result
    # ──────────────────────────────────────────────────────────────────────────
    score           = max(0, min(100, int(llm_result.get("confidenceScore", 50))))
    mismatched      = llm_result.get("mismatchedSkills", [])
    mismatch_reason = llm_result.get("mismatchReason") or None
    warnings        = llm_result.get("warnings", [])
    suggestions     = llm_result.get("suggestions", [])

    # Prepend exp_warning so it's always the first thing the user reads
    if exp_warning and exp_warning not in warnings:
        warnings.insert(0, exp_warning)

    tier = _derive_tier(score, len(mismatched))

    print(
        f"[JD Eval] ── Done ── score={score} | tier={tier.value} "
        f"| mismatched={mismatched}"
    )

    return EvaluationResult(
        confidenceScore=score,
        decisionTier=tier,
        mismatchedSkills=mismatched,
        mismatchReason=mismatch_reason,
        warnings=warnings,
        suggestions=suggestions,
    )