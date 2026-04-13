#!/usr/bin/env python
"""
Script to create sample posts in groups
"""
import os
import sys
import django
from datetime import timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from django.utils import timezone
from social_media_4P.models import User, Group, GroupMember, Post

def create_group_posts():
    """Create sample posts in groups"""
    
    print("🔄 Bắt đầu tạo bài viết mẫu trong nhóm...")
    
    # Get all groups
    groups = Group.objects.all()
    
    if not groups.exists():
        print("❌ Không tìm thấy nhóm nào. Chạy create_sample_groups.py trước!")
        return
    
    # Sample posts for each group
    posts_data = {
        'Bộ phận F&B': [
            'Thông báo: Thực đơn buffet sáng tuần này đã được cập nhật. Vui lòng kiểm tra và chuẩn bị nguyên liệu.',
            'Chúc mừng team F&B đã đạt 95% điểm hài lòng từ khách hàng tháng này! 🎉',
            'Nhắc nhở: Kiểm tra kho lạnh và báo cáo tình trạng nguyên liệu trước 5h chiều hôm nay.',
        ],
        'Bộ phận Housekeeping': [
            'Lịch vệ sinh tổng các phòng VIP đã được cập nhật. Vui lòng xem chi tiết trong file đính kèm.',
            'Cảm ơn team đã làm việc chăm chỉ! Tất cả phòng đã sẵn sàng cho đợt khách check-in chiều nay.',
            'Nhắc nhở: Kiểm tra và bổ sung đầy đủ amenities cho tất cả các phòng.',
        ],
        'Bộ phận Front Office': [
            'Thông báo: Có đoàn khách VIP 20 người check-in vào 14h chiều nay. Vui lòng chuẩn bị.',
            'Cập nhật: Hệ thống booking đã được nâng cấp. Vui lòng tham gia training session vào 9h sáng mai.',
            'Chúc mừng đội ngũ lễ tân đã xử lý xuất sắc tình huống khách hàng khó tính hôm qua! 👏',
        ],
        'Dự án Nâng cấp Khách sạn': [
            'Tiến độ dự án: Đã hoàn thành 60% công việc nâng cấp hệ thống điện. Dự kiến hoàn thành vào cuối tuần.',
            'Họp dự án: Thứ 5 tuần này lúc 10h sáng tại phòng họp tầng 3. Vui lòng chuẩn bị báo cáo tiến độ.',
            'Thông báo: Khu vực lobby sẽ tạm đóng cửa từ 22h-6h để thi công. Vui lòng thông báo khách.',
        ],
        'Đào tạo nhân viên mới': [
            'Lịch training tuần này: Thứ 2 - Customer Service, Thứ 4 - Safety & Security, Thứ 6 - Product Knowledge.',
            'Chúc mừng 5 nhân viên mới đã hoàn thành chương trình đào tạo cơ bản! 🎓',
            'Nhắc nhở: Nộp bài kiểm tra cuối khóa trước 17h thứ 6 tuần này.',
        ],
        'Sự kiện & Marketing': [
            'Kế hoạch sự kiện: Gala Dinner tháng 5 đã được phê duyệt. Bắt đầu chuẩn bị từ tuần sau.',
            'Chiến dịch marketing mùa hè: Đã đạt 10,000 lượt tương tác trên social media! 📈',
            'Họp team: Thứ 3 tuần này lúc 14h để brainstorm ý tưởng cho sự kiện cuối năm.',
        ],
    }
    
    created_count = 0
    
    for group in groups:
        # Get members of this group
        members = GroupMember.objects.filter(group=group).select_related('user')
        
        if not members.exists():
            print(f"⚠️  Nhóm '{group.name}' không có thành viên, bỏ qua")
            continue
        
        # Get posts for this group
        group_posts = posts_data.get(group.name, [])
        
        if not group_posts:
            print(f"⚠️  Không có bài viết mẫu cho nhóm '{group.name}'")
            continue
        
        # Create posts
        for i, content in enumerate(group_posts):
            # Rotate through members to post
            member = members[i % members.count()]
            
            # Create post with different timestamps
            created_at = timezone.now() - timedelta(hours=i*3, minutes=i*15)
            
            post = Post.objects.create(
                user=member.user,
                group=group,
                content=content,
                created_at=created_at
            )
            
            created_count += 1
            print(f"✅ Tạo bài viết trong '{group.name}' bởi {member.user.username}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 TỔNG KẾT")
    print("="*60)
    print(f"✅ Đã tạo {created_count} bài viết trong các nhóm")
    
    for group in groups:
        post_count = group.posts.count()
        print(f"   - {group.name}: {post_count} bài viết")
    
    print("\n🎉 Hoàn thành!")
    print("\n📝 Truy cập nhóm để xem bài viết:")
    print("   http://127.0.0.1:8000/nhom/")

if __name__ == '__main__':
    create_group_posts()
