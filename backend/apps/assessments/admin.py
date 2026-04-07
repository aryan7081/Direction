from django.contrib import admin
from .models import Category, Question, AnswerOption, AssessmentAttempt, UserResponse, AssessmentResult


class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 0
    fields = ("order", "api_id", "text", "score", "category_weights")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("code", "order", "category", "premium_only", "is_active", "text_preview")
    list_filter = ("category", "is_active", "premium_only")
    search_fields = ("code", "text")
    inlines = [AnswerOptionInline]
    ordering = ("order",)
    fields = (
        "code",
        "category",
        "order",
        "is_active",
        "premium_only",
        "text",
        "metadata",
    )

    @admin.display(description="Text (preview)")
    def text_preview(self, obj):
        t = obj.text or ""
        return f"{t[:72]}…" if len(t) > 72 else t


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "is_complete", "created_at")
    list_filter = ("is_complete",)


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ("attempt", "total_questions_answered")
