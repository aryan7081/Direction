from django.urls import path

from . import views

urlpatterns = [
    path("game/content/", views.GameContentView.as_view(), name="game-content"),
    path("game/start/", views.StartSessionView.as_view(), name="game-start"),
    path("game/save-progress/", views.SaveProgressView.as_view(), name="game-save-progress"),
    path("game/create-account/", views.CreateAccountFromSessionView.as_view(), name="game-create-account"),
    path("game/log-event/", views.LogEventView.as_view(), name="game-log-event"),
    path("game/submit/", views.SubmitSessionView.as_view(), name="game-submit"),
    path(
        "game/premium-extension/content/",
        views.PremiumExtensionContentView.as_view(),
        name="game-premium-extension-content",
    ),
    path(
        "game/premium-extension/submit/",
        views.SubmitPremiumExtensionView.as_view(),
        name="game-premium-extension-submit",
    ),
    path(
        "game/results/<uuid:session_id>/",
        views.SessionResultView.as_view(),
        name="game-results",
    ),
    path("game/dashboard/", views.GameDashboardView.as_view(), name="game-dashboard"),
    path("game/resume/", views.ResumeSessionView.as_view(), name="game-resume"),
    # Report (gated behind payment)
    path(
        "game/report/<uuid:session_id>/teaser/",
        views.ReportTeaserView.as_view(),
        name="game-report-teaser",
    ),
    path(
        "game/report/<uuid:session_id>/",
        views.CareerReportView.as_view(),
        name="game-report",
    ),
    path(
        "game/report/<uuid:session_id>/pdf/",
        views.CareerReportPDFView.as_view(),
        name="game-report-pdf",
    ),
    path(
        "game/report/<uuid:session_id>/counseling-request/",
        views.CareerCounselingRequestCreateView.as_view(),
        name="game-report-counseling-request",
    ),
    # Payment
    path(
        "game/payment/create-order/",
        views.CreatePaymentOrderView.as_view(),
        name="payment-create-order",
    ),
    path(
        "game/payment/validate-coupon/",
        views.ValidatePaymentCouponView.as_view(),
        name="payment-validate-coupon",
    ),
    path(
        "game/payment/verify/",
        views.VerifyPaymentView.as_view(),
        name="payment-verify",
    ),
    path(
        "game/payment/webhook/",
        views.RazorpayWebhookView.as_view(),
        name="payment-webhook",
    ),
]
