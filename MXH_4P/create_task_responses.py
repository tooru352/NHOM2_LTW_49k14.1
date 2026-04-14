"""
Script to create sample task responses
Run: python create_task_responses.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Task, TaskResponse, User
from django.utils import timezone
from datetime import timedelta
import random

def create_task_responses():
    """Create sample task responses"""
    
    # Get all tasks
    tasks = Task.objects.all()[:10]
    
    if not tasks:
        print("No tasks found! Please create tasks first.")
        return
    
    # Clear existing responses
    TaskResponse.objects.all().delete()
    print("Cleared existing task responses")
    
    # Get all employees
    employees = list(User.objects.filter(groups__name='Employee'))
    
    if not employees:
        print("No employees found!")
        return
    
    responses_data = [
        {
            'status': True,
            'reason': 'Tôi sẽ hoàn thành nhiệm vụ này đúng giờ.'
        },
        {
            'status': True,
            'reason': 'Đã sẵn sàng nhận nhiệm vụ.'
        },
        {
            'status': True,
            'reason': 'OK, tôi sẽ chuẩn bị sẵn sàng.'
        },
        {
            'status': True,
            'reason': 'Đã sẵn sàng cho ca làm việc.'
        },
        {
            'status': False,
            'reason': 'Tôi đang có ca làm việc khác vào thời gian này.'
        },
        {
            'status': False,
            'reason': 'Xin nghỉ phép hôm nay vì lý do sức khỏe.'
        },
        {
            'status': True,
            'reason': 'Tôi sẽ hoàn thành tốt công việc này.'
        },
        {
            'status': True,
            'reason': 'Đồng ý, tôi sẽ làm ngay.'
        },
    ]
    
    created_count = 0
    
    for i, task in enumerate(tasks):
        # Random 1-2 responses per task
        num_responses = random.randint(1, 2)
        
        # Get random employees for this task
        task_employees = random.sample(employees, min(num_responses, len(employees)))
        
        for j, employee in enumerate(task_employees):
            response_data = random.choice(responses_data)
            
            # Create response
            TaskResponse.objects.create(
                task=task,
                user=employee,
                status=response_data['status'],
                reason=response_data['reason'],
                responded_at=timezone.now() - timedelta(minutes=random.randint(5, 300))
            )
            created_count += 1
            
            status_text = "Đồng ý" if response_data['status'] else "Từ chối"
            print(f"  [{status_text}] {task.title} - {employee.get_full_name() or employee.username}")
    
    print(f"\n✓ Created {created_count} task responses")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    total = TaskResponse.objects.count()
    accepted = TaskResponse.objects.filter(status=True).count()
    rejected = TaskResponse.objects.filter(status=False).count()
    
    print(f"\nTotal responses: {total}")
    print(f"Accepted: {accepted}")
    print(f"Rejected: {rejected}")

if __name__ == '__main__':
    print("Creating task responses...")
    create_task_responses()
    print("\nDone!")
