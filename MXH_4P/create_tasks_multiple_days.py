"""
Script to create tasks for multiple days
Run: python create_tasks_multiple_days.py
"""

import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Task, TaskAssignment, User
from django.utils import timezone

# Get today and set work_date for existing tasks
today = timezone.now().date()

print(f"Setting work_date for existing tasks to {today}...")
Task.objects.all().update(work_date=today)
print(f"✓ Updated {Task.objects.count()} tasks")

print("\nDone!")
