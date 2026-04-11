"""
Production settings (AWS, etc.).
"""
import os

from .base import *

# Required in production — no insecure fallback (overrides base.py)
SECRET_KEY = os.environ["SECRET_KEY"]

DEBUG = False
ALLOWED_HOSTS = [h.strip() for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h.strip()]

CORS_ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
# Allow Vercel preview URLs and outcave.in
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://[a-z0-9-]+\.vercel\.app$",
    r"^https://[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$",
    r"^https://(www\.)?outcave\.in$",
]

# Required when behind AWS ALB/ELB or reverse proxy (HTTPS → HTTP)
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()]
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {"sslmode": "require"} if os.environ.get("DB_SSL", "").lower() in ("1", "true", "yes") else {},
    }
}

# Set USE_HTTPS=false when backend is HTTP-only (e.g. EC2 without SSL, frontend proxies via Vercel)
_use_https = os.environ.get("USE_HTTPS", "true").lower() in ("1", "true", "yes")
SECURE_SSL_REDIRECT = _use_https
SESSION_COOKIE_SECURE = _use_https
CSRF_COOKIE_SECURE = _use_https
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Referrer policy (Django 4+)
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# HSTS — only when the app is served over HTTPS end-to-end (see USE_HTTPS)
if _use_https:
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))  # 1 year default
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get(
        "SECURE_HSTS_INCLUDE_SUBDOMAINS", "true"
    ).lower() in ("1", "true", "yes")
    # Set SECURE_HSTS_PRELOAD=true only after you submit the domain to the HSTS preload list
    SECURE_HSTS_PRELOAD = os.environ.get("SECURE_HSTS_PRELOAD", "").lower() in (
        "1",
        "true",
        "yes",
    )
else:
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False

# Optional Redis for shared rate-limit counters across Gunicorn workers / tasks.
# Without this, each worker uses its own in-memory cache (limits are per-process).
_redis_url = os.environ.get("REDIS_URL", "").strip()
if _redis_url:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": _redis_url,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "SOCKET_CONNECT_TIMEOUT": 5,
                "SOCKET_TIMEOUT": 5,
                "CONNECTION_POOL_KWARGS": {"max_connections": 50},
                # Degrade gracefully if Redis is unavailable (availability over strict limits).
                "IGNORE_EXCEPTIONS": True,
            },
            "KEY_PREFIX": "outcave",
            "TIMEOUT": int(os.environ.get("CACHE_DEFAULT_TIMEOUT", "300")),
        }
    }
