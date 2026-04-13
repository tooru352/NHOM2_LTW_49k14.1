"""
Script to create Posts, Tasks, Meetings, and Work Schedules
Run AFTER create_hotel_data.py
Run: python create_posts_tasks.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from django.contrib.auth import get_user_model
from social_media_4P.models import *
from datetime import datetime, date, time, timedelta
from django.utils import timezone

User = get_user_model()

print("=" * 60)
print("CREATING POSTS, TASKS & SCHEDULES")
print("=" * 60)

# Get users
managers = {
    'F&B': User.objects.get(username='doanxuantoan'),
    'HK': User.objects.get(username='phamxuanthuong'),
    'FO': User.objects.get(username='nguyennhatha'),
}

fb_employees = list(User.objects.filter(username__in=[
    'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan'
]))

hk_employees = list(User.objects.filter(username__in=[
    'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha'
]))

fo_employees = list(User.objects.filter(username__in=[
    'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong'
]))

# Get interaction types
reaction_type = InteractionType.objects.get(name='reaction')
comment_type = InteractionType.objects.get(name='comment')

# ============================================
# 1. CREATE POSTS
# ============================================
print("\n1. Creating Posts...")

# F&B Posts
fb_posts_data = [
    {
        'user': managers['F&B'],
        'content': 'Thông báo: Menu buffet sáng tuần tới sẽ có 5 món mới. Nhờ team chuẩn bị nguyên liệu từ thứ 6. 🍳'
    },
    {
        'user': fb_employees[0],  # Võ Thị Kim Hoa
        'content': 'Hôm nay phục vụ 3 tiệc cưới, mọi người cố gắng nhé! Khách hàng rất hài lòng với món khai vị. 🎉'
    },
    {
        'user': fb_employees[1],  # Đoàn Thị Anh Thư
        'content': 'Đã hoàn thành kiểm tra kho nguyên liệu. Cần đặt thêm 50kg thịt bò và 30kg cá hồi cho tuần sau.'
    },
    {
        'user': managers['F&B'],
        'content': 'Chúc mừng team F&B đã đạt điểm đánh giá 4.8/5 từ khách hàng tháng này! 🌟'
    },
]

# HK Posts
hk_posts_data = [
    {
        'user': managers['HK'],
        'content': 'Lịch dọn phòng hôm nay: 45 phòng check-out, 38 phòng check-in. Ưu tiên phòng VIP trước 2pm. 🏨'
    },
    {
        'user': hk_employees[0],  # Nguyễn Đình Khoa
        'content': 'Đã hoàn thành dọn dẹp tầng 3-5. Tất cả phòng đều đạt chuẩn 5 sao. ✨'
    },
    {
        'user': hk_employees[1],  # Nguyễn Trường Giang
        'content': 'Phát hiện máy giặt số 2 bị hỏng. Đã báo bộ phận kỹ thuật sửa chữa.'
    },
    {
        'user': managers['HK'],
        'content': 'Nhắc nhở: Kiểm tra kỹ minibar và đồ dùng phòng tắm trước khi báo phòng sẵn sàng.'
    },
]

# FO Posts
fo_posts_data = [
    {
        'user': managers['FO'],
        'content': 'Hôm nay có 25 đoàn khách quốc tế check-in. Nhớ chuẩn bị tài liệu tiếng Anh. 🌍'
    },
    {
        'user': fo_employees[0],  # Lâm Văn Đạt
        'content': 'Khách ở phòng 501 khen ngợi dịch vụ lễ tân nhiệt tình. Cảm ơn team! 😊'
    },
    {
        'user': fo_employees[1],  # Trịnh Thị Ngọc
        'content': 'Đã xử lý xong 15 booking online. Tỷ lệ lấp đầy phòng tuần sau đạt 92%.'
    },
    {
        'user': managers['FO'],
        'content': 'Áp dụng quy trình check-in mới từ tuần sau. Thời gian giảm từ 5 phút xuống 3 phút. ⏱️'
    },
]

posts = []
for post_data in fb_posts_data + hk_posts_data + fo_posts_data:
    post = Post.objects.create(**post_data)
    posts.append(post)

print(f"✓ Created {len(posts)} posts")

# Add some reactions and comments
for i, post in enumerate(posts[:6]):
    # Add reactions
    Interaction.objects.create(
        post=post,
        user=managers['F&B'] if i % 3 == 0 else managers['HK'],
        interaction_type=reaction_type
    )
    
    # Add comment to some posts
    if i % 2 == 0:
        Interaction.objects.create(
            post=post,
            user=fb_employees[0] if i < 4 else hk_employees[0],
            interaction_type=comment_type,
            content='Đã ghi nhận! Sẽ thực hiện ngay.'
        )

print("✓ Added reactions and comments")

# ============================================
# 2. CREATE TASKS
# ============================================
print("\n2. Creating Tasks...")

# F&B Tasks
fb_tasks_data = [
    {
        'title': 'Chuẩn bị menu buffet sáng tuần sau',
        'description': 'Thêm 5 món mới: Phở bò, Bánh mì pate, Trứng Benedict, Salad trái cây, Sữa chua Hy Lạp',
        'created_by': managers['F&B'],
        'assigned_to': fb_employees[0],
        'status': 'InProgress'
    },
    {
        'title': 'Kiểm tra kho nguyên liệu',
        'description': 'Kiểm tra số lượng và chất lượng nguyên liệu, lập danh sách cần đặt thêm',
        'created_by': managers['F&B'],
        'assigned_to': fb_employees[1],
        'status': 'Done'
    },
    {
        'title': 'Đào tạo nhân viên mới về quy trình phục vụ',
        'description': 'Hướng dẫn 3 nhân viên mới về cách phục vụ bàn, giao tiếp với khách',
        'created_by': managers['F&B'],
        'assigned_to': fb_employees[2],
        'status': 'Todo'
    },
    {
        'title': 'Chuẩn bị tiệc cưới ngày 20/4',
        'description': 'Menu 10 món, 200 khách, cần chuẩn bị từ sáng sớm',
        'created_by': managers['F&B'],
        'assigned_to': fb_employees[0],
        'status': 'Todo'
    },
]

# HK Tasks
hk_tasks_data = [
    {
        'title': 'Dọn dẹp phòng VIP tầng 10',
        'description': 'Làm vệ sinh kỹ lưỡng, thay đổi toàn bộ đồ dùng, kiểm tra minibar',
        'created_by': managers['HK'],
        'assigned_to': hk_employees[0],
        'status': 'Done'
    },
    {
        'title': 'Kiểm tra máy giặt công nghiệp',
        'description': 'Kiểm tra 5 máy giặt, báo cáo tình trạng, liên hệ bảo trì nếu cần',
        'created_by': managers['HK'],
        'assigned_to': hk_employees[1],
        'status': 'InProgress'
    },
    {
        'title': 'Đặt hàng đồ dùng phòng tắm',
        'description': 'Đặt 500 bộ amenities (dầu gội, sữa tắm, kem đánh răng)',
        'created_by': managers['HK'],
        'assigned_to': hk_employees[2],
        'status': 'Todo'
    },
    {
        'title': 'Đào tạo quy trình dọn phòng mới',
        'description': 'Hướng dẫn nhân viên mới về quy trình dọn phòng chuẩn 5 sao',
        'created_by': managers['HK'],
        'assigned_to': hk_employees[0],
        'status': 'InProgress'
    },
]

# FO Tasks
fo_tasks_data = [
    {
        'title': 'Xử lý booking online',
        'description': 'Xác nhận 20 booking mới từ website và OTA, gửi email xác nhận',
        'created_by': managers['FO'],
        'assigned_to': fo_employees[0],
        'status': 'Done'
    },
    {
        'title': 'Chuẩn bị tài liệu cho đoàn khách Nhật',
        'description': 'In tài liệu tiếng Nhật, chuẩn bị welcome drink, sắp xếp phòng',
        'created_by': managers['FO'],
        'assigned_to': fo_employees[1],
        'status': 'InProgress'
    },
    {
        'title': 'Đào tạo quy trình check-in mới',
        'description': 'Hướng dẫn toàn bộ nhân viên về quy trình check-in 3 phút',
        'created_by': managers['FO'],
        'assigned_to': fo_employees[2],
        'status': 'Todo'
    },
    {
        'title': 'Cập nhật giá phòng trên hệ thống',
        'description': 'Cập nhật bảng giá mùa cao điểm tháng 5-8',
        'created_by': managers['FO'],
        'assigned_to': fo_employees[3],
        'status': 'Todo'
    },
]

tasks = []
for task_data in fb_tasks_data + hk_tasks_data + fo_tasks_data:
    task = Task.objects.create(**task_data)
    tasks.append(task)

print(f"✓ Created {len(tasks)} tasks")

# Add task responses for completed tasks
completed_tasks = [t for t in tasks if t.status == 'Done']
for task in completed_tasks:
    TaskResponse.objects.create(
        task=task,
        user=task.assigned_to,
        status=True,
        reason='Đã hoàn thành đúng hạn'
    )

print(f"✓ Added responses for {len(completed_tasks)} completed tasks")

# ============================================
# 3. CREATE MEETINGS
# ============================================
print("\n3. Creating Meetings...")

now = timezone.now()

meetings_data = [
    {
        'title': 'Họp toàn thể khách sạn',
        'created_by': managers['HK'],
        'start_time': now + timedelta(days=7, hours=9),
        'end_time': now + timedelta(days=7, hours=11),
        'participants': [managers['F&B'], managers['HK'], managers['FO']] + fb_employees[:2] + hk_employees[:2] + fo_employees[:2]
    },
    {
        'title': 'Họp bộ phận F&B',
        'created_by': managers['F&B'],
        'start_time': now + timedelta(days=3, hours=14),
        'end_time': now + timedelta(days=3, hours=15),
        'participants': [managers['F&B']] + fb_employees[:4]
    },
    {
        'title': 'Họp bộ phận HK',
        'created_by': managers['HK'],
        'start_time': now + timedelta(days=4, hours=10),
        'end_time': now + timedelta(days=4, hours=11),
        'participants': [managers['HK']] + hk_employees[:4]
    },
    {
        'title': 'Họp bộ phận FO',
        'created_by': managers['FO'],
        'start_time': now + timedelta(days=5, hours=15),
        'end_time': now + timedelta(days=5, hours=16),
        'participants': [managers['FO']] + fo_employees[:4]
    },
]

for meeting_data in meetings_data:
    participants = meeting_data.pop('participants')
    meeting = Meeting.objects.create(**meeting_data)
    
    for participant in participants:
        MeetingParticipant.objects.create(
            meeting=meeting,
            user=participant
        )

print(f"✓ Created {len(meetings_data)} meetings")

# ============================================
# 4. CREATE WORK SHIFTS
# ============================================
print("\n4. Creating Work Shifts...")

shifts_data = [
    {
        'shift_code': 'S',
        'shift_name': 'Ca sáng',
        'start_time': time(6, 0),
        'end_time': time(14, 0),
        'color_code': '#4CAF50'
    },
    {
        'shift_code': 'C',
        'shift_name': 'Ca chiều',
        'start_time': time(14, 0),
        'end_time': time(22, 0),
        'color_code': '#2196F3'
    },
    {
        'shift_code': 'T',
        'shift_name': 'Ca tối',
        'start_time': time(22, 0),
        'end_time': time(6, 0),
        'color_code': '#FF9800'
    },
    {
        'shift_code': 'O',
        'shift_name': 'Nghỉ',
        'start_time': time(0, 0),
        'end_time': time(0, 0),
        'color_code': '#9E9E9E'
    },
]

shifts = {}
for shift_data in shifts_data:
    shift, _ = WorkShift.objects.get_or_create(
        shift_code=shift_data['shift_code'],
        defaults=shift_data
    )
    shifts[shift_data['shift_code']] = shift

print("✓ Created 4 work shifts")

# ============================================
# 5. CREATE WORK SCHEDULES
# ============================================
print("\n5. Creating Work Schedules...")

today = date.today()
week_start = today - timedelta(days=today.weekday())

# Create schedules for next week
all_employees = fb_employees + hk_employees + fo_employees
shift_codes = ['S', 'C', 'T', 'O']

schedule_count = 0
for i in range(7):  # 7 days
    work_date = week_start + timedelta(days=i)
    
    for j, employee in enumerate(all_employees[:12]):  # First 12 employees
        shift_code = shift_codes[(i + j) % 4]  # Rotate shifts
        
        WorkSchedule.objects.create(
            user=employee,
            shift_code=shifts[shift_code],
            work_date=work_date,
            week_start=week_start,
            status=1  # Accepted
        )
        schedule_count += 1

print(f"✓ Created {schedule_count} work schedules")

print("\n" + "=" * 60)
print("POSTS, TASKS & SCHEDULES CREATED!")
print("=" * 60)
print(f"\nSummary:")
print(f"  - Posts: {len(posts)}")
print(f"  - Tasks: {len(tasks)}")
print(f"  - Meetings: {len(meetings_data)}")
print(f"  - Work Shifts: 4")
print(f"  - Work Schedules: {schedule_count}")
