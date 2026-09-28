from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.orm import Session
from app.db import get_db, SessionLocal
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.policy import PolicyUploadResponse, PolicyStatusResponse, PolicyOverviewResponse
from app.services.policy_service import policy_service
router = APIRouter(prefix="/api/policies", tags=["Policies"])

def process_policy_background(policy_id: str):
    db = SessionLocal()
    try:
        policy_service.process(db, policy_id)
    finally:
        db.close()

@router.post("/upload", response_model=PolicyUploadResponse, status_code=202)
async def upload_policy(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    policy = await policy_service.create_upload(db, user.id, file)
    background_tasks.add_task(process_policy_background, policy.id)
    return {"policy_id": policy.id, "filename": policy.filename, "status": policy.status}

@router.get("/{policy_id}/status", response_model=PolicyStatusResponse)
def policy_status(policy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    policy = policy_service.require_owned(db, policy_id, user.id)
    return {"policy_id": policy.id, "status": policy.status}

@router.get("/{policy_id}", response_model=PolicyOverviewResponse)
def policy_overview(policy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    policy = policy_service.require_owned(db, policy_id, user.id)
    return policy_service.overview(policy)
