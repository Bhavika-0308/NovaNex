"""Adapter boundary for the AI/RAG teammate's module.

Configure AI_ASSISTANT_MODULE to the importable module that exposes:
    ingest_policy(policy_id, document_path)
    ask_policy_question(policy_id, question)

The adapter intentionally does not implement RAG.
"""
import importlib
import inspect
from app.core.config import settings

class AIIntegrationError(RuntimeError):
    pass

class AIAssistantAdapter:
    def _module(self):
        if not settings.ai_assistant_module:
            raise AIIntegrationError("AI assistant module is not configured")
        try:
            return importlib.import_module(settings.ai_assistant_module)
        except ImportError as exc:
            raise AIIntegrationError(f"Could not import configured AI assistant module: {exc}") from exc

    async def ingest_policy(self, policy_id: str, document_path: str):
        module = self._module()
        fn = getattr(module, "ingest_policy", None)
        if not callable(fn):
            raise AIIntegrationError("AI module must expose ingest_policy(policy_id, document_path)")
        result = fn(policy_id, document_path)
        return await result if inspect.isawaitable(result) else result

    async def ask_policy_question(self, policy_id: str, question: str):
        module = self._module()
        fn = getattr(module, "ask_policy_question", None)
        if not callable(fn):
            raise AIIntegrationError("AI module must expose ask_policy_question(policy_id, question)")
        result = fn(policy_id, question)
        return await result if inspect.isawaitable(result) else result

ai_adapter = AIAssistantAdapter()
