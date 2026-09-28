import json
import re
from pathlib import Path
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from app.models.policy import Policy
from app.integrations.ai_assistant import ai_adapter, AIIntegrationError
from app.services.document_service import document_service

class PolicyService:
    async def create_upload(self, db: Session, user_id: str, upload: UploadFile):
        content = await upload.read()
        max_bytes = settings.max_upload_size_mb * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(status_code=413, detail={"error": {"code": "FILE_TOO_LARGE", "message": f"PDF must be <= {settings.max_upload_size_mb} MB"}})
        filename = Path(upload.filename or "policy.pdf").name
        document_service.validate_pdf(content, filename)
        policy_id = str(uuid4())
        upload_dir = Path(settings.upload_dir).resolve()
        upload_dir.mkdir(parents=True, exist_ok=True)
        safe_name = f"{policy_id}.pdf"
        path = upload_dir / safe_name
        path.write_bytes(content)
        policy = Policy(id=policy_id, user_id=user_id, filename=filename, file_path=str(path), status="processing")
        db.add(policy); db.commit(); db.refresh(policy)
        return policy

    def process(self, db: Session, policy_id: str):
        policy = db.get(Policy, policy_id)
        if not policy:
            return
        try:
            pages, text = document_service.extract(policy.file_path)
            policy.page_text_json = json.dumps(pages, ensure_ascii=False)
            policy.extracted_text = text
            # AI ingestion may return structured metadata/rules. The backend only stores it.
            import asyncio
            try:
                result = asyncio.run(ai_adapter.ingest_policy(policy.id, policy.file_path))
            except AIIntegrationError:
                result = None
            if isinstance(result, dict):
                overview = result.get("overview")
                rules = result.get("rules")
                if overview is not None:
                    policy.overview_json = json.dumps(overview, ensure_ascii=False)
                if rules is not None:
                    policy.rules_json = json.dumps(rules, ensure_ascii=False)
            policy.status = "completed"
            policy.processing_error = None
        except Exception as exc:
            policy.status = "failed"
            policy.processing_error = str(exc)[:2000]
        db.commit()

    def require_owned(self, db: Session, policy_id: str, user_id: str):
        policy = db.get(Policy, policy_id)
        if not policy or policy.user_id != user_id:
            raise HTTPException(status_code=404, detail={"error": {"code": "POLICY_NOT_FOUND", "message": "Policy not found"}})
        return policy

    def overview(self, policy: Policy):
        data = json.loads(policy.overview_json) if policy.overview_json else {}
        return {
            "policy_id": policy.id,
            "provider": data.get("provider"),
            "policy_name": data.get("policy_name"),
            "coverage_summary": data.get("coverage_summary"),
            "waiting_periods": data.get("waiting_periods", []),
            "exclusions": data.get("exclusions", []),
            "deductibles": data.get("deductibles", []),
            "copay": data.get("copay", []),
            "limits": data.get("limits", []),
        }

policy_service = PolicyService()
