from pydantic import BaseModel, Field
class CostAnalyzeRequest(BaseModel):
    treatment: str = Field(min_length=1, max_length=300)
    age: int | None = Field(default=None, ge=0, le=130)
    location: str = Field(min_length=1, max_length=200)
class CostAnalyzeResponse(BaseModel):
    treatment: str
    location: str
    estimated_cost: float
    cost_min: float
    cost_max: float
    source: str
