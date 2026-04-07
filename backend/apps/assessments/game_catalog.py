"""
DB-backed MCQ catalog for the game assessment.

The canonical runtime source is `Question` + `AnswerOption` rows (editable in admin).
`psychometric_items.ALL_MCQ_ITEMS` is the static seed source only.
"""

from __future__ import annotations

from typing import Any, Dict, List

from django.conf import settings

from apps.assessments.models import Question

_mcq_catalog_cache: List[Dict[str, Any]] | None = None


def invalidate_mcq_catalog_cache() -> None:
    global _mcq_catalog_cache
    _mcq_catalog_cache = None
    try:
        from apps.game_assessment.services.psychometric_scoring import (
            invalidate_option_profile_cache,
        )

        invalidate_option_profile_cache()
    except Exception:
        pass


def _coerce_weights(raw: Any) -> Dict[str, int]:
    if not isinstance(raw, dict):
        return {}
    out: Dict[str, int] = {}
    for k, v in raw.items():
        if isinstance(v, bool):
            out[str(k)] = int(v)
        elif isinstance(v, (int, float)):
            out[str(k)] = int(v)
    return out


def load_mcq_items_from_db() -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    qs = (
        Question.objects.filter(is_active=True)
        .select_related("category")
        .prefetch_related("answer_options")
        .order_by("order")
    )
    for q in qs:
        code = (q.code or (q.metadata or {}).get("code") or "").strip()
        if not code:
            continue
        opts: List[tuple] = []
        option_api_ids: List[str] = []
        answer_opts = sorted(q.answer_options.all(), key=lambda x: x.order)
        letters = ("a", "b", "c", "d")
        for i, ao in enumerate(answer_opts):
            cw = _coerce_weights(ao.category_weights)
            opts.append((ao.text, cw))
            if ao.api_id:
                option_api_ids.append(ao.api_id)
            else:
                option_api_ids.append(f"{code.lower()}_{letters[i] if i < len(letters) else i}")
        meta = dict(q.metadata or {})
        meta.setdefault("code", code)
        row: Dict[str, Any] = {
            "code": code,
            "section_category_slug": q.category.slug,
            "text": q.text,
            "metadata": meta,
            "options": opts,
            "option_api_ids": option_api_ids,
        }
        if q.premium_only:
            row["premium_only"] = True
        out.append(row)
    return out


def get_mcq_catalog() -> List[Dict[str, Any]]:
    """
    Ordered list of item dicts in the same shape as `psychometric_items` rows.
    Cached until a Question/AnswerOption save invalidates it.
    """
    global _mcq_catalog_cache
    if _mcq_catalog_cache is not None:
        return _mcq_catalog_cache

    loaded = load_mcq_items_from_db()
    if not loaded and getattr(
        settings, "MCQ_CATALOG_ALLOW_STATIC_FALLBACK", False
    ):
        from apps.assessments.content.psychometric_items import ALL_MCQ_ITEMS

        _mcq_catalog_cache = list(ALL_MCQ_ITEMS)
        return _mcq_catalog_cache

    _mcq_catalog_cache = loaded
    return _mcq_catalog_cache
