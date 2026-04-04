# Generated manually for catalogue sync semantics.

from django.db import migrations, models


def set_existing_careers_managed_by_seed(apps, schema_editor):
    Career = apps.get_model("careers", "Career")
    Career.objects.all().update(managed_by_seed=True)


class Migration(migrations.Migration):

    dependencies = [
        ("careers", "0002_add_financial_marks_cost"),
    ]

    operations = [
        migrations.AddField(
            model_name="career",
            name="managed_by_seed",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(set_existing_careers_managed_by_seed, migrations.RunPython.noop),
    ]
