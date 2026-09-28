from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token

repo = UserRepository()

def signup(db: Session, email: str, password: str, full_name: str | None):
    email = email.lower().strip()
    if repo.get_by_email(db, email):
        raise HTTPException(status_code=409, detail={"error": {"code": "EMAIL_EXISTS", "message": "An account with this email already exists"}})
    user = User(id=str(uuid4()), email=email, password_hash=hash_password(password), full_name=full_name)
    db.add(user); db.commit(); db.refresh(user)
    return user

def login(db: Session, email: str, password: str):
    user = repo.get_by_email(db, email.lower().strip())
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}})
    return create_access_token(user.id)
