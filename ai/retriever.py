from typing import List
from ai.schemas import QueryResult
from ai.embeddings import PolicyEmbedder
from ai.vector_store import IsolatedVectorStore
from ai.config import AIConfig

class PolicyNotIndexedError(Exception):
    """Exception raised when querying a policy_id that has not been ingested."""
    pass

class PolicyRetriever:
    """Retrieves relevant policy context chunks for a specific policy_id."""

    def __init__(self, embedder: PolicyEmbedder = None, vector_store: IsolatedVectorStore = None):
        self.embedder = embedder or PolicyEmbedder()
        self.vector_store = vector_store or IsolatedVectorStore()

    def retrieve_context(self, policy_id: str, question: str, top_k: int = None) -> List[QueryResult]:
        """
        Given a policy_id and user question, returns top_k matching chunks with similarity scores.
        Guarantees strictly isolated retrieval per policy_id.
        """
        if not self.vector_store.policy_exists(policy_id):
            raise PolicyNotIndexedError(f"Policy ID '{policy_id}' has not been ingested into the vector store.")

        k = top_k or AIConfig.TOP_K_RETRIEVAL
        query_embedding = self.embedder.embed_query(question)
        
        results = self.vector_store.retrieve(policy_id, query_embedding, top_k=k)
        return results
