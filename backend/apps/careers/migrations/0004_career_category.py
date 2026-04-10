from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("careers", "0003_career_managed_by_seed"),
    ]

    operations = [
        migrations.AddField(
            model_name="career",
            name="category",
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
