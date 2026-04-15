"""
Base settings for Outcave Platform.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-dev-key-change-in-production")

DEBUG = False
ALLOWED_HOSTS = []

# When True and the Question table is empty, load items from psychometric_items.py (dev/tests only).
MCQ_CATALOG_ALLOW_STATIC_FALLBACK = False

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    # Local apps
    "apps.common",
    "apps.users",
    "apps.assessments.apps.AssessmentsConfig",
    "apps.careers",
    "apps.recommendations",
    "apps.reports",
    "apps.game_assessment",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "apps.common.middleware.VisitorTrackingMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.User"

# Shared cache for throttling (and future cache use). Production overrides with Redis.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "outcave-api",
    }
}


def _throttle_rate(env_key: str, default: str) -> str:
    """Allow env overrides, e.g. THROTTLE_AUTH_LOGIN=15/min — empty falls back to default."""
    val = os.environ.get(env_key, "").strip()
    return val if val else default


# How many trusted reverse proxies sit in front of the app (DRF uses this for
# X-Forwarded-For). Local dev: 0. Single AWS ALB: typically 1.
DRF_NUM_PROXIES = int(os.environ.get("DRF_NUM_PROXIES", "0"))

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "NUM_PROXIES": DRF_NUM_PROXIES,
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "apps.common.throttling.ScopedRateThrottleWithLogging",
    ),
    "DEFAULT_THROTTLE_RATES": {
        # Global ceilings (per IP for anon, per user id for authenticated)
        # Generous global anon ceiling — stricter limits come from `throttle_scope` per view.
        "anon": _throttle_rate("THROTTLE_ANON", "8000/hour"),
        "user": _throttle_rate("THROTTLE_USER", "12000/hour"),
        # Auth & account abuse controls (per IP or per user per scope)
        "auth_login": _throttle_rate("THROTTLE_AUTH_LOGIN", "10/min"),
        "auth_register": _throttle_rate("THROTTLE_AUTH_REGISTER", "5/min"),
        "auth_google": _throttle_rate("THROTTLE_AUTH_GOOGLE", "30/min"),
        "auth_refresh": _throttle_rate("THROTTLE_AUTH_REFRESH", "60/min"),
        "auth_session_signup": _throttle_rate("THROTTLE_AUTH_SESSION_SIGNUP", "5/min"),
        # Game / anonymous assessment traffic
        "game_content": _throttle_rate("THROTTLE_GAME_CONTENT", "120/min"),
        "game_start": _throttle_rate("THROTTLE_GAME_START", "40/min"),
        "game_progress": _throttle_rate("THROTTLE_GAME_PROGRESS", "30/min"),
        "game_log": _throttle_rate("THROTTLE_GAME_LOG", "180/min"),
        "game_submit": _throttle_rate("THROTTLE_GAME_SUBMIT", "30/hour"),
        "game_teaser": _throttle_rate("THROTTLE_GAME_TEASER", "120/min"),
        # Reports & payments
        "report_json": _throttle_rate("THROTTLE_REPORT_JSON", "120/min"),
        "report_pdf": _throttle_rate("THROTTLE_REPORT_PDF", "30/hour"),
        "payment_create": _throttle_rate("THROTTLE_PAYMENT_CREATE", "30/min"),
        "payment_verify": _throttle_rate("THROTTLE_PAYMENT_VERIFY", "40/min"),
        "payment_webhook": _throttle_rate("THROTTLE_PAYMENT_WEBHOOK", "600/min"),
        # Legacy MCQ assessment + misc
        "assessment_submit": _throttle_rate("THROTTLE_ASSESSMENT_SUBMIT", "40/hour"),
        "assessment_read": _throttle_rate("THROTTLE_ASSESSMENT_READ", "120/min"),
        "legacy_report_pdf": _throttle_rate("THROTTLE_LEGACY_REPORT_PDF", "20/hour"),
        "recommendations_read": _throttle_rate("THROTTLE_RECOMMENDATIONS", "120/min"),
        "careers_catalog": _throttle_rate("THROTTLE_CAREERS_CATALOG", "120/min"),
        "visitor_ping": _throttle_rate("THROTTLE_VISITOR_PING", "240/min"),
    },
    "EXCEPTION_HANDLER": "apps.common.exception_handler.custom_exception_handler",
}

from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Outcave Platform API",
    "DESCRIPTION": "AI-powered career discovery for Class 9-10 students",
    "VERSION": "1.0.0",
}

CORS_ALLOW_CREDENTIALS = True

# Razorpay
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
# Dashboard → Webhooks → signing secret (HMAC of raw body). Required for /api/.../payment/webhook/.
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").strip()
from ..pricing import (
    PREMIUM_BUNDLE_PRICE_INR,
    PREMIUM_UPGRADE_FROM_REPORT_INR,
    REPORT_PRICE_INR,
)

# Google OAuth (for Sign in with Google)
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")


def _init_sentry() -> None:
    """Optional error tracking (set SENTRY_DSN in production)."""
    dsn = os.environ.get("SENTRY_DSN", "").strip()
    if not dsn:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
    except ImportError:
        import logging

        logging.getLogger(__name__).warning(
            "SENTRY_DSN is set but sentry-sdk is not installed; skip Sentry init."
        )
        return

    traces = float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0") or "0")
    env_name = os.environ.get("SENTRY_ENVIRONMENT", os.environ.get("DJANGO_ENV", "development"))
    sentry_sdk.init(
        dsn=dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=min(1.0, max(0.0, traces)),
        send_default_pii=False,
        environment=env_name,
    )


_init_sentry()
