from django.core.management.base import BaseCommand
from social_media_4P.models import User

class Command(BaseCommand):
    help = 'Create sample users for testing'

    def handle(self, *args, **kwargs):
        # Create Quản Lý user
        if not User.objects.filter(email='quanly@fourpoints.com').exists():
            quanly = User.objects.create_user(
                username='quanly',
                email='quanly@fourpoints.com',
                password='123456',
                first_name='Đoàn Xuân',
                last_name='Toàn',
                role='quanly'
            )
            self.stdout.write(self.style.SUCCESS(f'Created Quản Lý user: {quanly.email}'))
        else:
            # Update existing user
            quanly = User.objects.get(email='quanly@fourpoints.com')
            quanly.first_name = 'Đoàn Xuân'
            quanly.last_name = 'Toàn'
            quanly.save()
            self.stdout.write(self.style.WARNING('Quản Lý user already exists - updated name'))

        # Create Nhân Viên user
        if not User.objects.filter(email='nhanvien@fourpoints.com').exists():
            nhanvien = User.objects.create_user(
                username='nhanvien',
                email='nhanvien@fourpoints.com',
                password='123456',
                first_name='Võ Thị Kim',
                last_name='Hoa',
                role='nhanvien'
            )
            self.stdout.write(self.style.SUCCESS(f'Created Nhân Viên user: {nhanvien.email}'))
        else:
            # Update existing user
            nhanvien = User.objects.get(email='nhanvien@fourpoints.com')
            nhanvien.first_name = 'Võ Thị Kim'
            nhanvien.last_name = 'Hoa'
            nhanvien.save()
            self.stdout.write(self.style.WARNING('Nhân Viên user already exists - updated name'))

        self.stdout.write(self.style.SUCCESS('\nSample users created successfully!'))
        self.stdout.write('Quản Lý: quanly@fourpoints.com / 123456 - Đoàn Xuân Toàn')
        self.stdout.write('Nhân Viên: nhanvien@fourpoints.com / 123456 - Võ Thị Kim Hoa')
