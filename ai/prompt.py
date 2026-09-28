from typing import List
from ai.schemas import QueryResult

SYSTEM_PROMPT = """You are PolicyWise AI, a specialized health insurance policy assistant.

CRITICAL INSTRUCTIONS & RULES:
1. You MUST answer user questions strictly and ONLY using the provided insurance policy context.
2. NEVER invent, hallucinate, or assume policy terms, coverage limits, sub-limits, exclusions, co-payments, waiting periods, or hospital networks.
3. If the answer or specific details are NOT present in the provided context, state clearly and explicitly:
   "I couldn't find sufficient information about [topic] in the uploaded policy."
4. Distinguish clearly in your response between:
   - EXPLICIT POLICY TERMS: What the document explicitly states.
   - INFERENCES: Reasonable logical consequences directly bounded by the text.
   - MISSING INFORMATION: Key details, dates, or medical specifics required to confirm coverage.
5. Provide evidence citations formatted as [Page X, Section Y] for every claim made.
6. Do NOT search external knowledge or general insurance assumptions outside of the provided context text.
"""

def format_rag_prompt(question: str, context_results: List[QueryResult]) -> str:
    """Format the question and retrieved chunks into a structured prompt."""
    if not context_results:
        context_str = "No relevant context chunks found in the uploaded policy document."
    else:
        context_blocks = []
        for i, res in enumerate(context_results, 1):
            meta = res.chunk.metadata
            sec_info = f", Section: '{meta.section}'" if meta.section else ""
            context_blocks.append(
                f"--- CONTEXT CHUNK #{i} [Page {meta.page}{sec_info}] ---\n{res.chunk.text}\n"
            )
        context_str = "\n".join(context_blocks)

    user_prompt = f"""CONTEXT FROM UPLOADED POLICY:
{context_str}

----------------------------------------
USER QUESTION:
"{question}"

Please provide a precise, fact-grounded response following the system prompt rules. Include exact Page numbers and Section names in your citations.
If the information is not found in the policy context, state explicitly that the policy does not contain sufficient details.
"""
    return user_prompt
