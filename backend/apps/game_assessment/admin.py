from django.contrib import admin

from .models import (
    GameSession,
    GameEventLog,
    TraitScore,
    CareerMatchScore,
    GameCareerTraitWeight,
    ReportOrder,
)


class GameEventLogInline(admin.TabularInline):
    model = GameEventLog
    extra = 0
    readonly_fields = ("game_name", "event_type", "payload", "timestamp")


class TraitScoreInline(admin.TabularInline):
    model = TraitScore
    extra = 0
    readonly_fields = ("trait_name", "raw_score", "normalized_score")


class CareerMatchScoreInline(admin.TabularInline):
    model = CareerMatchScore
    extra = 0
    readonly_fields = ("career", "score", "rank")


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "started_at", "is_complete", "completed_at")
    list_filter = ("is_complete",)
    search_fields = ("user__email",)
    inlines = [TraitScoreInline, CareerMatchScoreInline]


@admin.register(GameEventLog)
class GameEventLogAdmin(admin.ModelAdmin):
    list_display = ("session", "game_name", "event_type", "timestamp")
    list_filter = ("game_name", "event_type")


@admin.register(GameCareerTraitWeight)
class GameCareerTraitWeightAdmin(admin.ModelAdmin):
    list_display = ("career", "trait_name", "weight")
    list_filter = ("trait_name",)
    search_fields = ("career__name",)


@admin.register(ReportOrder)
class ReportOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session", "amount", "status", "paid_at")
    list_filter = ("status",)
    search_fields = ("user__email", "razorpay_order_id", "razorpay_payment_id")
