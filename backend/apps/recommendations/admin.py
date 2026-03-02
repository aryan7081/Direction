from django.contrib import admin
from .models import CareerRecommendation

@admin.register(CareerRecommendation)
class CareerRecommendationAdmin(admin.ModelAdmin):
    list_display = ("attempt", "career_id", "compatibility_score", "rank")
