#!/usr/bin/env python
"""
Script to update existing posts with scope
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Post, Group

def update_posts_scope():
    """Update existing posts with scope"""
    
    print("🔄 Cập nhật phạm vi cho bài viết hiện có...")
    
    # Get all posts
    posts = Post.objects.all()
    
    if not posts.exists():
        print("❌ Không có bài viết nào trong database")
        return
    
    updated_count = 0
    
    for post in posts:
        # Set scope to hotel by default
        post.scope = 'hotel'
        post.save()
        updated_count += 1
    
    print(f"✅ Đã cập nhật {updated_count} bài viết với phạm vi 'Toàn khách sạn'")
    
    print("\n🎉 Hoàn thành!")
    print("\n📝 Bây giờ bạn có thể:")
    print("   - Tạo bài viết mới với phạm vi tùy chọn")
    print("   - Chọn 'Toàn khách sạn' hoặc 'Theo nhóm'")
    print("   - Nếu chọn 'Theo nhóm', có thể chọn nhiều nhóm cùng lúc")

if __name__ == '__main__':
    update_posts_scope()
