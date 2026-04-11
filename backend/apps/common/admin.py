from django.contrib import admin
from django.utils.html import escape, format_html

from .models import ApiErrorLog, VisitorLog


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "path", "user_agent_short", "created_at")
    list_filter = ("created_at", "ip_address")
    search_fields = ("ip_address", "path", "user_agent")
    readonly_fields = ("ip_address", "user_agent", "path", "created_at")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    def user_agent_short(self, obj):
        return (obj.user_agent[:60] + "...") if len(obj.user_agent) > 60 else obj.user_agent

    user_agent_short.short_description = "User agent"


@admin.register(ApiErrorLog)
class ApiErrorLogAdmin(admin.ModelAdmin):
    """Read-only: errors are inserted by the API exception handler only."""

    list_display = (
        "created_at",
        "exception_class",
        "method",
        "path_short",
        "user",
        "client_ip",
    )
    list_filter = ("exception_class", "method", "created_at")
    search_fields = ("path", "message", "exception_class", "client_ip")
    readonly_fields = (
        "created_at",
        "user",
        "path",
        "method",
        "exception_class",
        "message",
        "traceback_formatted",
        "client_ip",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def path_short(self, obj):
        p = obj.path
        return (p[:70] + "…") if len(p) > 70 else p

    path_short.short_description = "Path"

    def traceback_formatted(self, obj):
        if not obj.traceback_text:
            return "—"
        return format_html(
            "<pre style='white-space: pre-wrap; max-height: 480px; overflow: auto;'>{}</pre>",
            escape(obj.traceback_text),
        )

    traceback_formatted.short_description = "Traceback"

    fieldsets = (
        (None, {"fields": ("created_at", "user", "client_ip", "method", "path")}),
        ("Exception", {"fields": ("exception_class", "message", "traceback_formatted")}),
    )
