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
@require_http_methods(["GET"])
def get_week_schedule_status(request):
    """API trả về status hiện tại của tất cả ca trong tuần — dùng để polling"""
    from datetime import datetime, timedelta
    week_param = request.GET.get('week')
    try:
        week_start = datetime.strptime(week_param, '%Y-%m-%d').date() if week_param else None
        if not week_start:
            today = datetime.now().date()
            week_start = today - timedelta(days=today.weekday())
    except ValueError:
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())

    schedules = WorkSchedule.objects.filter(week_start=week_start).values(
        'id', 'user_id', 'work_date', 'status', 'employee_note', 'manager_note'
    )
    data = {}
    for s in schedules:
        uid = s['user_id']
        date_str = s['work_date'].isoformat()
        if uid not in data:
            data[uid] = {}
        data[uid][date_str] = {
            'id':            s['id'],
            'status':        s['status'],
            'employee_note': s['employee_note'] or '',
            'manager_note':  s['manager_note']  or '',
        }
    return JsonResponse({'success': True, 'data': data})


@login_required
@require_http_methods(["POST"])
def update_schedule_status_manager(request, schedule_id):
    """API for manager to update schedule status and add manager note"""
    try:
        if not request.user.is_manager():
            return JsonResponse({'success': False, 'error': 'Chỉ quản lý mới có quyền'}, status=403)

        schedule = WorkSchedule.objects.get(id=schedule_id)
        data = json.loads(request.body)

        status       = data.get('status')
        manager_note = data.get('manager_note', '')

        if status is not None:
            schedule.status = status
        if manager_note:
            schedule.manager_note = manager_note
        schedule.save()

        return JsonResponse({'success': True, 'message': 'Đã cập nhật'})

    except WorkSchedule.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Không tìm thấy lịch'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@require_http_methods(["POST"])
def update_schedule(request, schedule_id):
    """API endpoint for manager to update work schedule"""
    try:
        if not request.user.is_manager():
            return JsonResponse({'success': False, 'error': 'Chỉ quản lý mới có quyền chỉnh sửa lịch'}, status=403)

        schedule = WorkSchedule.objects.get(id=schedule_id)
        data = json.loads(request.body)

        shift_code   = data.get('shift_code')
        manager_note = data.get('manager_note', '')
        reset_status = data.get('reset_status', False)

        if shift_code:
            shift = WorkShift.objects.filter(shift_code=shift_code).first()
            if not shift:
                return JsonResponse({'success': False, 'error': 'Không tìm thấy ca làm việc'}, status=404)
            schedule.shift_code = shift

        if reset_status:
            schedule.status = 0  # Reset về pending

        if manager_note:
            schedule.manager_note = manager_note

        schedule.save()
        return JsonResponse({'success': True, 'message': 'Đã cập nhật lịch làm việc'})

    except WorkSchedule.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Không tìm thấy lịch làm việc'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

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
    """API endpoint for manager to batch update/create/delete work schedules"""
    try:
        if not request.user.is_manager():
            return JsonResponse({'success': False, 'error': 'Chỉ quản lý mới có quyền chỉnh sửa lịch'}, status=403)

        data = json.loads(request.body)
        updates = data.get('updates', [])

        if not updates:
            return JsonResponse({'success': False, 'error': 'Không có thay đổi nào'}, status=400)

        from datetime import datetime, timedelta
        updated_count = 0
        created_count = 0
        deleted_count = 0

        for item in updates:
            action      = item.get('action', 'create')
            schedule_id = item.get('schedule_id')
            shift_code  = item.get('shift_code')
            user_id     = item.get('user_id')
            work_date_s = item.get('work_date')
            week_start_s= item.get('week_start')

            # ---- DELETE ----
            if action == 'delete':
                if schedule_id:
                    try:
                        WorkSchedule.objects.get(id=schedule_id).delete()
                        deleted_count += 1
                    except WorkSchedule.DoesNotExist:
                        pass
                continue

            # ---- UPDATE ----
            if action == 'update':
                if not schedule_id or not shift_code:
                    continue
                shift = WorkShift.objects.filter(shift_code=shift_code).first()
                if not shift:
                    continue
                try:
                    s = WorkSchedule.objects.get(id=schedule_id)
                    s.shift_code = shift
                    s.status = 0
                    s.save()
                    updated_count += 1
                except WorkSchedule.DoesNotExist:
                    pass
                continue

            # ---- CREATE ----
            if not all([user_id, work_date_s, week_start_s, shift_code]):
                continue
            shift = WorkShift.objects.filter(shift_code=shift_code).first()
            if not shift:
                continue
            try:
                user       = User.objects.get(id=user_id)
                work_date  = datetime.strptime(work_date_s,  '%Y-%m-%d').date()
                # Tự tính week_start đúng từ work_date (tránh lỗi timezone từ JS)
                week_start = work_date - timedelta(days=work_date.weekday())
            except (User.DoesNotExist, ValueError):
                continue

            existing = WorkSchedule.objects.filter(user=user, work_date=work_date).first()
            if existing:
                existing.shift_code = shift
                existing.week_start = week_start
                existing.status = 0
                existing.save()
                updated_count += 1
            else:
                WorkSchedule.objects.create(
                    user=user, shift_code=shift,
                    work_date=work_date, week_start=week_start, status=0
                )
                created_count += 1

        return JsonResponse({
            'success': True,
            'message': f'Đã tạo {created_count}, cập nhật {updated_count}, xóa {deleted_count} lịch',
            'details': {'created': created_count, 'updated': updated_count, 'deleted': deleted_count}
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
