from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create default admin user for Akash Automobile"

    def handle(self, *args, **kwargs):
        username = "sumitkalaskar"
        password = "sunilkalaskar"

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                password=password,
                email="admin@akashautomobile.com",
                first_name="Sumit",
                last_name="Kalaskar",
            )
            self.stdout.write(self.style.SUCCESS(f"Admin user '{username}' created successfully."))
        else:
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists."))
