from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, Http404
from django.db.models import Q, Max
from django.views.decorators.http import require_http_methods
import json

from .forms import (
    LoginForm, UserRegistrationForm, UserProfileForm,
    PostForm, PostCreateForm, CommentForm,
    GroupForm, GroupMemberForm,
    TaskForm, TaskResponseForm,
    MeetingForm, MeetingParticipantForm,
    MessageForm, ConversationForm,
    WorkShiftForm, WorkScheduleForm, WorkScheduleCreateForm, WorkScheduleResponseForm
)
from .models import (
    User, Post, Interaction, InteractionType,
    Group, GroupMember, Task, TaskResponse,
    Meeting, MeetingParticipant, Message, Conversation,
    WorkShift, WorkSchedule
)

def login_page(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, 'Đăng nhập thành công!')
                return redirect('home')
            else:
                form.add_error(None, 'Email hoặc mật khẩu không đúng!')
    else:
        form = LoginForm()
    
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, 'Đã đăng xuất thành công!')
    return redirect('login')

@login_required
def register(request):
    """User registration view"""
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Đăng ký thành công! Vui lòng đăng nhập.')
            return redirect('login')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'account_management/register.html', {'form': form})

@login_required
def account(request):
    """User profile management"""
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật thông tin cá nhân!')
            return redirect('account')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'account_management/account.html', {'form': form})

@login_required
def home(request):
    """Home page with posts list"""
    # Get user's groups
    user_groups = Group.objects.filter(members__user=request.user)
    user_group_ids = user_groups.values_list('id', flat=True)
    
    # Get posts: hotel-wide OR in user's groups
    posts = Post.objects.filter(
        Q(scope='hotel') | Q(scope='groups', groups__id__in=user_group_ids)
    ).select_related('user').prefetch_related('interactions__user', 'interactions__interaction_type', 'groups').distinct().order_by('-created_at')
    
    # Get reaction and comment types
    try:
        reaction_type = InteractionType.objects.get(name='reaction')
        comment_type = InteractionType.objects.get(name='comment')
        
        # Calculate counts for each post
        for post in posts:
            post.reaction_count = post.interactions.filter(interaction_type=reaction_type).count()
            post.user_reacted = post.interactions.filter(user=request.user, interaction_type=reaction_type).exists()
            post.comment_count = post.interactions.filter(interaction_type=comment_type).count()
            post.comments = post.interactions.filter(interaction_type=comment_type).select_related('user').order_by('created_at')
    except InteractionType.DoesNotExist:
        # If no interaction type exists, set defaults
        for post in posts:
            post.reaction_count = 0
            post.user_reacted = False
            post.comment_count = 0
            post.comments = []
    
    # Get user's upcoming meetings
    from django.utils import timezone
    my_meetings = Meeting.objects.filter(
        participants__user=request.user,
        start_time__gte=timezone.now()
    ).select_related('created_by').order_by('start_time')[:5]
    
    # Get user's tasks
    my_tasks = Task.objects.filter(assigned_to=request.user).select_related('created_by').order_by('-created_at')[:5]
    
    context = {
        'posts': posts,
        'user_groups': user_groups,
        'my_meetings': my_meetings,
        'my_tasks': my_tasks,
    }
    return render(request, 'posts_management/posts.html', context)

@login_required
def create_post(request):
    """Create new post"""
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        scope = request.POST.get('scope', 'hotel')
        groups = request.POST.getlist('groups')
        images = request.FILES.getlist('images')  # Get multiple images
        
        if not content:
            messages.error(request, 'Nội dung bài viết không được để trống!')
            return redirect('home')
        
        # Create post
        post = Post.objects.create(
            user=request.user,
            content=content,
            scope=scope
        )
        
        # Add groups if scope is 'groups'
        if scope == 'groups' and groups:
            post.groups.set(groups)
        
        # Save images
        from .models import PostImage
        for index, image in enumerate(images):
            PostImage.objects.create(
                post=post,
                image=image,
                order=index
            )
        
        messages.success(request, 'Đã tạo bài viết thành công!')
        return redirect('home')
    
    # GET request - show form
    user_groups = Group.objects.filter(members__user=request.user)
    return render(request, 'posts_management/create_post.html', {'user_groups': user_groups})

@login_required
def get_post_data(request, post_id):
    """Get post data for editing"""
    post = get_object_or_404(Post, id=post_id)
    
    # Only post owner can get data
    if post.user != request.user:
        return JsonResponse({'success': False, 'error': 'Bạn không có quyền truy cập!'})
    
    # Get user's groups
    user_groups = Group.objects.filter(members__user=request.user).values('id', 'name')
    
    # Get post's groups
    post_groups = list(post.groups.values_list('id', flat=True))
    
    # Get post's images
    from .models import PostImage
    post_images = [{'id': img.id, 'url': img.image.url} for img in post.images.all()]
    
    return JsonResponse({
        'success': True,
        'post': {
            'id': post.id,
            'content': post.content,
            'scope': post.scope,
            'groups': post_groups,
            'images': post_images,
            'user_groups': list(user_groups)
        }
    })

@login_required
def edit_post(request, post_id):
    """Edit existing post"""
    post = get_object_or_404(Post, id=post_id)
    
    # Only post owner can edit
    if post.user != request.user:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({'success': False, 'error': 'Bạn không có quyền chỉnh sửa bài viết này!'})
        messages.error(request, 'Bạn không có quyền chỉnh sửa bài viết này!')
        return redirect('home')
    
    if request.method == 'POST':
        # Handle multipart form data (with images)
        if request.content_type and 'multipart/form-data' in request.content_type:
            try:
                from .models import PostImage
                
                content = request.POST.get('content', '').strip()
                scope = request.POST.get('scope', 'hotel')
                groups = request.POST.getlist('groups')
                delete_images = request.POST.getlist('delete_images')
                new_images = request.FILES.getlist('new_images')
                
                if not content:
                    return JsonResponse({'success': False, 'error': 'Nội dung không được để trống!'})
                
                if scope == 'groups' and not groups:
                    return JsonResponse({'success': False, 'error': 'Vui lòng chọn ít nhất một nhóm!'})
                
                # Update post
                post.content = content
                post.scope = scope
                post.save()
                
                # Update groups
                if scope == 'groups':
                    post.groups.set(groups)
                else:
                    post.groups.clear()
                
                # Delete images
                if delete_images:
                    PostImage.objects.filter(id__in=delete_images, post=post).delete()
                
                # Add new images
                if new_images:
                    max_order = post.images.aggregate(models.Max('order'))['order__max'] or -1
                    for index, image in enumerate(new_images):
                        PostImage.objects.create(
                            post=post,
                            image=image,
                            order=max_order + index + 1
                        )
                
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        # Handle JSON request (legacy)
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                content = data.get('content', '').strip()
                scope = data.get('scope', 'hotel')
                groups = data.get('groups', [])
                
                if not content:
                    return JsonResponse({'success': False, 'error': 'Nội dung không được để trống!'})
                
                if scope == 'groups' and not groups:
                    return JsonResponse({'success': False, 'error': 'Vui lòng chọn ít nhất một nhóm!'})
                
                # Update post
                post.content = content
                post.scope = scope
                post.save()
                
                # Update groups
                if scope == 'groups':
                    post.groups.set(groups)
                else:
                    post.groups.clear()
                
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        # Handle regular form submission
        form = PostForm(request.POST, request.FILES, instance=post)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật bài viết!')
            return redirect('home')
    else:
        form = PostForm(instance=post)
    
    return render(request, 'posts_management/edit_post.html', {'form': form, 'post': post})

@login_required
def delete_post(request, post_id):
    """Delete post"""
    post = get_object_or_404(Post, id=post_id)
    
    # Only post owner can delete
    if post.user != request.user:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({'success': False, 'error': 'Bạn không có quyền xóa bài viết này!'})
        messages.error(request, 'Bạn không có quyền xóa bài viết này!')
        return redirect('home')
    
    if request.method == 'POST':
        post.delete()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({'success': True})
        messages.success(request, 'Đã xóa bài viết!')
        return redirect('home')
    
    return render(request, 'posts_management/delete_post.html', {'post': post})

@login_required
def create_comment(request, post_id):
    """Create comment on post"""
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        
        try:
            import json
            data = json.loads(request.body)
            content = data.get('content', '').strip()
            
            if not content:
                return JsonResponse({'success': False, 'error': 'Nội dung trống'})
            
            # Get or create comment interaction type
            comment_type, _ = InteractionType.objects.get_or_create(
                name='comment',
                defaults={'description': 'Bình luận'}
            )
            
            # Create comment
            comment = Interaction.objects.create(
                user=request.user,
                post=post,
                interaction_type=comment_type,
                content=content
            )
            
            # Get updated comment count
            comment_count = post.interactions.filter(interaction_type=comment_type).count()
            
            return JsonResponse({
                'success': True,
                'comment_count': comment_count,
                'user_name': request.user.get_full_name() or request.user.username,
                'user_initials': request.user.get_initials()
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def messaging(request):
    """Messaging page"""
    # Get conversations where user is a member
    conversations = Conversation.objects.filter(
        members__user=request.user
    ).prefetch_related('members__user', 'messages').distinct().order_by('-created_at')
    
    return render(request, 'messanging_management/messaging.html', {
        'conversations': conversations
    })

@login_required
def send_message(request, conversation_id):
    """Send message in conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user is part of conversation
    if conversation.user1 != request.user and conversation.user2 != request.user:
        messages.error(request, 'Bạn không có quyền truy cập cuộc trò chuyện này!')
        return redirect('messaging')
    
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            message.conversation = conversation
            message.save()
            
            # Update conversation timestamp
            conversation.save()  # This will update updated_at
            
            return redirect('messaging')
    
    return redirect('messaging')

@login_required
def work_management(request):
    """Work management page - list all tasks"""
    from datetime import datetime, timedelta
    from django.utils import timezone
    from .models import TaskTemplate
    
    # Get selected date from query parameter or use today
    selected_date_str = request.GET.get('date')
    if selected_date_str:
        try:
            selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = timezone.now().date()
    else:
        selected_date = timezone.now().date()
    
    # Calculate previous and next dates
    previous_date = selected_date - timedelta(days=1)
    next_date = selected_date + timedelta(days=1)
    
    # Get employees filtered by manager's department
    manager_department = None
    if request.user.is_manager():
        # Determine manager's department based on username or profile
        username = request.user.username.lower()
        
        # F&B department employees
        fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                       'tranvantu', 'dangthiyen', 'vothixuan']
        # HK department employees
        hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                       'phanvanthang', 'tathivan', 'buithinga']
        # FO department employees
        fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                       'luuvanphong', 'hoangvanquan', 'lyvanhai']
        
        # Determine which department this manager belongs to
        if username == 'doanxuantoan':  # F&B Manager
            manager_department = 'F&B'
            employees = User.objects.filter(username__in=fb_usernames).order_by('username')
        elif username == 'phamxuanthuong':  # HK Manager
            manager_department = 'HK'
            employees = User.objects.filter(username__in=hk_usernames).order_by('username')
        elif username == 'nguyennhatha':  # FO Manager
            manager_department = 'FO'
            employees = User.objects.filter(username__in=fo_usernames).order_by('username')
        else:
            # If manager not recognized, try to detect from first task they created
            first_task = Task.objects.filter(created_by=request.user).first()
            if first_task and first_task.department:
                manager_department = first_task.department
                # Filter employees based on detected department
                if manager_department == 'F&B':
                    employees = User.objects.filter(username__in=fb_usernames).order_by('username')
                elif manager_department == 'HK':
                    employees = User.objects.filter(username__in=hk_usernames).order_by('username')
                elif manager_department == 'FO':
                    employees = User.objects.filter(username__in=fo_usernames).order_by('username')
                else:
                    employees = User.objects.filter(groups__name='Employee').order_by('username')
            else:
                # Default: show all employees if manager not recognized
                employees = User.objects.filter(groups__name='Employee').order_by('username')
    else:
        # Non-managers see all employees
        employees = User.objects.filter(groups__name='Employee').order_by('username')
    
    # Filter tasks by manager's department AND selected date
    if manager_department:
        # Manager only sees tasks from their department for selected date
        tasks = Task.objects.filter(
            department=manager_department,
            work_date=selected_date
        ).select_related('created_by', 'assigned_to').prefetch_related('assignments__user').order_by('shift', 'title')
        
        # If no tasks exist for this date, create from templates
        if not tasks.exists():
            templates = TaskTemplate.objects.filter(
                department=manager_department,
                is_active=True
            ).order_by('order')
            
            # Get a default employee for assigned_to (first employee in department)
            default_employee = employees.first()
            
            if default_employee:
                for template in templates:
                    Task.objects.create(
                        title=template.title,
                        description=template.description,
                        created_by=request.user,
                        assigned_to=default_employee,
                        status='Todo',
                        shift=template.shift,
                        department=template.department,
                        start_time=template.start_time,
                        end_time=template.end_time,
                        work_date=selected_date
                    )
                
                # Reload tasks after creation
                tasks = Task.objects.filter(
                    department=manager_department,
                    work_date=selected_date
                ).select_related('created_by', 'assigned_to').prefetch_related('assignments__user').order_by('shift', 'title')
    else:
        # Non-managers or unrecognized managers see all tasks for selected date
        tasks = Task.objects.filter(
            work_date=selected_date
        ).select_related('created_by', 'assigned_to').prefetch_related('assignments__user').order_by('shift', 'title')
    
    # Calculate statistics for selected date
    tasks_in_progress = tasks.filter(status='InProgress').count()
    tasks_done = tasks.filter(status='Done').count()
    tasks_todo = tasks.filter(status='Todo').count()
    
    # Get recent task responses (only from manager's department)
    if manager_department:
        responses = TaskResponse.objects.filter(task__department=manager_department).select_related('task', 'user').order_by('-responded_at')[:10]
    else:
        responses = TaskResponse.objects.select_related('task', 'user').order_by('-responded_at')[:10]
    
    return render(request, 'works_management/work_management.html', {
        'tasks': tasks,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
        'employees': employees,
        'responses': responses,
        'selected_date': selected_date,
        'previous_date': previous_date,
        'next_date': next_date,
        'manager_department': manager_department,
    })

@login_required
@require_http_methods(["POST"])
def add_task_employee(request, task_id):
    """Add employee to task"""
    from django.http import JsonResponse
    from .models import TaskAssignment
    
    task = get_object_or_404(Task, id=task_id)
    
    # Only manager or task creator can add employees
    if not request.user.is_manager() and task.created_by != request.user:
        return JsonResponse({'success': False, 'error': 'Không có quyền thêm nhân viên'}, status=403)
    
    user_id = request.POST.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Thiếu user_id'}, status=400)
    
    user = get_object_or_404(User, id=user_id)
    
    # Check if already assigned
    if TaskAssignment.objects.filter(task=task, user=user).exists():
        return JsonResponse({'success': False, 'error': 'Nhân viên đã được giao công việc này'}, status=400)
    
    # Delete old TaskResponse if exists (so user can see urgent notification again)
    TaskResponse.objects.filter(task=task, user=user).delete()
    
    # Create assignment
    TaskAssignment.objects.create(task=task, user=user)
    
    return JsonResponse({
        'success': True,
        'user_id': user.id,
        'user_name': user.get_full_name() or user.username,
        'user_initials': user.get_initials()
    })

@login_required
@require_http_methods(["POST"])
def remove_task_employee(request, task_id):
    """Remove employee from task"""
    from django.http import JsonResponse
    from .models import TaskAssignment
    
    task = get_object_or_404(Task, id=task_id)
    
    # Only manager or task creator can remove employees
    if not request.user.is_manager() and task.created_by != request.user:
        return JsonResponse({'success': False, 'error': 'Không có quyền xóa nhân viên'}, status=403)
    
    user_id = request.POST.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Thiếu user_id'}, status=400)
    
    user = get_object_or_404(User, id=user_id)
    
    # Delete assignment
    assignment = TaskAssignment.objects.filter(task=task, user=user).first()
    if not assignment:
        return JsonResponse({'success': False, 'error': 'Nhân viên không có trong công việc này'}, status=400)
    
    assignment.delete()
    
    return JsonResponse({
        'success': True,
        'user_id': user.id
    })

@login_required
@require_http_methods(["POST"])
def delete_task(request, task_id):
    """Delete task"""
    task = get_object_or_404(Task, id=task_id)
    
    # Only manager or task creator can delete
    if not request.user.is_manager() and task.created_by != request.user:
        messages.error(request, 'Bạn không có quyền xóa công việc này!')
        return redirect('work_management')
    
    task.delete()
    messages.success(request, 'Đã xóa công việc thành công!')
    return redirect('work_management')

@login_required
@require_http_methods(["POST"])
def copy_tasks_from_date(request):
    """Copy tasks from one date to another"""
    try:
        import json
        from datetime import datetime
        from .models import TaskAssignment
        
        data = json.loads(request.body)
        from_date_str = data.get('from_date')
        to_date_str = data.get('to_date')
        department = data.get('department')
        
        if not from_date_str or not to_date_str:
            return JsonResponse({'success': False, 'error': 'Thiếu thông tin ngày'})
        
        # Parse dates
        from_date = datetime.strptime(from_date_str, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_date_str, '%Y-%m-%d').date()
        
        # Get tasks from source date
        source_tasks = Task.objects.filter(work_date=from_date)
        if department:
            source_tasks = source_tasks.filter(department=department)
        
        # Delete existing tasks for target date (same department)
        target_tasks = Task.objects.filter(work_date=to_date)
        if department:
            target_tasks = target_tasks.filter(department=department)
        target_tasks.delete()
        
        # Copy tasks
        copied_count = 0
        for source_task in source_tasks:
            # Get assignments before creating new task
            assignments = list(source_task.assignments.all())
            
            # Create new task
            new_task = Task.objects.create(
                title=source_task.title,
                description=source_task.description,
                created_by=request.user,
                assigned_to=source_task.assigned_to,
                status='Todo',  # Reset status
                shift=source_task.shift,
                department=source_task.department,
                start_time=source_task.start_time,
                end_time=source_task.end_time,
                work_date=to_date
            )
            
            # Copy assignments
            for assignment in assignments:
                TaskAssignment.objects.create(
                    task=new_task,
                    user=assignment.user
                )
            
            copied_count += 1
        
        return JsonResponse({
            'success': True,
            'count': copied_count,
            'message': f'Đã copy {copied_count} công việc'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required
def create_task(request):
    """Create new task"""
    if request.method == 'POST':
        # Handle AJAX request from modal
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            try:
                from .models import TaskAssignment
                from datetime import datetime
                import json
                
                # Parse JSON data
                data = json.loads(request.body)
                
                title = data.get('title', '').strip()
                description = data.get('description', '').strip()
                employee_ids = data.get('employee_ids', [])
                shift = data.get('shift', 'Sáng')
                start_time = data.get('start_time', '08:00')
                end_time = data.get('end_time', '16:00')
                work_date_str = data.get('work_date', None)  # Get work_date from request
                
                if not title:
                    return JsonResponse({'success': False, 'error': 'Tên công việc không được để trống!'})
                
                if not employee_ids:
                    return JsonResponse({'success': False, 'error': 'Vui lòng chọn ít nhất một nhân viên!'})
                
                # Determine department based on manager
                department = None
                if request.user.username == 'doanxuantoan':
                    department = 'F&B'
                elif request.user.username == 'phamxuanthuong':
                    department = 'HK'
                elif request.user.username == 'nguyennhatha':
                    department = 'FO'
                
                # Parse time strings to time objects
                try:
                    start_time_obj = datetime.strptime(start_time, '%H:%M').time()
                    end_time_obj = datetime.strptime(end_time, '%H:%M').time()
                except ValueError:
                    start_time_obj = None
                    end_time_obj = None
                
                # Parse work_date
                work_date_obj = timezone.now().date()
                if work_date_str:
                    try:
                        work_date_obj = datetime.strptime(work_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        pass
                
                # Create task
                task = Task.objects.create(
                    title=title,
                    description=description,
                    created_by=request.user,
                    assigned_to=User.objects.get(id=employee_ids[0]),  # First employee as primary
                    status='Todo',
                    shift=shift,
                    department=department,
                    start_time=start_time_obj,
                    end_time=end_time_obj,
                    work_date=work_date_obj
                )
                
                # Create assignments for all employees
                for emp_id in employee_ids:
                    TaskAssignment.objects.create(
                        task=task,
                        user=User.objects.get(id=emp_id)
                    )
                
                return JsonResponse({
                    'success': True,
                    'task_id': task.id,
                    'message': 'Đã tạo công việc thành công!'
                })
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        # Handle regular form submission
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.created_by = request.user
            task.save()
            messages.success(request, 'Đã tạo công việc thành công!')
            return redirect('work_management')
    else:
        form = TaskForm()
    
    return render(request, 'works_management/create_task.html', {'form': form})

@login_required
def edit_task(request, task_id):
    """Edit existing task"""
    task = get_object_or_404(Task, id=task_id)
    
    # Only creator can edit
    if task.created_by != request.user:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({'success': False, 'error': 'Bạn không có quyền chỉnh sửa công việc này!'})
        messages.error(request, 'Bạn không có quyền chỉnh sửa công việc này!')
        return redirect('work_management')
    
    if request.method == 'POST':
        # Handle AJAX request from detail modal
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            try:
                from .models import TaskAssignment
                import json
                
                # Parse JSON data
                data = json.loads(request.body)
                
                title = data.get('title', '').strip()
                description = data.get('description', '').strip()
                employee_ids = data.get('employee_ids', [])
                
                if not title:
                    return JsonResponse({'success': False, 'error': 'Tên công việc không được để trống!'})
                
                if not employee_ids:
                    return JsonResponse({'success': False, 'error': 'Vui lòng chọn ít nhất một nhân viên!'})
                
                # Update task
                task.title = title
                task.description = description
                task.assigned_to = User.objects.get(id=employee_ids[0])  # First employee as primary
                task.save()
                
                # Update assignments - delete old ones and create new ones
                TaskAssignment.objects.filter(task=task).delete()
                for emp_id in employee_ids:
                    TaskAssignment.objects.create(
                        task=task,
                        user=User.objects.get(id=emp_id)
                    )
                
                return JsonResponse({
                    'success': True,
                    'message': 'Đã cập nhật công việc thành công!'
                })
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        # Handle regular form submission
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật công việc!')
            return redirect('work_management')
    else:
        form = TaskForm(instance=task)
    
    return render(request, 'works_management/edit_task.html', {'form': form, 'task': task})

@login_required
def respond_to_task(request, task_id):
    """Respond to a task"""
    task = get_object_or_404(Task, id=task_id)
    
    if request.method == 'POST':
        # Handle AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.content_type == 'application/json':
            try:
                import json
                data = json.loads(request.body)
                status = data.get('status', True)  # True = Accept, False = Reject
                note = data.get('note', '').strip()
                
                # Check if user is assigned to this task
                from .models import TaskAssignment
                is_assigned = TaskAssignment.objects.filter(task=task, user=request.user).exists() or task.assigned_to == request.user
                
                if not is_assigned:
                    return JsonResponse({'success': False, 'error': 'Bạn không được phân công nhiệm vụ này'})
                
                # If rejecting, note is required
                if status == False and not note:
                    return JsonResponse({'success': False, 'error': 'Vui lòng nhập lý do từ chối!'})
                
                # Create or update TaskResponse
                task_response, created = TaskResponse.objects.get_or_create(
                    task=task,
                    user=request.user,
                    defaults={
                        'status': status,
                        'reason': note
                    }
                )
                
                if not created:
                    task_response.status = status
                    task_response.reason = note
                    task_response.save()
                
                # If rejected, remove user from task assignments
                if status == False:
                    TaskAssignment.objects.filter(task=task, user=request.user).delete()
                    # If this was the assigned_to user, clear it
                    if task.assigned_to == request.user:
                        # Find another assigned user or set to None
                        other_assignment = TaskAssignment.objects.filter(task=task).exclude(user=request.user).first()
                        if other_assignment:
                            task.assigned_to = other_assignment.user
                        else:
                            task.assigned_to = None
                        task.save()
                
                message = 'Đã đồng ý nhiệm vụ!' if status else 'Đã từ chối nhiệm vụ!'
                return JsonResponse({
                    'success': True,
                    'message': message
                })
                
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        # Handle regular form submission
        form = TaskResponseForm(request.POST)
        if form.is_valid():
            response = form.save(commit=False)
            response.task = task
            response.user = request.user
            response.save()
            messages.success(request, 'Đã gửi phản hồi!')
            return redirect('work_management')
    else:
        form = TaskResponseForm()
    
    return render(request, 'works_management/respond_task.html', {
        'form': form, 
        'task': task
    })

@login_required
def meeting_schedule(request):
    """Meeting schedule page - shows only meetings created by current user"""
    from django.utils import timezone
    from datetime import datetime
    
    # Get year and month from query params
    year = int(request.GET.get('year', timezone.now().year))
    month = int(request.GET.get('month', timezone.now().month))
    
    # Filter meetings by month, year, and created by current user
    meetings = Meeting.objects.select_related('created_by', 'group').prefetch_related('participants__user').filter(
        created_by=request.user,  # Only show meetings created by this user
        start_time__year=year,
        start_time__month=month
    ).order_by('start_time')
    
    # Calculate statistics
    now = timezone.now()
    meetings_total = meetings.count()
    meetings_upcoming = meetings.filter(status='Upcoming').count()
    meetings_completed = meetings.filter(status='Completed').count()
    meetings_cancelled = meetings.filter(status='Cancelled').count()
    
    # Add emoji to meetings
    emoji_map = {
        'Ban giám đốc': '📊',
        'F&B': '🍽️',
        'HK': '🧹',
        'FO': '🏨',
    }
    
    for meeting in meetings:
        meeting.get_emoji = emoji_map.get(meeting.location, '📋')
    
    # Get all groups for the create meeting form
    groups = Group.objects.all().order_by('name')
    
    return render(request, 'works_management/meeting_schedule.html', {
        'meetings': meetings,
        'meetings_total': meetings_total,
        'meetings_upcoming': meetings_upcoming,
        'meetings_completed': meetings_completed,
        'meetings_cancelled': meetings_cancelled,
        'current_month': month,
        'current_year': year,
        'groups': groups,
    })

@login_required
def create_meeting_ajax(request):
    """Create new meeting via AJAX"""
    if request.method == 'POST':
        import json
        from django.utils import timezone
        from datetime import datetime
        
        try:
            data = json.loads(request.body)
            
            title = data.get('title')
            description = data.get('description', '')
            location = data.get('location', '')
            date = data.get('date')
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            group_id = data.get('group_id')  # Optional: for group meetings
            
            if not title or not date:
                return JsonResponse({'success': False, 'error': 'Thiếu thông tin bắt buộc'})
            
            # Combine date and time
            start_datetime = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
            end_datetime = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")
            
            # Make timezone aware
            start_datetime = timezone.make_aware(start_datetime)
            end_datetime = timezone.make_aware(end_datetime)
            
            # Get group if specified
            group = None
            if group_id:
                try:
                    group = Group.objects.get(id=group_id)
                except Group.DoesNotExist:
                    pass
            
            # Create meeting
            meeting = Meeting.objects.create(
                title=title,
                description=description,
                location=location,
                start_time=start_datetime,
                end_time=end_datetime,
                created_by=request.user,
                status='Upcoming',
                group=group
            )
            
            # Auto-add participants
            participants_added = 0
            
            # Priority 1: If group is specified, add all group members
            if group:
                group_members = GroupMember.objects.filter(group=group).select_related('user')
                for member in group_members:
                    MeetingParticipant.objects.create(meeting=meeting, user=member.user)
                    participants_added += 1
            
            # Priority 2: If location specifies department, add department members
            elif location:
                # Department-specific usernames (including managers)
                fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                               'tranvantu', 'dangthiyen', 'vothixuan']
                hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                               'phanvanthang', 'tathivan', 'buithinga']
                fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                               'luuvanphong', 'hoangvanquan', 'lyvanhai']
                
                # Determine which users to add based on location
                users_to_add = []
                if 'F&B' in location or 'fb' in location.lower() or 'f&b' in location.lower():
                    users_to_add = User.objects.filter(username__in=fb_usernames)
                elif 'HK' in location or 'housekeeping' in location.lower() or 'hk' in location.lower():
                    users_to_add = User.objects.filter(username__in=hk_usernames)
                elif 'FO' in location or 'front' in location.lower() or 'fo' in location.lower():
                    users_to_add = User.objects.filter(username__in=fo_usernames)
                elif 'Ban giám đốc' in location or 'giám đốc' in location.lower() or 'BGĐ' in location:
                    # Add all managers
                    users_to_add = User.objects.filter(groups__name='Manager')
                else:
                    # If location doesn't match any department, add all users (managers + employees)
                    users_to_add = User.objects.filter(Q(groups__name='Manager') | Q(groups__name='Employee')).distinct()
                
                # Create MeetingParticipant for each user
                for user in users_to_add:
                    MeetingParticipant.objects.create(meeting=meeting, user=user)
                    participants_added += 1
            
            return JsonResponse({
                'success': True,
                'message': f'Đã tạo cuộc họp thành công! ({participants_added} người tham gia)',
                'meeting_id': meeting.id
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def delete_meeting_ajax(request, meeting_id):
    """Delete meeting via AJAX"""
    if request.method == 'POST':
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            
            # Check permission
            if meeting.created_by != request.user:
                return JsonResponse({'success': False, 'error': 'Bạn không có quyền xóa cuộc họp này'})
            
            meeting.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Đã xóa cuộc họp thành công!'
            })
            
        except Meeting.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Cuộc họp không tồn tại'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def update_meeting_ajax(request, meeting_id):
    """Update meeting via AJAX"""
    if request.method == 'POST':
        import json
        from django.utils import timezone
        from datetime import datetime
        
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            
            # Check permission
            if meeting.created_by != request.user:
                return JsonResponse({'success': False, 'error': 'Bạn không có quyền chỉnh sửa cuộc họp này'})
            
            data = json.loads(request.body)
            
            title = data.get('title')
            description = data.get('description', '')
            location = data.get('location', '')
            date = data.get('date')
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            group_id = data.get('group_id')
            
            if not title or not date:
                return JsonResponse({'success': False, 'error': 'Thiếu thông tin bắt buộc'})
            
            # Combine date and time
            start_datetime = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
            end_datetime = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")
            
            # Make timezone aware
            start_datetime = timezone.make_aware(start_datetime)
            end_datetime = timezone.make_aware(end_datetime)
            
            # Get group if specified
            group = None
            if group_id:
                try:
                    group = Group.objects.get(id=group_id)
                except Group.DoesNotExist:
                    pass
            
            # Update meeting
            meeting.title = title
            meeting.description = description
            meeting.location = location
            meeting.start_time = start_datetime
            meeting.end_time = end_datetime
            meeting.group = group
            meeting.save()
            
            # Remove old participants
            MeetingParticipant.objects.filter(meeting=meeting).delete()
            
            # Re-add participants using same logic as create
            participants_added = 0
            
            # Priority 1: If group is specified, add all group members
            if group:
                group_members = GroupMember.objects.filter(group=group).select_related('user')
                for member in group_members:
                    MeetingParticipant.objects.create(meeting=meeting, user=member.user)
                    participants_added += 1
            
            # Priority 2: If location specifies department, add department members
            elif location:
                # Department-specific usernames (including managers)
                fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                               'tranvantu', 'dangthiyen', 'vothixuan']
                hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                               'phanvanthang', 'tathivan', 'buithinga']
                fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                               'luuvanphong', 'hoangvanquan', 'lyvanhai']
                
                # Determine which users to add based on location
                users_to_add = []
                if 'F&B' in location or 'fb' in location.lower() or 'f&b' in location.lower():
                    users_to_add = User.objects.filter(username__in=fb_usernames)
                elif 'HK' in location or 'housekeeping' in location.lower() or 'hk' in location.lower():
                    users_to_add = User.objects.filter(username__in=hk_usernames)
                elif 'FO' in location or 'front' in location.lower() or 'fo' in location.lower():
                    users_to_add = User.objects.filter(username__in=fo_usernames)
                elif 'Ban giám đốc' in location or 'giám đốc' in location.lower() or 'BGĐ' in location:
                    # Add all managers
                    users_to_add = User.objects.filter(groups__name='Manager')
                else:
                    # If location doesn't match any department, add all users (managers + employees)
                    users_to_add = User.objects.filter(Q(groups__name='Manager') | Q(groups__name='Employee')).distinct()
                
                # Create MeetingParticipant for each user
                for user in users_to_add:
                    MeetingParticipant.objects.create(meeting=meeting, user=user)
                    participants_added += 1
            
            return JsonResponse({
                'success': True,
                'message': f'Đã cập nhật cuộc họp! ({participants_added} người tham gia)'
            })
            
        except Meeting.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Cuộc họp không tồn tại'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def create_meeting(request):
    """Create new meeting"""
    if request.method == 'POST':
        form = MeetingForm(request.POST)
        if form.is_valid():
            meeting = form.save(commit=False)
            meeting.organizer = request.user
            meeting.save()
            messages.success(request, 'Đã tạo cuộc họp thành công!')
            return redirect('meeting_schedule')
    else:
        form = MeetingForm()
    
    return render(request, 'works_management/create_meeting.html', {'form': form})

@login_required
def edit_meeting(request, meeting_id):
    """Edit existing meeting"""
    meeting = get_object_or_404(Meeting, id=meeting_id)
    
    # Only organizer can edit
    if meeting.organizer != request.user:
        messages.error(request, 'Bạn không có quyền chỉnh sửa cuộc họp này!')
        return redirect('meeting_schedule')
    
    if request.method == 'POST':
        form = MeetingForm(request.POST, instance=meeting)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật cuộc họp!')
            return redirect('meeting_schedule')
    else:
        form = MeetingForm(instance=meeting)
    
    return render(request, 'works_management/edit_meeting.html', {
        'form': form, 
        'meeting': meeting
    })

@login_required
def employee_dashboard(request):
    """Employee dashboard"""
    from .models import TaskAssignment
    from django.utils import timezone
    from datetime import timedelta
    
    # Get today's date
    today = timezone.now().date()
    tomorrow = today + timedelta(days=1)
    
    # Get task IDs where user is assigned via TaskAssignment
    assigned_task_ids = TaskAssignment.objects.filter(user=request.user).values_list('task_id', flat=True)
    
    # Get all tasks assigned to user for today
    all_my_tasks = Task.objects.filter(
        Q(id__in=assigned_task_ids) | Q(assigned_to=request.user),
        work_date=today
    ).select_related('created_by').prefetch_related('assignments__user').order_by('shift', 'start_time').distinct()
    
    # Separate tasks into urgent (not yet accepted) and accepted tasks
    urgent_tasks = []
    my_tasks = []
    
    for task in all_my_tasks:
        # Check if user has responded to this task
        response = TaskResponse.objects.filter(task=task, user=request.user).first()
        
        if response is None:
            # No response yet - show in urgent notifications
            urgent_tasks.append(task)
        elif response.status == True:
            # Accepted - show in daily tasks
            my_tasks.append(task)
        # If response.status == False (rejected), don't show anywhere
    
    # Calculate task statistics (only for accepted tasks)
    tasks_total = len(my_tasks)
    tasks_in_progress = sum(1 for t in my_tasks if t.status == 'InProgress')
    tasks_done = sum(1 for t in my_tasks if t.status == 'Done')
    tasks_todo = sum(1 for t in my_tasks if t.status == 'Todo')
    
    # Get upcoming meetings where user is a participant
    upcoming_meetings = Meeting.objects.filter(
        participants__user=request.user,
        start_time__gte=timezone.now(),
        status='Upcoming'
    ).select_related('created_by').order_by('start_time')[:5]
    
    return render(request, 'works_management/employee_dashboard.html', {
        'my_tasks': my_tasks,
        'upcoming_meetings': upcoming_meetings,
        'urgent_tasks': urgent_tasks,
        'tasks_total': tasks_total,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
        'today': today,
        'tomorrow': tomorrow,
    })


@login_required
def view_work_assignments(request):
    """View work assignments in read-only mode (for employees)"""
    from datetime import datetime, timedelta
    from django.utils import timezone
    
    # Get selected date from query parameter or use today
    selected_date_str = request.GET.get('date')
    if selected_date_str:
        try:
            selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = timezone.now().date()
    else:
        selected_date = timezone.now().date()
    
    # Calculate previous and next dates
    previous_date = selected_date - timedelta(days=1)
    next_date = selected_date + timedelta(days=1)
    
    # Determine user's department
    username = request.user.username.lower()
    user_department = None
    
    # Department-specific usernames
    fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                   'tranvantu', 'dangthiyen', 'vothixuan']
    hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                   'phanvanthang', 'tathivan', 'buithinga']
    fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                   'luuvanphong', 'hoangvanquan', 'lyvanhai']
    
    # Determine user's department
    if username in fb_usernames:
        user_department = 'F&B'
        employees = User.objects.filter(username__in=fb_usernames).order_by('username')
    elif username in hk_usernames:
        user_department = 'HK'
        employees = User.objects.filter(username__in=hk_usernames).order_by('username')
    elif username in fo_usernames:
        user_department = 'FO'
        employees = User.objects.filter(username__in=fo_usernames).order_by('username')
    else:
        # If user not in any department list, try to detect from their tasks
        user_task = Task.objects.filter(
            Q(assigned_to=request.user) | Q(assignments__user=request.user)
        ).first()
        if user_task and user_task.department:
            user_department = user_task.department
            # Get employees from that department
            if user_department == 'F&B':
                employees = User.objects.filter(username__in=fb_usernames).order_by('username')
            elif user_department == 'HK':
                employees = User.objects.filter(username__in=hk_usernames).order_by('username')
            elif user_department == 'FO':
                employees = User.objects.filter(username__in=fo_usernames).order_by('username')
            else:
                employees = User.objects.filter(groups__name='Employee').order_by('username')
        else:
            # Default: show all employees
            employees = User.objects.filter(groups__name='Employee').order_by('username')
    
    # Filter tasks by user's department and selected date
    if user_department:
        tasks = Task.objects.filter(
            department=user_department,
            work_date=selected_date
        ).select_related('created_by', 'assigned_to').prefetch_related('assignments__user').order_by('shift', 'title')
    else:
        # If no department detected, show all tasks (fallback)
        tasks = Task.objects.filter(
            work_date=selected_date
        ).select_related('created_by', 'assigned_to').prefetch_related('assignments__user').order_by('shift', 'title')
    
    # Calculate statistics for selected date
    tasks_in_progress = tasks.filter(status='InProgress').count()
    tasks_done = tasks.filter(status='Done').count()
    tasks_todo = tasks.filter(status='Todo').count()
    
    return render(request, 'works_management/view_work_assignments.html', {
        'tasks': tasks,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
        'employees': employees,
        'selected_date': selected_date,
        'previous_date': previous_date,
        'next_date': next_date,
        'user_department': user_department,
        'readonly': True,  # Flag to indicate read-only mode
    })

@login_required
def complete_task(request, task_id):
    """Complete a task - employee reports task completion"""
    if request.method == 'POST':
        import json
        
        try:
            data = json.loads(request.body)
            note = data.get('note', '')
            status = data.get('status', True)
            
            # Get the task
            task = Task.objects.get(id=task_id)
            
            # Check if user is assigned to this task
            from .models import TaskAssignment
            is_assigned = TaskAssignment.objects.filter(task=task, user=request.user).exists() or task.assigned_to == request.user
            
            if not is_assigned:
                return JsonResponse({'success': False, 'error': 'Bạn không được phân công nhiệm vụ này'})
            
            # Update task status to Done
            task.status = 'Done'
            task.save()
            
            # Create or update TaskResponse
            task_response, created = TaskResponse.objects.get_or_create(
                task=task,
                user=request.user,
                defaults={
                    'status': status,
                    'note': note
                }
            )
            
            if not created:
                task_response.status = status
                task_response.note = note
                task_response.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Đã báo cáo hoàn thành nhiệm vụ thành công!'
            })
            
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Nhiệm vụ không tồn tại'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def all_notifications(request):
    """All notifications page"""
    from .models import TaskAssignment
    
    # Get task IDs where user is assigned via TaskAssignment
    assigned_task_ids = TaskAssignment.objects.filter(user=request.user).values_list('task_id', flat=True)
    
    # Get all tasks where user is assigned (either via TaskAssignment or old assigned_to field)
    notifications = Task.objects.filter(
        Q(id__in=assigned_task_ids) | Q(assigned_to=request.user)
    ).select_related('created_by').prefetch_related('assignments__user').order_by('-created_at').distinct()
    
    return render(request, 'works_management/all_notifications.html', {
        'notifications': notifications
    })

@login_required
def weekly_schedule(request):
    """Weekly work schedule - detailed daily assignments"""
    from django.utils import timezone
    
    # Get date from query parameter or use today
    selected_date_str = request.GET.get('date')
    if selected_date_str:
        try:
            from datetime import datetime
            selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = timezone.now().date()
    else:
        selected_date = timezone.now().date()
    
    # Get all schedules for the selected date
    schedules = WorkSchedule.objects.filter(
        work_date=selected_date
    ).select_related('user', 'shift_code').order_by('shift_code__start_time', 'user__username')
    
    # Get all tasks for the selected date (if Task model has deadline field)
    # Otherwise get all tasks
    tasks = Task.objects.select_related('assigned_to', 'created_by').prefetch_related('assignments__user').order_by('status', 'title')
    
    return render(request, 'works_management/weekly_schedule.html', {
        'schedules': schedules,
        'tasks': tasks,
        'selected_date': selected_date,
    })

@login_required
def all_tasks(request):
    """All tasks page"""
    tasks = Task.objects.select_related('created_by', 'assigned_to').prefetch_related('assignments__user').all().order_by('-created_at')
    
    # Calculate statistics
    tasks_total = tasks.count()
    tasks_in_progress = tasks.filter(status='InProgress').count()
    tasks_done = tasks.filter(status='Done').count()
    tasks_todo = tasks.filter(status='Todo').count()
    
    return render(request, 'works_management/all_tasks.html', {
        'tasks': tasks,
        'tasks_total': tasks_total,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
    })

@login_required
def all_responses(request):
    """All task responses page"""
    responses = TaskResponse.objects.select_related('task', 'user').all().order_by('-responded_at')
    
    return render(request, 'works_management/all_responses.html', {
        'responses': responses
    })

@login_required
def work_schedules_management(request):
    """Work schedules management page"""
    from django.utils import timezone
    from datetime import timedelta, datetime
    
    # Get selected week from query parameter or use current week
    week_param = request.GET.get('week')
    if week_param:
        try:
            # Parse week parameter (format: YYYY-MM-DD for Monday)
            week_start = datetime.strptime(week_param, '%Y-%m-%d').date()
        except ValueError:
            today = timezone.now().date()
            week_start = today - timedelta(days=today.weekday())
    else:
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
    
    # Calculate week end and navigation dates
    week_end = week_start + timedelta(days=6)
    previous_week = week_start - timedelta(days=7)
    next_week = week_start + timedelta(days=7)
    
    # Determine manager's department
    username = request.user.username.lower()
    manager_department = None
    
    # Department-specific usernames
    fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                   'tranvantu', 'dangthiyen', 'vothixuan']
    hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                   'phanvanthang', 'tathivan', 'buithinga']
    fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                   'luuvanphong', 'hoangvanquan', 'lyvanhai']
    
    # Determine which department this manager belongs to
    if username == 'doanxuantoan':  # F&B Manager
        manager_department = 'F&B'
        department_usernames = fb_usernames
    elif username == 'phamxuanthuong':  # HK Manager
        manager_department = 'HK'
        department_usernames = hk_usernames
    elif username == 'nguyennhatha':  # FO Manager
        manager_department = 'FO'
        department_usernames = fo_usernames
    else:
        # Default: show all employees if manager not recognized
        department_usernames = fb_usernames + hk_usernames + fo_usernames
    
    # Get employees from manager's department
    users = User.objects.filter(username__in=department_usernames).order_by('username')
    
    # Get schedules for selected week and department
    schedules = WorkSchedule.objects.select_related('user', 'shift_code').filter(
        week_start=week_start,
        user__username__in=department_usernames
    ).order_by('work_date', 'user__username')
    
    # Check if schedules exist for this week
    has_schedules = schedules.exists()
    
    # Get all shifts
    shifts = WorkShift.objects.all().order_by('start_time')
    
    # Calculate statistics
    total_schedules = schedules.count()
    pending_schedules = schedules.filter(status=0).count()
    accepted_schedules = schedules.filter(status=1).count()
    rejected_schedules = schedules.filter(status=2).count()
    
    # Calculate shift counts
    ms_count = schedules.filter(shift_code__shift_code='MS').count()
    a1_count = schedules.filter(shift_code__shift_code='A1').count()
    e9_count = schedules.filter(shift_code__shift_code='E9').count()
    m6ss_count = schedules.filter(shift_code__shift_code='M6SS').count()
    do_count = schedules.filter(shift_code__shift_code='DO').count()
    
    # Create week days list (Monday to Sunday)
    week_days = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        week_days.append({
            'date': day,
            'day_name': day.strftime('%A'),  # Monday, Tuesday, etc.
            'day_number': day.day,
        })
    
    # Organize schedules by user and date for easy template access
    schedule_by_user_date = {}
    for user in users:
        schedule_by_user_date[user.id] = {}
        for day in week_days:
            # Find schedule for this user and date
            schedule = schedules.filter(user=user, work_date=day['date']).first()
            schedule_by_user_date[user.id][day['date'].isoformat()] = schedule
    
    # Create a flat list for template iteration
    user_schedules = []
    for user in users:
        user_data = {
            'user': user,
            'schedules': []
        }
        for day in week_days:
            schedule = schedule_by_user_date[user.id].get(day['date'].isoformat())
            user_data['schedules'].append({
                'date': day['date'],
                'schedule': schedule
            })
        user_schedules.append(user_data)
    
    return render(request, 'work_schedules_management/work_schedules_management.html', {
        'schedules': schedules,
        'users': users,
        'shifts': shifts,
        'week_start': week_start,
        'week_end': week_end,
        'previous_week': previous_week,
        'next_week': next_week,
        'week_days': week_days,
        'user_schedules': user_schedules,
        'has_schedules': has_schedules,
        'manager_department': manager_department,
        'total_schedules': total_schedules,
        'pending_schedules': pending_schedules,
        'accepted_schedules': accepted_schedules,
        'rejected_schedules': rejected_schedules,
        'ms_count': ms_count,
        'a1_count': a1_count,
        'e9_count': e9_count,
        'm6ss_count': m6ss_count,
        'do_count': do_count,
    })

@login_required
def create_work_schedule(request):
    """Create new work schedule"""
    if request.method == 'POST':
        form = WorkScheduleCreateForm(request.POST)
        if form.is_valid():
            schedule = form.save()
            messages.success(request, 'Đã tạo lịch làm việc thành công!')
            return redirect('work_schedules_management')
    else:
        form = WorkScheduleCreateForm()
    
    return render(request, 'work_schedules_management/create_schedule.html', {'form': form})

@login_required
def edit_work_schedule(request, schedule_id):
    """Edit existing work schedule"""
    schedule = get_object_or_404(WorkSchedule, id=schedule_id)
    
    if request.method == 'POST':
        form = WorkScheduleForm(request.POST, instance=schedule)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật lịch làm việc!')
            return redirect('work_schedules_management')
    else:
        form = WorkScheduleForm(instance=schedule)
    
    return render(request, 'work_schedules_management/edit_schedule.html', {
        'form': form,
        'schedule': schedule
    })

@login_required
def employee_work_schedules(request):
    """Employee's own work schedules"""
    from django.utils import timezone
    from datetime import timedelta, datetime
    
    # Get selected week from query parameter or use current week
    week_param = request.GET.get('week')
    if week_param:
        try:
            week_start = datetime.strptime(week_param, '%Y-%m-%d').date()
        except ValueError:
            today = timezone.now().date()
            week_start = today - timedelta(days=today.weekday())
    else:
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
    
    # Calculate week end
    week_end = week_start + timedelta(days=6)
    
    # Determine user's department
    username = request.user.username.lower()
    user_department = None
    
    # Department-specific usernames
    fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                   'tranvantu', 'dangthiyen', 'vothixuan']
    hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                   'phanvanthang', 'tathivan', 'buithinga']
    fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                   'luuvanphong', 'hoangvanquan', 'lyvanhai']
    
    # Determine which department this user belongs to
    if username in fb_usernames:
        user_department = 'F&B'
        department_usernames = fb_usernames
    elif username in hk_usernames:
        user_department = 'HK'
        department_usernames = hk_usernames
    elif username in fo_usernames:
        user_department = 'FO'
        department_usernames = fo_usernames
    else:
        # If user not in any department list, show all employees (fallback)
        department_usernames = fb_usernames + hk_usernames + fo_usernames
    
    # Get employees from user's department only
    employees = User.objects.filter(username__in=department_usernames).order_by('username')
    
    # Get schedules for the week filtered by department
    schedules = WorkSchedule.objects.select_related('user', 'shift_code').filter(
        week_start=week_start,
        user__username__in=department_usernames
    ).order_by('work_date', 'user__username')
    
    # Create week days list
    week_days = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        week_days.append({
            'date': day,
            'day_name': day.strftime('%A'),
            'day_number': day.day,
        })
    
    # Organize schedules by user and date
    schedule_by_user_date = {}
    for user in employees:
        schedule_by_user_date[user.id] = {}
        for day in week_days:
            schedule = schedules.filter(user=user, work_date=day['date']).first()
            schedule_by_user_date[user.id][day['date'].isoformat()] = schedule
    
    # Create user schedules list
    user_schedules = []
    for user in employees:
        user_data = {
            'user': user,
            'schedules': []
        }
        for day in week_days:
            schedule = schedule_by_user_date[user.id].get(day['date'].isoformat())
            user_data['schedules'].append({
                'date': day['date'],
                'schedule': schedule
            })
        user_schedules.append(user_data)
    
    # Calculate shift counts
    ms_count = schedules.filter(shift_code__shift_code='MS').count()
    a1_count = schedules.filter(shift_code__shift_code='A1').count()
    e9_count = schedules.filter(shift_code__shift_code='E9').count()
    m6ss_count = schedules.filter(shift_code__shift_code='M6SS').count()
    do_count = schedules.filter(shift_code__shift_code='DO').count()
    
    return render(request, 'work_schedules_management/employee_work_schedules.html', {
        'week_start': week_start,
        'week_end': week_end,
        'week_days': week_days,
        'user_schedules': user_schedules,
        'ms_count': ms_count,
        'a1_count': a1_count,
        'e9_count': e9_count,
        'm6ss_count': m6ss_count,
        'do_count': do_count,
    })

@login_required
def profile(request):
    """User profile page"""
    return render(request, 'profile_management/profile.html', {
        'user': request.user
    })

@login_required
def edit_profile(request):
    """Edit user profile"""
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật hồ sơ!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'profile_management/edit_profile.html', {'form': form})
# Group Management Views

@login_required
def nhom(request):
    """Groups list page"""
    groups = Group.objects.prefetch_related('members', 'group_posts').all().order_by('-created_at')
    
    # Add member count and post count for each group
    for group in groups:
        group.member_count = group.members.count()
        group.post_count = group.group_posts.count()
    
    return render(request, 'group_management/nhom.html', {
        'nhom_list': groups,
        'user': request.user
    })

@login_required
def nhom_detail(request, nhom_id):
    """Group detail page"""
    group = get_object_or_404(Group, id=nhom_id)
    
    # Check if user is member
    is_member = GroupMember.objects.filter(group=group, user=request.user).exists()
    # Check if user is the group creator (admin)
    is_admin = (group.created_by == request.user)
    
    # Get group members
    members = GroupMember.objects.filter(group=group).select_related('user')
    
    # Get posts scoped to this group ONLY (not hotel-wide posts)
    posts = Post.objects.filter(
        scope='groups',
        groups=group
    ).select_related('user').prefetch_related('interactions__user', 'interactions__interaction_type').order_by('-created_at')
    
    # Add interaction counts to posts
    try:
        reaction_type = InteractionType.objects.get(name='reaction')
        comment_type = InteractionType.objects.get(name='comment')
        
        for post in posts:
            post.reaction_count = post.interactions.filter(interaction_type=reaction_type).count()
            post.user_reacted = post.interactions.filter(user=request.user, interaction_type=reaction_type).exists()
            post.comment_count = post.interactions.filter(interaction_type=comment_type).count()
            post.comments = post.interactions.filter(interaction_type=comment_type).select_related('user').order_by('created_at')
    except InteractionType.DoesNotExist:
        for post in posts:
            post.reaction_count = 0
            post.user_reacted = False
            post.comment_count = 0
            post.comments = []
    
    # Handle post creation — mọi user đã login đều có thể đăng bài trong nhóm
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        images = request.FILES.getlist('images')
        
        if content:
            from .models import PostImage
            # Tạo bài viết gắn với nhóm này
            new_post = Post.objects.create(
                user=request.user,
                content=content,
                scope='groups'
            )
            new_post.groups.add(group)
            
            # Lưu ảnh đính kèm
            for index, image in enumerate(images):
                PostImage.objects.create(
                    post=new_post,
                    image=image,
                    order=index
                )
            
            messages.success(request, 'Đã đăng bài thành công!')
            return redirect('nhom_detail', nhom_id=nhom_id)
    
    return render(request, 'group_management/nhom_detail.html', {
        'nhom': group,
        'posts': posts,
        'members': members,
        'is_member': is_member,
        'is_admin': is_admin,
        'user': request.user
    })

@login_required
def nhom_new(request):
    """Create new group"""
    if request.method == 'POST':
        form = GroupForm(request.POST)
        if form.is_valid():
            group = form.save(commit=False)
            group.created_by = request.user
            group.save()
            
            # Add creator as member
            GroupMember.objects.create(
                group=group,
                user=request.user
            )
            
            messages.success(request, 'Đã tạo nhóm thành công!')
            return redirect('nhom_detail', nhom_id=group.id)
    else:
        form = GroupForm()
    
    return render(request, 'group_management/nhom_new.html', {'form': form})

@login_required
@login_required
def nhom_edit(request, nhom_id):
    """Edit group"""
    group = get_object_or_404(Group, id=nhom_id)
    
    # Check if user is the group creator (admin)
    is_admin = (group.created_by == request.user)
    if not is_admin:
        messages.error(request, 'Bạn không có quyền chỉnh sửa nhóm này!')
        return redirect('nhom_detail', nhom_id=nhom_id)
    
    if request.method == 'POST':
        form = GroupForm(request.POST, instance=group)
        if form.is_valid():
            form.save()
            messages.success(request, 'Đã cập nhật nhóm thành công!')
            return redirect('nhom_detail', nhom_id=nhom_id)
    else:
        form = GroupForm(instance=group)
    
    return render(request, 'group_management/nhom_edit.html', {
        'form': form,
        'nhom': group,
        'user': request.user
    })


@login_required
@require_http_methods(["POST"])
def nhom_delete(request, nhom_id):
    """Delete group — chỉ admin nhóm mới được xóa"""
    group = get_object_or_404(Group, id=nhom_id)
    if group.created_by != request.user:
        messages.error(request, 'Bạn không có quyền xóa nhóm này!')
        return redirect('nhom_detail', nhom_id=nhom_id)
    group.delete()
    messages.success(request, f'Đã xóa nhóm "{group.name}" thành công!')
    return redirect('nhom')

@login_required
def nhom_new_edit(request):
    """Alternative create/edit group page"""
    return nhom_new(request)

@login_required
def nhom_quanly(request):
    """Groups for managers"""
    return nhom(request)

@login_required
def nhom_nhanvien(request):
    """Groups for employees"""
    return nhom(request)

# Report Management Views

@login_required
def baocao_tuongtac(request):
    """Interaction report - Báo cáo tương tác"""
    from django.db.models import Count, Q
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range (last 30 days)
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    # Total posts
    total_posts = Post.objects.count()
    posts_this_month = Post.objects.filter(created_at__gte=start_date).count()
    
    # Total interactions
    total_reactions = Interaction.objects.filter(
        interaction_type__name='reaction'
    ).count()
    total_comments = Interaction.objects.filter(
        interaction_type__name='comment'
    ).count()
    
    # Top active users (by posts)
    top_posters = User.objects.annotate(
        post_count=Count('posts')
    ).filter(post_count__gt=0).order_by('-post_count')[:10]
    
    # Top engaged posts (by reactions + comments)
    top_posts = Post.objects.annotate(
        reaction_count=Count('interactions', filter=Q(interactions__interaction_type__name='reaction')),
        comment_count=Count('interactions', filter=Q(interactions__interaction_type__name='comment'))
    ).order_by('-reaction_count', '-comment_count')[:10]
    
    # Posts by scope
    posts_by_scope = Post.objects.values('scope').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Group activity
    group_activity = Group.objects.annotate(
        post_count=Count('group_posts'),
        member_count=Count('members')
    ).order_by('-post_count')[:10]
    
    # Daily post trend (last 7 days)
    daily_posts = []
    for i in range(7):
        day = end_date - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = Post.objects.filter(
            created_at__gte=day_start,
            created_at__lt=day_end
        ).count()
        daily_posts.append({
            'date': day_start.strftime('%d/%m'),
            'count': count
        })
    daily_posts.reverse()
    
    return render(request, 'report_management/baocao_tuongtac.html', {
        'user': request.user,
        'total_posts': total_posts,
        'posts_this_month': posts_this_month,
        'total_reactions': total_reactions,
        'total_comments': total_comments,
        'top_posters': top_posters,
        'top_posts': top_posts,
        'posts_by_scope': posts_by_scope,
        'group_activity': group_activity,
        'daily_posts': daily_posts,
    })

@login_required
def baocao_congviec(request):
    """Work report - Báo cáo công việc"""
    from django.db.models import Count, Q
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Task statistics
    total_tasks = Task.objects.count()
    tasks_todo = Task.objects.filter(status='Todo').count()
    tasks_in_progress = Task.objects.filter(status='InProgress').count()
    tasks_done = Task.objects.filter(status='Done').count()
    
    # Tasks this week
    tasks_this_week = Task.objects.filter(work_date__gte=week_start).count()
    tasks_this_month = Task.objects.filter(work_date__gte=month_start).count()
    
    # Tasks by department
    tasks_by_department = Task.objects.values('department').annotate(
        total=Count('id'),
        done=Count('id', filter=Q(status='Done')),
        in_progress=Count('id', filter=Q(status='InProgress')),
        todo=Count('id', filter=Q(status='Todo'))
    ).order_by('department')
    
    # Tasks by shift
    tasks_by_shift = Task.objects.values('shift').annotate(
        count=Count('id')
    ).order_by('shift')
    
    # Top performers (users with most completed tasks)
    top_performers = User.objects.annotate(
        completed_tasks=Count('assigned_tasks', filter=Q(assigned_tasks__status='Done'))
    ).filter(completed_tasks__gt=0).order_by('-completed_tasks')[:10]
    
    # Task responses statistics
    total_responses = TaskResponse.objects.count()
    accepted_responses = TaskResponse.objects.filter(status=True).count()
    rejected_responses = TaskResponse.objects.filter(status=False).count()
    
    # Meeting statistics
    total_meetings = Meeting.objects.count()
    upcoming_meetings = Meeting.objects.filter(
        start_time__gte=timezone.now(),
        status='Upcoming'
    ).count()
    completed_meetings = Meeting.objects.filter(status='Completed').count()
    
    # Work schedule statistics
    total_schedules = WorkSchedule.objects.count()
    pending_schedules = WorkSchedule.objects.filter(status=0).count()
    accepted_schedules = WorkSchedule.objects.filter(status=1).count()
    rejected_schedules = WorkSchedule.objects.filter(status=2).count()
    
    # Daily task completion trend (last 7 days)
    daily_completions = []
    for i in range(7):
        day = today - timedelta(days=i)
        count = Task.objects.filter(
            work_date=day,
            status='Done'
        ).count()
        daily_completions.append({
            'date': day.strftime('%d/%m'),
            'count': count
        })
    daily_completions.reverse()
    
    return render(request, 'report_management/baocao_congviec.html', {
        'user': request.user,
        'total_tasks': total_tasks,
        'tasks_todo': tasks_todo,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_this_week': tasks_this_week,
        'tasks_this_month': tasks_this_month,
        'tasks_by_department': tasks_by_department,
        'tasks_by_shift': tasks_by_shift,
        'top_performers': top_performers,
        'total_responses': total_responses,
        'accepted_responses': accepted_responses,
        'rejected_responses': rejected_responses,
        'total_meetings': total_meetings,
        'upcoming_meetings': upcoming_meetings,
        'completed_meetings': completed_meetings,
        'total_schedules': total_schedules,
        'pending_schedules': pending_schedules,
        'accepted_schedules': accepted_schedules,
        'rejected_schedules': rejected_schedules,
        'daily_completions': daily_completions,
    })

@login_required
def baocao_xephang(request):
    """Ranking report"""
    from django.db.models import Count
    
    # Get user rankings by post count
    user_rankings = User.objects.annotate(
        post_count=Count('post')
    ).order_by('-post_count')[:10]
    
    return render(request, 'report_management/baocao_xephang.html', {
        'user': request.user,
        'user_rankings': user_rankings
    })

# Additional Helper Views

@login_required
def create_work_shift(request):
    """Create new work shift"""
    if request.method == 'POST':
        form = WorkShiftForm(request.POST)
        if form.is_valid():
            shift = form.save()
            messages.success(request, 'Đã tạo ca làm việc thành công!')
            return redirect('work_schedules_management')
    else:
        form = WorkShiftForm()
    
    return render(request, 'work_schedules_management/create_shift.html', {'form': form})

@login_required
def add_group_member(request, group_id):
    """Add member to group"""
    group = get_object_or_404(Group, id=group_id)
    
    # Check if user is the group creator (admin)
    is_admin = (group.created_by == request.user)
    if not is_admin:
        messages.error(request, 'Bạn không có quyền thêm thành viên!')
        return redirect('nhom_detail', nhom_id=group_id)
    
    if request.method == 'POST':
        form = GroupMemberForm(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            
            # Check if user is already a member
            if GroupMember.objects.filter(group=group, user=user).exists():
                messages.error(request, f'{user.get_full_name()} đã là thành viên của nhóm!')
            else:
                member = form.save(commit=False)
                member.group = group
                member.save()
                messages.success(request, f'Đã thêm {user.get_full_name()} vào nhóm!')
                return redirect('nhom_detail', nhom_id=group_id)
    else:
        form = GroupMemberForm()
    
    # Get users who are not already members
    existing_member_ids = group.members.values_list('user_id', flat=True)
    available_users = User.objects.exclude(id__in=existing_member_ids).order_by('first_name', 'last_name')
    
    # Update form queryset
    form.fields['user'].queryset = available_users
    form.fields['user'].widget.attrs.update({'class': 'form-control'})
    
    return render(request, 'group_management/add_member.html', {
        'form': form,
        'group': group
    })

@login_required
def react_to_post(request, post_id):
    """React to a post (like/unlike)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    post = get_object_or_404(Post, id=post_id)
    
    # Get or create reaction type
    reaction_type, _ = InteractionType.objects.get_or_create(
        name='reaction',
        defaults={'description': 'Thả cảm xúc'}
    )
    
    # Check if user already reacted
    existing_reaction = Interaction.objects.filter(
        post=post,
        user=request.user,
        interaction_type=reaction_type
    ).first()
    
    if existing_reaction:
        # Unlike
        existing_reaction.delete()
        liked = False
    else:
        # Like
        Interaction.objects.create(
            post=post,
            user=request.user,
            interaction_type=reaction_type
        )
        liked = True
    
    count = post.interactions.filter(interaction_type=reaction_type).count()
    return JsonResponse({'success': True, 'liked': liked, 'count': count})
@login_required
def account(request):
    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'update_profile':
            user = request.user
            if user.is_authenticated:
                user.first_name = request.POST.get('first_name', '')
                user.last_name = request.POST.get('last_name', '')
                user.email = request.POST.get('email', '')
                user.save()
                return JsonResponse({'status': 'ok', 'message': 'Đã lưu thông tin cá nhân.'})
            return JsonResponse({'status': 'error', 'message': 'Chưa đăng nhập.'}, status=403)

        if action == 'change_password':
            user = request.user
            if not user.is_authenticated:
                return JsonResponse({'status': 'error', 'message': 'Chưa đăng nhập.'}, status=403)
            data = json.loads(request.body)
            old_pw = data.get('old_password', '')
            new_pw = data.get('new_password', '')
            confirm_pw = data.get('confirm_password', '')
            if not user.check_password(old_pw):
                return JsonResponse({'status': 'error', 'message': 'Mật khẩu hiện tại không đúng.'})
            if len(new_pw) < 8:
                return JsonResponse({'status': 'error', 'message': 'Mật khẩu mới phải có ít nhất 8 ký tự.'})
            if new_pw != confirm_pw:
                return JsonResponse({'status': 'error', 'message': 'Xác nhận mật khẩu không khớp.'})
            user.set_password(new_pw)
            user.save()
            update_session_auth_hash(request, user)
            return JsonResponse({'status': 'ok', 'message': 'Đổi mật khẩu thành công.'})

    return render(request, 'account_management/account.html')