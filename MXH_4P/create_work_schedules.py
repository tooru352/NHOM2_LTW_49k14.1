import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import User, WorkShift, WorkSchedule
from django.utils import timezone

print("=" * 60)
print("TẠO DỮ LIỆU LỊCH LÀM VIỆC")
print("=" * 60)

# Step 1: Create/Update Work Shifts
print("\n1. Tạo các ca làm việc...")

shifts_data = [
    ('MS', 'Ca Sáng', '05:00:00', '13:00:00', '#2196F3'),
    ('A1', 'Ca Chiều', '13:00:00', '21:00:00', '#9C27B0'),
    ('E9', 'Ca Tối', '21:00:00', '05:00:00', '#FF9800'),
    ('M6SS', 'Ca Đặc Biệt', '06:00:00', '14:00:00', '#E91E63'),
    ('DO', 'Nghỉ', None, None, '#F44336'),
]

shifts = {}
for code, name, start, end, color in shifts_data:
    shift, created = WorkShift.objects.update_or_create(
        shift_code=code,
        defaults={
            'shift_name': name,
            'start_time': start,
            'end_time': end,
            'color_code': color
        }
    )
    shifts[code] = shift
    status = "✓ Tạo mới" if created else "✓ Cập nhật"
    print(f"{status}: {code} - {name}")

# Step 2: Get current week (Monday to Sunday)
print("\n2. Xác định tuần hiện tại...")
today = timezone.now().date()
week_start = today - timedelta(days=today.weekday())  # Monday
week_end = week_start + timedelta(days=6)  # Sunday

print(f"Tuần: {week_start.strftime('%d/%m/%Y')} - {week_end.strftime('%d/%m/%Y')}")

# Step 3: Get all employees
print("\n3. Lấy danh sách nhân viên...")

# Department-specific usernames
fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
               'tranvantu', 'dangthiyen', 'vothixuan']
hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
               'phanvanthang', 'tathivan', 'buithinga']
fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
               'luuvanphong', 'hoangvanquan', 'lyvanhai']

all_usernames = fb_usernames + hk_usernames + fo_usernames
users = User.objects.filter(username__in=all_usernames)

print(f"Tìm thấy {users.count()} nhân viên")

# Step 4: Create work schedules
print("\n4. Tạo lịch làm việc...")

# Delete existing schedules for this week
WorkSchedule.objects.filter(week_start=week_start).delete()
print("✓ Đã xóa lịch cũ (nếu có)")

# Shift rotation pattern for variety
shift_patterns = [
    ['MS', 'A1', 'E9', 'MS', 'A1', 'DO', 'E9'],  # Pattern 1
    ['A1', 'E9', 'MS', 'A1', 'E9', 'MS', 'DO'],  # Pattern 2
    ['E9', 'MS', 'A1', 'DO', 'MS', 'A1', 'E9'],  # Pattern 3
    ['MS', 'MS', 'A1', 'A1', 'E9', 'E9', 'DO'],  # Pattern 4
    ['A1', 'A1', 'E9', 'MS', 'MS', 'DO', 'A1'],  # Pattern 5
    ['E9', 'DO', 'MS', 'A1', 'E9', 'MS', 'A1'],  # Pattern 6
    ['MS', 'A1', 'M6SS', 'E9', 'MS', 'A1', 'DO'],  # Pattern 7 (with M6SS)
    ['A1', 'M6SS', 'E9', 'MS', 'DO', 'A1', 'E9'],  # Pattern 8 (with M6SS)
]

created_count = 0
for idx, user in enumerate(users):
    # Select pattern based on user index
    pattern = shift_patterns[idx % len(shift_patterns)]
    
    # Create schedule for each day of the week
    for day_offset in range(7):
        work_date = week_start + timedelta(days=day_offset)
        shift_code = pattern[day_offset]
        
        schedule = WorkSchedule.objects.create(
            user=user,
            shift_code=shifts[shift_code],
            work_date=work_date,
            week_start=week_start,
            status=0,  # Pending
            manager_note=f'Lịch làm việc tuần {week_start.strftime("%d/%m")}'
        )
        created_count += 1
    
    print(f"✓ Tạo lịch cho: {user.get_full_name()} ({user.username})")

print(f"\n✓ Đã tạo {created_count} ca làm việc")

# Step 5: Statistics
print("\n5. Thống kê:")
for code, name, _, _, _ in shifts_data:
    count = WorkSchedule.objects.filter(
        week_start=week_start,
        shift_code__shift_code=code
    ).count()
    print(f"  - {code} ({name}): {count} ca")

print("\n" + "=" * 60)
print("HOÀN THÀNH!")
print("=" * 60)
print("\nBạn có thể truy cập:")
print("  - Quản lý: /work_schedules_management/")
print("  - Nhân viên: /employee_work_schedules/")
