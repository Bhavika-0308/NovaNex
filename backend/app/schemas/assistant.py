from pydantic import BaseModel, Field
class AssistantAskRequest(BaseModel):
    policy_id: str
    question: str = Field(min_length=1, max_length=5000)
class Citation(BaseModel):
    text: str
    page: int | None = None
    section: str | None = None
class AssistantResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
    confidence: float = 0.0
    missing_information: list[str] = []
