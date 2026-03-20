from django.contrib import admin
from .models import VisitorLog


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
