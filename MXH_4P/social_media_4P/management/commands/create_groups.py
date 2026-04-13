from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Create role groups: Manager and Employee'

    def handle(self, *args, **kwargs):
        # Create Manager group
        manager_group, created = Group.objects.get_or_create(name='Manager')
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created group: Manager'))
        else:
            self.stdout.write(self.style.WARNING('○ Group Manager already exists'))
        
        # Create Employee group
        employee_group, created = Group.objects.get_or_create(name='Employee')
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created group: Employee'))
        else:
            self.stdout.write(self.style.WARNING('○ Group Employee already exists'))
        
        # Assign permissions to Manager (can add permissions later)
        # Example: manager_group.permissions.add(permission)
        
        self.stdout.write(self.style.SUCCESS('\n✓ Role groups created successfully!'))
