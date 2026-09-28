import os
import json
import math
from pathlib import Path
from typing import List, Dict, Any, Optional
from ai.schemas import Chunk, ChunkMetadata, QueryResult
from ai.config import AIConfig

class VectorStoreError(Exception):
    """Exception raised for vector store operations."""
    pass

class IsolatedVectorStore:
    """
    Local isolated vector store implementation.
    Maintains separate vector indexes keyed strictly by policy_id to guarantee zero multi-tenant leakage.
    Supports FAISS with local fallback persistence.
    """

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or AIConfig.VECTOR_STORE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._faiss = None
        self._detect_faiss()

    def _detect_faiss(self):
        try:
            import faiss
            self._faiss = faiss
        except ImportError:
            self._faiss = None

    def add_policy(self, policy_id: str, chunks: List[Chunk], embeddings: List[List[float]]):
        """
        Store chunks and vector embeddings for a specific policy_id.
        Overwrites or updates the isolated store for policy_id.
        """
        if not chunks or not embeddings:
            raise VectorStoreError(f"No chunks or embeddings provided for policy_id: {policy_id}")

        if len(chunks) != len(embeddings):
            raise VectorStoreError("Mismatch between number of chunks and embeddings.")

        policy_dir = self.storage_dir / policy_id
        policy_dir.mkdir(parents=True, exist_ok=True)

        # Save metadata and text chunks
        chunks_file = policy_dir / "chunks.json"
        serialized_chunks = [chunk.model_dump() for chunk in chunks]
        with open(chunks_file, "w", encoding="utf-8") as f:
            json.dump(serialized_chunks, f, indent=2)

        # Save embeddings
        embeddings_file = policy_dir / "embeddings.json"
        with open(embeddings_file, "w", encoding="utf-8") as f:
            json.dump(embeddings, f)

        # If FAISS is installed, build and save FAISS index
        if self._faiss and embeddings:
            try:
                import numpy as np
                emb_matrix = np.array(embeddings, dtype=np.float32)
                d = emb_matrix.shape[1]
                # Use Inner Product (Cosine Similarity since vectors are unit-normalized)
                index = self._faiss.IndexFlatIP(d)
                index.add(emb_matrix)
                faiss_file = policy_dir / "index.faiss"
                self._faiss.write_index(index, str(faiss_file))
            except Exception as e:
                print(f"[VectorStore] FAISS write error for {policy_id}: {str(e)}")

    def policy_exists(self, policy_id: str) -> bool:
        """Check if policy_id has an indexed vector store."""
        policy_dir = self.storage_dir / policy_id
        chunks_file = policy_dir / "chunks.json"
        embeddings_file = policy_dir / "embeddings.json"
        return chunks_file.exists() and embeddings_file.exists()

    def retrieve(self, policy_id: str, query_embedding: List[float], top_k: int = 4) -> List[QueryResult]:
        """
        Retrieve top_k relevant chunks STRICTLY for the given policy_id.
        Returns empty list if policy does not exist or has no chunks.
        """
        if not self.policy_exists(policy_id):
            return []

        policy_dir = self.storage_dir / policy_id
        chunks_file = policy_dir / "chunks.json"

        # Load chunks
        with open(chunks_file, "r", encoding="utf-8") as f:
            raw_chunks = json.load(f)
        chunks = [Chunk(**c) for c in raw_chunks]

        faiss_file = policy_dir / "index.faiss"
        if self._faiss and faiss_file.exists():
            try:
                import numpy as np
                index = self._faiss.read_index(str(faiss_file))
                q_vec = np.array([query_embedding], dtype=np.float32)
                k = min(top_k, len(chunks))
                scores, indices = index.search(q_vec, k)
                
                results = []
                for score, idx in zip(scores[0], indices[0]):
                    if idx >= 0 and idx < len(chunks):
                        results.append(QueryResult(
                            chunk=chunks[idx],
                            similarity_score=float(score)
                        ))
                return results
            except Exception as e:
                print(f"[VectorStore] FAISS search error ({str(e)}). Falling back to direct matrix cosine retrieval.")

        # Fallback matrix cosine similarity search
        embeddings_file = policy_dir / "embeddings.json"
        with open(embeddings_file, "r", encoding="utf-8") as f:
            embeddings = json.load(f)

        scored_results = []
        for i, emb in enumerate(embeddings):
            score = self._cosine_similarity(query_embedding, emb)
            scored_results.append((score, chunks[i]))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_results[:top_k]

        return [
            QueryResult(chunk=chunk, similarity_score=float(score))
            for score, chunk in top_results
        ]

    def list_policies(self) -> List[str]:
        """List all indexed policy IDs."""
        if not self.storage_dir.exists():
            return []
        policies = []
        for d in self.storage_dir.iterdir():
            if d.is_dir() and (d / "chunks.json").exists():
                policies.append(d.name)
        return policies

    def delete_policy(self, policy_id: str) -> bool:
        """Delete vector store index for policy_id."""
        import shutil
        policy_dir = self.storage_dir / policy_id
        if policy_dir.exists():
            shutil.rmtree(policy_dir)
            return True
        return False

    @staticmethod
    def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 < 1e-9 or norm2 < 1e-9:
            return 0.0
        return dot / (norm1 * norm2)
