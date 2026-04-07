# Generated manually for DB-backed MCQ catalog

from django.db import migrations


def backfill_codes_and_api_ids(apps, schema_editor):
    Question = apps.get_model("assessments", "Question")
    AnswerOption = apps.get_model("assessments", "AnswerOption")
    letters = ("a", "b", "c", "d")
    for q in Question.objects.all().iterator():
        meta = q.metadata or {}
        code = (q.code or meta.get("code") or "").strip()
        if not code:
            continue
        to_update = []
        if q.code != code:
            q.code = code
            to_update.append("code")
        if meta.get("premium_only") and not q.premium_only:
            q.premium_only = True
            to_update.append("premium_only")
        if to_update:
            q.save(update_fields=to_update)
        opts = list(
            AnswerOption.objects.filter(question=q).order_by("order", "id")
        )
        for i, ao in enumerate(opts[: len(letters)]):
            expected = f"{code.lower()}_{letters[i]}"
            if not ao.api_id:
                ao.api_id = expected
                ao.save(update_fields=["api_id"])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0004_question_code_premium_api_id"),
    ]

    operations = [
        migrations.RunPython(backfill_codes_and_api_ids, noop_reverse),
    ]
