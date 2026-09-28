from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.policy import Policy
class PolicyRepository:
    def get_for_user(self, db: Session, policy_id: str, user_id: str):
        return db.scalar(select(Policy).where(Policy.id == policy_id, Policy.user_id == user_id))
