from typing import List
from ai.schemas import QueryResult, Citation

class ConfidenceCalculator:
    """
    Algorithmic confidence calculator.
    Computes an empirical confidence score (0.0 to 1.0) based on:
    - Top vector retrieval similarity
    - Number and density of supporting context chunks
    - Presence of direct policy citations
    - Count of missing information items
    """

    @staticmethod
    def calculate_confidence(
        answer: str,
        context_results: List[QueryResult],
        citations: List[Citation],
        missing_information: List[str]
    ) -> float:
        """
        Calculates an empirical confidence score bounded between 0.0 and 1.0.
        
        Note: This confidence score is an estimate based on factual grounding
        and retrieval similarity, not a guarantee.
        """
        if not context_results:
            return 0.0

        if "couldn't find sufficient information" in answer.lower() or "not available in the policy" in answer.lower():
            return 0.15

        # 1. Base Retrieval Score (0.0 - 0.45)
        top_sim = max((res.similarity_score for res in context_results), default=0.0)
        # Cosine sim usually ranges 0.2 to 0.95
        retrieval_component = min(max(top_sim, 0.0), 1.0) * 0.45

        # 2. Citation Evidence Score (0.0 - 0.30)
        citation_count = len(citations)
        if citation_count >= 2:
            citation_component = 0.30
        elif citation_count == 1:
            citation_component = 0.20
        else:
            citation_component = 0.05

        # 3. Grounding & Length Factor (0.0 - 0.25)
        grounding_component = 0.0
        if len(answer.strip()) > 50:
            grounding_component += 0.15
        if "according to" in answer.lower() or "section" in answer.lower() or "page" in answer.lower():
            grounding_component += 0.10

        total_score = retrieval_component + citation_component + grounding_component

        # 4. Penalty for missing information
        if missing_information:
            penalty = len(missing_information) * 0.12
            total_score = max(0.0, total_score - penalty)

        # Round score to 2 decimal places and clamp between 0.0 and 1.0
        return round(min(max(total_score, 0.0), 0.98), 2)
