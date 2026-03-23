import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# ✅ Google Auth imports
from google.oauth2 import id_token
from google.auth.transport import requests

load_dotenv()

# ==============================
# 🔐 JWT CONFIG
# ==============================
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# ==============================
# 🔐 GOOGLE CONFIG
# ==============================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ==============================
# 🔐 PASSWORD HASHING
# ==============================
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ==============================
# 🔐 JWT FUNCTIONS
# ==============================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Ensure sub is string
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ==============================
# 🔐 GOOGLE TOKEN VERIFICATION
# ==============================
def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

    except Exception as e:
        print("❌ Invalid Google token:", e)
        return None


# ==============================
# 🔐 GOOGLE LOGIN LOGIC
# ==============================
def google_login(token: str):
    user_data = verify_google_token(token)

    if not user_data:
        raise Exception("Invalid Google token")

    # ==============================
    # ⚠️ REPLACE THIS WITH YOUR DB
    # ==============================

    # Dummy in-memory user (replace with DB)
    user = {
        "id": user_data["email"],
        "email": user_data["email"],
        "name": user_data["name"]
    }

    # ==============================
    # 🔐 CREATE JWT
    # ==============================
    access_token = create_access_token(
        data={
            "sub": user["id"],
            "email": user["email"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
