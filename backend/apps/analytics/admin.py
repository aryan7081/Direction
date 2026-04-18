from django.contrib import admin
from django.utils.html import format_html

from .models import AnalyticsSettings


@admin.register(AnalyticsSettings)
class AnalyticsSettingsAdmin(admin.ModelAdmin):
    """Permission anchor — no data rows required."""

    change_list_template = "admin/analytics/analyticssettings/change_list.html"

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["instructions"] = format_html(
            "<p><strong>Who can use the analytics dashboard?</strong> Users with "
            "<em>Can view analytics dashboard</em> on this app, or superusers.</p>"
            "<p><strong>Grant access (staff):</strong> "
            "<strong>Authentication → Groups → Analytics dashboard viewers</strong> — add the user; "
            "or edit <strong>Users</strong> → <strong>User permissions</strong> → tick "
            "<em>Can view analytics dashboard</em>.</p>"
            "<p><strong>Credentials:</strong> Set the user’s password in admin. They sign in at "
            "<code>/analytics/login</code> (tokens are stored separately from student accounts).</p>"
        )
        return super().changelist_view(request, extra_context=extra_context)

    def has_change_permission(self, request, obj=None):
        return True
