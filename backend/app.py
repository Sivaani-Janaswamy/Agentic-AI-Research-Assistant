from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from agents.retriever_agent import RetrieverAgent
from agents.summarizer_agent import SummarizerAgent
from agents.extractor_agent import ExtractorAgent
from agents.gap_agent import GapAgent
from vector_store import VectorStore
from rag_agent import RAGAgent

app = FastAPI()

# ===== CORS CONFIG =====
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== INITIALIZE AGENTS =====
retriever = RetrieverAgent()
summarizer = SummarizerAgent()
extractor = ExtractorAgent()
gap_agent = GapAgent()
vector_store = VectorStore()
rag_agent = RAGAgent()

# ===== REQUEST MODELS =====
class ResearchRequest(BaseModel):
    query: str

class QuestionRequest(BaseModel):
    question: str

# ===== RESEARCH ENDPOINT =====
@app.post("/research")
def run_research(request: ResearchRequest):
    try:
        query = request.query

        # 1. Retrieve papers
        papers = retriever.run(query)
        if not papers:
            return {"error": "No papers found."}

        # 2. Summarize and extract
        raw_summaries = summarizer.run(papers)
        extracted_info = extractor.run(papers)

        # 3. Prepare structured data
        combined_data = []
        for summary, extraction in zip(raw_summaries, extracted_info):
            # Handle summary string or list
            if isinstance(summary.get("summary"), str):
                raw_points = [s.strip() for s in summary["summary"].split("*") if s.strip()]
            elif isinstance(summary.get("summary"), list):
                raw_points = summary.get("summary", [])
            else:
                raw_points = []

            # Replace colons with dash for cleaner formatting
            summary_points = []
            for s in raw_points:
                s = s.replace(":", " ") \
                     .replace("Problem", "Problem –") \
                     .replace("Method", "Method –") \
                     .replace("Dataset", "Dataset –") \
                     .replace("Results", "Results –") \
                     .replace("Contribution", "Contribution –")
                summary_points.append(s)

            combined_data.append({
                "title": summary.get("title", "Untitled"),
                "summary": summary_points,                       # list for frontend
                "summary_text": "\n".join(summary_points),      # string for gap agent
                "extracted": extraction.get("extracted", ""),
                "pdf_url": summary.get("pdf_url", "")
            })

        # 4. Run gap analysis
        gaps = gap_agent.run([{"summary": paper["summary_text"]} for paper in combined_data])

        # 5. Store papers in vector DB
        vector_store.add_documents(combined_data)

        # 6. Return structured response
        return {"papers": combined_data, "gaps": gaps}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# ===== QUESTION ENDPOINT =====
@app.post("/ask")
def ask_question(request: QuestionRequest):
    try:
        question = request.question

        # Retrieve relevant documents from vector store
        relevant_docs = vector_store.search(question, k=4)

        # Generate answer using RAG agent
        answer = rag_agent.answer(question, relevant_docs)

        return {"answer": answer}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}