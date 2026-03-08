import chromadb
from chromadb.utils import embedding_functions
import os
import uuid

class VectorStore:
    def __init__(self, persist_directory="./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Use a local embedding model (sentence-transformers)
        # ChromaDB has a default, but we'll be explicit to match previous performance
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name="research_papers",
            embedding_function=self.embedding_fn
        )

    def add_documents(self, docs):
        """
        docs: list of dicts with keys:
              id (optional), title, summary, extracted, pdf_url, category (optional)
        """
        ids = []
        texts = []
        metadatas = []

        for doc in docs:
            # Generate or use existing ID
            doc_id = doc.get("id") or str(uuid.uuid4())
            ids.append(doc_id)
            
            # Text to embed
            text = f"Title: {doc['title']}\nAbstract: {doc['summary']}\nExtracted: {doc['extracted']}"
            texts.append(text)
            
            # Metadata for retrieval
            metadatas.append({
                "title": doc.get("title", ""),
                "summary": str(doc.get("summary", "")), # Ensure it's string
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
        """
        Search for documents by semantic similarity.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=k
        )
        
        formatted_results = []
        # ChromaDB returns nested lists
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
        """
        Fetch a single document by its ID from the vector store.
        """
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
