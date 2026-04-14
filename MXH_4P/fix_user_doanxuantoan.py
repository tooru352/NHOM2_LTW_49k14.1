import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import User

# Fix user doanxuantoan
try:
    user = User.objects.get(username='doanxuantoan')
    print(f"Tìm thấy user: {user.username}")
    print(f"Tên hiện tại: {user.first_name} {user.last_name}")
    
    # Update correct information
    user.first_name = 'Đoàn Xuân'
    user.last_name = 'Toàn'
    user.email = 'toan@hotel.com'
    user.avatar_initials = 'DT'
    user.save()
    
    print(f"✓ Đã sửa thành: {user.first_name} {user.last_name}")
    print(f"✓ Full name: {user.get_full_name()}")
    
except User.DoesNotExist:
    print("✗ Không tìm thấy user doanxuantoan")
except Exception as e:
    print(f"✗ Lỗi: {e}")
