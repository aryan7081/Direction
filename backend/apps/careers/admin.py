from django.contrib import admin
from .models import Career, CareerCategoryWeight, StreamRecommendation


class CareerCategoryWeightInline(admin.TabularInline):
    model = CareerCategoryWeight
    extra = 1


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "stream", "order", "is_active", "managed_by_seed")
    list_filter = ("stream", "is_active", "managed_by_seed")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [CareerCategoryWeightInline]
    ordering = ("order", "name")


@admin.register(StreamRecommendation)
class StreamRecommendationAdmin(admin.ModelAdmin):
    list_display = ("attempt", "primary_stream", "secondary_stream")
