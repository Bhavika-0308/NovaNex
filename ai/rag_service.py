import os
import traceback
from typing import Optional, List
from ai.schemas import (
    IngestRequest,
    IngestResponse,
    QuestionRequest,
    QuestionResponse,
    Citation,
)
from ai.document_processor import DocumentProcessor, DocumentProcessingError
from ai.chunker import SmartPolicyChunker
from ai.embeddings import PolicyEmbedder
from ai.vector_store import IsolatedVectorStore, VectorStoreError
from ai.retriever import PolicyRetriever, PolicyNotIndexedError
from ai.llm import LLMService
from ai.citation import CitationExtractor
from ai.confidence import ConfidenceCalculator

class PolicyRAGService:
    """
    Complete RAG Pipeline Service for PolicyWise Health Insurance Assistant.
    Provides clean ingestion and Q&A interfaces with citations and confidence scores.
    """

    def __init__(self):
        self.doc_processor = DocumentProcessor()
        self.chunker = SmartPolicyChunker()
        self.embedder = PolicyEmbedder()
        self.vector_store = IsolatedVectorStore()
        self.retriever = PolicyRetriever(embedder=self.embedder, vector_store=self.vector_store)
        self.llm = LLMService()
        self.citation_extractor = CitationExtractor()
        self.confidence_calculator = ConfidenceCalculator()

    def ingest_policy(self, policy_id: str, document_path: str) -> IngestResponse:
        """
        Ingest a policy PDF, extract text with page metadata, chunk into clauses,
        generate embeddings, and store in isolated vector index.
        """
        if not policy_id or not policy_id.strip():
            return IngestResponse(
                success=False,
                policy_id=policy_id or "",
                error="Policy ID cannot be empty."
            )

        if not document_path or not os.path.exists(document_path):
            return IngestResponse(
                success=False,
                policy_id=policy_id,
                error=f"Document file not found at path: '{document_path}'"
            )

        try:
            # 1. Extract PDF pages with metadata
            pages = self.doc_processor.extract_pdf(document_path)

            # 2. Smart section-aware chunking
            chunks = self.chunker.chunk_policy(policy_id=policy_id, pages=pages)
            if not chunks:
                return IngestResponse(
                    success=False,
                    policy_id=policy_id,
                    total_pages=len(pages),
                    total_chunks=0,
                    error="Failed to produce text chunks from document."
                )

            # 3. Generate embeddings
            texts = [c.text for c in chunks]
            embeddings = self.embedder.embed_texts(texts)

            # 4. Save to policy-isolated vector store
            self.vector_store.add_policy(policy_id=policy_id, chunks=chunks, embeddings=embeddings)

            return IngestResponse(
                success=True,
                policy_id=policy_id,
                total_pages=len(pages),
                total_chunks=len(chunks),
                message=f"Successfully ingested policy '{policy_id}' ({len(pages)} pages, {len(chunks)} chunks)."
            )

        except DocumentProcessingError as e:
            return IngestResponse(
                success=False,
                policy_id=policy_id,
                error=f"Document processing error: {str(e)}"
            )
        except Exception as e:
            print(f"[PolicyRAGService] Ingestion failed for {policy_id}: {traceback.format_exc()}")
            return IngestResponse(
                success=False,
                policy_id=policy_id,
                error=f"Unexpected error during policy ingestion: {str(e)}"
            )

    def ask_policy_question(self, policy_id: str, question: str) -> QuestionResponse:
        """
        Answers questions strictly from the uploaded insurance policy.
        Returns fact-grounded answer, citations, confidence score, and missing info.
        """
        if not policy_id or not policy_id.strip():
            return QuestionResponse(
                answer="Error: policy_id is required.",
                citations=[],
                confidence=0.0,
                missing_information=["Valid policy_id"],
                policy_id=policy_id or "",
                status="error",
                error="policy_id cannot be empty."
            )

        if not question or not question.strip():
            return QuestionResponse(
                answer="Please enter a valid policy question.",
                citations=[],
                confidence=0.0,
                missing_information=["User question text"],
                policy_id=policy_id,
                status="error",
                error="Question string cannot be empty."
            )

        try:
            # 1. Retrieve top context chunks strictly isolated to policy_id
            context_results = self.retriever.retrieve_context(policy_id=policy_id, question=question)

            # 2. LLM answer generation / synthesis
            answer_text, missing_info = self.llm.generate_answer(question=question, context_results=context_results)

            # 3. Extract evidence citations
            citations = self.citation_extractor.extract_citations(answer=answer_text, context_results=context_results)

            # 4. Calculate empirical confidence score
            confidence = self.confidence_calculator.calculate_confidence(
                answer=answer_text,
                context_results=context_results,
                citations=citations,
                missing_information=missing_info
            )

            status = "insufficient_information" if "couldn't find sufficient information" in answer_text.lower() else "success"

            return QuestionResponse(
                answer=answer_text,
                citations=citations,
                confidence=confidence,
                missing_information=missing_info,
                policy_id=policy_id,
                status=status
            )

        except PolicyNotIndexedError as e:
            return QuestionResponse(
                answer=f"I couldn't find policy '{policy_id}' in the vector database. Please upload/ingest the policy document first.",
                citations=[],
                confidence=0.0,
                missing_information=["Uploaded policy document"],
                policy_id=policy_id,
                status="error",
                error=str(e)
            )
        except Exception as e:
            print(f"[PolicyRAGService] Q&A error for policy {policy_id}: {traceback.format_exc()}")
            return QuestionResponse(
                answer="An unexpected error occurred while analyzing the policy document.",
                citations=[],
                confidence=0.0,
                missing_information=[],
                policy_id=policy_id,
                status="error",
                error=f"Q&A processing failure: {str(e)}"
            )

# Global singleton helper instances for clean module imports
_rag_service_instance = None

def get_rag_service() -> PolicyRAGService:
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = PolicyRAGService()
    return _rag_service_instance

def ingest_policy(policy_id: str, document_path: str) -> IngestResponse:
    """Convenience helper function for backend integration."""
    return get_rag_service().ingest_policy(policy_id, document_path)

def ask_policy_question(policy_id: str, question: str) -> QuestionResponse:
    """Convenience helper function for backend integration."""
    return get_rag_service().ask_policy_question(policy_id, question)
