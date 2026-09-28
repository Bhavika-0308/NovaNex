import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.coverage import CoverageAnalyzeRequest, CoverageResponse, RecalculateRequest
from app.services.policy_service import policy_service
from app.services.coverage_service import coverage_service
from app.repositories.analysis_repository import AnalysisRepository
router = APIRouter(prefix="/api/coverage", tags=["Coverage Analysis"])
analysis_repo = AnalysisRepository()

@router.post("/analyze", response_model=CoverageResponse)
def analyze(body: CoverageAnalyzeRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    policy = policy_service.require_owned(db, body.policy_id, user.id)
    patient = body.patient_details.model_dump(exclude_none=True)
    analysis = coverage_service.create_analysis(db, policy, body.treatment, body.treatment_cost, patient)
    return {"analysis_id": analysis.id, "estimated_cost": analysis.estimated_cost, "potential_coverage": analysis.potential_coverage, "potential_oop": analysis.potential_oop, "confidence": analysis.confidence, "reasons": json.loads(analysis.reasons_json), "missing_information": json.loads(analysis.missing_information_json)}

@router.post("/recalculate", response_model=CoverageResponse)
def recalculate(body: RecalculateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    analysis = analysis_repo.get_for_user(db, body.analysis_id, user.id)
    if not analysis:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail={"error": {"code": "ANALYSIS_NOT_FOUND", "message": "Analysis not found"}})
    analysis = coverage_service.recalculate(db, analysis, body.additional_information)
    return {"analysis_id": analysis.id, "estimated_cost": analysis.estimated_cost, "potential_coverage": analysis.potential_coverage, "potential_oop": analysis.potential_oop, "confidence": analysis.confidence, "reasons": json.loads(analysis.reasons_json), "missing_information": json.loads(analysis.missing_information_json)}
