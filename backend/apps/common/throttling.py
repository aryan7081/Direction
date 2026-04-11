"""
API rate limiting (DRF throttles).

Uses Django's cache backend so limits are shared across workers when Redis (or
another shared cache) is configured. Scoped limits are applied via
`throttle_scope` on views; see DEFAULT_THROTTLE_RATES in settings.

Violations are logged at WARNING with a stable message for log aggregation.
"""
from __future__ import annotations

import logging

from rest_framework.throttling import ScopedRateThrottle

logger = logging.getLogger(__name__)


class ScopedRateThrottleWithLogging(ScopedRateThrottle):
    """
    Same as DRF's ScopedRateThrottle, but logs throttled requests.

    Views without `throttle_scope` are not throttled by this class (DRF
    behavior). Add this to DEFAULT_THROTTLE_CLASSES once, then set
    `throttle_scope` only where a non-default limit is required.
    """

    def allow_request(self, request, view):
        allowed = super().allow_request(request, view)
        if not allowed:
            scope = getattr(view, self.scope_attr, None)
            ident = self.get_ident(request)
            logger.warning(
                "api.rate_limit.exceeded",
                extra={
                    "scope": scope,
                    "path": request.path,
                    "method": request.method,
                    "client_ident": ident,
                },
            )
        return allowed
