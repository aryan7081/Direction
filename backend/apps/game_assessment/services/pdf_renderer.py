"""
Renders the career report as an A4 PDF using WeasyPrint.
Falls back gracefully if WeasyPrint is not installed.
"""
from __future__ import annotations

import math
from django.template.loader import render_to_string


def _generate_svg_radar(traits: list) -> str:
    """Generate an inline SVG radar chart from trait scores."""
    n = len(traits)
    if n == 0:
        return ""

    vw, vh = 460, 400
    cx, cy, r = vw // 2, vh // 2, 120
    angle_step = 2 * math.pi / n

    grid_lines = []
    for level in [0.25, 0.5, 0.75, 1.0]:
        points = []
        for i in range(n):
            angle = -math.pi / 2 + i * angle_step
            x = cx + r * level * math.cos(angle)
            y = cy + r * level * math.sin(angle)
            points.append(f"{x:.1f},{y:.1f}")
        grid_lines.append(" ".join(points))

    axis_lines = []
    label_positions = []
    for i, t in enumerate(traits):
        angle = -math.pi / 2 + i * angle_step
        x_end = cx + r * math.cos(angle)
        y_end = cy + r * math.sin(angle)
        axis_lines.append(f'<line x1="{cx}" y1="{cy}" x2="{x_end:.1f}" y2="{y_end:.1f}" stroke="#e5e7eb" stroke-width="1"/>')

        label_r = r + 24
        lx = cx + label_r * math.cos(angle)
        ly = cy + label_r * math.sin(angle)

        anchor = "middle"
        if math.cos(angle) > 0.3:
            anchor = "start"
        elif math.cos(angle) < -0.3:
            anchor = "end"

        label_positions.append(
            f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="{anchor}" '
            f'dominant-baseline="central" font-size="11" fill="#6b7280">'
            f'{t["label"]}</text>'
        )

    data_points = []
    for i, t in enumerate(traits):
        frac = t["score"] / t["max"] if t["max"] > 0 else 0
        angle = -math.pi / 2 + i * angle_step
        x = cx + r * frac * math.cos(angle)
        y = cy + r * frac * math.sin(angle)
        data_points.append(f"{x:.1f},{y:.1f}")

    svg = f'''<svg viewBox="0 0 {vw} {vh}" xmlns="http://www.w3.org/2000/svg" width="{vw}" height="{vh}">
    {''.join(f'<polygon points="{pts}" fill="none" stroke="#e5e7eb" stroke-width="1"/>' for pts in grid_lines)}
    {''.join(axis_lines)}
    <polygon points="{' '.join(data_points)}" fill="rgba(22,163,74,0.2)" stroke="#16a34a" stroke-width="2"/>
    {''.join(label_positions)}
    </svg>'''
    return svg


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


def render_report_pdf(report: dict) -> bytes:
    """Render the report dict to a PDF byte string."""
    from weasyprint import HTML

    radar_svg = _generate_svg_radar(report.get("traits", []))
    bar_svg = _generate_svg_bar_chart(report.get("careers", []))

    html_string = render_to_string(
        "game_assessment/report_pdf.html",
        {
            "report": report,
            "radar_svg": radar_svg,
            "bar_chart_svg": bar_svg,
        },
    )

    pdf = HTML(string=html_string).write_pdf()
    return pdf
