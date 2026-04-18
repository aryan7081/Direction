"""
Aggregate metrics for the analytics dashboard (UTC date boundaries).
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Tuple

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.common.models import ApiErrorLog, VisitorLog
from apps.game_assessment.models import (
    CareerCounselingRequest,
    CareerMatchScore,
    CouponRedemption,
    GameSession,
    ReportOrder,
)
from apps.assessments.models import AssessmentAttempt

User = get_user_model()


def _utc_day_start(d: date) -> datetime:
    return timezone.make_aware(datetime.combine(d, datetime.min.time()))


def _utc_day_end(d: date) -> datetime:
    return timezone.make_aware(datetime.combine(d, datetime.max.time()))


def parse_range(request) -> Tuple[datetime, datetime, date, date]:
    """
    Query params: from=YYYY-MM-DD, to=YYYY-MM-DD (inclusive).
    Default: last 30 calendar days including today.
    """
    today = timezone.now().date()
    default_from = today - timedelta(days=29)

    raw_from = request.query_params.get("from")
    raw_to = request.query_params.get("to")
    try:
        d_from = date.fromisoformat(raw_from) if raw_from else default_from
    except ValueError:
        d_from = default_from
    try:
        d_to = date.fromisoformat(raw_to) if raw_to else today
    except ValueError:
        d_to = today
    if d_from > d_to:
        d_from, d_to = d_to, d_from

    start = _utc_day_start(d_from)
    end = _utc_day_end(d_to)
    return start, end, d_from, d_to


def _date_keys(d_from: date, d_to: date) -> List[date]:
    out = []
    cur = d_from
    while cur <= d_to:
        out.append(cur)
        cur += timedelta(days=1)
    return out


def _series_from_trunc(
    qs, date_field: str, start: datetime, end: datetime, d_from: date, d_to: date
) -> List[Dict[str, Any]]:
    rows = (
        qs.filter(**{f"{date_field}__gte": start, f"{date_field}__lte": end})
        .annotate(day=TruncDate(date_field))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )
    by_day = {r["day"]: r["count"] for r in rows if r["day"]}
    keys = _date_keys(d_from, d_to)
    return [{"date": str(k), "count": int(by_day.get(k, 0))} for k in keys]


def _revenue_by_day(start: datetime, end: datetime, d_from: date, d_to: date) -> List[Dict[str, Any]]:
    qs = ReportOrder.objects.filter(status="paid", paid_at__gte=start, paid_at__lte=end)
    rows = (
        qs.annotate(day=TruncDate("paid_at"))
        .values("day")
        .annotate(revenue_inr=Sum("amount"))
        .order_by("day")
    )
    by_day = {r["day"]: int(r["revenue_inr"] or 0) for r in rows if r["day"]}
    keys = _date_keys(d_from, d_to)
    return [{"date": str(k), "revenue_inr": by_day.get(k, 0)} for k in keys]


def build_dashboard_payload(start: datetime, end: datetime, d_from: date, d_to: date) -> Dict[str, Any]:
    """Full dashboard dataset for [start, end]."""
    span_days = (d_to - d_from).days + 1
    prev_end = d_from - timedelta(days=1)
    prev_from = prev_end - timedelta(days=span_days - 1)
    p_start = _utc_day_start(prev_from)
    p_end = _utc_day_end(prev_end)

    # ── KPIs (current range) ─────────────────────────────────────
    visitor_hits = VisitorLog.objects.filter(created_at__gte=start, created_at__lte=end).count()
    unique_ips = (
        VisitorLog.objects.filter(created_at__gte=start, created_at__lte=end)
        .values("ip_address")
        .distinct()
        .count()
    )
    new_users = User.objects.filter(date_joined__gte=start, date_joined__lte=end).count()
    sessions_started = GameSession.objects.filter(started_at__gte=start, started_at__lte=end).count()
    sessions_completed = GameSession.objects.filter(
        is_complete=True, completed_at__gte=start, completed_at__lte=end
    ).count()
    sessions_with_user = GameSession.objects.filter(
        started_at__gte=start, started_at__lte=end, user__isnull=False
    ).count()

    paid_orders = ReportOrder.objects.filter(
        status="paid", paid_at__gte=start, paid_at__lte=end
    )
    orders_paid_count = paid_orders.count()
    revenue_inr = int(paid_orders.aggregate(s=Sum("amount"))["s"] or 0)

    counseling_total = CareerCounselingRequest.objects.filter(
        created_at__gte=start, created_at__lte=end
    ).count()

    api_errors = ApiErrorLog.objects.filter(created_at__gte=start, created_at__lte=end).count()

    legacy_attempts = AssessmentAttempt.objects.filter(
        is_complete=True,
        completed_at__gte=start,
        completed_at__lte=end,
    ).count()

    coupon_rows = CouponRedemption.objects.filter(created_at__gte=start, created_at__lte=end).aggregate(
        n=Count("id"),
        savings=Sum("list_price_inr"),
        paid=Sum("final_amount_inr"),
    )
    coupon_redemptions = int(coupon_rows["n"] or 0)
    coupon_list_sum = int(coupon_rows["savings"] or 0)
    coupon_paid_sum = int(coupon_rows["paid"] or 0)
    coupon_discount_inr = max(0, coupon_list_sum - coupon_paid_sum)

    conv_rate = (sessions_completed / sessions_started * 100) if sessions_started else 0.0
    pay_rate = (orders_paid_count / sessions_completed * 100) if sessions_completed else 0.0

    # ── Previous period (for deltas) ───────────────────────────────
    pv_hits = VisitorLog.objects.filter(created_at__gte=p_start, created_at__lte=p_end).count()
    pv_users = User.objects.filter(date_joined__gte=p_start, date_joined__lte=p_end).count()
    pv_started = GameSession.objects.filter(started_at__gte=p_start, started_at__lte=p_end).count()
    pv_done = GameSession.objects.filter(
        is_complete=True, completed_at__gte=p_start, completed_at__lte=p_end
    ).count()
    pv_paid = ReportOrder.objects.filter(status="paid", paid_at__gte=p_start, paid_at__lte=p_end)
    pv_orders = pv_paid.count()
    pv_rev = int(pv_paid.aggregate(s=Sum("amount"))["s"] or 0)

    def delta(cur: float, old: float) -> Dict[str, float]:
        pct = ((cur - old) / old * 100) if old else (100.0 if cur else 0.0)
        return {"current": cur, "previous": old, "change_pct": round(pct, 1)}

    # ── Time series ──────────────────────────────────────────────
    visitors_by_day = _series_from_trunc(VisitorLog.objects.all(), "created_at", start, end, d_from, d_to)
    users_by_day = _series_from_trunc(User.objects.all(), "date_joined", start, end, d_from, d_to)
    completions_by_day = _series_from_trunc(
        GameSession.objects.filter(is_complete=True, completed_at__isnull=False),
        "completed_at",
        start,
        end,
        d_from,
        d_to,
    )
    revenue_by_day = _revenue_by_day(start, end, d_from, d_to)
    errors_by_day = _series_from_trunc(ApiErrorLog.objects.all(), "created_at", start, end, d_from, d_to)

    # ── Payments breakdown ───────────────────────────────────────
    pay_by_product = (
        paid_orders.values("product_type")
        .annotate(count=Count("id"), revenue=Sum("amount"))
        .order_by()
    )
    payments_breakdown = {
        row["product_type"]: {"count": row["count"], "revenue_inr": int(row["revenue"] or 0)}
        for row in pay_by_product
    }

    # ── Counseling status ────────────────────────────────────────
    counsel_status = (
        CareerCounselingRequest.objects.filter(created_at__gte=start, created_at__lte=end)
        .values("status")
        .annotate(n=Count("id"))
    )
    counseling_by_status = {row["status"]: row["n"] for row in counsel_status}

    # ── Top careers (#1 match for completed sessions in range) ───
    top_careers = (
        CareerMatchScore.objects.filter(
            rank=1,
            session__is_complete=True,
            session__completed_at__gte=start,
            session__completed_at__lte=end,
        )
        .values("career__name", "career__slug")
        .annotate(n=Count("id"))
        .order_by("-n")[:12]
    )
    top_careers_list = [
        {"name": row["career__name"], "slug": row["career__slug"], "count": row["n"]}
        for row in top_careers
    ]

    # ── Assessment tier mix (completed in range) ─────────────────
    tier_mix = (
        GameSession.objects.filter(
            is_complete=True, completed_at__gte=start, completed_at__lte=end
        )
        .values("assessment_tier")
        .annotate(n=Count("id"))
    )
    tier_breakdown = {row["assessment_tier"]: row["n"] for row in tier_mix}

    return {
        "range": {
            "from": str(d_from),
            "to": str(d_to),
            "span_days": span_days,
            "timezone": "UTC",
        },
        "kpis": {
            "visitor_hits": visitor_hits,
            "unique_visitor_ips": unique_ips,
            "new_user_registrations": new_users,
            "game_sessions_started": sessions_started,
            "game_sessions_completed": sessions_completed,
            "game_sessions_with_account": sessions_with_user,
            "completion_rate_pct": round(conv_rate, 1),
            "paid_orders": orders_paid_count,
            "revenue_inr": revenue_inr,
            "payment_conversion_vs_completed_pct": round(pay_rate, 1),
            "career_counseling_requests": counseling_total,
            "api_errors_logged": api_errors,
            "legacy_mcq_completions": legacy_attempts,
            "coupon_redemptions": coupon_redemptions,
            "coupon_discount_inr_total": coupon_discount_inr,
        },
        "deltas": {
            "visitor_hits": delta(float(visitor_hits), float(pv_hits)),
            "new_user_registrations": delta(float(new_users), float(pv_users)),
            "game_sessions_started": delta(float(sessions_started), float(pv_started)),
            "game_sessions_completed": delta(float(sessions_completed), float(pv_done)),
            "paid_orders": delta(float(orders_paid_count), float(pv_orders)),
            "revenue_inr": delta(float(revenue_inr), float(pv_rev)),
        },
        "series": {
            "visitors_by_day": visitors_by_day,
            "registrations_by_day": users_by_day,
            "assessment_completions_by_day": completions_by_day,
            "revenue_by_day": revenue_by_day,
            "api_errors_by_day": errors_by_day,
        },
        "payments": {
            "by_product": payments_breakdown,
        },
        "counseling": {
            "by_status": counseling_by_status,
        },
        "assessments": {
            "tier_breakdown_completed": tier_breakdown,
            "top_careers_rank1": top_careers_list,
        },
    }
