"""
Script to create complete hotel data for MXH_4P
Run: python create_hotel_data.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group as DjangoGroup
from social_media_4P.models import *
from datetime import datetime, date, time, timedelta
from django.utils import timezone

User = get_user_model()

print("=" * 60)
print("CREATING HOTEL DATA - MXH_4P")
print("=" * 60)

# ============================================
# 1. CREATE DJANGO GROUPS (for roles)
# ============================================
print("\n1. Creating Django Groups...")
manager_group, _ = DjangoGroup.objects.get_or_create(name='Manager')
employee_group, _ = DjangoGroup.objects.get_or_create(name='Employee')
print("✓ Created Manager and Employee groups")

# ============================================
# 2. CREATE USERS
# ============================================
print("\n2. Creating Users...")

# ADMIN
admin = User.objects.create_user(
    username='admin',
    email='admin@hotel.com',
    password='admin123',
    first_name='Admin',
    last_name='System',
    is_staff=True,
    is_superuser=True,
    avatar_initials='AD',
    avatar_gradient='linear-gradient(135deg, #667eea, #764ba2)'
)
admin.groups.add(manager_group)
print("✓ Created admin")

# MANAGERS
managers_data = [
    ('doanxuantoan', 'Đoàn Xuân', 'Toàn', 'toan@hotel.com', 'DT', '#FF6B6B', 'F&B'),
    ('phamxuanthuong', 'Phạm Xuân', 'Thương', 'thuong@hotel.com', 'PT', '#4ECDC4', 'HK'),
    ('nguyennhatha', 'Nguyễn Nhật', 'Hạ', 'ha@hotel.com', 'NH', '#45B7D1', 'FO'),
]

managers = {}
for username, first, last, email, initials, color, dept in managers_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=f'{username}123',
        first_name=first,
        last_name=last,
        avatar_initials=initials,
        avatar_gradient=f'linear-gradient(135deg, {color}, {color}AA)'
    )
    user.groups.add(manager_group)
    managers[dept] = user
    print(f"✓ Created manager: {first} {last} ({dept})")

# EMPLOYEES - Given names
given_employees_data = [
    ('vothikimhoa', 'Võ Thị Kim', 'Hoa', 'hoa@hotel.com', 'VH', '#E74C3C', 'F&B'),
    ('doanthianhth', 'Đoàn Thị Anh', 'Thư', 'thu@hotel.com', 'DT', '#3498DB', 'F&B'),
    ('nguyendinhkhoa', 'Nguyễn Đình', 'Khoa', 'khoa@hotel.com', 'NK', '#2ECC71', 'HK'),
    ('nguyentruonggiang', 'Nguyễn Trường', 'Giang', 'giang@hotel.com', 'NG', '#F39C12', 'HK'),
]

employees = {'F&B': [], 'HK': [], 'FO': []}
for username, first, last, email, initials, color, dept in given_employees_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=f'{username}123',
        first_name=first,
        last_name=last,
        avatar_initials=initials,
        avatar_gradient=f'linear-gradient(135deg, {color}, {color}AA)'
    )
    user.groups.add(employee_group)
    employees[dept].append(user)
    print(f"✓ Created employee: {first} {last} ({dept})")

# ADDITIONAL EMPLOYEES - F&B (6 more to make 10 total)
fb_employees_data = [
    ('tranvanminh', 'Trần Văn', 'Minh', 'minh.fb@hotel.com', 'TM', '#9B59B6'),
    ('lethilan', 'Lê Thị', 'Lan', 'lan.fb@hotel.com', 'LL', '#1ABC9C'),
    ('nguyenhoangnam', 'Nguyễn Hoàng', 'Nam', 'nam.fb@hotel.com', 'NH', '#E67E22'),
    ('phamthihuong', 'Phạm Thị', 'Hương', 'huong.fb@hotel.com', 'PH', '#34495E'),
    ('hoangvanduc', 'Hoàng Văn', 'Đức', 'duc.fb@hotel.com', 'HD', '#16A085'),
    ('vuthimai', 'Vũ Thị', 'Mai', 'mai.fb@hotel.com', 'VM', '#C0392B'),
    ('dangquocbao', 'Đặng Quốc', 'Bảo', 'bao.fb@hotel.com', 'DB', '#2980B9'),
    ('buithinga', 'Bùi Thị', 'Nga', 'nga.fb@hotel.com', 'BN', '#8E44AD'),
    ('lyvanhai', 'Lý Văn', 'Hải', 'hai.fb@hotel.com', 'LH', '#27AE60'),
    ('truongthilinh', 'Trương Thị', 'Linh', 'linh.fb@hotel.com', 'TL', '#D35400'),
]

for username, first, last, email, initials, color in fb_employees_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=f'{username}123',
        first_name=first,
        last_name=last,
        avatar_initials=initials,
        avatar_gradient=f'linear-gradient(135deg, {color}, {color}AA)'
    )
    user.groups.add(employee_group)
    employees['F&B'].append(user)

print(f"✓ Created {len(fb_employees_data)} additional F&B employees")

# ADDITIONAL EMPLOYEES - HK (8 more to make 10 total)
hk_employees_data = [
    ('ngovantung', 'Ngô Văn', 'Tùng', 'tung.hk@hotel.com', 'NT', '#E74C3C'),
    ('phanthiha', 'Phan Thị', 'Hà', 'ha.hk@hotel.com', 'PH', '#3498DB'),
    ('dinhvanlong', 'Đinh Văn', 'Long', 'long.hk@hotel.com', 'DL', '#2ECC71'),
    ('maithithu', 'Mai Thị', 'Thu', 'thu.hk@hotel.com', 'MT', '#F39C12'),
    ('luuvanphong', 'Lưu Văn', 'Phong', 'phong.hk@hotel.com', 'LP', '#9B59B6'),
    ('dothihong', 'Đỗ Thị', 'Hồng', 'hong.hk@hotel.com', 'DH', '#1ABC9C'),
    ('caovanson', 'Cao Văn', 'Sơn', 'son.hk@hotel.com', 'CS', '#E67E22'),
    ('tathivan', 'Tạ Thị', 'Vân', 'van.hk@hotel.com', 'TV', '#34495E'),
    ('hovankien', 'Hồ Văn', 'Kiên', 'kien.hk@hotel.com', 'HK', '#16A085'),
    ('vothixuan', 'Võ Thị', 'Xuân', 'xuan.hk@hotel.com', 'VX', '#C0392B'),
]

for username, first, last, email, initials, color in hk_employees_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=f'{username}123',
        first_name=first,
        last_name=last,
        avatar_initials=initials,
        avatar_gradient=f'linear-gradient(135deg, {color}, {color}AA)'
    )
    user.groups.add(employee_group)
    employees['HK'].append(user)

print(f"✓ Created {len(hk_employees_data)} additional HK employees")

# ADDITIONAL EMPLOYEES - FO (10 employees)
fo_employees_data = [
    ('lamvandat', 'Lâm Văn', 'Đạt', 'dat.fo@hotel.com', 'LD', '#2980B9'),
    ('trinhthingoc', 'Trịnh Thị', 'Ngọc', 'ngoc.fo@hotel.com', 'TN', '#8E44AD'),
    ('duongvanhung', 'Dương Văn', 'Hùng', 'hung.fo@hotel.com', 'DH', '#27AE60'),
    ('lethiphuong', 'Lê Thị', 'Phương', 'phuong.fo@hotel.com', 'LP', '#D35400'),
    ('phanvanthang', 'Phan Văn', 'Thắng', 'thang.fo@hotel.com', 'PT', '#E74C3C'),
    ('nguyenthidung', 'Nguyễn Thị', 'Dung', 'dung.fo@hotel.com', 'ND', '#3498DB'),
    ('hoangvanquan', 'Hoàng Văn', 'Quân', 'quan.fo@hotel.com', 'HQ', '#2ECC71'),
    ('buithitrang', 'Bùi Thị', 'Trang', 'trang.fo@hotel.com', 'BT', '#F39C12'),
    ('tranvantu', 'Trần Văn', 'Tuấn', 'tuan.fo@hotel.com', 'TT', '#9B59B6'),
    ('dangthiyen', 'Đặng Thị', 'Yến', 'yen.fo@hotel.com', 'DY', '#1ABC9C'),
]

for username, first, last, email, initials, color in fo_employees_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=f'{username}123',
        first_name=first,
        last_name=last,
        avatar_initials=initials,
        avatar_gradient=f'linear-gradient(135deg, {color}, {color}AA)'
    )
    user.groups.add(employee_group)
    employees['FO'].append(user)

print(f"✓ Created {len(fo_employees_data)} FO employees")

print(f"\nTotal users created:")
print(f"  - Managers: 3")
print(f"  - F&B Employees: {len(employees['F&B'])}")
print(f"  - HK Employees: {len(employees['HK'])}")
print(f"  - FO Employees: {len(employees['FO'])}")

# ============================================
# 3. CREATE INTERACTION TYPES
# ============================================
print("\n3. Creating Interaction Types...")
reaction_type, _ = InteractionType.objects.get_or_create(name='reaction')
comment_type, _ = InteractionType.objects.get_or_create(name='comment')
share_type, _ = InteractionType.objects.get_or_create(name='share')
print("✓ Created interaction types")

# ============================================
# 4. CREATE GROUPS (DEPARTMENTS)
# ============================================
print("\n4. Creating Department Groups...")

fb_group = Group.objects.create(
    name='Bộ phận F&B',
    description='Food & Beverage Department - Phục vụ ăn uống',
    created_by=managers['F&B'],
    status='group'
)

hk_group = Group.objects.create(
    name='Bộ phận HK',
    description='Housekeeping Department - Buồng phòng',
    created_by=managers['HK'],
    status='group'
)

fo_group = Group.objects.create(
    name='Bộ phận FO',
    description='Front Office Department - Lễ tân',
    created_by=managers['FO'],
    status='group'
)

print("✓ Created 3 department groups")

# ============================================
# 5. ADD GROUP MEMBERS
# ============================================
print("\n5. Adding Group Members...")

# F&B Group
GroupMember.objects.create(group=fb_group, user=managers['F&B'])
for emp in employees['F&B']:
    GroupMember.objects.create(group=fb_group, user=emp)

# HK Group
GroupMember.objects.create(group=hk_group, user=managers['HK'])
for emp in employees['HK']:
    GroupMember.objects.create(group=hk_group, user=emp)

# FO Group
GroupMember.objects.create(group=fo_group, user=managers['FO'])
for emp in employees['FO']:
    GroupMember.objects.create(group=fo_group, user=emp)

print(f"✓ Added members to all groups")

print("\n" + "=" * 60)
print("DATA CREATION COMPLETED!")
print("=" * 60)
print("\nLogin credentials:")
print("  Admin: admin / admin123")
print("  Managers: {username} / {username}123")
print("  Employees: {username} / {username}123")
print("\nExample:")
print("  doanxuantoan / doanxuantoan123")
print("  vothikimhoa / vothikimhoa123")
