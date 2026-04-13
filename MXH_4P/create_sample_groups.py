#!/usr/bin/env python
"""
Script to create sample groups and group members for testing
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import User, Group, GroupMember
from django.contrib.auth.models import Group as AuthGroup

def create_sample_groups():
    """Create sample groups with members"""
    
    print("🔄 Bắt đầu tạo dữ liệu nhóm mẫu...")
    
    # Get managers and employees
    managers = User.objects.filter(groups__name='Manager')
    employees = User.objects.filter(groups__name='Employee')
    
    if not managers.exists():
        print("❌ Không tìm thấy Manager. Chạy create_groups.py trước!")
        return
    
    if not employees.exists():
        print("❌ Không tìm thấy Employee. Chạy create_sample_users.py trước!")
        return
    
    # Delete existing groups (except Django auth groups)
    Group.objects.all().delete()
    print("✅ Đã xóa dữ liệu nhóm cũ")
    
    # Sample groups data
    groups_data = [
        {
            'name': 'Bộ phận F&B',
            'description': 'Nhóm quản lý nhà hàng và bar',
            'manager': 'doanxuantoan',
            'members': ['vothikimhoa', 'phamxuanthuong', 'nguyennhatha', 'doanthianhth']
        },
        {
            'name': 'Bộ phận Housekeeping',
            'description': 'Nhóm quản lý vệ sinh và phòng',
            'manager': 'phamxuanthuong',
            'members': ['nguyendinhkhoa', 'nguyentruonggiang', 'tranvanminh', 'lethilan']
        },
        {
            'name': 'Bộ phận Front Office',
            'description': 'Nhóm lễ tân và tiếp khách',
            'manager': 'doanxuantoan',
            'members': ['vothikimhoa', 'doanthianhth', 'lethilan', 'nguyennhatha']
        },
        {
            'name': 'Dự án Nâng cấp Khách sạn',
            'description': 'Nhóm làm việc cho dự án nâng cấp cơ sở vật chất',
            'manager': 'doanxuantoan',
            'members': ['phamxuanthuong', 'vothikimhoa', 'nguyendinhkhoa', 'tranvanminh']
        },
        {
            'name': 'Đào tạo nhân viên mới',
            'description': 'Nhóm hướng dẫn và đào tạo nhân viên mới',
            'manager': 'phamxuanthuong',
            'members': ['vothikimhoa', 'doanthianhth', 'lethilan']
        },
        {
            'name': 'Sự kiện & Marketing',
            'description': 'Nhóm tổ chức sự kiện và marketing',
            'manager': 'doanxuantoan',
            'members': ['nguyennhatha', 'nguyentruonggiang', 'lethilan', 'vothikimhoa']
        },
    ]
    
    created_groups = []
    
    for group_data in groups_data:
        try:
            # Get manager user
            manager = User.objects.get(username=group_data['manager'])
            
            # Create group
            group = Group.objects.create(
                name=group_data['name'],
                description=group_data['description'],
                created_by=manager,
                status='group'
            )
            
            # Add manager as member
            GroupMember.objects.create(
                group=group,
                user=manager
            )
            
            # Add other members
            for username in group_data['members']:
                try:
                    user = User.objects.get(username=username)
                    GroupMember.objects.create(
                        group=group,
                        user=user
                    )
                except User.DoesNotExist:
                    print(f"⚠️  User {username} không tồn tại, bỏ qua")
                except Exception as e:
                    print(f"⚠️  Lỗi khi thêm {username} vào nhóm: {e}")
            
            member_count = group.members.count()
            created_groups.append(group)
            print(f"✅ Tạo nhóm: {group.name} ({member_count} thành viên)")
            
        except User.DoesNotExist:
            print(f"❌ Manager {group_data['manager']} không tồn tại")
        except Exception as e:
            print(f"❌ Lỗi khi tạo nhóm {group_data['name']}: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 TỔNG KẾT")
    print("="*60)
    print(f"✅ Đã tạo {len(created_groups)} nhóm")
    
    for group in created_groups:
        member_count = group.members.count()
        print(f"   - {group.name}: {member_count} thành viên")
    
    total_members = GroupMember.objects.count()
    print(f"\n✅ Tổng số thành viên trong tất cả nhóm: {total_members}")
    
    print("\n🎉 Hoàn thành!")
    print("\n📝 Truy cập: http://127.0.0.1:8000/nhom/")
    print("   - Xem danh sách nhóm")
    print("   - Tạo nhóm mới")
    print("   - Thêm/xóa thành viên")

if __name__ == '__main__':
    create_sample_groups()
