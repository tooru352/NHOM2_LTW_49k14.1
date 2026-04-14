import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import User, Meeting, MeetingParticipant
from django.utils import timezone
from datetime import datetime, timedelta

# Get managers
managers = User.objects.filter(groups__name='Manager')

if not managers.exists():
    print("Không tìm thấy manager nào!")
    exit()

# Clear existing meetings
Meeting.objects.all().delete()
print("Đã xóa tất cả meetings cũ")

# Sample meetings data
meetings_data = [
    {
        'title': 'Họp ban giám đốc',
        'description': 'Cuộc họp nhằm đánh giá kết quả làm việc của nhân sự trong tháng 2, thảo luận các vấn đề tài, đề xuất phương án cải thiện xuất hiệu suất công việc và kế hoạch phát triển nhân sự trong tháng tiếp theo.',
        'location': 'Ban giám đốc',
        'start_time': timezone.now().replace(hour=8, minute=0, second=0, microsecond=0),
        'end_time': timezone.now().replace(hour=10, minute=0, second=0, microsecond=0),
        'status': 'Completed',
    },
    {
        'title': 'Đào tạo quy trình check-in mới',
        'description': 'Hướng dẫn quy trình check-in mới cho nhân viên lễ tân',
        'location': 'Phòng họp tầng 3',
        'start_time': timezone.now().replace(hour=14, minute=0, second=0, microsecond=0),
        'end_time': timezone.now().replace(hour=16, minute=0, second=0, microsecond=0),
        'status': 'Upcoming',
    },
    {
        'title': 'Review báo cáo tài chính Q1',
        'description': 'Xem xét và phê duyệt báo cáo tài chính quý 1',
        'location': 'Phòng họp Khối 4',
        'start_time': timezone.now().replace(hour=9, minute=0, second=0, microsecond=0),
        'end_time': timezone.now().replace(hour=11, minute=0, second=0, microsecond=0),
        'status': 'Completed',
    },
    {
        'title': 'Họp menu mới cho mùa xuân',
        'description': 'Thảo luận và quyết định menu mới cho mùa xuân',
        'location': 'Nhà hàng tầng 1',
        'start_time': timezone.now().replace(hour=15, minute=0, second=0, microsecond=0),
        'end_time': timezone.now().replace(hour=17, minute=0, second=0, microsecond=0),
        'status': 'Upcoming',
    },
    {
        'title': 'Họp kế hoạch marketing tháng 4',
        'description': 'Lên kế hoạch marketing và khuyến mãi cho tháng 4',
        'location': 'Phòng Marketing',
        'start_time': (timezone.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0),
        'end_time': (timezone.now() + timedelta(days=1)).replace(hour=12, minute=0, second=0, microsecond=0),
        'status': 'Upcoming',
    },
    {
        'title': 'Đánh giá chất lượng dịch vụ',
        'description': 'Họp đánh giá chất lượng dịch vụ và phản hồi từ khách hàng',
        'location': 'Phòng họp tầng 2',
        'start_time': (timezone.now() + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0),
        'end_time': (timezone.now() + timedelta(days=2)).replace(hour=16, minute=0, second=0, microsecond=0),
        'status': 'Upcoming',
    },
    {
        'title': 'Training an toàn lao động',
        'description': 'Đào tạo về an toàn lao động cho toàn bộ nhân viên',
        'location': 'Hội trường',
        'start_time': (timezone.now() + timedelta(days=3)).replace(hour=9, minute=0, second=0, microsecond=0),
        'end_time': (timezone.now() + timedelta(days=3)).replace(hour=11, minute=0, second=0, microsecond=0),
        'status': 'Upcoming',
    },
]

# Create meetings
created_count = 0
for data in meetings_data:
    manager = managers[created_count % managers.count()]
    
    meeting = Meeting.objects.create(
        title=data['title'],
        description=data['description'],
        location=data['location'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        created_by=manager,
        status=data['status']
    )
    
    # Add some participants
    employees = User.objects.filter(groups__name='Employee')[:3]
    for emp in employees:
        MeetingParticipant.objects.create(
            meeting=meeting,
            user=emp
        )
    
    created_count += 1
    print(f"✓ Đã tạo meeting: {meeting.title}")

print(f"\n✅ Đã tạo {created_count} meetings thành công!")
print(f"📊 Tổng số meetings trong database: {Meeting.objects.count()}")
print(f"👥 Tổng số participants: {MeetingParticipant.objects.count()}")
