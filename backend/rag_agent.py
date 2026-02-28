# rag_agent.py

from groq import Groq
import os


class RAGAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def answer(self, question, retrieved_docs):
        context = ""

        for doc in retrieved_docs:
            context += f"""
Title: {doc['title']}
Summary: {doc['summary']}
Extracted Info: {doc['extracted']}
-----------------------------------
"""

        prompt = f"""
You are a research assistant.

Answer the question using ONLY the provided context.
If the answer is not in the context, say "Not found in retrieved papers."

Context:
{context}

Question:
{question}

Answer clearly and concisely:
"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        return response.choices[0].message.content