"""
Razorpay webhook signature verification and event parsing.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


def verify_webhook_signature(body: bytes, signature: str, secret: str) -> bool:
    """Razorpay: HMAC-SHA256 of raw body with webhook secret (Dashboard)."""
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def extract_payment_from_payload(payload: Dict[str, Any]) -> Optional[Tuple[str, str]]:
    """
    Return (razorpay_order_id, razorpay_payment_id) from webhook `payload` object, or None.
    """
    try:
        pay = payload.get("payment", {}).get("entity") or {}
        order_id = pay.get("order_id") or ""
        payment_id = pay.get("id") or ""
        if order_id and payment_id:
            return str(order_id), str(payment_id)
    except (TypeError, AttributeError):
        pass
    return None


def extract_failed_order_id(payload: Dict[str, Any]) -> Optional[str]:
    try:
        pay = payload.get("payment", {}).get("entity") or {}
        oid = pay.get("order_id") or ""
        return str(oid) if oid else None
    except (TypeError, AttributeError):
        return None


def parse_webhook_body(body: bytes) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        logger.warning("razorpay.webhook.invalid_json: %s", e)
        return None


def payment_event_name(data: Dict[str, Any]) -> str:
    return str(data.get("event") or "")
