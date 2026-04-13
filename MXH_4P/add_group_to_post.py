#!/usr/bin/env python
"""
Script to add group field to Post model via migration
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

print("📝 Tạo migration để thêm field 'group' vào Post model...")
print("\nChạy lệnh sau:")
print("python manage.py makemigrations")
print("python manage.py migrate")
print("\nHoặc chỉnh sửa trực tiếp models.py:")
print("Thêm dòng sau vào Post model:")
print("    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='posts', blank=True, null=True)")
