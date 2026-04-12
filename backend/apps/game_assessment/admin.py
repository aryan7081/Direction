from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils import timezone

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


class ReportOrderInline(admin.TabularInline):
    model = ReportOrder
    extra = 0
    max_num = 1
    readonly_fields = (
        "id",
        "product_type",
        "amount",
        "status",
        "razorpay_order_id",
        "razorpay_payment_id",
        "paid_at",
        "created_at",
    )
    can_delete = True
    show_change_link = True


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "pending_email", "started_at", "is_complete", "completed_at", "report_payment_status")
    list_filter = ("is_complete",)
    search_fields = ("user__email", "id")
    inlines = [TraitScoreInline, CareerMatchScoreInline, ReportOrderInline]
    readonly_fields = ("id", "started_at", "completed_at")
    list_select_related = ("user",)

    @admin.display(description="Report access")
    def report_payment_status(self, obj):
        order = ReportOrder.objects.filter(session=obj).first()
        if not order:
            return format_html('<span style="color:#9ca3af;">—</span>')
        if order.status == "paid":
            return format_html('<span style="color:#16a34a; font-weight:600;">Paid</span>')
        if order.status == "pending":
            return format_html('<span style="color:#f59e0b;">Pending</span>')
        return format_html('<span style="color:#dc2626;">Failed</span>')


@admin.register(GameEventLog)
class GameEventLogAdmin(admin.ModelAdmin):
    list_display = ("session", "game_name", "event_type", "timestamp")
    list_filter = ("game_name", "event_type")


@admin.register(GameCareerTraitWeight)
class GameCareerTraitWeightAdmin(admin.ModelAdmin):
    list_display = ("career", "trait_name", "weight")
    list_filter = ("trait_name",)
    search_fields = ("career__name",)


@admin.action(description="Mark selected as PAID (grant report access)")
def mark_orders_paid(modeladmin, request, queryset):
    updated = queryset.exclude(status="paid").update(status="paid", paid_at=timezone.now())
    modeladmin.message_user(request, f"{updated} order(s) marked as paid. Users now have report access.")


@admin.action(description="Mark selected as UNPAID (revoke report access)")
def mark_orders_unpaid(modeladmin, request, queryset):
    updated = queryset.filter(status="paid").update(status="pending", paid_at=None)
    modeladmin.message_user(request, f"{updated} order(s) marked as unpaid. Report access revoked.")


@admin.register(ReportOrder)
class ReportOrderAdmin(admin.ModelAdmin):
    list_display = (
        "id_short",
        "user_email",
        "session_link",
        "product_type",
        "amount",
        "status",
        "paid_at",
        "created_at",
    )
    list_filter = ("status", "product_type", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "razorpay_order_id", "razorpay_payment_id", "session__id")
    list_editable = ("status",)
    list_per_page = 25
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    actions = [mark_orders_paid, mark_orders_unpaid]
    raw_id_fields = ("user", "session")

    fieldsets = (
        (None, {
            "fields": (
                "id",
                "user",
                "session",
                "product_type",
                "amount",
                "status",
            ),
        }),
        ("Payment details", {
            "fields": ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "paid_at"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
    readonly_fields = ("id", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        if change and obj.status != "paid":
            obj.paid_at = None
        elif obj.status == "paid" and not obj.paid_at:
            obj.paid_at = timezone.now()
        super().save_model(request, obj, form, change)

    @admin.display(description="Order ID")
    def id_short(self, obj):
        if not obj.id:
            return "—"
        url = reverse("admin:game_assessment_reportorder_change", args=[obj.id])
        short = str(obj.id)[:8] + "…"
        return format_html('<a href="{}">{}</a>', url, short)

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.user.email if obj.user else "—"

    @admin.display(description="Session")
    def session_link(self, obj):
        if not obj.session_id:
            return "—"
        url = reverse("admin:game_assessment_gamesession_change", args=[obj.session_id])
        return format_html('<a href="{}">{}</a>', url, str(obj.session_id)[:8] + "…")
