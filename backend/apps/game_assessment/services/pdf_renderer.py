"""
Renders the career report as an A4 PDF using WeasyPrint.
Falls back gracefully if WeasyPrint is not installed.

Context mirrors the web CareerReportPage (hero → stream → profile → matches → growth).
"""
from __future__ import annotations

import base64
import os
from typing import Any, Dict, List, Tuple

from django.template.loader import render_to_string

# Match frontend TraitRadarChart.tsx
_TRAIT_ICON_MAP = {
    "brain": "🧠",
    "calculator": "🔢",
    "lightbulb": "💡",
    "message-circle": "💬",
    "users": "👥",
    "trophy": "🏆",
    "zap": "⚡",
    "calendar": "📅",
}
_TRAIT_SHORT_LABELS = {
    "Analytical Reasoning": "Analytical",
    "Quantitative Comfort": "Numbers",
    "Creativity & Innovation": "Creativity",
    "Verbal & Communication": "Communication",
    "Social Orientation": "Social",
    "Leadership Drive": "Leadership",
    "Risk Appetite": "Risk-Taking",
    "Structure & Discipline": "Discipline",
}


def _trait_tile_label(trait: dict) -> str:
    label = trait.get("label") or ""
    return _TRAIT_SHORT_LABELS.get(label, label)


def _trait_tile_emoji(trait: dict) -> str:
    return _TRAIT_ICON_MAP.get(trait.get("icon") or "", "●")


def _trait_level(score: float) -> Tuple[str, str, str]:
    if score >= 8:
        return "Excellent", "#15803d", "#f0fdf4"
    if score >= 6:
        return "Strong", "#1d4ed8", "#eff6ff"
    if score >= 4:
        return "Developing", "#d97706", "#fffbeb"
    return "Growing", "#dc2626", "#fef2f2"


def _trait_bar_color(score: float) -> str:
    if score >= 8:
        return "#16a34a"
    if score >= 6:
        return "#3b82f6"
    if score >= 4:
        return "#f59e0b"
    return "#ef4444"


def _trait_chips_for_pdf(traits: List[dict]) -> Tuple[List[dict], List[dict]]:
    sorted_t = sorted(traits, key=lambda t: -float(t.get("score") or 0))
    strongest = sorted_t[:3]
    developing = [t for t in sorted_t if float(t.get("score") or 0) < 6][:2]
    out_s = [
        {"emoji": _trait_tile_emoji(t), "label": _trait_tile_label(t)}
        for t in strongest
    ]
    out_d = [
        {"emoji": _trait_tile_emoji(t), "label": _trait_tile_label(t)}
        for t in developing
    ]
    return out_s, out_d


def _trait_tiles_enriched(traits: List[dict]) -> List[dict]:
    rows = []
    for t in traits:
        score = float(t.get("score") or 0)
        mx = float(t.get("max") or 10)
        pct = int(round((score / mx) * 100)) if mx else 0
        lvl, lc, bg = _trait_level(score)
        rows.append({
            **t,
            "short_label": _trait_tile_label(t),
            "emoji": _trait_tile_emoji(t),
            "bar_width_pct": pct,
            "bar_color": _trait_bar_color(score),
            "level_label": lvl,
            "level_color": lc,
            "level_bg": bg,
        })
    return rows


def _stream_theme(stream: str) -> Dict[str, str]:
    """Match frontend StreamSection STREAM_THEME."""
    s = (stream or "").strip()
    themes = {
        "Science": {"icon": "🔬", "header_bg": "#eff6ff", "accent": "#1d4ed8", "border": "#bfdbfe"},
        "Commerce": {"icon": "📈", "header_bg": "#fefce8", "accent": "#a16207", "border": "#fde68a"},
        "Arts": {"icon": "🎨", "header_bg": "#fdf2f8", "accent": "#be185d", "border": "#fbcfe8"},
        "Humanities": {"icon": "📚", "header_bg": "#fdf2f8", "accent": "#be185d", "border": "#fbcfe8"},
        "General": {"icon": "🎓", "header_bg": "#f3f4f6", "accent": "#374151", "border": "#d1d5db"},
    }
    return themes.get(s, themes["General"])


def _hero_confidence_style(confidence: str) -> Dict[str, str]:
    """Match frontend HeroSection BADGE_COLORS."""
    c = (confidence or "").strip()
    if c == "High":
        return {"bg": "#f0fdf4", "text": "#16a34a", "border": "#bbf7d0"}
    if c == "Moderate":
        return {"bg": "#eff6ff", "text": "#2563eb", "border": "#bfdbfe"}
    return {"bg": "#fffbeb", "text": "#d97706", "border": "#fde68a"}


def _generate_svg_bar_chart(careers: list) -> str:
    """Generate an inline SVG horizontal bar chart comparing career matches."""
    if not careers:
        return ""

    bar_h = 36
    gap = 12
    label_w = 140
    chart_w = 400
    total_w = label_w + chart_w + 60
    total_h = len(careers) * (bar_h + gap) + 20

    bars = []
    for i, c in enumerate(careers):
        y = i * (bar_h + gap) + 10
        pct = c.get("score_percent", 0)
        bar_w = (pct / 100) * chart_w

        colors = ["#16a34a", "#3b82f6", "#f59e0b"]
        color = colors[i] if i < len(colors) else "#6b7280"

        bars.append(
            f'<text x="{label_w - 8}" y="{y + bar_h / 2 + 1}" text-anchor="end" '
            f'dominant-baseline="central" font-size="12" fill="#374151" font-weight="600">'
            f'#{c.get("rank", i + 1)} {c["career_name"]}</text>'
            f'<rect x="{label_w}" y="{y}" width="{bar_w:.1f}" height="{bar_h}" '
            f'rx="4" fill="{color}" opacity="0.85"/>'
            f'<text x="{label_w + bar_w + 8}" y="{y + bar_h / 2 + 1}" '
            f'dominant-baseline="central" font-size="12" fill="#374151" font-weight="600">'
            f'{pct}%</text>'
        )

    return (
        f'<svg viewBox="0 0 {total_w} {total_h}" xmlns="http://www.w3.org/2000/svg" '
        f'width="{total_w}" height="{total_h}">{"".join(bars)}</svg>'
    )


def _get_logo_data_uri() -> str:
    """Read the logo file and return a base64 data URI for embedding in HTML."""
    logo_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        "..", "frontend", "public", "logo.png",
    )
    try:
        with open(logo_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        return f"data:image/png;base64,{b64}"
    except FileNotFoundError:
        return ""


def _pdf_context(report: dict) -> Dict[str, Any]:
    traits = report.get("traits") or []
    trait_strongest, trait_developing = _trait_chips_for_pdf(traits)
    stream = (report.get("stream_recommendation") or {}).get("stream") or ""
    hero = report.get("hero") or {}
    return {
        "report": report,
        "bar_chart_svg": _generate_svg_bar_chart(report.get("careers") or []),
        "logo_uri": _get_logo_data_uri(),
        "stream_theme": _stream_theme(stream),
        "hero_badge_style": _hero_confidence_style(hero.get("confidence") or ""),
        "trait_strongest": trait_strongest,
        "trait_developing": trait_developing,
        "trait_tiles": _trait_tiles_enriched(traits),
    }


def render_report_pdf(report: dict) -> bytes:
    """Render the report dict to a PDF byte string."""
    from weasyprint import HTML

    ctx = _pdf_context(report)
    html_string = render_to_string("game_assessment/report_pdf.html", ctx)
    return HTML(string=html_string).write_pdf()
