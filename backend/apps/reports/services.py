"""
PDF report generation service.
"""
import hashlib
import io
import os
from typing import Optional

from django.conf import settings

# Fix reportlab + Python 3.8 + OpenSSL: usedforsecurity kwarg not supported
_original_md5 = hashlib.md5


def _safe_md5(*args, **kwargs):
    try:
        return _original_md5(*args, **kwargs)
    except TypeError:
        kwargs.pop("usedforsecurity", None)
        return _original_md5(*args, **kwargs)


hashlib.md5 = _safe_md5


class PDFReportService:
    """Generate career assessment PDF reports."""

    def __init__(self, attempt):
        self.attempt = attempt

    def generate(self) -> Optional[bytes]:
        """Generate PDF bytes. Uses reportlab if available, else placeholder."""
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import (
                SimpleDocTemplate,
                Paragraph,
                Spacer,
                Table,
                TableStyle,
                PageBreak,
                Image,
            )
        except ImportError:
            return self._generate_placeholder()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            spaceAfter=30,
        )

        story = []

        user = self.attempt.user
        logo_path = str(settings.BASE_DIR / "frontend" / "public" / "logo.png")
        if os.path.isfile(logo_path):
            story.append(Image(logo_path, width=48, height=48))
            story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph("Outcave Report", title_style))
        story.append(Paragraph(f"Student: {user.email}", styles["Normal"]))
        story.append(Spacer(1, 0.5 * inch))

        result = getattr(self.attempt, "result", None)
        if result:
            story.append(Paragraph("Category Scores", styles["Heading2"]))
            data = [["Category ID", "Score"]]
            for k, v in result.category_scores.items():
                data.append([k, f"{float(v) * 100:.1f}%"])
            t = Table(data)
            t.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            story.append(t)
            story.append(Spacer(1, 0.5 * inch))

        stream_rec = getattr(self.attempt, "stream_recommendation", None)
        if stream_rec:
            story.append(Paragraph("Stream Recommendation", styles["Heading2"]))
            story.append(
                Paragraph(
                    f"Primary: {stream_rec.primary_stream}",
                    styles["Normal"],
                )
            )
            story.append(Spacer(1, 0.2 * inch))

        from apps.recommendations.services import get_recommendation_engine

        engine = get_recommendation_engine()
        recs = engine.get_recommendations(self.attempt, top_n=5)
        if recs:
            story.append(Paragraph("Top Career Matches", styles["Heading2"]))
            data = [["Rank", "Career", "Stream", "Compatibility"]]
            for i, r in enumerate(recs, 1):
                data.append(
                    [
                        str(i),
                        r["career_name"],
                        r["stream"],
                        f"{r['compatibility_percent']}%",
                    ]
                )
            t = Table(data)
            t.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            story.append(t)

        doc.build(story)
        return buffer.getvalue()

    def _generate_placeholder(self) -> bytes:
        """Minimal PDF when reportlab not installed."""
        return b"%PDF-1.4 placeholder - install reportlab for full reports\n"
