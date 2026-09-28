from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User
class UserRepository:
    def get_by_email(self, db: Session, email: str):
        return db.scalar(select(User).where(User.email == email.lower()))
    def get(self, db: Session, user_id: str):
        return db.get(User, user_id)
