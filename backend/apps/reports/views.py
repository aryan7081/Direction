"""
Report views - PDF generation.
"""
import logging

from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assessments.models import AssessmentAttempt
from apps.reports.models import GeneratedReport
from apps.reports.services import PDFReportService

logger = logging.getLogger(__name__)


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = AssessmentAttempt.objects.filter(
            user=request.user, id=attempt_id, is_complete=True
        ).select_related("result").first()
        if not attempt:
            return Response(
                {"error": "Completed assessment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            service = PDFReportService(attempt)
            pdf_bytes = service.generate()
        except Exception as e:
            logger.exception("PDF generation failed: %s", e)
            return Response(
                {"error": "Report generation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not pdf_bytes:
            return Response(
                {"error": "Report generation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        GeneratedReport.objects.get_or_create(
            attempt=attempt,
            defaults={"file_path": ""},
        )

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="career-report-{attempt_id}.pdf"'
        return response
