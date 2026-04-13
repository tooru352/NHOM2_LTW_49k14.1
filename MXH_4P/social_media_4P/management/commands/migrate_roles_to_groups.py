from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from social_media_4P.models import User


class Command(BaseCommand):
    help = 'Migrate users từ trường role sang Django Groups'

    def handle(self, *args, **kwargs):
        # Lấy hoặc tạo groups
        quan_ly_group, _ = Group.objects.get_or_create(name='QuanLy')
        nhan_vien_group, _ = Group.objects.get_or_create(name='NhanVien')
        
        # Nếu User model cũ có trường 'role', uncomment đoạn này:
        # for user in User.objects.all():
        #     if hasattr(user, 'role'):
        #         if user.role == 'QuanLy':
        #             user.groups.add(quan_ly_group)
        #             self.stdout.write(f'✓ {user.username} → QuanLy')
        #         elif user.role == 'NhanVien':
        #             user.groups.add(nhan_vien_group)
        #             self.stdout.write(f'✓ {user.username} → NhanVien')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Hoàn thành migration!'))
