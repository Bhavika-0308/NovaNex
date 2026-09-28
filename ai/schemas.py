from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Citation(BaseModel):
    """Citation referencing supporting policy text."""
    text: str = Field(..., description="Exact or summarized supporting text snippet from policy")
    page: int = Field(..., description="1-indexed page number in the original PDF")
    section: Optional[str] = Field(default=None, description="Section heading or clause title if identified")

class ChunkMetadata(BaseModel):
    """Metadata attached to each policy text chunk."""
    policy_id: str = Field(..., description="Unique policy identifier")
    page: int = Field(..., description="1-indexed page number where chunk resides")
    section: Optional[str] = Field(default=None, description="Inferred section title or heading")
    chunk_id: str = Field(..., description="Unique chunk identifier")

class Chunk(BaseModel):
    """Represents a text chunk with metadata."""
    text: str = Field(..., description="The chunk text content")
    metadata: ChunkMetadata = Field(..., description="Metadata for policy, page, section")

class QueryResult(BaseModel):
    """Result returned from vector store retrieval."""
    chunk: Chunk
    similarity_score: float = Field(..., description="Cosine similarity score between 0.0 and 1.0")

class IngestRequest(BaseModel):
    """Request payload to ingest a policy PDF."""
    policy_id: str = Field(..., description="Unique ID for the policy document")
    document_path: str = Field(..., description="Absolute or relative file path to the PDF document")

class IngestResponse(BaseModel):
    """Response payload after policy ingestion."""
    success: bool
    policy_id: str
    total_pages: int = 0
    total_chunks: int = 0
    message: str = ""
    error: Optional[str] = None

class QuestionRequest(BaseModel):
    """Request payload to ask a policy question."""
    policy_id: str = Field(..., description="Unique ID for the target policy document")
    question: str = Field(..., description="User question regarding policy terms, coverage, limits")

class QuestionResponse(BaseModel):
    """Standardized response payload from AI Policy Assistant."""
    answer: str = Field(..., description="Fact-checked answer generated strictly from policy context")
    citations: List[Citation] = Field(default_factory=list, description="List of evidence citations from the policy")
    confidence: float = Field(..., description="Calculated confidence score between 0.0 and 1.0")
    missing_information: List[str] = Field(default_factory=list, description="Specific details or inputs missing to answer fully")
    policy_id: str = Field(..., description="Policy ID queried")
    status: str = Field("success", description="Status indicator: success | insufficient_information | error")
    error: Optional[str] = Field(default=None, description="Error detail if status is error")
