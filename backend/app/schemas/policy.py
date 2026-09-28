from pydantic import BaseModel

class PolicyUploadResponse(BaseModel):
    policy_id: str
    filename: str
    status: str

class PolicyStatusResponse(BaseModel):
    policy_id: str
    status: str

class PolicyOverviewResponse(BaseModel):
    policy_id: str
    provider: str | None = None
    policy_name: str | None = None
    coverage_summary: str | None = None
    waiting_periods: list = []
    exclusions: list = []
    deductibles: list = []
    copay: list = []
    limits: list = []
