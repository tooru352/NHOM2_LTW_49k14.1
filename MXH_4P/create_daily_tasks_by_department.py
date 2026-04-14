"""
Script to create daily tasks by department (F&B, HK, FO)
Tasks are organized by date and department
Run: python create_daily_tasks_by_department.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Task, TaskAssignment, User
from django.contrib.auth.models import Group
from datetime import datetime, timedelta
from django.utils import timezone

def create_daily_tasks():
    """Create tasks organized by department and date"""
    
    # Get managers
    managers = {
        'F&B': User.objects.get(username='doanxuantoan'),
        'HK': User.objects.get(username='phamxuanthuong'),
        'FO': User.objects.get(username='nguyennhatha'),
    }
    
    # Get employees by department
    fb_employees = list(User.objects.filter(username__in=[
        'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
        'tranvantuan', 'dangthiyen', 'vothixuan'
    ]))
    
    hk_employees = list(User.objects.filter(username__in=[
        'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
        'phanvanthang', 'tathivan', 'buithinga'
    ]))
    
    fo_employees = list(User.objects.filter(username__in=[
        'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
        'luuvanphong', 'hoangvanquan', 'lyvanhai'
    ]))
    
    print(f"F&B employees: {len(fb_employees)}")
    print(f"HK employees: {len(hk_employees)}")
    print(f"FO employees: {len(fo_employees)}")
    
    # Clear existing tasks and assignments
    Task.objects.all().delete()
    print("Cleared existing tasks")
    
    # Today's date
    today = timezone.now().date()
    
    # ============================================
    # F&B DEPARTMENT TASKS - Ngày hôm nay
    # ============================================
    print("\n=== Creating F&B Department Tasks ===")
    
    fb_tasks = [
        {
            'title': 'Chuẩn bị buffet sáng',
            'description': 'Chuẩn bị buffet sáng cho 80 khách: Phở, bánh mì, trứng, salad, trái cây, nước ép',
            'created_by': managers['F&B'],
            'assigned_to': fb_employees[0],
            'status': 'Done',
            'shift': 'Sáng',
            'department': 'F&B',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [fb_employees[0], fb_employees[1], fb_employees[2]]
        },
        {
            'title': 'Phục vụ bữa trưa nhà hàng',
            'description': 'Phục vụ bữa trưa à la carte, dự kiến 50 khách. Menu: Bò bít tết, Cá hồi nướng, Mì Ý',
            'created_by': managers['F&B'],
            'assigned_to': fb_employees[1],
            'status': 'InProgress',
            'shift': 'Chiều',
            'department': 'F&B',
            'start_time': '14:00',
            'end_time': '22:00',
            'employees': [fb_employees[1], fb_employees[3], fb_employees[4]]
        },
        {
            'title': 'Kiểm tra kho nguyên liệu',
            'description': 'Kiểm tra số lượng thịt, cá, rau củ. Lập danh sách đặt hàng cho ngày mai',
            'created_by': managers['F&B'],
            'assigned_to': fb_employees[2],
            'status': 'InProgress',
            'shift': 'Sáng',
            'department': 'F&B',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [fb_employees[2], fb_employees[5]]
        },
        {
            'title': 'Chuẩn bị tiệc cocktail tối',
            'description': 'Tiệc cocktail 40 khách lúc 19h. Chuẩn bị finger food, đồ uống, trang trí',
            'created_by': managers['F&B'],
            'assigned_to': fb_employees[0],
            'status': 'Todo',
            'shift': 'Tối',
            'department': 'F&B',
            'start_time': '22:00',
            'end_time': '06:00',
            'employees': [fb_employees[0], fb_employees[1], fb_employees[5]]
        },
        {
            'title': 'Vệ sinh bếp và khu vực F&B',
            'description': 'Vệ sinh tổng thể bếp, nhà hàng, bar sau ca làm việc',
            'created_by': managers['F&B'],
            'assigned_to': fb_employees[3],
            'status': 'Todo',
            'shift': 'Tối',
            'department': 'F&B',
            'start_time': '22:00',
            'end_time': '06:00',
            'employees': [fb_employees[3], fb_employees[4]]
        },
    ]
    
    # ============================================
    # HOUSEKEEPING DEPARTMENT TASKS - Ngày hôm nay
    # ============================================
    print("\n=== Creating Housekeeping Department Tasks ===")
    
    hk_tasks = [
        {
            'title': 'Dọn phòng check-out sáng',
            'description': 'Dọn 15 phòng check-out: 301-315. Thay khăn, ga giường, vệ sinh phòng tắm, kiểm tra minibar',
            'created_by': managers['HK'],
            'assigned_to': hk_employees[0],
            'status': 'Done',
            'shift': 'Sáng',
            'department': 'HK',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [hk_employees[0], hk_employees[1], hk_employees[2]]
        },
        {
            'title': 'Chuẩn bị phòng VIP',
            'description': 'Chuẩn bị 5 phòng VIP tầng 10 cho khách VIP check-in lúc 14h. Trang trí hoa, trái cây',
            'created_by': managers['HK'],
            'assigned_to': hk_employees[1],
            'status': 'InProgress',
            'shift': 'Chiều',
            'department': 'HK',
            'start_time': '14:00',
            'end_time': '22:00',
            'employees': [hk_employees[1], hk_employees[3]]
        },
        {
            'title': 'Giặt là và ủi đồ',
            'description': 'Giặt 200kg khăn, ga giường. Ủi đồng phục nhân viên',
            'created_by': managers['HK'],
            'assigned_to': hk_employees[2],
            'status': 'InProgress',
            'shift': 'Cả ngày',
            'department': 'HK',
            'start_time': '08:00',
            'end_time': '17:00',
            'employees': [hk_employees[2], hk_employees[4]]
        },
        {
            'title': 'Kiểm tra và bổ sung đồ dùng',
            'description': 'Kiểm tra minibar, amenities, đồ dùng phòng tắm tất cả các phòng. Bổ sung nếu thiếu',
            'created_by': managers['HK'],
            'assigned_to': hk_employees[3],
            'status': 'Todo',
            'shift': 'Chiều',
            'department': 'HK',
            'start_time': '14:00',
            'end_time': '22:00',
            'employees': [hk_employees[3], hk_employees[5], hk_employees[6]]
        },
        {
            'title': 'Vệ sinh khu vực công cộng',
            'description': 'Vệ sinh lobby, hành lang, thang máy, khu vực bể bơi',
            'created_by': managers['HK'],
            'assigned_to': hk_employees[4],
            'status': 'Todo',
            'shift': 'Sáng',
            'department': 'HK',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [hk_employees[4], hk_employees[5]]
        },
    ]
    
    # ============================================
    # FRONT OFFICE DEPARTMENT TASKS - Ngày hôm nay
    # ============================================
    print("\n=== Creating Front Office Department Tasks ===")
    
    fo_tasks = [
        {
            'title': 'Xử lý check-in sáng',
            'description': 'Check-in 20 phòng từ 6h-12h. Xác nhận booking, thu tiền, giao chìa khóa',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[0],
            'status': 'Done',
            'shift': 'Sáng',
            'department': 'FO',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [fo_employees[0], fo_employees[1]]
        },
        {
            'title': 'Xử lý check-out',
            'description': 'Check-out 15 phòng. Kiểm tra minibar, thanh toán, gửi email cảm ơn',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[1],
            'status': 'Done',
            'shift': 'Sáng',
            'department': 'FO',
            'start_time': '06:00',
            'end_time': '14:00',
            'employees': [fo_employees[1], fo_employees[2]]
        },
        {
            'title': 'Xử lý booking online',
            'description': 'Xác nhận 25 booking mới từ website, Booking.com, Agoda. Gửi email xác nhận',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[2],
            'status': 'InProgress',
            'shift': 'Cả ngày',
            'department': 'FO',
            'start_time': '08:00',
            'end_time': '17:00',
            'employees': [fo_employees[2], fo_employees[3]]
        },
        {
            'title': 'Đón đoàn khách Nhật Bản',
            'description': 'Đón đoàn 30 khách Nhật lúc 15h. Chuẩn bị tài liệu tiếng Nhật, welcome drink',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[3],
            'status': 'Todo',
            'shift': 'Chiều',
            'department': 'FO',
            'start_time': '14:00',
            'end_time': '22:00',
            'employees': [fo_employees[3], fo_employees[4], fo_employees[5]]
        },
        {
            'title': 'Cập nhật báo cáo cuối ngày',
            'description': 'Cập nhật báo cáo: Số phòng bán, doanh thu, tỷ lệ lấp đầy, khách hàng VIP',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[4],
            'status': 'Todo',
            'shift': 'Tối',
            'department': 'FO',
            'start_time': '22:00',
            'end_time': '06:00',
            'employees': [fo_employees[4]]
        },
        {
            'title': 'Xử lý yêu cầu khách hàng',
            'description': 'Xử lý 10 yêu cầu: Đổi phòng, late check-out, early check-in, đặt tour',
            'created_by': managers['FO'],
            'assigned_to': fo_employees[5],
            'status': 'InProgress',
            'shift': 'Chiều',
            'department': 'FO',
            'start_time': '14:00',
            'end_time': '22:00',
            'employees': [fo_employees[5], fo_employees[6]]
        },
    ]
    
    # Create all tasks
    all_tasks_data = fb_tasks + hk_tasks + fo_tasks
    created_count = 0
    
    from datetime import datetime
    
    for task_data in all_tasks_data:
        employees = task_data.pop('employees')
        shift = task_data.pop('shift', 'Sáng')
        department = task_data.pop('department', None)
        start_time_str = task_data.pop('start_time', None)
        end_time_str = task_data.pop('end_time', None)
        
        # Convert time strings to time objects
        start_time_obj = None
        end_time_obj = None
        if start_time_str:
            start_time_obj = datetime.strptime(start_time_str, '%H:%M').time()
        if end_time_str:
            end_time_obj = datetime.strptime(end_time_str, '%H:%M').time()
        
        # Create task
        task = Task.objects.create(
            **task_data,
            shift=shift,
            department=department,
            start_time=start_time_obj,
            end_time=end_time_obj
        )
        
        # Create assignments for all employees
        for emp in employees:
            TaskAssignment.objects.create(
                task=task,
                user=emp
            )
        
        created_count += 1
        
        # Print task info
        dept = 'F&B' if task.created_by == managers['F&B'] else 'HK' if task.created_by == managers['HK'] else 'FO'
        emp_names = ', '.join([e.get_full_name() or e.username for e in employees])
        time_display = f"{start_time_str}-{end_time_str}" if start_time_str and end_time_str else ""
        print(f"  [{dept}] {task.title} - Ca {shift} {time_display} - {emp_names} ({task.status})")
    
    print(f"\n✓ Created {created_count} tasks with assignments")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY BY DEPARTMENT")
    print("=" * 60)
    
    for dept_name, manager in managers.items():
        dept_tasks = Task.objects.filter(created_by=manager)
        todo = dept_tasks.filter(status='Todo').count()
        in_progress = dept_tasks.filter(status='InProgress').count()
        done = dept_tasks.filter(status='Done').count()
        
        print(f"\n{dept_name} Department:")
        print(f"  Total: {dept_tasks.count()} tasks")
        print(f"  Todo: {todo}")
        print(f"  In Progress: {in_progress}")
        print(f"  Done: {done}")

if __name__ == '__main__':
    print("Creating daily tasks by department...")
    print("Date: Today")
    create_daily_tasks()
    print("\nDone!")
