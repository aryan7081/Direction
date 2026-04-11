"""
Career views.
"""
from django.db.models import Prefetch
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.careers.models import Career, CareerCategoryWeight
from apps.careers.serializers import CareerDetailSerializer, CareerListSerializer


class CareerListView(generics.ListAPIView):
    """Full catalogue for browsing (no pagination — global PAGE_SIZE would truncate)."""

    permission_classes = [IsAuthenticated]
    serializer_class = CareerListSerializer
    queryset = Career.objects.filter(is_active=True).order_by("order", "name")
    pagination_class = None


class CareerDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerDetailSerializer
    queryset = Career.objects.filter(is_active=True).prefetch_related(
        Prefetch(
            "category_weights",
            queryset=CareerCategoryWeight.objects.select_related("category"),
        )
    )
    lookup_field = "slug"
    lookup_url_kwarg = "slug"
