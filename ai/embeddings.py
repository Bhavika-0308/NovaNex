import math
import re
from typing import List
from ai.config import AIConfig

class PolicyEmbedder:
    """
    Generates normalized vector embeddings for text chunks and queries.
    Supports SentenceTransformers with an automated lightweight fallback.
    """

    def __init__(self, model_name: str = None):
        self.model_name = model_name or AIConfig.EMBEDDING_MODEL_NAME
        self._st_model = None
        self._use_fallback = False
        self._init_embedder()

    def _init_embedder(self):
        if AIConfig.EMBEDDING_PROVIDER == "sentence-transformers":
            try:
                from sentence_transformers import SentenceTransformer
                self._st_model = SentenceTransformer(self.model_name)
                return
            except Exception as e:
                print(f"[PolicyEmbedder] Could not load SentenceTransformer ({str(e)}). Using lightweight fallback embedder.")
                self._use_fallback = True
        else:
            self._use_fallback = True

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of text strings."""
        if not texts:
            return []

        if self._st_model and not self._use_fallback:
            try:
                embeddings = self._st_model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
                return [emb.tolist() for emb in embeddings]
            except Exception as e:
                print(f"[PolicyEmbedder] Encoding error: {str(e)}. Falling back to lightweight embedder.")
                self._use_fallback = True

        return [self._fallback_embed(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        """Embed a single search query."""
        results = self.embed_texts([query])
        return results[0] if results else []

    def _fallback_embed(self, text: str, dimension: int = 384) -> List[float]:
        """
        Deterministic, lightweight feature-hashing subword vectorizer.
        Generates normalized d-dimensional dense vector embeddings.
        """
        vec = [0.0] * dimension
        tokens = re.findall(r'\w+', text.lower())
        if not tokens:
            return vec

        for token in tokens:
            # Hash full token
            h1 = hash(token) % dimension
            vec[h1] += 2.0
            
            # Hash character n-grams (3-grams)
            if len(token) >= 3:
                for i in range(len(token) - 2):
                    ngram = token[i:i+3]
                    h2 = hash(ngram) % dimension
                    vec[h2] += 1.0

        # Compute Euclidean norm
        norm = math.sqrt(sum(val * val for val in vec))
        if norm > 1e-9:
            vec = [val / norm for val in vec]

        return vec
