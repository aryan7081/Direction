"""
Development settings.
"""
import os
from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

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

# Use PostgreSQL if DB_HOST is set, else SQLite for quick local dev
if os.environ.get("DB_HOST") or os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "career_discovery"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": str(BASE_DIR / "db.sqlite3"),
        }
    }
