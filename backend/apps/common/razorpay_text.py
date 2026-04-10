"""
Razorpay Standard Checkout calls `standard_checkout/preferences` on Razorpay's servers.
They have documented 500 responses when checkout-related strings contain emoji or certain
Unicode (merchant sees failure as soon as the modal loads).

See: https://stackoverflow.com/questions/77397417/ (Razorpay API + emoji → 500)
"""

from __future__ import annotations

import re
from typing import Optional

_EMOJI_AND_PICTO = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # misc symbols and pictographs
    "\U0001F680-\U0001F6FF"  # transport and map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA70-\U0001FAFF"
    "]+",
    flags=re.UNICODE,
)


def razorpay_safe_customer_name(value: Optional[str], *, max_length: int = 200) -> str:
    """Strip emoji / control chars for Checkout prefill.name (keeps Indic/Latin letters)."""
    if not value or not str(value).strip():
        return "Customer"
    s = _EMOJI_AND_PICTO.sub("", str(value))
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    s = " ".join(s.split()).strip()
    return (s[:max_length] if s else "Customer")


def razorpay_safe_note_value(value: Optional[str], *, max_length: int = 255) -> str:
    """Sanitize order `notes` values passed to Razorpay Orders API."""
    if value is None:
        return ""
    s = _EMOJI_AND_PICTO.sub("", str(value))
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    return s.strip()[:max_length]


def razorpay_safe_email(value: Optional[str]) -> str:
    """Strip control chars from prefill.email (avoid odd 500s on preferences)."""
    if not value:
        return ""
    s = re.sub(r"[\x00-\x1f]", "", str(value)).strip()
    return s[:254]
