from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.assistant import AssistantAskRequest, AssistantResponse
from app.services.policy_service import policy_service
from app.services.assistant_service import ask
router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])
@router.post("/ask", response_model=AssistantResponse)
async def ask_assistant(body: AssistantAskRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    policy_service.require_owned(db, body.policy_id, user.id)
    return await ask(body.policy_id, body.question)
