from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.report import ReportResponse
from app.repositories.analysis_repository import AnalysisRepository
from app.services.report_service import report_service
router = APIRouter(prefix="/api/reports", tags=["Reports"])
repo = AnalysisRepository()
@router.get("/{analysis_id}", response_model=ReportResponse)
def report(analysis_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    analysis = repo.get_for_user(db, analysis_id, user.id)
    if not analysis:
        raise HTTPException(status_code=404, detail={"error": {"code": "ANALYSIS_NOT_FOUND", "message": "Analysis not found"}})
    return report_service.build(analysis)
