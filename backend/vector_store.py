import chromadb
from chromadb.utils import embedding_functions
import os
import uuid
from typing import Optional


class VectorStore:
    """
    Lazily loads the embedding model and Chroma collection to avoid long startup times.
    Optionally uses MODEL_CACHE_DIR or SENTENCE_TRANSFORMERS_HOME to load a pre-downloaded model.
    """

    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.client: Optional[chromadb.PersistentClient] = None
        self.embedding_fn = None
        self.collection = None
        self.model_name = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
        default_cache = os.path.join(os.path.dirname(__file__), "static", "models")
        self.model_cache = (
            os.getenv("MODEL_CACHE_DIR")
            or os.getenv("SENTENCE_TRANSFORMERS_HOME")
            or default_cache
        )
        # Configure offline/local loading if cache exists
        self.local_model_path = None
        if self.model_cache:
            os.environ["SENTENCE_TRANSFORMERS_HOME"] = self.model_cache
            os.environ["HF_HOME"] = self.model_cache
            os.environ["TRANSFORMERS_OFFLINE"] = os.getenv("TRANSFORMERS_OFFLINE", "1")
            os.environ["HF_HUB_DISABLE_TELEMETRY"] = os.getenv("HF_HUB_DISABLE_TELEMETRY", "1")
            os.environ["HF_DATASETS_OFFLINE"] = os.getenv("HF_DATASETS_OFFLINE", "1")
            os.environ["HF_HUB_OFFLINE"] = os.getenv("HF_HUB_OFFLINE", "1")
            candidate = os.path.join(self.model_cache, self.model_name)
            if os.path.isdir(candidate):
                self.local_model_path = candidate

    def _ensure_loaded(self):
        if self.client is None:
            self.client = chromadb.PersistentClient(path=self.persist_directory)
        if self.embedding_fn is None:
            self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=self.local_model_path or self.model_name
            )
        if self.collection is None:
            self.collection = self.client.get_or_create_collection(
                name="research_papers",
                embedding_function=self.embedding_fn
            )

    def add_documents(self, docs):
        self._ensure_loaded()
        ids = []
        texts = []
        metadatas = []

        for doc in docs:
            doc_id = doc.get("id") or str(uuid.uuid4())
            ids.append(doc_id)
            text = f"Title: {doc.get('title','')}\nAbstract: {doc.get('summary','')}\nExtracted: {doc.get('extracted','')}"
            texts.append(text)
            metadatas.append({
                "title": doc.get("title", ""),
                "summary": str(doc.get("summary", "")),
                "pdf_url": doc.get("pdf_url", ""),
                "extracted": doc.get("extracted", ""),
                "category": doc.get("category", "General")
            })

        if ids:
            self.collection.upsert(
                ids=ids,
                documents=texts,
                metadatas=metadatas
            )

    def search(self, query, k=4):
        self._ensure_loaded()
        results = self.collection.query(
            query_texts=[query],
            n_results=k
        )
        formatted_results = []
        if results['ids']:
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "title": results['metadatas'][0][i]['title'],
                    "summary": results['metadatas'][0][i]['summary'],
                    "extracted": results['metadatas'][0][i]['extracted'],
                    "pdf_url": results['metadatas'][0][i]['pdf_url'],
                    "category": results['metadatas'][0][i].get('category', 'General')
                })
        return formatted_results

    def get_by_id(self, doc_id):
        self._ensure_loaded()
        try:
            result = self.collection.get(ids=[doc_id])
            if result['ids']:
                return {
                    "id": result['ids'][0],
                    "title": result['metadatas'][0]['title'],
                    "summary": result['metadatas'][0]['summary'],
                    "extracted": result['metadatas'][0]['extracted'],
                    "pdf_url": result['metadatas'][0]['pdf_url']
                }
        except Exception:
            return None
        return None

    @property
    def is_ready(self):
        return self.collection is not None
