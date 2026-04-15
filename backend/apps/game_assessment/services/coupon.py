"""
Percentage-based coupon validation and redemption helpers.

Server recomputes list price and discount on every validate/create-order call — never trust client amounts.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Literal, Optional, Tuple

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractUser

    from apps.game_assessment.models import PaymentCoupon, ReportOrder

logger = logging.getLogger(__name__)

CheckoutKind = Literal["initial", "upgrade"]


def normalize_coupon_code(raw: Optional[str]) -> str:
    return (raw or "").strip().upper()


def apply_percent_discount(list_price_inr: int, discount_percent: int) -> int:
    """Return final INR to charge (integer, >= 0)."""
    if list_price_inr <= 0:
        return 0
    d = max(0, min(100, int(discount_percent)))
    if d <= 0:
        return list_price_inr
    if d >= 100:
        return 0
    return max(0, int(round(list_price_inr * (100 - d) / 100.0)))


def price_line_inr(list_price_inr: int, discount_percent: int) -> dict:
    """Single product line: list, final, savings (for API previews)."""
    final = apply_percent_discount(list_price_inr, discount_percent)
    return {
        "list_price_inr": list_price_inr,
        "final_amount_inr": final,
        "savings_inr": max(0, list_price_inr - final),
    }


def _eligible_now(coupon: "PaymentCoupon") -> bool:
    now = timezone.now()
    if coupon.valid_from and now < coupon.valid_from:
        return False
    if coupon.valid_until and now > coupon.valid_until:
        return False
    return True


def _user_redemption_count(coupon: "PaymentCoupon", user: "AbstractUser") -> int:
    from apps.game_assessment.models import CouponRedemption

    return CouponRedemption.objects.filter(coupon=coupon, user=user).count()


def _total_redemption_count(coupon: "PaymentCoupon") -> int:
    from apps.game_assessment.models import CouponRedemption

    return CouponRedemption.objects.filter(coupon=coupon).count()


def validate_coupon_for_checkout(
    *,
    code: Optional[str],
    user: "AbstractUser",
    list_price_inr: int,
) -> Tuple[Optional["PaymentCoupon"], int, int]:
    """
    Validate coupon code for the given list price.

    Returns (coupon_or_none, final_amount_inr, savings_inr).
    Empty code → no discount.
    """
    from apps.game_assessment.models import PaymentCoupon

    normalized = normalize_coupon_code(code)
    if not normalized:
        return None, list_price_inr, 0

    try:
        coupon = PaymentCoupon.objects.get(code=normalized)
    except PaymentCoupon.DoesNotExist:
        raise ValidationError("This coupon code is not valid.")

    if not coupon.is_active:
        raise ValidationError("This coupon is no longer active.")

    if not _eligible_now(coupon):
        raise ValidationError("This coupon is not valid at this time.")

    if coupon.max_redemptions is not None:
        if _total_redemption_count(coupon) >= coupon.max_redemptions:
            raise ValidationError("This coupon has reached its usage limit.")

    if _user_redemption_count(coupon, user) >= coupon.max_redemptions_per_user:
        raise ValidationError("You have already used this coupon the maximum number of times.")

    dp = int(coupon.discount_percent)
    final = apply_percent_discount(list_price_inr, dp)
    savings = max(0, list_price_inr - final)
    return coupon, final, savings


def attach_pending_coupon_to_order(
    order: "ReportOrder",
    *,
    coupon: Optional["PaymentCoupon"],
    checkout_kind: CheckoutKind,
    list_price_inr: int,
    final_amount_inr: int,
    discount_percent: int,
) -> None:
    """Persist pending coupon fields for redemption after successful payment."""
    if not coupon:
        order.pending_coupon = None
        order.pending_checkout_kind = ""
        order.pending_list_price_inr = None
        order.pending_final_amount_inr = None
        order.pending_discount_percent = 0
        return
    order.pending_coupon = coupon
    order.pending_checkout_kind = checkout_kind
    order.pending_list_price_inr = list_price_inr
    order.pending_final_amount_inr = final_amount_inr
    order.pending_discount_percent = discount_percent


@transaction.atomic
def finalize_pending_coupon_redemption(order: "ReportOrder") -> None:
    """
    Create CouponRedemption row(s) and clear pending fields. Idempotent per (order, context).
    """
    from apps.game_assessment.models import CouponRedemption, ReportOrder

    if not order.pending_coupon_id or not order.pending_checkout_kind:
        return

    context = order.pending_checkout_kind
    if context not in ("initial", "upgrade"):
        return

    cid = order.pending_coupon_id
    CouponRedemption.objects.get_or_create(
        report_order=order,
        context=context,
        defaults={
            "coupon_id": cid,
            "user_id": order.user_id,
            "list_price_inr": order.pending_list_price_inr or 0,
            "final_amount_inr": order.pending_final_amount_inr or 0,
            "discount_percent": order.pending_discount_percent,
        },
    )

    logger.info("coupon.redemption order=%s context=%s coupon=%s", order.id, context, cid)

    ReportOrder.objects.filter(pk=order.pk).update(
        pending_coupon=None,
        pending_checkout_kind="",
        pending_list_price_inr=None,
        pending_final_amount_inr=None,
        pending_discount_percent=0,
    )
    order.pending_coupon_id = None
    order.pending_checkout_kind = ""
    order.pending_list_price_inr = None
    order.pending_final_amount_inr = None
    order.pending_discount_percent = 0


def clear_pending_coupon(order: "ReportOrder") -> None:
    """Clear pending coupon (e.g. abandoned checkout)."""
    from apps.game_assessment.models import ReportOrder

    if not order.pending_coupon_id and not order.pending_checkout_kind:
        return
    ReportOrder.objects.filter(pk=order.pk).update(
        pending_coupon=None,
        pending_checkout_kind="",
        pending_list_price_inr=None,
        pending_final_amount_inr=None,
        pending_discount_percent=0,
    )
