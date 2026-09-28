import os
from pathlib import Path
from typing import Optional

class AIConfig:
    """Configuration settings for the PolicyWise AI Module."""
    
    # Project paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = Path(os.getenv("POLICYWISE_STORAGE_DIR", BASE_DIR / "ai_storage"))
    VECTOR_STORE_DIR: Path = STORAGE_DIR / "vector_store"
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto").lower()  # 'gemini', 'openai', 'anthropic', 'ollama', 'auto'
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    
    # Embedding Settings
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers").lower()  # 'sentence-transformers', 'tfidf', 'openai'
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    
    # Chunking Settings
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "600"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))
    MIN_CHUNK_SIZE: int = int(os.getenv("MIN_CHUNK_SIZE", "80"))
    
    # Retrieval Settings
    TOP_K_RETRIEVAL: int = int(os.getenv("TOP_K_RETRIEVAL", "4"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.20"))
    
    @classmethod
    def ensure_directories(cls):
        """Ensure all required storage directories exist."""
        cls.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        cls.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

AIConfig.ensure_directories()
