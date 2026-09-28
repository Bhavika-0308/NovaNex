from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.analysis import PolicyAnalysis
class AnalysisRepository:
    def get_for_user(self, db: Session, analysis_id: str, user_id: str):
        return db.scalar(select(PolicyAnalysis).join(PolicyAnalysis.policy).where(PolicyAnalysis.id == analysis_id, PolicyAnalysis.policy.has(user_id=user_id)))
