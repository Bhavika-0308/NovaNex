from fastapi import HTTPException
from app.integrations.ai_assistant import ai_adapter, AIIntegrationError

async def ask(policy_id: str, question: str):
    try:
        result = await ai_adapter.ask_policy_question(policy_id, question)
    except AIIntegrationError as exc:
        raise HTTPException(status_code=503, detail={"error": {"code": "AI_NOT_CONFIGURED", "message": str(exc)}})
    if not isinstance(result, dict):
        raise HTTPException(status_code=502, detail={"error": {"code": "AI_INVALID_RESPONSE", "message": "AI module returned an invalid response"}})
    return {
        "answer": result.get("answer", ""),
        "citations": result.get("citations", []),
        "confidence": float(result.get("confidence", 0.0)),
        "missing_information": result.get("missing_information", []),
    }
