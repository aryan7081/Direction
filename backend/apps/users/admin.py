from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile
from apps.game_assessment.models import ReportOrder


class ReportOrderInline(admin.TabularInline):
    """Show user's report orders (payment status) on User admin."""
    model = ReportOrder
    fk_name = "user"
    extra = 0
    max_num = 20
    readonly_fields = ("id", "session", "amount", "status", "paid_at", "created_at")
    can_delete = True
    show_change_link = True
    verbose_name = "Report order"
    verbose_name_plural = "Report orders (career report payments)"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_staff")
    list_filter = ("role", "is_staff")
    search_fields = ("email", "username")
    ordering = ("email",)
    inlines = [ReportOrderInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "grade", "school")
