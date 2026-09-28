from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
import tempfile
import os

from ai.schemas import (
    IngestRequest,
    IngestResponse,
    QuestionRequest,
    QuestionResponse,
)
from ai.rag_service import get_rag_service

ai_router = APIRouter(prefix="/ai", tags=["AI Policy Assistant"])

@ai_router.post("/ingest", response_model=IngestResponse, summary="Ingest insurance policy PDF")
async def ingest_policy_endpoint(payload: IngestRequest):
    """
    Ingest a policy PDF given policy_id and local file path.
    Extracts text, builds embeddings, and creates isolated FAISS vector index.
    """
    service = get_rag_service()
    response = service.ingest_policy(policy_id=payload.policy_id, document_path=payload.document_path)
    if not response.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.error or "Failed to ingest document."
        )
    return response

@ai_router.post("/upload-and-ingest", response_model=IngestResponse, summary="Upload PDF file and ingest")
async def upload_and_ingest_endpoint(
    policy_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Upload a policy PDF file directly and ingest into vector database.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        service = get_rag_service()
        response = service.ingest_policy(policy_id=policy_id, document_path=tmp_path)
        return response
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@ai_router.post("/ask", response_model=QuestionResponse, summary="Ask question about an ingested policy")
async def ask_question_endpoint(payload: QuestionRequest):
    """
    Query policy Q&A assistant for an ingested policy.
    Returns fact-grounded answer, evidence citations, confidence score, and missing info.
    """
    service = get_rag_service()
    response = service.ask_policy_question(policy_id=payload.policy_id, question=payload.question)
    return response

@ai_router.get("/policies", response_model=List[str], summary="List all ingested policy IDs")
async def list_policies_endpoint():
    """Returns list of currently indexed policy IDs."""
    service = get_rag_service()
    return service.vector_store.list_policies()

@ai_router.delete("/policies/{policy_id}", summary="Delete indexed policy")
async def delete_policy_endpoint(policy_id: str):
    """Deletes policy vector index and cached chunks for policy_id."""
    service = get_rag_service()
    deleted = service.vector_store.delete_policy(policy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Policy '{policy_id}' not found.")
    return {"message": f"Successfully deleted vector index for policy '{policy_id}'."}
