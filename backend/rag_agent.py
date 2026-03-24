# rag_agent.py

from groq import Groq
import os


class RAGAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def answer(self, question, retrieved_docs):
        q_clean = (question or "").strip()
        if not q_clean or len(q_clean.split()) <= 2 or q_clean.lower() in {"hi", "hello", "hey", "hi!", "hello!"}:
            return "Hi! I'm Bee. Ask me about your papers or a research topic and I'll answer using what I can retrieve."

        if not retrieved_docs:
            return "I couldn't find relevant context in the indexed papers yet."

        context = ""
        for doc in retrieved_docs:
            context += f"Title: {doc.get('title','')}\n"
            context += f"Summary: {doc.get('summary','')}\n"
            context += f"Extracted: {doc.get('extracted','')}\n"
            context += "----\n"

        prompt = f"""You are Bee, a friendly but rigorous research AI.
Respond conversationally like ChatGPT, but ground every statement in the provided papers. If something is not supported by the papers, say "Not found in retrieved papers."
Format: one short intro line, then 2–4 bullet lines (each starting with "- "), citing paper titles inline (e.g., according to *Paper Title*). Preserve line breaks.

Question: {question}

Context:
{context}

Answer:"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
        )

        return response.choices[0].message.content
