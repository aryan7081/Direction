from django.contrib import admin
from .models import Category, Question, AnswerOption, AssessmentAttempt, UserResponse, AssessmentResult


class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "category", "order", "is_active")
    list_filter = ("category", "is_active")
    inlines = [AnswerOptionInline]
    ordering = ("order",)


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "is_complete", "created_at")
    list_filter = ("is_complete",)


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ("attempt", "total_questions_answered")
