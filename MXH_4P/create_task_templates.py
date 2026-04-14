"""
Script to create task templates from existing tasks
Run: python create_task_templates.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Task, TaskTemplate
from django.utils import timezone

print("Creating task templates from existing tasks...")

# Get today's tasks
today = timezone.now().date()
tasks = Task.objects.filter(work_date=today).order_by('department', 'shift', 'title')

# Clear existing templates
TaskTemplate.objects.all().delete()
print("Cleared existing templates")

# Create templates
created_count = 0
for order, task in enumerate(tasks):
    template = TaskTemplate.objects.create(
        title=task.title,
        description=task.description,
        department=task.department,
        shift=task.shift,
        start_time=task.start_time,
        end_time=task.end_time,
        order=order,
        is_active=True
    )
    created_count += 1
    print(f"  [{task.department}] {task.title} - Ca {task.shift}")

print(f"\n✓ Created {created_count} task templates")

# Print summary by department
print("\n" + "=" * 60)
print("SUMMARY BY DEPARTMENT")
print("=" * 60)

for dept in ['F&B', 'HK', 'FO']:
    dept_templates = TaskTemplate.objects.filter(department=dept)
    print(f"\n{dept} Department: {dept_templates.count()} templates")
    for template in dept_templates:
        print(f"  - {template.title} (Ca {template.shift})")

print("\nDone!")
