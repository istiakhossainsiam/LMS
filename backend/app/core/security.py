import base64
import hashlib
import hmac
import html
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from app.core.config import settings

try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    _argon2_hasher = PasswordHasher()
except ImportError:
    _argon2_hasher = None

try:
    import nh3
    _HAS_NH3 = True
except ImportError:
    _HAS_NH3 = False

ALGORITHM = "HS256"


def _get_fernet() -> Fernet:
    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)


def encrypt_secret(plain_text: str) -> str:
    """Encrypts sensitive API keys / SMTP passwords at rest using Fernet (AES-128-CBC + HMAC-SHA256)."""
    if not plain_text:
        return ""
    if plain_text.startswith("enc::"):
        return plain_text
    token = _get_fernet().encrypt(plain_text.encode("utf-8")).decode("utf-8")
    return f"enc::{token}"


def decrypt_secret(cipher_text: str) -> str:
    """Decrypts Fernet-encrypted secrets stored in the database."""
    if not cipher_text:
        return ""
    if not cipher_text.startswith("enc::"):
        return cipher_text
    try:
        raw = cipher_text[5:].encode("utf-8")
        return _get_fernet().decrypt(raw).decode("utf-8")
    except Exception:
        return ""


def hash_password(password: str) -> str:
    """Hashes passwords with Argon2id (or PBKDF2-SHA256 fallback with 600,000 iterations)."""
    if _argon2_hasher is not None:
        return f"argon2::{_argon2_hasher.hash(password)}"
    salt = secrets.token_hex(16)
    iterations = 600000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    b64_hash = base64.b64encode(dk).decode("ascii").strip()
    return f"pbkdf2_sha256${iterations}${salt}${b64_hash}"


def verify_password(plain_password: str, stored_hash: str) -> tuple[bool, bool]:
    """
    Verifies a plaintext password against either:
    1. LMS 2.0 Argon2id (`argon2::$argon2id$...`)
    2. Legacy Django LMS 1.0 `pbkdf2_sha256$<iterations>$<salt>$<hash>`
    Returns (is_valid, needs_rehash).
    """
    if not stored_hash or not plain_password:
        return False, False

    if stored_hash.startswith("argon2::") and _argon2_hasher is not None:
        raw_hash = stored_hash[8:]
        try:
            valid = _argon2_hasher.verify(raw_hash, plain_password)
            return valid, _argon2_hasher.check_needs_rehash(raw_hash)
        except VerifyMismatchError:
            return False, False
        except Exception:
            return False, False

    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            parts = stored_hash.split("$")
            if len(parts) != 4:
                return False, False
            _, iter_str, salt, b64_expected = parts
            iterations = int(iter_str)
            dk = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt.encode("utf-8"),
                iterations,
            )
            b64_actual = base64.b64encode(dk).decode("ascii").strip()
            valid = hmac.compare_digest(b64_actual, b64_expected)
            return valid, valid and (_argon2_hasher is not None)
        except Exception:
            return False, False

    return False, False


def create_access_token(
    subject: str | int,
    role: str,
    session_key: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "sid": session_key,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str | int, session_key: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "sid": session_key,
        "type": "refresh",
        "jti": secrets.token_hex(12),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_vault_download_token(
    user_id: int,
    resource_type: str,
    resource_id: int,
    file_path: str,
    expires_minutes: int = 15,
) -> str:
    """Creates a signed, short-lived token for downloading protected media files."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=expires_minutes)
    payload = {
        "sub": str(user_id),
        "rtype": resource_type,
        "rid": resource_id,
        "fpath": file_path,
        "type": "vault_download",
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def sanitize_plain_text(value: str) -> str:
    """Sanitizes plain text inputs (e.g. Q&A comments, notes, names) to prevent Stored XSS while preserving code characters like `--` or `SELECT`."""
    if not value:
        return ""
    # Strip dangerous HTML script/event tags while preserving code text
    if _HAS_NH3:
        return nh3.clean(value, tags=set())
    cleaned = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", value, flags=re.IGNORECASE | re.DOTALL)
    return html.escape(cleaned, quote=False)


def sanitize_rich_html(value: str) -> str:
    """Sanitizes rich HTML content (blog posts, legal pages, course descriptions) against XSS."""
    if not value:
        return ""
    allowed_tags = {
        "p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li",
        "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "a", "span", "hr"
    }
    if _HAS_NH3:
        return nh3.clean(
            value,
            tags=allowed_tags,
            attributes={"a": {"href", "title", "target"}, "span": {"class"}, "code": {"class"}},
            url_schemes={"http", "https", "mailto"},
        )
    # Fallback safe strip of script/iframe/object/on* attributes
    cleaned = re.sub(r"<\s*(script|iframe|object|embed|form)[^>]*>.*?<\s*/\s*\1\s*>", "", value, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r"\son\w+\s*=\s*(['\"]).*?\1", "", cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r"javascript\s*:", "", cleaned, flags=re.IGNORECASE)
    return cleaned


def validate_safe_redirect_url(next_url: Optional[str]) -> str:
    """Prevents Open Redirect phishing attacks (fixing LMS 1.0 core/views.py vulnerability)."""
    if not next_url:
        return "/dashboard"
    parsed = urlparse(next_url)
    if parsed.scheme or parsed.netloc or next_url.startswith("//") or "\\" in next_url:
        return "/dashboard"
    if not next_url.startswith("/"):
        return "/dashboard"
    return next_url
