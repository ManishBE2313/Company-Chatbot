import json
import os
import re
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from ai.llm.client import get_embedding_model, get_worker_llm

router = APIRouter(prefix="/api/hr/settings", tags=["hr-settings-ai"])
SKILL_COLLECTION = "company_settings_skill_catalog"


class SkillOption(BaseModel):
    id: str
    name: str
    category: str | None = None


class JobDescriptionAnalyzeRequest(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    availableSkills: list[SkillOption] = Field(default_factory=list)


class SuggestRequest(BaseModel):
    input: str = Field(...)
    kind: Literal["skill", "description"] = "description"


def _extract_json(raw: str) -> dict:
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL | re.IGNORECASE)
    if fence_match:
        return json.loads(fence_match.group(1))

    start, end = raw.find("{"), raw.rfind("}")
    if start != -1 and end > start:
        return json.loads(raw[start:end + 1])

    raise ValueError(f"No JSON object found in response: {raw[:400]}")


def _get_skill_candidates(description: str, skills: list[SkillOption], limit: int = 20) -> list[str]:
    if not skills:
        return []

    embedder = get_embedding_model()
    query_text = description.strip()
    query_vector = embedder.embed_query(query_text)
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    client = QdrantClient(url=qdrant_url)

    vector_size = len(query_vector)
    if client.collection_exists(SKILL_COLLECTION):
        client.delete_collection(SKILL_COLLECTION)

    client.create_collection(
        collection_name=SKILL_COLLECTION,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    skill_vectors = embedder.embed_documents([f"{skill.name} {skill.category or ''}" for skill in skills])
    client.upsert(
        collection_name=SKILL_COLLECTION,
        points=[
            PointStruct(
                id=index + 1,
                vector=skill_vectors[index],
                payload={"id": skill.id, "name": skill.name, "category": skill.category or ""},
            )
            for index, skill in enumerate(skills)
        ],
    )

    response = client.query_points(
        collection_name=SKILL_COLLECTION,
        query=query_vector,
        limit=min(limit, len(skills)),
        with_payload=True,
        with_vectors=False,
    )
    matches = response.points if hasattr(response, "points") else []
    return [str(match.payload.get("name")) for match in matches if match.payload and match.payload.get("name")]


@router.post("/job-descriptions/analyze")
async def analyze_job_description(payload: JobDescriptionAnalyzeRequest):
    candidate_skills = _get_skill_candidates(f"{payload.title}\n{payload.description}", payload.availableSkills)
    worker = get_worker_llm()

    prompt = f"""
You are helping HR structure a reusable job description template.

Job title:
{payload.title}

Raw job description:
{payload.description}

Candidate skills retrieved from the existing skill vector catalog:
{candidate_skills}

Return JSON only in this exact shape:
{{
  "refinedDescription": "short polished rewrite of the JD, preserving meaning",
  "mustHaveSkills": ["skill names only from the candidate list when possible"],
  "niceToHaveSkills": ["skill names only from the candidate list when possible"],
  "summary": "one short sentence summary",
  "suggestions": ["short bullets for wording or skill corrections"]
}}

Rules:
- Prefer skill names from the candidate skill list.
- Put the most essential implementation skills in mustHaveSkills.
- Put supporting or optional skills in niceToHaveSkills.
- Avoid duplicates.
- Keep refinedDescription professional and concise.
"""

    response = worker.invoke(prompt)
    data = _extract_json(response.content if hasattr(response, "content") else str(response))
    return data


@router.post("/suggest")
async def suggest_text(payload: SuggestRequest):
    worker = get_worker_llm()

    prompt = f"""
You are a normalization and rewrite assistant.

Input kind: {payload.kind}
Input text: {payload.input}

Return JSON only in this format:
{{
  "status": "clear" | "ambiguous" | "rewrite",
  "result": "main corrected or rewritten text",
  "options": ["optional alternatives when ambiguous"]
}}

Rules:
- Correct spelling mistakes.
- Expand abbreviations when you can infer them confidently.
- If the input is ambiguous, set status to ambiguous and return 2-5 options.
- If the input is a sentence or paragraph, rewrite it professionally and concisely.
- If the input is a skill phrase, normalize it to the most likely professional form.
"""

    response = worker.invoke(prompt)
    return _extract_json(response.content if hasattr(response, "content") else str(response))

