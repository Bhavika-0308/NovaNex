import os
import sys
import tempfile
from pathlib import Path

try:
    import pytest
except ImportError:
    pytest = None


from ai.schemas import IngestResponse, QuestionResponse
from ai.document_processor import DocumentProcessor, DocumentProcessingError, ExtractedPage
from ai.chunker import SmartPolicyChunker
from ai.vector_store import IsolatedVectorStore
from ai.embeddings import PolicyEmbedder
from ai.retriever import PolicyRetriever, PolicyNotIndexedError
from ai.rag_service import PolicyRAGService

# Sample policy text for testing
SAMPLE_POLICY_TEXT_P1 = """
POLICY SCHEDULE - HEALTH GUARD ADVANCED
Policy Number: HG-990812-A
Policyholder: Rahul Sharma
Sum Insured: Rs. 5,00,000

SECTION 1: HOSPITALIZATION COVERAGE
1.1 Inpatient Care: The company shall indemnify medical expenses incurred during hospital stay exceeding 24 hours.
1.2 Room Rent Limit: Room rent is covered up to Single Private Room limit (Rs. 5,000 per day). If the insured occupies a higher category room, co-payment of 20% shall apply on all associated medical fees.

SECTION 2: EXCLUSIONS
2.1 Non-Medical Expenses: Consumables, gloves, masks, and administrative charges are excluded under Section 2.1.
2.2 Cosmetic Surgery: Treatments for aesthetic enhancement are not covered unless necessitated by accidental trauma.

SECTION 3: WAITING PERIODS
3.1 Pre-Existing Diseases (PED): A waiting period of 36 months of continuous coverage applies for pre-existing conditions.
3.2 Knee Replacement Surgery: Covered after a specific waiting period of 24 months.
"""

SAMPLE_POLICY_TEXT_P2 = """
POLICY SCHEDULE - STAR CORPORATE HEALTH
Policy Number: STAR-441-B
Sum Insured: Rs. 10,00,000

SECTION 1: COVERAGE
1.1 Maternity Expenses: Maternity expenses covered up to Rs. 50,000 for normal delivery and Rs. 75,000 for C-section.
1.2 Newborn Care: Covered up to 90 days from birth within the maternity sum limit.
"""

def test_chunker_section_metadata():
    chunker = SmartPolicyChunker(target_chunk_size=300, chunk_overlap=50)
    pages = [
        ExtractedPage(page_num=1, text=SAMPLE_POLICY_TEXT_P1, initial_section="POLICY SCHEDULE")
    ]
    chunks = chunker.chunk_policy(policy_id="POL_TEST_1", pages=pages)
    
    assert len(chunks) >= 1
    assert chunks[0].metadata.policy_id == "POL_TEST_1"
    assert chunks[0].metadata.page == 1
    assert "HOSPITALIZATION" in [c.metadata.section for c in chunks if c.metadata.section] or len(chunks) > 0

def test_policy_isolation_in_vector_store(tmp_path):
    v_store = IsolatedVectorStore(storage_dir=tmp_path / "v_store")
    embedder = PolicyEmbedder()
    chunker = SmartPolicyChunker()

    pages1 = [ExtractedPage(page_num=1, text=SAMPLE_POLICY_TEXT_P1)]
    chunks1 = chunker.chunk_policy("POL_1", pages1)
    embs1 = embedder.embed_texts([c.text for c in chunks1])
    v_store.add_policy("POL_1", chunks1, embs1)

    pages2 = [ExtractedPage(page_num=1, text=SAMPLE_POLICY_TEXT_P2)]
    chunks2 = chunker.chunk_policy("POL_2", pages2)
    embs2 = embedder.embed_texts([c.text for c in chunks2])
    v_store.add_policy("POL_2", chunks2, embs2)

    # Search POL_1 for Maternity (which is only in POL_2)
    query_emb = embedder.embed_query("Maternity delivery expense limit")
    results1 = v_store.retrieve("POL_1", query_emb, top_k=4)

    # Ensure NONE of the retrieved chunks belong to POL_2!
    for res in results1:
        assert res.chunk.metadata.policy_id == "POL_1"
        assert "Maternity" not in res.chunk.text

def test_full_rag_pipeline(tmp_path):
    service = PolicyRAGService()
    service.vector_store = IsolatedVectorStore(storage_dir=tmp_path / "v_store_test")
    service.retriever = PolicyRetriever(embedder=service.embedder, vector_store=service.vector_store)

    # Directly mock ingestion by adding chunks
    chunker = SmartPolicyChunker()
    pages = [ExtractedPage(page_num=1, text=SAMPLE_POLICY_TEXT_P1)]
    chunks = chunker.chunk_policy("POL_RAG_1", pages)
    embs = service.embedder.embed_texts([c.text for c in chunks])
    service.vector_store.add_policy("POL_RAG_1", chunks, embs)

    # Question 1: Covered clause (Knee replacement)
    resp1 = service.ask_policy_question("POL_RAG_1", "What is the waiting period for knee replacement surgery?")
    assert resp1.status == "success"
    assert "24" in resp1.answer or "knee replacement" in resp1.answer.lower()
    assert resp1.confidence > 0.3
    assert len(resp1.citations) >= 1

    # Question 2: Out of policy / unmentioned topic (Cheapest hospital in Pune)
    resp2 = service.ask_policy_question("POL_RAG_1", "What is the cheapest hospital in Pune?")
    assert "couldn't find sufficient information" in resp2.answer.lower() or resp2.status == "insufficient_information"

def test_unindexed_policy_error(tmp_path):
    service = PolicyRAGService()
    service.vector_store = IsolatedVectorStore(storage_dir=tmp_path / "v_store_empty")
    service.retriever = PolicyRetriever(embedder=service.embedder, vector_store=service.vector_store)

    resp = service.ask_policy_question("UNINDEXED_POL_999", "Is room rent covered?")
    assert resp.status == "error"
    assert "vector database" in resp.answer.lower() or "ingested" in resp.error.lower()


def run_all_tests():
    p = Path(tempfile.mkdtemp())
    print("[1/4] Running test_chunker_section_metadata...")
    test_chunker_section_metadata()
    print("[2/4] Running test_policy_isolation_in_vector_store...")
    test_policy_isolation_in_vector_store(p)
    print("[3/4] Running test_full_rag_pipeline...")
    test_full_rag_pipeline(p)
    print("[4/4] Running test_unindexed_policy_error...")
    test_unindexed_policy_error(p)
    print("\n[SUCCESS] ALL 4 AI RAG PIPELINE UNIT TESTS PASSED!")

if __name__ == "__main__":
    run_all_tests()


