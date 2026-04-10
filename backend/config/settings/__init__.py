"""
Settings module - loads environment-specific config.

Load .env before reading DJANGO_ENV so local `DJANGO_ENV=development` in .env applies.
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

_base_dir = Path(__file__).resolve().parent.parent.parent
try:
    from dotenv import load_dotenv

    load_dotenv(_base_dir / ".env")
except ImportError:
    pass

env = (os.environ.get("DJANGO_ENV") or "development").strip().lower()

if env == "production":
    from .production import *  # noqa: F401, F403
elif env == "development":
    from .development import *  # noqa: F401, F403
else:
    raise ImproperlyConfigured(
        f"DJANGO_ENV must be 'development' or 'production', not {env!r}."
    )
