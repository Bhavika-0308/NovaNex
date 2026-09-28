from pydantic import BaseModel
class ReportResponse(BaseModel):
    policy_summary: str | None
    treatment: str
    estimated_cost: float
    potential_coverage: float | None
    potential_oop: float | None
    confidence: float | None
    reasons: list[str]
    citations: list
