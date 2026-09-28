from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import signup, login
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=201)
def signup_route(body: SignupRequest, db: Session = Depends(get_db)):
    return signup(db, body.email, body.password, body.full_name)

@router.post("/login", response_model=TokenResponse)
def login_route(body: LoginRequest, db: Session = Depends(get_db)):
    return {"access_token": login(db, body.email, body.password), "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user
