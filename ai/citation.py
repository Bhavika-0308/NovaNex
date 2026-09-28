import re
from typing import List
from ai.schemas import Citation, QueryResult

class CitationExtractor:
    """Extracts and verifies evidence citations from LLM output and retrieved context."""

    def extract_citations(self, answer: str, context_results: List[QueryResult]) -> List[Citation]:
        """
        Derives citations by matching referenced pages/sections in answer text
        or mapping to top retrieved context chunks.
        """
        citations: List[Citation] = []
        seen = set()

        # Regex search for explicit [Page X, Section: Y] or [Page X] in answer
        page_matches = re.findall(r'\[Page\s+(\d+)(?:,\s*Section:\s*([^\]]+))?\]', answer, re.IGNORECASE)

        if page_matches:
            for page_str, section_str in page_matches:
                try:
                    page_num = int(page_str)
                    sec = section_str.strip() if section_str else None
                    
                    # Find corresponding context snippet
                    matching_text = self._find_context_text(page_num, sec, context_results)
                    key = (page_num, sec, matching_text[:40])
                    
                    if key not in seen:
                        seen.add(key)
                        citations.append(Citation(
                            text=matching_text,
                            page=page_num,
                            section=sec
                        ))
                except ValueError:
                    continue

        # If LLM didn't format tags, map from top retrieved context results
        if not citations and context_results:
            for res in context_results[:3]:
                meta = res.chunk.metadata
                key = (meta.page, meta.section, res.chunk.text[:40])
                if key not in seen and res.similarity_score >= 0.15:
                    seen.add(key)
                    # Snippet summarizing the chunk
                    text_snippet = res.chunk.text.strip().replace('\n', ' ')
                    if len(text_snippet) > 250:
                        text_snippet = text_snippet[:247] + "..."
                    citations.append(Citation(
                        text=text_snippet,
                        page=meta.page,
                        section=meta.section
                    ))

        return citations

    def _find_context_text(self, page_num: int, section: str, context_results: List[QueryResult]) -> str:
        for res in context_results:
            meta = res.chunk.metadata
            if meta.page == page_num:
                if not section or (meta.section and section.lower() in meta.section.lower()):
                    snippet = res.chunk.text.strip().replace('\n', ' ')
                    return snippet[:250] + "..." if len(snippet) > 250 else snippet
        
        # Fallback first chunk matching page
        for res in context_results:
            if res.chunk.metadata.page == page_num:
                snippet = res.chunk.text.strip().replace('\n', ' ')
                return snippet[:250] + "..." if len(snippet) > 250 else snippet

        return f"Supporting evidence from Page {page_num}"
