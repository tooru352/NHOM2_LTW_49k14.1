from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import WorkSchedule, WorkShift, User

@login_required
@require_http_methods(["POST"])
def update_schedule_status(request, schedule_id):
    """API endpoint to update work schedule status"""
    try:
        # Get the schedule
        schedule = WorkSchedule.objects.get(id=schedule_id)
        
        # Check if the user owns this schedule
        if schedule.user != request.user:
            return JsonResponse({
                'success': False,
                'error': 'Bạn không có quyền cập nhật lịch này'
            }, status=403)
        
        # Parse request body
        data = json.loads(request.body)
        status = data.get('status')
        employee_note = data.get('employee_note', '')
        
        # Validate status
        if status not in [0, 1, 2]:
            return JsonResponse({
                'success': False,
                'error': 'Trạng thái không hợp lệ'
            }, status=400)
        
        # Update schedule
        schedule.status = status
        if employee_note:
            schedule.employee_note = employee_note
        schedule.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Đã cập nhật trạng thái thành công',
            'schedule': {
                'id': schedule.id,
                'status': schedule.status,
                'employee_note': schedule.employee_note
            }
        })
        
    except WorkSchedule.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Không tìm thấy lịch làm việc'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Dữ liệu không hợp lệ'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def update_schedule(request, schedule_id):
    """API endpoint for manager to update work schedule"""
    try:
        # Check if user is manager
        if not request.user.is_manager():
            return JsonResponse({
                'success': False,
                'error': 'Chỉ quản lý mới có quyền chỉnh sửa lịch'
            }, status=403)
        
        # Get the schedule
        schedule = WorkSchedule.objects.get(id=schedule_id)
        
        # Parse request body
        data = json.loads(request.body)
        shift_code = data.get('shift_code')
        
        if not shift_code:
            return JsonResponse({
                'success': False,
                'error': 'Thiếu mã ca làm việc'
            }, status=400)
        
        # Get shift
        shift = WorkShift.objects.filter(shift_code=shift_code).first()
        if not shift:
            return JsonResponse({
                'success': False,
                'error': 'Không tìm thấy ca làm việc'
            }, status=404)
        
        # Update schedule
        schedule.shift_code = shift
        schedule.status = 0  # Reset to pending
        schedule.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Đã cập nhật lịch làm việc'
        })
        
    except WorkSchedule.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Không tìm thấy lịch làm việc'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def delete_schedule(request, schedule_id):
    """API endpoint for manager to delete work schedule"""
    try:
        # Check if user is manager
        if not request.user.is_manager():
            return JsonResponse({
                'success': False,
                'error': 'Chỉ quản lý mới có quyền xóa lịch'
            }, status=403)
        
        # Get and delete the schedule
        schedule = WorkSchedule.objects.get(id=schedule_id)
        schedule.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Đã xóa lịch làm việc'
        })
        
    except WorkSchedule.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Không tìm thấy lịch làm việc'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def batch_update_schedules(request):
    """API endpoint for manager to batch update/create work schedules"""
    try:
        # Check if user is manager
        if not request.user.is_manager():
            return JsonResponse({
                'success': False,
                'error': 'Chỉ quản lý mới có quyền chỉnh sửa lịch'
            }, status=403)
        
        # Parse request body
        data = json.loads(request.body)
        updates = data.get('updates', [])
        
        if not updates:
            return JsonResponse({
                'success': False,
                'error': 'Không có thay đổi nào'
            }, status=400)
        
        from datetime import datetime
        updated_count = 0
        created_count = 0
        deleted_count = 0
        
        for update in updates:
            user_id = update.get('user_id')
            work_date_str = update.get('work_date')
            schedule_id = update.get('schedule_id')
            shift_code = update.get('shift_code')
            week_start_str = update.get('week_start')
            
            if not all([user_id, work_date_str, week_start_str]):
                continue
            
            user = User.objects.get(id=user_id)
            work_date = datetime.strptime(work_date_str, '%Y-%m-%d').date()
            week_start = datetime.strptime(week_start_str, '%Y-%m-%d').date()
            
            # If shift_code is empty, delete the schedule
            if not shift_code or shift_code == '':
                if schedule_id:
                    try:
                        schedule = WorkSchedule.objects.get(id=schedule_id)
                        schedule.delete()
                        deleted_count += 1
                    except WorkSchedule.DoesNotExist:
                        pass
                continue
            
            # Get shift
            shift = WorkShift.objects.filter(shift_code=shift_code).first()
            if not shift:
                continue
            
            # Update existing or create new
            if schedule_id:
                # Update existing schedule
                try:
                    schedule = WorkSchedule.objects.get(id=schedule_id)
                    schedule.shift_code = shift
                    schedule.status = 0  # Reset to pending
                    schedule.save()
                    updated_count += 1
                except WorkSchedule.DoesNotExist:
                    # Schedule was deleted, create new one
                    WorkSchedule.objects.create(
                        user=user,
                        shift_code=shift,
                        work_date=work_date,
                        week_start=week_start,
                        status=0
                    )
                    created_count += 1
            else:
                # Create new schedule
                # Check if already exists
                existing = WorkSchedule.objects.filter(
                    user=user,
                    work_date=work_date
                ).first()
                
                if existing:
                    # Update existing
                    existing.shift_code = shift
                    existing.status = 0
                    existing.save()
                    updated_count += 1
                else:
                    # Create new
                    WorkSchedule.objects.create(
                        user=user,
                        shift_code=shift,
                        work_date=work_date,
                        week_start=week_start,
                        status=0
                    )
                    created_count += 1
        
        total = updated_count + created_count + deleted_count
        message = f'Đã cập nhật {updated_count}, tạo mới {created_count}, xóa {deleted_count} lịch làm việc'
        
        return JsonResponse({
            'success': True,
            'message': message,
            'updated': total,
            'details': {
                'updated': updated_count,
                'created': created_count,
                'deleted': deleted_count
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
