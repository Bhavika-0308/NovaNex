# PolicyWise — AI Policy Assistant & RAG Pipeline Module

> **Component:** AI Policy Assistant & Document RAG Engine  
> **Target System:** PolicyWise — AI-Powered Health Insurance Policy Analyzer  
> **Status:** Production-Ready & Integration-Tested

---

## 📌 Architecture Overview

The `ai/` module provides a self-contained, high-performance **Retrieval-Augmented Generation (RAG)** engine for health insurance policies. It enforces strict factual grounding to prevent hallucinations, guarantees **policy-level tenant isolation**, and computes evidence-backed confidence scores with page and clause citations.

```
Upload Insurance Policy PDF
       │
       ▼
DocumentProcessor (PyMuPDF / PDFPlumber / PyPDF)
       │  (Extracts text page-by-page preserving 1-indexed page numbers)
       ▼
SmartPolicyChunker
       │  (Section/Clause aware splitting + metadata tagging)
       ▼
PolicyEmbedder (SentenceTransformers / Local Vectorizer)
       │  (Generates unit-normalized dense vectors)
       ▼
IsolatedVectorStore (FAISS / Local Disk Index per Policy)
       │  (Enforces policy_id tenant isolation — zero cross-user leakage)
       ▼
User asks question ──► PolicyRetriever ──► Top-K Relevant Context Chunks
                                                    │
                                                    ▼
                                            LLMService (Gemini / OpenAI / Anthropic / Offline RAG Synthesizer)
                                                    │
                                                    ▼
                                            CitationExtractor & ConfidenceCalculator
                                                    │
                                                    ▼
                                            QuestionResponse JSON
```

---

## 📂 Module Structure

```
ai/
├── __init__.py             # Exposes ingest_policy & ask_policy_question
├── config.py               # Environment configuration & default paths
├── document_processor.py   # PDF text extraction with page metadata & scanned PDF detection
├── chunker.py              # Clause/Section-aware smart text chunking
├── embeddings.py           # Configurable dense vector embedder with fallback
├── vector_store.py         # Policy-isolated FAISS & Disk Vector Store
├── retriever.py            # Isolated context retriever per policy_id
├── prompt.py               # Anti-hallucination system prompt & context formatter
├── llm.py                  # Gemini, OpenAI, Anthropic, Ollama & offline RAG synthesizer
├── citation.py             # Citation extractor & context page matcher
├── confidence.py           # Algorithmic empirical confidence calculator
├── rag_service.py          # High-level PolicyRAGService entrypoint
├── router.py               # FastAPI APIRouter endpoints for backend integration
├── schemas.py              # Pydantic models (IngestResponse, QuestionResponse, etc.)
├── README.md               # Quick reference guide
└── tests/
    └── test_rag.py         # Automated unit test suite
```

---

## 🛠️ Installation & Setup

### 1. Requirements

Install required dependencies:

```bash
pip install fitz pypdf sentence-transformers faiss-cpu google-generativeai openai fastapi pydantic
```

*(Note: The module includes lightweight fallbacks for text processing, embedding, and vector similarity if native binary C-extensions are omitted).*

### 2. Environment Variables

Create or set the following variables in your `.env` or server environment:

```env
# Storage Directory (default: ./ai_storage)
POLICYWISE_STORAGE_DIR="./ai_storage"

# Configurable LLM Provider: 'gemini', 'openai', 'anthropic', 'ollama', or 'auto'
LLM_PROVIDER="auto"

# API Keys (Configure whichever provider you choose)
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Embedding Model
EMBEDDING_PROVIDER="sentence-transformers"
EMBEDDING_MODEL_NAME="all-MiniLM-L6-v2"

# Chunking & Retrieval Parameters
CHUNK_SIZE=600
CHUNK_OVERLAP=100
TOP_K_RETRIEVAL=4
SIMILARITY_THRESHOLD=0.20
```

---

## 🔌 Backend Engineer Integration Guide

The main FastAPI backend engineer can integrate the AI module in **two clean ways**:

### Option A: Direct Function Import (Recommended for FastAPI / Python backends)

```python
from ai import ingest_policy, ask_policy_question

# 1. Ingest policy after user uploads PDF
ingest_res = ingest_policy(
    policy_id="POL_889210",
    document_path="/path/to/uploaded_policy.pdf"
)

print(ingest_res.success)      # True / False
print(ingest_res.total_pages)  # Number of pages indexed

# 2. Query policy assistant when user asks a question
query_res = ask_policy_question(
    policy_id="POL_889210",
    question="What is the waiting period for pre-existing diseases?"
)

print(query_res.answer)
print(query_res.citations)
print(query_res.confidence)
print(query_res.missing_information)
```

---

### Option B: FastAPI APIRouter Mount (1-Line API Mounting)

In your main FastAPI application (`main.py`):

```python
from fastapi import FastAPI
from ai.router import ai_router

app = FastAPI(title="PolicyWise API")

# Mount AI module routes
app.include_router(ai_router)
```

This instantly exposes the following HTTP REST endpoints:

- `POST /ai/ingest` — Ingest policy document path
- `POST /ai/upload-and-ingest` — Upload PDF directly & ingest
- `POST /ai/ask` — Ask question on ingested policy
- `GET /ai/policies` — List all indexed policy IDs
- `DELETE /ai/policies/{policy_id}` — Remove policy vector index

---

## 📋 API & Schema Contract

### `ask_policy_question(policy_id: str, question: str)`

#### **Response JSON Schema (`QuestionResponse`)**:

```json
{
  "answer": "According to the uploaded policy document, pre-existing diseases (PED) have a mandatory waiting period of 36 months of continuous coverage before claims are payable.",
  "citations": [
    {
      "text": "3.1 Pre-Existing Diseases (PED): A waiting period of 36 months of continuous coverage applies for pre-existing conditions.",
      "page": 3,
      "section": "SECTION 3: WAITING PERIODS"
    }
  ],
  "confidence": 0.88,
  "missing_information": [],
  "policy_id": "POL_889210",
  "status": "success",
  "error": null
}
```

#### **Out-of-Policy / Unmentioned Topic Response Example**:

If the question asks for information not present in the policy (e.g. *"What is the cheapest hospital in Pune?"* or *"Does this cover space travel?"*):

```json
{
  "answer": "I couldn't find sufficient information about 'cheapest hospital in Pune' in the uploaded policy.",
  "citations": [],
  "confidence": 0.15,
  "missing_information": [
    "Policy details regarding cheapest, hospital, pune"
  ],
  "policy_id": "POL_889210",
  "status": "insufficient_information",
  "error": null
}
```

---

## 🛡️ Anti-Hallucination & Security Design

1. **Strict Context Grounding:** The prompt explicitly forces the LLM to rely *only* on context chunks and output `"I couldn't find sufficient information..."` if context is insufficient.
2. **Tenant Isolation:** Vector indexes are partitioned per `policy_id`. Queries for `policy_id="P1"` will **never** access or retrieve chunks from `policy_id="P2"`.
3. **Deterministic Fallback Synthesizer:** If external API keys are unavailable, the offline synthesizer extracts facts strictly matching the query terms without making unverified assertions.

---

## 🧪 Running Unit Tests

Run the automated test suite to verify pipeline functionality:

```bash
python -m ai.tests.test_rag
```

Expected Output:

```text
[1/4] Running test_chunker_section_metadata...
[2/4] Running test_policy_isolation_in_vector_store...
[3/4] Running test_full_rag_pipeline...
[4/4] Running test_unindexed_policy_error...

[SUCCESS] ALL 4 AI RAG PIPELINE UNIT TESTS PASSED!
```
