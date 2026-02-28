# vector_store.py

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class VectorStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self.documents = []

    def add_documents(self, docs):
        """
        docs: list of dicts with keys:
              title, summary, extracted
        """
        texts = [
            f"{doc['title']}\n{doc['summary']}\n{doc['extracted']}"
            for doc in docs
        ]

        embeddings = self.model.encode(texts)
        self.index.add(np.array(embeddings).astype("float32"))
        self.documents.extend(docs)

    def search(self, query, k=2):
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(
            np.array(query_embedding).astype("float32"), k
        )

        results = []
        for idx in indices[0]:
            results.append(self.documents[idx])

        return results