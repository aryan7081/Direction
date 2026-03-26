from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assessments", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="answeroption",
            name="category_weights",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
