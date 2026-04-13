from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from social_media_4P.models import User

class Command(BaseCommand):
    help = 'Create sample users for testing'

    def handle(self, *args, **kwargs):
        # Get or create groups
        manager_group, _ = Group.objects.get_or_create(name='Manager')
        employee_group, _ = Group.objects.get_or_create(name='Employee')
        
        # Create Manager user
        if not User.objects.filter(email='manager@fourpoints.com').exists():
            manager = User.objects.create_user(
                username='manager',
                email='manager@fourpoints.com',
                password='123456',
                first_name='Doan Xuan',
                last_name='Toan'
            )
            manager.groups.add(manager_group)
            self.stdout.write(self.style.SUCCESS(f'✓ Created Manager user: {manager.email}'))
        else:
            # Update existing user
            manager = User.objects.get(email='manager@fourpoints.com')
            manager.first_name = 'Doan Xuan'
            manager.last_name = 'Toan'
            manager.groups.add(manager_group)
            manager.save()
            self.stdout.write(self.style.WARNING('○ Manager user already exists - updated'))

        # Create Employee user
        if not User.objects.filter(email='employee@fourpoints.com').exists():
            employee = User.objects.create_user(
                username='employee',
                email='employee@fourpoints.com',
                password='123456',
                first_name='Vo Thi Kim',
                last_name='Hoa'
            )
            employee.groups.add(employee_group)
            self.stdout.write(self.style.SUCCESS(f'✓ Created Employee user: {employee.email}'))
        else:
            # Update existing user
            employee = User.objects.get(email='employee@fourpoints.com')
            employee.first_name = 'Vo Thi Kim'
            employee.last_name = 'Hoa'
            employee.groups.add(employee_group)
            employee.save()
            self.stdout.write(self.style.WARNING('○ Employee user already exists - updated'))

        self.stdout.write(self.style.SUCCESS('\n✓ Sample users created successfully!'))
        self.stdout.write('Manager: manager@fourpoints.com / 123456 - Doan Xuan Toan')
        self.stdout.write('Employee: employee@fourpoints.com / 123456 - Vo Thi Kim Hoa')

