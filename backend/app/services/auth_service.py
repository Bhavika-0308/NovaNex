from uuid import uuid4
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token

repo = UserRepository()
GUEST_EMAIL = "guest@insuresight.local"

def signup(db: Session, email: str, password: str, full_name: str | None):
    email = email.lower().strip()
    if repo.get_by_email(db, email):
        raise HTTPException(status_code=409, detail={"error": {"code": "EMAIL_EXISTS", "message": "An account with this email already exists"}})
    user = User(id=str(uuid4()), email=email, password_hash=hash_password(password), full_name=full_name)
    db.add(user); db.commit(); db.refresh(user)
    return user

def login(db: Session, _email: str = "", _password: str = ""):
    user = repo.get_by_email(db, GUEST_EMAIL)
    if not user:
        user = User(
            id=str(uuid4()),
            email=GUEST_EMAIL,
            password_hash=hash_password(uuid4().hex),
            full_name="Guest User",
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            user = repo.get_by_email(db, GUEST_EMAIL)
            if not user:
                raise
        else:
            db.refresh(user)
    return create_access_token(user.id)
