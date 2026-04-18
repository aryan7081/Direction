# Data migration: create "Analytics dashboard viewers" group with dashboard permission.

from django.apps import apps as django_apps
from django.contrib.auth.management import create_permissions
from django.contrib.contenttypes.management import create_contenttypes
from django.db import migrations


def create_analytics_group(apps, schema_editor):
    # ContentTypes and model permissions are normally created in post_migrate; ensure they exist here.
    app_config = django_apps.get_app_config("analytics")
    create_contenttypes(app_config, interactive=False, verbosity=0)
    create_permissions(app_config, verbosity=0)

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    ct = ContentType.objects.get(app_label="analytics", model="analyticssettings")
    perm = Permission.objects.get(content_type=ct, codename="view_analyticsdashboard")
    group, _ = Group.objects.get_or_create(name="Analytics dashboard viewers")
    group.permissions.add(perm)


def remove_analytics_group(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name="Analytics dashboard viewers").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("analytics", "0001_initial"),
        ("contenttypes", "0002_remove_content_type_name"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(create_analytics_group, remove_analytics_group),
    ]
