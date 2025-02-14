from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Creates an admin user'

    def handle(self, *args, **options):
        if not User.objects.filter(email='adminx@example.com').exists():
            User.objects.create_user(
                username='adminx@example.com',
                email='adminx@example.com',
                password='adminx@example.com',
                first_name='Admin',
                user_type='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS('Admin user created successfully'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
