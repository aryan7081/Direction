from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_add_financial_marks_cost"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="profile",
            name="financial_tier",
        ),
        migrations.RemoveField(
            model_name="profile",
            name="subject_marks",
        ),
    ]
