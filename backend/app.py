import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import fitz  # PyMuPDF
import io
import logging
import datetime
from sqlalchemy.orm import Session

from agents.retriever_agent import RetrieverAgent
from agents.summarizer_agent import SummarizerAgent
from agents.extractor_agent import ExtractorAgent
from agents.gap_agent import GapAgent
from agents.comparison_agent import ComparisonAgent
from vector_store import VectorStore
from rag_agent import RAGAgent
from tools.arxiv_tool import get_paper_by_id

import database
import auth

# ===== LOGGING CONFIG =====
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamFileHandler if hasattr(logging, "StreamFileHandler") else logging.StreamHandler(),
        logging.FileHandler("backend_errors.log")
    ]
)
logger = logging.getLogger(__name__)

# Initialize DB
database.init_db()

# Ensure uploads directory exists
UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()

# ===== GLOBAL ERROR HANDLERS =====

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.datetime.utcnow().isoformat()
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "An internal server error occurred.",
            "status_code": 500,
            "details": str(exc),
            "timestamp": datetime.datetime.utcnow().isoformat()
        },
    )

app.mount("/static", StaticFiles(directory="static"), name="static")

# ===== CORS CONFIG =====
origins = [
    "http://localhost:5173",
    "https://agentic-ai-research-assistant-two.vercel.app/",
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
comparison_agent = ComparisonAgent()
vector_store = VectorStore()
rag_agent = RAGAgent()

# ===== AUTH DEPENDENCIES =====
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

import os
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ===== REQUEST MODELS =====
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class GoogleAuthRequest(BaseModel):
    token: str

class ResearchRequest(BaseModel):
    query: str

class QuestionRequest(BaseModel):
    question: str

class GapRequest(BaseModel):
    topic: str

class CompareRequest(BaseModel):
    paper_ids: List[str]

class FavoriteRequest(BaseModel):
    paper_id: str
    title: Optional[str] = None
    pdf_url: Optional[str] = None

# ===== HELPER FUNCTIONS =====
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")

# ===== AUTH ENDPOINTS =====

@app.post("/api/auth/google")
def google_auth(request: GoogleAuthRequest, db: Session = Depends(database.get_db)):
    try:
        # Verify the ID token with Google
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(request.token, google_requests.Request(), CLIENT_ID)

        # Get user info from token
        email = idinfo['email']
        name = idinfo.get('name', '')
        google_id = idinfo['sub']

        # Check if user exists by email or google_id
        user = db.query(database.User).filter(
            (database.User.email == email) | 
            (database.User.google_id == google_id)
        ).first()

        if not user:
            # Create new user for first-time Google sign-in
            user = database.User(
                email=email,
                full_name=name,
                google_id=google_id,
                # Use a random string as the internal password_hash for security
                password_hash=auth.get_password_hash(str(uuid.uuid4()))
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.google_id:
            # Link Google ID to existing email account if not already linked
            user.google_id = google_id
            db.commit()

        # Generate JWT
        access_token = auth.create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }

    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/auth/signup")
def signup(user_in: UserCreate, db: Session = Depends(database.get_db)):
    # Check if email exists
    user_exists = db.query(database.User).filter(database.User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = database.User(
        email=user_in.email,
        password_hash=auth.get_password_hash(user_in.password),  # truncated & encoded
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate JWT
    access_token = auth.create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name
        }
    }
@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(database.User).filter(database.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# ===== USER PERSONALIZATION ENDPOINTS =====

@app.get("/api/user/favorites")
def get_favorites(current_user: database.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return current_user.favorites

@app.post("/api/user/favorites")
def add_favorite(fav_in: FavoriteRequest, current_user: database.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Check if already favorited
    existing = db.query(database.Favorite).filter(
        database.Favorite.user_id == current_user.id,
        database.Favorite.paper_id == fav_in.paper_id
    ).first()
    if existing:
        return existing
    
    new_fav = database.Favorite(
        user_id=current_user.id,
        paper_id=fav_in.paper_id,
        title=fav_in.title,
        pdf_url=fav_in.pdf_url
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@app.delete("/api/user/favorites/{paper_id}")
def remove_favorite(paper_id: str, current_user: database.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    fav = db.query(database.Favorite).filter(
        database.Favorite.user_id == current_user.id,
        database.Favorite.paper_id == paper_id
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}

@app.get("/api/user/history")
def get_history(current_user: database.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return current_user.sessions

# ===== PAPER DISCOVERY ENDPOINTS =====

@app.post("/api/papers/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
        # 1. Save file to local storage
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        stored_filename = f"{file_id}{file_extension}"
        file_path = UPLOAD_DIR / stored_filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size_kb = file_path.stat().st_size / 1024
        
        # 2. Extract basic info for Paper model
        content = file_path.read_bytes()
        text = extract_text_from_pdf(content)
        
        # Trigger lightweight summarization to get a title
        summary_obj = summarizer.run(text[:5000], is_raw_text=True)
        
        # 3. Create Paper record
        new_paper = database.Paper(
            id=file_id,
            title=summary_obj.get("title", file.filename),
            abstract=summary_obj.get("summary", ""),
            pdf_url=f"/static/uploads/{stored_filename}",
            file_name=file.filename,
            file_size=f"{file_size_kb:.2f} KB",
            category="User Upload"
        )
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        
        # 4. Add to Vector Store for RAG
        vector_store.add_documents([{
            "id": new_paper.id,
            "title": new_paper.title,
            "summary": new_paper.abstract,
            "extracted": "User Uploaded PDF",
            "pdf_url": new_paper.pdf_url
        }])
        
        return {
            "paper_id": new_paper.id,
            "file_name": new_paper.file_name,
            "pdf_url": new_paper.pdf_url,
            "uploaded_at": new_paper.created_at.isoformat()
        }
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

@app.get("/api/papers/search")
def search_papers(q: str, limit: int = 10, offset: int = 0, db: Session = Depends(database.get_db)):
    try:
        # 1. Search local DB first
        local_papers = db.query(database.Paper).filter(
            (database.Paper.title.ilike(f"%{q}%")) | 
            (database.Paper.abstract.ilike(f"%{q}%"))
        ).limit(limit).offset(offset).all()
        
        # 2. If results are few, fetch from ArXiv to supplement
        if len(local_papers) < limit:
            arxiv_papers = retriever.run(q)
            for ap in arxiv_papers:
                # Cache in local DB if not already there
                exists = db.query(database.Paper).filter(database.Paper.external_id == ap['id']).first()
                if not exists:
                    new_paper = database.Paper(
                        external_id=ap['id'],
                        title=ap['title'],
                        authors=", ".join(ap['authors']),
                        abstract=ap['summary'],
                        pdf_url=ap['pdf_url'],
                        category="ArXiv"
                    )
                    db.add(new_paper)
            db.commit()
            
            # Re-query local DB to get combined results
            local_papers = db.query(database.Paper).filter(
                (database.Paper.title.ilike(f"%{q}%")) | 
                (database.Paper.abstract.ilike(f"%{q}%"))
            ).limit(limit).offset(offset).all()

        return local_papers
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/papers/recent")
def get_recent_papers(limit: int = 10, db: Session = Depends(database.get_db)):
    try:
        # Fetch most recently added or published papers
        papers = db.query(database.Paper).order_by(database.Paper.publish_date.desc()).limit(limit).all()
        return papers
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/papers/{paper_id}")
def get_paper_details(paper_id: str, db: Session = Depends(database.get_db)):
    try:
        # Try local DB first (handles both internal UUIDs and ArXiv IDs)
        paper = db.query(database.Paper).filter(
            (database.Paper.id == paper_id) | 
            (database.Paper.external_id == paper_id)
        ).first()
        
        if not paper:
            # Try ArXiv if not found locally
            ap = get_paper_by_id(paper_id)
            if not ap:
                raise HTTPException(status_code=404, detail="Paper not found.")
            
            # Cache it
            paper = database.Paper(
                external_id=ap['id'],
                title=ap['title'],
                authors=", ".join(ap['authors']),
                abstract=ap['summary'],
                pdf_url=ap['pdf_url'],
                category="ArXiv"
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)
            
        return paper
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

# ===== GRANULAR AI SERVICE ENDPOINTS =====

@app.post("/api/analysis/summarize")
async def summarize_paper(
    paper_id: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None),
    current_user: Optional[database.User] = Depends(get_current_user), # Track history if logged in
    db: Session = Depends(database.get_db)
):
    try:
        result = None
        session_name = ""
        
        if file:
            content = await file.read()
            text = extract_text_from_pdf(content)
            result = summarizer.run(text, is_raw_text=True)
            session_name = f"Upload: {result.get('title', 'Untitled')[:30]}..."
        
        elif paper_id:
            paper = get_paper_by_id(paper_id)
            if not paper:
                raise HTTPException(status_code=404, detail="Paper not found on ArXiv.")
            result = summarizer.run(paper)
            session_name = f"ArXiv: {result.get('title', 'Untitled')[:30]}..."
        
        else:
            raise HTTPException(status_code=400, detail="Either paper_id or file must be provided.")
            
        # Log session if user is logged in
        if current_user and result:
            new_session = database.ResearchSession(
                user_id=current_user.id,
                session_name=session_name
            )
            db.add(new_session)
            db.commit()
            
        return result
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

@app.get("/api/papers/related")
def get_related_papers(q: Optional[str] = None, paper_id: Optional[str] = None):
    try:
        if paper_id:
            # First fetch the paper to get its content for comparison
            paper = vector_store.get_by_id(paper_id)
            if not paper:
                # If not in vector store, try fetching from ArXiv
                paper = get_paper_by_id(paper_id)
            
            if not paper:
                raise HTTPException(status_code=404, detail="Paper not found.")
            
            query = f"Title: {paper['title']}\nAbstract: {paper['summary']}"
        elif q:
            query = q
        else:
            raise HTTPException(status_code=400, detail="Query (q) or paper_id must be provided.")
            
        results = vector_store.search(query, k=5)
        return {"related_papers": results}
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

@app.post("/api/analysis/detect-gaps")
def detect_gaps(
    request: GapRequest, 
    current_user: Optional[database.User] = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        # 1. First, search persistent vector store for existing papers on this topic
        existing_papers = vector_store.search(request.topic, k=4)
        
        # 2. Fetch fresh papers from ArXiv
        new_papers = retriever.run(request.topic)
        
        # 3. Combine for analysis (limit duplicates if possible, but simplicity first)
        combined_papers = existing_papers + new_papers
        
        if not combined_papers:
            raise HTTPException(status_code=404, detail="No relevant papers found for gap analysis.")
            
        result = gap_agent.run(combined_papers)
        
        # 4. Save new ArXiv papers to vector store for persistence
        if new_papers:
            docs_to_add = []
            for p in new_papers:
                docs_to_add.append({
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "summary": p.get("summary"),
                    "extracted": "Fetched via Gap Analysis",
                    "pdf_url": p.get("pdf_url", "")
                })
            vector_store.add_documents(docs_to_add)

        if current_user:
            new_session = database.ResearchSession(
                user_id=current_user.id,
                session_name=f"Gap Detection: {request.topic[:30]}..."
            )
            db.add(new_session)
            db.commit()
            
        return result
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

@app.post("/api/analysis/compare")
def compare_papers(
    request: CompareRequest,
    current_user: Optional[database.User] = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        if not request.paper_ids:
            raise HTTPException(status_code=400, detail="List of paper IDs cannot be empty.")
            
        papers_data = []
        for pid in request.paper_ids:
            # Check vector store first
            p = vector_store.get_by_id(pid)
            if not p:
                # Then ArXiv
                p = get_paper_by_id(pid)
            
            if p:
                papers_data.append(p)
                
        if not papers_data:
            raise HTTPException(status_code=404, detail="None of the provided paper IDs were found.")
            
        result = comparison_agent.run(papers_data)
        
        # Save any new ArXiv papers to vector store
        docs_to_add = []
        for p in papers_data:
            # Only add if it has extracted info (from a previous step) or just add as is
            docs_to_add.append({
                "id": p.get("id"),
                "title": p.get("title"),
                "summary": p.get("summary"),
                "extracted": p.get("extracted", "Fetched via Comparison"),
                "pdf_url": p.get("pdf_url", "")
            })
        vector_store.add_documents(docs_to_add)

        if current_user:
            new_session = database.ResearchSession(
                user_id=current_user.id,
                session_name=f"Comparison: {len(papers_data)} papers"
            )
            db.add(new_session)
            db.commit()
            
        return result
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        return {"error": str(e)}

# ===== ORIGINAL ENDPOINTS (MAINTAINED FOR COMPATIBILITY) =====

@app.post("/research")
def run_research(request: ResearchRequest, current_user: Optional[database.User] = Depends(get_current_user), db: Session = Depends(database.get_db)):
    try:
        query = request.query
        papers = retriever.run(query)
        if not papers:
            return {"error": "No papers found."}

        combined_data = []
        for paper in papers:
            summary_obj = summarizer.run(paper)
            extraction_obj = extractor.run([paper])[0]
            
            combined_data.append({
                "id": paper.get("id"),
                "title": summary_obj.get("title", paper["title"]),
                "summary": summary_obj.get("key_findings", []),
                "summary_text": summary_obj.get("summary", ""),
                "extracted": extraction_obj.get("extracted", ""),
                "pdf_url": paper.get("pdf_url", "")
            })

        gaps_result = gap_agent.run(papers)
        gaps = gaps_result.get("gaps", [])

        # Store in persistent Vector DB
        vector_store.add_documents([{
            "id": p["id"],
            "title": p["title"],
            "summary": p["summary_text"],
            "extracted": p["extracted"],
            "pdf_url": p["pdf_url"]
        } for p in combined_data])

        if current_user:
            new_session = database.ResearchSession(
                user_id=current_user.id,
                session_name=f"Research: {query[:30]}..."
            )
            db.add(new_session)
            db.commit()

        return {"papers": combined_data, "gaps": gaps}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/ask")
def ask_question(request: QuestionRequest):
    try:
        question = request.question
        relevant_docs = vector_store.search(question, k=4)
        answer = rag_agent.answer(question, relevant_docs)
        return {"answer": answer}

    except Exception as e:
        return {"error": str(e)}