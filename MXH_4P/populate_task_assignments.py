"""
Script to populate TaskAssignment data for existing tasks
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Task, TaskAssignment, User
from django.contrib.auth.models import Group

def populate_task_assignments():
    """Add multiple employees to existing tasks"""
    
    # Get all employees
    employee_group = Group.objects.get(name='Employee')
    employees = list(User.objects.filter(groups=employee_group))
    
    if not employees:
        print("No employees found!")
        return
    
    # Get all tasks
    tasks = Task.objects.all()
    
    if not tasks:
        print("No tasks found!")
        return
    
    print(f"Found {tasks.count()} tasks and {len(employees)} employees")
    
    # Clear existing assignments
    TaskAssignment.objects.all().delete()
    print("Cleared existing task assignments")
    
    # Add assignments for each task
    assignments_created = 0
    
    for task in tasks:
        # Add the originally assigned employee
        if task.assigned_to:
            TaskAssignment.objects.get_or_create(
                task=task,
                user=task.assigned_to
            )
            assignments_created += 1
        
        # Add 1-2 more random employees to some tasks
        import random
        num_additional = random.randint(0, 2)
        
        # Get employees not already assigned
        already_assigned = [task.assigned_to.id] if task.assigned_to else []
        available = [e for e in employees if e.id not in already_assigned]
        
        if available and num_additional > 0:
            additional_employees = random.sample(available, min(num_additional, len(available)))
            for emp in additional_employees:
                TaskAssignment.objects.get_or_create(
                    task=task,
                    user=emp
                )
                assignments_created += 1
    
    print(f"Created {assignments_created} task assignments")
    
    # Display summary
    print("\nTask Assignments Summary:")
    for task in tasks:
        assigned_users = [a.user.get_full_name() or a.user.username for a in task.assignments.all()]
        print(f"  {task.title}: {', '.join(assigned_users) if assigned_users else 'No assignments'}")

if __name__ == '__main__':
    print("Populating task assignments...")
    populate_task_assignments()
    print("Done!")
