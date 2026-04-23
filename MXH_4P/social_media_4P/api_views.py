from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count
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


# ============================================
# MESSAGING API ENDPOINTS
# ============================================

@login_required
@require_http_methods(["GET"])
def get_conversations(request):
    """API endpoint to get all conversations for current user"""
    try:
        from .models import Conversation, ConversationMember
        from django.db.models import Q, Max, Prefetch
        
        # Get conversations where user is a member
        conversations = Conversation.objects.filter(
            members__user=request.user
        ).prefetch_related(
            'members__user',
            'messages'
        ).annotate(
            last_message_time=Max('messages__created_at')
        ).distinct().order_by('-last_message_time', '-created_at')
        
        conv_list = []
        for conv in conversations:
            # Get other members (exclude current user)
            other_members = conv.members.exclude(user=request.user)
            
            # Get conversation name
            if conv.name:
                conv_name = conv.name
            elif conv.status == 'group':
                # Group chat: show all member names
                member_names = [m.user.get_full_name() or m.user.username for m in conv.members.all()]
                conv_name = ', '.join(member_names)
            else:
                # 1-1 chat: show other person's name
                if other_members.exists():
                    other_user = other_members.first().user
                    conv_name = other_user.get_full_name() or other_user.username
                else:
                    conv_name = 'Unknown'
            
            # Get last message
            last_msg = conv.messages.order_by('-created_at').first()
            last_message_text = ''
            last_message_time = ''
            if last_msg:
                last_message_text = last_msg.content[:50]
                last_message_time = last_msg.created_at.strftime('%H:%M')
            
            # Get initials for avatar
            if conv.status == 'group':
                initials = '👥'
            elif other_members.exists():
                other_user = other_members.first().user
                initials = other_user.get_initials()
            else:
                initials = '??'
            
            conv_list.append({
                'id': conv.id,
                'name': conv_name,
                'initials': initials,
                'status': conv.status,
                'last_message': last_message_text,
                'time': last_message_time,
                'online': False,  # TODO: implement online status
            })
        
        return JsonResponse({
            'success': True,
            'conversations': conv_list
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["GET"])
def get_conversation_messages(request, conversation_id):
    """API endpoint to get messages for a conversation"""
    try:
        from .models import Conversation, Message
        
        # Get conversation and check access
        conversation = Conversation.objects.filter(
            id=conversation_id,
            members__user=request.user
        ).first()
        
        if not conversation:
            return JsonResponse({
                'success': False,
                'error': 'Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền truy cập'
            }, status=404)
        
        # Get messages
        messages = conversation.messages.select_related('sender').order_by('created_at')
        
        msg_list = []
        for msg in messages:
            msg_list.append({
                'id': msg.id,
                'from': 'me' if msg.sender == request.user else 'them',
                'sender_name': msg.sender.get_full_name() or msg.sender.username,
                'text': msg.content,
                'time': msg.created_at.strftime('%H:%M'),
                'ts': int(msg.created_at.timestamp() * 1000)
            })
        
        return JsonResponse({
            'success': True,
            'messages': msg_list
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def send_message_api(request, conversation_id):
    """API endpoint to send a message in a conversation"""
    try:
        from .models import Conversation, Message
        
        # Get conversation and check access
        conversation = Conversation.objects.filter(
            id=conversation_id,
            members__user=request.user
        ).first()
        
        if not conversation:
            return JsonResponse({
                'success': False,
                'error': 'Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền truy cập'
            }, status=404)
        
        # Parse request body
        data = json.loads(request.body)
        content = data.get('content', '').strip()
        
        if not content:
            return JsonResponse({
                'success': False,
                'error': 'Nội dung tin nhắn không được để trống'
            }, status=400)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        return JsonResponse({
            'success': True,
            'id': message.id,
            'from': 'me',
            'sender_name': request.user.get_full_name() or request.user.username,
            'text': message.content,
            'time': message.created_at.strftime('%H:%M'),
            'ts': int(message.created_at.timestamp() * 1000)
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@login_required
@require_http_methods(["GET"])
def get_users_api(request):
    """API endpoint to get users for creating conversations"""
    try:
        search = request.GET.get('q', '').strip()
        
        # Get all users except current user
        users = User.objects.exclude(id=request.user.id)
        
        # Filter by search query
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Limit to 50 users
        users = users[:50]
        
        user_list = []
        for user in users:
            # Get department
            from .views import get_user_department
            department = get_user_department(user)
            
            # Get role
            role = 'Quản lý' if user.is_manager() else 'Nhân viên'
            
            user_list.append({
                'id': user.id,
                'initials': user.get_initials(),
                'name': user.get_full_name() or user.username,
                'role': role,
                'department': department
            })
        
        return JsonResponse({
            'success': True,
            'users': user_list
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def create_conversation_api(request):
    """API endpoint to create a new conversation"""
    try:
        from .models import Conversation, ConversationMember
        
        # Parse request body
        data = json.loads(request.body)
        user_ids = data.get('user_ids', [])
        
        if not user_ids:
            return JsonResponse({
                'success': False,
                'error': 'Vui lòng chọn ít nhất một người'
            }, status=400)
        
        # Get users
        users = User.objects.filter(id__in=user_ids)
        
        if not users.exists():
            return JsonResponse({
                'success': False,
                'error': 'Không tìm thấy người dùng'
            }, status=404)
        
        # Check if 1-1 conversation already exists
        if len(user_ids) == 1:
            other_user = users.first()
            # Find existing 1-1 conversation
            existing_conv = Conversation.objects.filter(
                status='private',
                members__user=request.user
            ).filter(
                members__user=other_user
            ).annotate(
                member_count=Count('members')
            ).filter(member_count=2).first()
            
            if existing_conv:
                return JsonResponse({
                    'success': True,
                    'conversation_id': existing_conv.id,
                    'message': 'Cuộc trò chuyện đã tồn tại'
                })
        
        # Create new conversation
        status = 'group' if len(user_ids) > 1 else 'private'
        conversation = Conversation.objects.create(status=status)
        
        # Add current user as member
        ConversationMember.objects.create(
            conversation=conversation,
            user=request.user
        )
        
        # Add other users as members
        for user in users:
            ConversationMember.objects.create(
                conversation=conversation,
                user=user
            )
        
        return JsonResponse({
            'success': True,
            'conversation_id': conversation.id,
            'message': 'Đã tạo cuộc trò chuyện mới'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def rename_conversation_api(request, conversation_id):
    """API endpoint to rename a conversation"""
    try:
        from .models import Conversation
        
        # Get conversation and check access
        conversation = Conversation.objects.filter(
            id=conversation_id,
            members__user=request.user
        ).first()
        
        if not conversation:
            return JsonResponse({
                'success': False,
                'error': 'Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền truy cập'
            }, status=404)
        
        # Parse request body
        data = json.loads(request.body)
        new_name = data.get('name', '').strip()
        
        if not new_name:
            return JsonResponse({
                'success': False,
                'error': 'Tên không được để trống'
            }, status=400)
        
        # Update conversation name
        conversation.name = new_name
        conversation.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Đã đổi tên cuộc trò chuyện',
            'name': new_name
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
