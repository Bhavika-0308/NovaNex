from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pwdlib import PasswordHash

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models.user import User


password_hash = PasswordHash.recommended()

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)


def create_access_token(subject: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    return jwt.encode(
        {"sub": subject, "exp": expires},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:

    token = credentials.credentials
    user_id = None
    user_email = None

    # 1. Try decoding standard JWT signed with internal secret
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get("sub")
    except JWTError:
        pass

    # 2. If internal JWT failed, try decoding Firebase JWT claims or demo token
    if not user_id:
        try:
            claims = jwt.get_unverified_claims(token)
            user_id = claims.get("user_id") or claims.get("sub")
            user_email = claims.get("email")
        except Exception:
            pass

    # 3. Fallback for demo tokens or unverified tokens
    if not user_id:
        user_id = "demo-user-123"
        user_email = "demo@insuresight.ai"

    user = db.get(User, user_id)

    if not user:
        # Auto-provision user record for Firebase / demo authentication
        user = User(
            id=user_id,
            email=user_email or f"{user_id[:8]}@insuresight.demo",
            full_name="Demo User",
            password_hash=hash_password("demopassword123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user