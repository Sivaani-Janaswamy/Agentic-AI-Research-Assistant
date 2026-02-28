![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
# Agentic AI Research Assistant

**Agentic AI Research Assistant** is an AI-powered tool that helps researchers retrieve, summarize, and analyze scientific papers. It leverages multiple AI agents to extract insights, highlight research gaps, and answer questions based on your documents.

---

## Features
- Retrieve research papers based on a query
- Summarize scientific papers automatically
- Extract key information from papers
- Identify gaps in research
- Answer research-related questions using a RAG (Retrieval-Augmented Generation) system

---

## Tech Stack

### Backend
- **Python 3.12** – Programming language
- **FastAPI** – API framework
- **Uvicorn** – ASGI server
- **Pydantic** – Data validation
- **Groq** – AI integration
- **FAISS** (optional) – Vector similarity search
- **VectorStore** – Custom vector database for documents

### Frontend
- **React.js** – UI library
- **Tailwind CSS** – Styling
- **Axios / Fetch API** – HTTP requests

### AI Agents & Tools
- **RetrieverAgent** – Finds relevant papers
- **SummarizerAgent** – Summarizes content
- **ExtractorAgent** – Extracts key info
- **GapAgent** – Identifies research gaps
- **RAGAgent** – Answers questions based on vector store
- **Hugging Face Models** – Optional pre-trained NLP models
- **Groq API** – AI processing backend

---

## Installation

### Backend
1. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate
```
#Install dependencies:
```bash
pip install -r requirements.txt
```
#Run the backend server:
```bash
uvicorn app:app --reload
```
#Frontend
```bash
Navigate to the frontend directory:
```bash
cd ai-research-ui
```