"""
Shared logic to mark a report order paid and unlock premium bundle on session.
Used by client-side verify and Razorpay webhooks (idempotent).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Literal, Tuple

from django.utils import timezone

if TYPE_CHECKING:
    from apps.game_assessment.models import ReportOrder

logger = logging.getLogger(__name__)

_PREMIUM = "premium_bundle"


def finalize_report_order_payment(
    order: "ReportOrder",
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> Tuple[Literal["already_paid", "ok"], str]:
    """
    Idempotently mark order paid and apply premium_unlocked for bundle.

    Returns (status, message) where status is already_paid or ok.
    """
    if order.status == "paid":
        return "already_paid", "Already verified."

    order.status = "paid"
    order.razorpay_payment_id = razorpay_payment_id[:100]
    order.razorpay_signature = razorpay_signature[:200]
    order.paid_at = timezone.now()
    order.save(
        update_fields=["status", "razorpay_payment_id", "razorpay_signature", "paid_at"]
    )

    sess = order.session
    if order.product_type == _PREMIUM:
        if not sess.premium_unlocked:
            sess.premium_unlocked = True
            sess.save(update_fields=["premium_unlocked"])

    src = "webhook" if razorpay_signature.startswith("webhook:") else "client"
    logger.info(
        "payment.finalized order=%s session=%s product=%s source=%s",
        order.id,
        order.session_id,
        order.product_type,
        src,
    )
    return "ok", "Payment recorded."
