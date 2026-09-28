from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.cost import CostAnalyzeRequest, CostAnalyzeResponse
from app.services.cost_service import cost_service
router = APIRouter(prefix="/api/cost", tags=["Cost Analyzer"])
@router.post("/analyze", response_model=CostAnalyzeResponse)
def analyze(body: CostAnalyzeRequest, user: User = Depends(get_current_user)):
    return cost_service.analyze(body.treatment, body.location)
