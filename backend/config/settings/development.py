"""
Development settings.
"""
import os
from .base import *

DEBUG = True
MCQ_CATALOG_ALLOW_STATIC_FALLBACK = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
_extra_hosts = os.environ.get("DEV_ALLOWED_HOSTS", "")
if _extra_hosts.strip():
    ALLOWED_HOSTS.extend(
        h.strip() for h in _extra_hosts.split(",") if h.strip()
    )

# Allow localhost and local network IPs for mobile testing (phone accesses via Mac's IP)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://direction-iagpards9-gangadhar-yadavs-projects.vercel.app",
    "https://rochester-horn-researchers-medications.trycloudflare.com",
    "https://direction-rjc4gfxov-gangadhar-yadavs-projects.vercel.app",
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://192\.168\.\d+\.\d+:\d+$",
    r"^http://10\.\d+\.\d+\.\d+:\d+$",
    r"^http://172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$",
    r"^https://[a-z0-9-]+\.trycloudflare\.com$",
]

# PostgreSQL only (aligns with production). Defaults match local Postgres / Docker.
_db_ssl = os.environ.get("DB_SSL", "").lower() in ("1", "true", "yes")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "career_discovery"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "OPTIONS": {"sslmode": "require"} if _db_ssl else {},
    }
}
