from pydantic import BaseModel, Field
class PatientDetailsInput(BaseModel):
    age: int | None = Field(default=None, ge=0, le=130)
    location: str | None = None
    hospital_type: str | None = None
    network_status: str | None = None
class CoverageAnalyzeRequest(BaseModel):
    policy_id: str
    treatment: str = Field(min_length=1, max_length=300)
    treatment_cost: float = Field(gt=0)
    patient_details: PatientDetailsInput = PatientDetailsInput()
class CoverageResponse(BaseModel):
    analysis_id: str
    estimated_cost: float
    potential_coverage: float | None
    potential_oop: float | None
    confidence: float
    reasons: list[str]
    missing_information: list[str]
class RecalculateRequest(BaseModel):
    analysis_id: str
    additional_information: dict = {}
