from django.apps import AppConfig
from django.db.models.signals import post_delete, post_save


class AssessmentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.assessments"
    verbose_name = "Assessments"

    def ready(self) -> None:
        from apps.assessments.models import AnswerOption, Question
        from apps.assessments.game_catalog import invalidate_mcq_catalog_cache

        post_save.connect(
            lambda **kw: invalidate_mcq_catalog_cache(),
            sender=Question,
            weak=False,
        )
        post_delete.connect(
            lambda **kw: invalidate_mcq_catalog_cache(),
            sender=Question,
            weak=False,
        )
        post_save.connect(
            lambda **kw: invalidate_mcq_catalog_cache(),
            sender=AnswerOption,
            weak=False,
        )
        post_delete.connect(
            lambda **kw: invalidate_mcq_catalog_cache(),
            sender=AnswerOption,
            weak=False,
        )
