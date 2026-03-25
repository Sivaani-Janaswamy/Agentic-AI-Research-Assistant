import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from prometheus_fastapi_instrumentator import Instrumentator
import hashlib
import secrets
import smtplib
import ssl
import os
import fitz  # PyMuPDF
import io
import logging
import datetime
import time
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid
from collections import defaultdict
import requests
import xml.etree.ElementTree as ET

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
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# Simple in-memory rate limit for forgot-password (email -> list of timestamps)
FORGOT_WINDOW_MINUTES = 15
FORGOT_MAX_REQUESTS = 5
forgot_tracker = defaultdict(list)
# Simple rate limiter for /api/ask
ask_tracker = defaultdict(list)
ASK_WINDOW_SECONDS = 60
ASK_MAX_REQUESTS = 20

# ===== HEALTH =====
@app.get("/health")
def health():
    return {
        "status": "ok",
        "time": datetime.datetime.utcnow().isoformat() + "Z",
        "vector_store_ready": getattr(vector_store, "is_ready", False)
    }

@app.get("/api/trends")
def trends():
    """
    Returns monthly paper counts for last 12 months, split by source:
    - user uploads (category == 'User Upload')
    - cached arxiv/other (everything else)
    """
    today = datetime.date.today().replace(day=1)
    months_index = []
    y, m = today.year, today.month
    for _ in range(12):
        months_index.insert(0, f"{y:04d}-{m:02d}")
        m -= 1
        if m == 0:
            m = 12
            y -= 1

    uploads = [0]*12
    arxiv = [0]*12

    with database.engine.connect() as conn:
        rows = list(conn.execute(
            """
            SELECT strftime('%Y-%m', created_at) as month,
                   CASE WHEN category='User Upload' THEN 'uploads' ELSE 'arxiv' END as source,
                   count(*) as count
            FROM papers
            WHERE created_at >= date('now','-11 months')
            GROUP BY 1,2
            ORDER BY 1
            """
        ))

    month_to_idx = {m: i for i, m in enumerate(months_index)}
    for month, source, count in rows:
        idx = month_to_idx.get(month)
        if idx is None:
            continue
        if source == 'uploads':
            uploads[idx] = int(count)
        else:
            arxiv[idx] = int(count)

    return {
        "labels": list(months_index),
        "series": [
            {"label": "User uploads", "data": uploads},
            {"label": "Fetched ArXiv/DB", "data": arxiv},
        ],
    }

@app.get("/api/trends/domains")
def domain_trends():
    """
    Returns top research domains (by category) over the last 6 months.
    Provides:
      labels: list of YYYY-MM months (6)
      series: list of {label, data[]} for line/bar (top categories, others aggregated)
      pie: list of {label, value} for latest month distribution
      bar: list of {label, value} total over 6 months
    """
    today = datetime.date.today().replace(day=1)
    months_index = []
    y, m = today.year, today.month
    for _ in range(6):
        months_index.insert(0, f"{y:04d}-{m:02d}")
        m -= 1
        if m == 0:
            m = 12
            y -= 1

    start_time = datetime.datetime.utcnow()
    with database.engine.connect() as conn:
        rows = list(conn.execute(text(
            """
            SELECT strftime('%Y-%m', created_at) as month,
                   COALESCE(NULLIF(TRIM(category),''),'Uncategorized') as category,
                   count(*) as count
            FROM papers
            WHERE created_at >= date('now','-5 months')
            GROUP BY 1,2
            ORDER BY 1
            """
        )))
    # map counts
    counts = defaultdict(lambda: [0]*6)
    month_to_idx = {m: i for i, m in enumerate(months_index)}
    for month, category, count in rows:
        idx = month_to_idx.get(month)
        if idx is None:
            continue
        counts[category][idx] = int(count)

    # pick top 5 categories by total
    totals = {cat: sum(vals) for cat, vals in counts.items()}
    top_categories = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:5]
    top_names = set(cat for cat, _ in top_categories)

    series = []
    other = [0]*6
    for cat, vals in counts.items():
        if cat in top_names:
            series.append({"label": cat, "data": vals})
        else:
            other = [o+v for o, v in zip(other, vals)]
    if any(other):
        series.append({"label": "Other", "data": other})

    # If no data at all, return zeros so UI still renders
    if not series:
        series = [{"label": "All papers", "data": [0]*6}]

    # pie for latest month
    latest_idx = len(months_index) - 1
    pie = []
    for s in series:
        pie.append({"label": s["label"], "value": s["data"][latest_idx]})

    # bar totals
    bar = [{"label": s["label"], "value": sum(s["data"])} for s in series]
    top = sorted(bar, key=lambda x: x["value"], reverse=True)[:5]

    payload = {
        "labels": months_index,
        "series": series,
        "pie": pie,
        "bar": bar,
        "top": top
    }
    duration_ms = int((datetime.datetime.utcnow() - start_time).total_seconds() * 1000)
    logger.info(f"[trends/domains] rows={len(rows)} series={len(series)} duration_ms={duration_ms}")
    return payload

def _crossref_trending(days: int = 7):
    """
    Fetch trending research domains from Crossref (last `days` days).
    Aggregates the 'subject' field across works to find top categories.
    """
    try:
        end = datetime.date.today()
        start = end - datetime.timedelta(days=days)
        url = "https://api.crossref.org/works"
        params = {
            "filter": f"from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}",
            "sort": "published",
            "order": "desc",
            "rows": 200,
            "select": "DOI,subject"
        }
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("message", {}).get("items", [])

        counts = defaultdict(int)
        total = 0
        for it in items:
            subjects = it.get("subject") or []
            for s in subjects:
                counts[s] += 1
                total += 1

        if total == 0:
            raise RuntimeError("empty crossref response")

        top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:8]
        domains = []
        for i, (label, count) in enumerate(top):
            percent = round((count / total) * 100, 1)
            domains.append({"label": label, "percent": percent, "rank": i + 1})

        return {"domains": domains, "total": total, "source": "crossref"}
    except Exception as e:
        logger.error(f"[trends/global] failed: {e}")
        fallback = [
            {"label": "Artificial Intelligence", "percent": 26.0, "rank": 1},
            {"label": "Machine Learning", "percent": 24.5, "rank": 2},
            {"label": "Computer Vision", "percent": 18.5, "rank": 3},
            {"label": "Natural Language Processing", "percent": 17.0, "rank": 4},
            {"label": "Robotics", "percent": 14.0, "rank": 5},
        ]
        return {"domains": fallback, "total": 0, "source": "fallback"}

@app.get("/api/trends/domains/online")
def domain_trends_online():
    return global_trends_cache

@app.get("/api/trends/global")
def domain_trends_global():
    return global_trends_cache

# ===== MIDDLEWARE: REQUEST ID + STRUCTURED ERRORS =====
class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = secrets.token_hex(8)
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(RequestContextMiddleware)

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
    req_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{req_id}] Unhandled error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "An internal server error occurred.",
            "status_code": 500,
            "request_id": req_id,
            "timestamp": datetime.datetime.utcnow().isoformat()
        },
    )

app.mount("/static", StaticFiles(directory="static"), name="static")

# ===== CORS CONFIG =====
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173, https://your-frontend.onrender.com").split(",")
origins = [o.strip() for o in raw_origins if o.strip()]
allow_credentials = True
# If '*' is present, FastAPI requires the literal list to be ['*'] and credentials must be disabled
if "*" in origins:
    origins = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
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

# Warm up vector store in the background so first user doesn’t pay the cost
def warmup_vector_store():
    try:
        vector_store._ensure_loaded()
        logger.info("Vector store warmup complete")
    except Exception as e:
        logger.warning(f"Vector store warmup skipped: {e}")

import threading
threading.Thread(target=warmup_vector_store, daemon=True).start()

# ===== GLOBAL TREND CACHE (Crossref) =====
global_trends_cache = {"domains": [], "total": 0, "source": "uninitialized", "last_success": None}

def fetch_crossref_trends():
    global global_trends_cache
    try:
        data = _crossref_trending()
        data["last_success"] = datetime.datetime.utcnow().isoformat() + "Z"
        global_trends_cache = data
        logger.info(f"[trends cache] refreshed source={data.get('source')} items={len(data.get('domains', []))}")
    except Exception as e:
        logger.warning(f"[trends cache] refresh failed: {e}")

def schedule_trends_refresh(interval_hours: int = 6):
    def loop():
        while True:
            fetch_crossref_trends()
            time.sleep(interval_hours * 3600)
    threading.Thread(target=loop, daemon=True).start()

fetch_crossref_trends()
schedule_trends_refresh(6)

# ===== EMAIL CONFIG =====
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://beeresearch-frontend.onrender.com")

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

class EmailPaperRequest(BaseModel):
    paper_id: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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

def send_reset_email(email: str, token: str):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM):
        logger.warning("SMTP not fully configured; skipping reset email send")
        return True
    try:
        context = ssl.create_default_context()
        reset_link = f"{FRONTEND_URL}/reset-password?code={token}"
        body = f"Use this code to reset your password:\n\n{token}\n\nOr click: {reset_link}\n\nThis code expires in 30 minutes."
        msg = f"Subject: Password Reset\nFrom: {SMTP_FROM}\nTo: {email}\n\n{body}"
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, [email], msg.encode("utf-8"))
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        return False

def send_email(to_email: str, subject: str, body: str):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM):
        logger.warning("SMTP not fully configured; skipping email send")
        return True
    try:
        context = ssl.create_default_context()
        msg = f"Subject: {subject}\nFrom: {SMTP_FROM}\nTo: {to_email}\n\n{body}"
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, [to_email], msg.encode("utf-8"))
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

# ===== AUTH ENDPOINTS =====

@app.post("/api/auth/google")
def google_auth(request: GoogleAuthRequest, db: Session = Depends(database.get_db)):
    try:
        # Verify the ID token with Google
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not CLIENT_ID:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured on server")
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
        refresh_token = auth.create_refresh_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": refresh_token,
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
    refresh_token = auth.create_refresh_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
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
    refresh_token = auth.create_refresh_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: database.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@app.post("/api/auth/refresh")
def refresh_token(token: str = Form(...)):
    payload = auth.decode_refresh_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = auth.create_access_token(data={"sub": user_id})
    new_refresh = auth.create_refresh_token(data={"sub": user_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh
    }

@app.post("/api/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(database.User).filter(database.User.email == request.email).first()
    if not user:
        # avoid user enumeration
        return {"message": "If that email exists, a reset code was created."}
    # rate limit per email
    now = datetime.datetime.utcnow()
    window_start = now - datetime.timedelta(minutes=FORGOT_WINDOW_MINUTES)
    forgot_tracker[user.email] = [t for t in forgot_tracker[user.email] if t > window_start]
    if len(forgot_tracker[user.email]) >= FORGOT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many reset requests. Try again later.")
    forgot_tracker[user.email].append(now)
    # create hashed token stored in DB for persistence
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)

    try:
        # Ensure table exists even on older DB files
        with database.engine.connect() as conn:
            conn.execute(text(
                """
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    token_hash VARCHAR(255) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            ))

        reset_entry = database.PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(reset_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to persist reset token: {e}")
        raise HTTPException(status_code=500, detail="Unable to create reset token")

    send_reset_email(user.email, raw_token)
    # do not leak delivery status to prevent enumeration; always respond success
    return {"message": "If that email exists, a reset code was sent."}

@app.post("/api/auth/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(database.get_db)):
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    reset_entry = db.query(database.PasswordResetToken).filter(
        database.PasswordResetToken.token_hash == token_hash
    ).first()
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if reset_entry.used is not None or reset_entry.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(database.User).filter(database.User.id == reset_entry.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = auth.get_password_hash(request.new_password)
    reset_entry.used = datetime.datetime.utcnow()
    db.commit()
    return {"message": "Password updated successfully"}

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
    sessions = (
        db.query(database.ResearchSession)
        .filter(database.ResearchSession.user_id == current_user.id)
        .order_by(database.ResearchSession.last_accessed.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "session_name": s.session_name,
            "last_accessed": s.last_accessed.isoformat() if s.last_accessed else None,
        }
        for s in sessions
    ]

# ===== PAPER DISCOVERY ENDPOINTS =====

@app.post("/api/papers/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    try:
        if file.spool_max_size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 10MB.")
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

def paginate_total(query):
    return query.count()

@app.get("/api/papers/search")
def search_papers(
    q: str,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(database.get_db)
):
    try:
        page = max(page, 1)
        page_size = max(1, min(page_size, 50))
        offset = (page - 1) * page_size

        # 1. Search local DB first
        base_query = db.query(database.Paper).filter(
            (database.Paper.title.ilike(f"%{q}%")) | 
            (database.Paper.abstract.ilike(f"%{q}%"))
        )
        total = paginate_total(base_query)
        local_papers = base_query.order_by(database.Paper.publish_date.desc()).limit(page_size).offset(offset).all()
        
        # 2. If results are few, fetch from ArXiv to supplement
        if len(local_papers) < page_size:
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
            base_query = db.query(database.Paper).filter(
                (database.Paper.title.ilike(f"%{q}%")) | 
                (database.Paper.abstract.ilike(f"%{q}%"))
            )
            total = paginate_total(base_query)
            local_papers = base_query.order_by(database.Paper.publish_date.desc()).limit(page_size).offset(offset).all()

        return {
            "items": local_papers,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/papers/recent")
def get_recent_papers(page: int = 1, page_size: int = 10, db: Session = Depends(database.get_db)):
    try:
        page = max(page, 1)
        page_size = max(1, min(page_size, 50))
        offset = (page - 1) * page_size
        base_query = db.query(database.Paper)
        total = paginate_total(base_query)
        papers = base_query.order_by(database.Paper.publish_date.desc()).limit(page_size).offset(offset).all()
        return {
            "items": papers,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        if not q and not paper_id:
            raise HTTPException(status_code=400, detail="Query (q) or paper_id must be provided.")
        if paper_id:
            # First fetch the paper to get its content for comparison
            paper = vector_store.get_by_id(paper_id)
            if not paper:
                # If not in vector store, try fetching from ArXiv
                paper = get_paper_by_id(paper_id)

            if not paper:
                raise HTTPException(status_code=404, detail="Paper not found.")

            query = f"Title: {paper['title']}\nAbstract: {paper['summary']}"
            local_results = vector_store.search(query, k=5)
            arxiv_results = retriever.run(paper['title'])[:3]
            combined = []
            seen = set()
            for p in local_results + arxiv_results:
                pid = p.get("id")
                if pid in seen:
                    continue
                seen.add(pid)
                combined.append({
                    "id": pid,
                    "title": p.get("title"),
                    "summary": p.get("summary", ""),
                    "pdf_url": p.get("pdf_url", ""),
                    "authors": p.get("authors", []),
                    "category": p.get("category", "General")
                })
            return {"related_papers": combined[:10]}
        elif q:
            # For a topic query, search both local and ArXiv for a better experience
            local_results = vector_store.search(q, k=5)
            arxiv_results = retriever.run(q)[:5]

            # Combine and deduplicate by ID if possible
            combined = []
            seen = set()
            for p in local_results + arxiv_results:
                pid = p.get("id")
                if pid in seen:
                    continue
                seen.add(pid)
                combined.append({
                    "id": pid,
                    "title": p.get("title"),
                    "summary": p.get("summary", ""),
                    "pdf_url": p.get("pdf_url", ""),
                    "authors": p.get("authors", []),
                    "category": p.get("category", "General")
                })

            return {"related_papers": combined[:10]}
        else:
            raise HTTPException(status_code=400, detail="Query (q) or paper_id must be provided.")
            
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
        if not request.paper_ids or len(request.paper_ids) < 2 or len(request.paper_ids) > 3:
            raise HTTPException(status_code=400, detail="Provide 2-3 paper IDs to compare.")
            
        papers_data = []
        missing_ids = []
        for pid in request.paper_ids:
            # Check vector store first
            p = vector_store.get_by_id(pid)
            if not p:
                # Then DB
                paper_db = db.query(database.Paper).filter(
                    (database.Paper.id == pid) | (database.Paper.external_id == pid)
                ).first()
                if paper_db:
                    summary_text = paper_db.abstract or ""
                    if hasattr(paper_db, "summary_text") and paper_db.summary_text:
                        summary_text = paper_db.summary_text
                    p = {
                        "id": paper_db.external_id or paper_db.id,
                        "title": paper_db.title,
                        "summary": summary_text,
                        "pdf_url": paper_db.pdf_url or "",
                        "extracted": ""
                    }

            if p:
                papers_data.append(p)
            else:
                missing_ids.append(pid)

        if not papers_data:
            raise HTTPException(status_code=404, detail="None of the provided paper IDs were found.")
        if missing_ids and len(papers_data) < len(request.paper_ids):
            raise HTTPException(status_code=404, detail=f"Some paper IDs were not found locally: {', '.join(missing_ids)}")

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

@app.post("/api/ask")
def ask_question(request: QuestionRequest):
    try:
        # rate limit per IP
        ip = "unknown"
        try:
            ip = request.client.host  # type: ignore
        except Exception:
            ip = "unknown"
        now = time.time()
        window_start = now - ASK_WINDOW_SECONDS
        ask_tracker[ip] = [t for t in ask_tracker[ip] if t >= window_start]
        if len(ask_tracker[ip]) >= ASK_MAX_REQUESTS:
            raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
        ask_tracker[ip].append(now)

        question = request.question
        relevant_docs = vector_store.search(question, k=6)
        answer = rag_agent.answer(question, relevant_docs)
        return {"answer": answer, "sources": [{"title": d.get("title"), "id": d.get("id")} for d in relevant_docs]}

    except Exception as e:
        logger.exception(f"Ask failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to answer question")

@app.post("/api/papers/email")
def email_paper(request: EmailPaperRequest, current_user: database.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    try:
        pid = request.paper_id
        paper = db.query(database.Paper).filter(
            (database.Paper.id == pid) | (database.Paper.external_id == pid)
        ).first()

        if not paper:
            ap = get_paper_by_id(pid)
            if not ap:
                raise HTTPException(status_code=404, detail="Paper not found.")
            paper = ap  # dict fallback

        title = getattr(paper, "title", None) or paper.get("title", "Untitled")
        abstract = getattr(paper, "abstract", None) or paper.get("summary", "") or "No abstract available."
        pdf_url = getattr(paper, "pdf_url", None) or paper.get("pdf_url", "")

        # Summarize using existing summarizer if available
        summary_text = ""
        try:
            summary_res = summarizer.run({"title": title, "summary": abstract})
            summary_text = summary_res.get("summary") or summary_res.get("answer") or ""
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")

        body_lines = [
            f"Title: {title}",
            f"PDF: {pdf_url or 'N/A'}",
            "",
            "Abstract:",
            abstract,
        ]
        if summary_text:
            body_lines += ["", "Summary:", summary_text]

        body = "\n".join(body_lines)
        ok = send_email(current_user.email, f"Paper: {title}", body)
        if not ok:
            raise HTTPException(status_code=500, detail="Failed to send email")

        return {"status": "sent"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Email paper failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to email paper")
