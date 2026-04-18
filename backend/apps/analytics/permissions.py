from rest_framework import permissions


class IsAnalyticsViewer(permissions.BasePermission):
    """
    Superusers or users with analytics.view_analyticsdashboard.
    Create accounts in Django Admin and assign the permission or the
    "Analytics dashboard viewers" group.
    """

    message = "You do not have access to the analytics dashboard."

    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if u.is_superuser:
            return True
        return u.has_perm("analytics.view_analyticsdashboard")
