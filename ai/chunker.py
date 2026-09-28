import re
import uuid
from typing import List, Optional
from ai.schemas import Chunk, ChunkMetadata
from ai.document_processor import ExtractedPage
from ai.config import AIConfig

class SmartPolicyChunker:
    """
    Chunks extracted policy pages while preserving sections, headings, clauses,
    page numbers, and policy IDs in metadata.
    """

    HEADING_PATTERNS = [
        re.compile(r'^(Section\s+\d+[\.\d+]*\s*[-:]?\s*.*$)', re.IGNORECASE),
        re.compile(r'^(Clause\s+\d+[\.\d+]*\s*[-:]?\s*.*$)', re.IGNORECASE),
        re.compile(r'^(\d+\.\d*\s+[A-Z\s]{3,60})$'),
        re.compile(r'^(Coverage|Exclusions|Waiting Period|Co-Payment|Deductible|Definitions|Claims Procedure|Policy Terms)\b.*$', re.IGNORECASE)
    ]

    def __init__(self, target_chunk_size: int = None, chunk_overlap: int = None):
        self.target_chunk_size = target_chunk_size or AIConfig.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or AIConfig.CHUNK_OVERLAP

    def chunk_policy(self, policy_id: str, pages: List[ExtractedPage]) -> List[Chunk]:
        """
        Processes all pages of a policy and generates structured chunks with metadata.
        """
        chunks: List[Chunk] = []
        current_section = "General Policy Overview"

        for page in pages:
            page_text = page.text.strip()
            if not page_text:
                continue

            # Update initial section if page provides one
            if page.initial_section:
                current_section = page.initial_section

            # Split text by paragraphs / clauses
            raw_blocks = [b.strip() for b in re.split(r'\n\s*\n|\n(?=[A-Z0-9\.\s]{4,30}:)', page_text) if b.strip()]
            
            accumulated_text = ""
            
            for block in raw_blocks:
                # Check if block is a heading
                detected_heading = self._extract_heading(block)
                if detected_heading:
                    current_section = detected_heading

                if len(accumulated_text) + len(block) > self.target_chunk_size and len(accumulated_text) >= AIConfig.MIN_CHUNK_SIZE:
                    # Flush current accumulated chunk
                    chunk_obj = self._create_chunk(
                        policy_id=policy_id,
                        page_num=page.page_num,
                        section=current_section,
                        text=accumulated_text.strip()
                    )
                    chunks.append(chunk_obj)

                    # Keep overlap from previous text
                    overlap_size = min(len(accumulated_text), self.chunk_overlap)
                    accumulated_text = accumulated_text[-overlap_size:] + " " + block
                else:
                    if accumulated_text:
                        accumulated_text += "\n\n" + block
                    else:
                        accumulated_text = block

            # Flush remaining page text
            if accumulated_text and len(accumulated_text.strip()) >= 20:
                chunk_obj = self._create_chunk(
                    policy_id=policy_id,
                    page_num=page.page_num,
                    section=current_section,
                    text=accumulated_text.strip()
                )
                chunks.append(chunk_obj)

        return chunks

    def _extract_heading(self, text_line: str) -> Optional[str]:
        first_line = text_line.split('\n')[0].strip()
        for pattern in self.HEADING_PATTERNS:
            match = pattern.match(first_line)
            if match:
                clean = match.group(1).strip()
                if 4 <= len(clean) <= 90:
                    return clean
        return None

    def _create_chunk(self, policy_id: str, page_num: int, section: Optional[str], text: str) -> Chunk:
        chunk_id = f"chunk_{policy_id}_{page_num}_{uuid.uuid4().hex[:8]}"
        metadata = ChunkMetadata(
            policy_id=policy_id,
            page=page_num,
            section=section,
            chunk_id=chunk_id
        )
        return Chunk(text=text, metadata=metadata)
