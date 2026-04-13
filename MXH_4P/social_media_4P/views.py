from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, Http404
from django.db.models import Q, Max
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
    tasks = Task.objects.select_related('created_by', 'assigned_to').all().order_by('-created_at')
    
    # Calculate statistics
    tasks_in_progress = tasks.filter(status='InProgress').count()
    tasks_done = tasks.filter(status='Done').count()
    tasks_todo = tasks.filter(status='Todo').count()
    
    return render(request, 'works_management/work_management_dynamic.html', {
        'tasks': tasks,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
    })

@login_required
def create_task(request):
    """Create new task"""
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.assigner = request.user
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
    
    # Only assigner can edit
    if task.assigner != request.user:
        messages.error(request, 'Bạn không có quyền chỉnh sửa công việc này!')
        return redirect('work_management')
    
    if request.method == 'POST':
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
        form = TaskResponseForm(request.POST)
        if form.is_valid():
            response = form.save(commit=False)
            response.task = task
            response.responder = request.user
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
    """Meeting schedule page"""
    from django.utils import timezone
    
    meetings = Meeting.objects.select_related('created_by').prefetch_related('participants__user').all().order_by('start_time')
    
    # Calculate statistics
    now = timezone.now()
    meetings_total = meetings.count()
    meetings_upcoming = meetings.filter(start_time__gte=now).count()
    meetings_completed = meetings.filter(end_time__lt=now).count()
    meetings_today = meetings.filter(start_time__date=now.date()).count()
    
    return render(request, 'works_management/meeting_schedule.html', {
        'meetings': meetings,
        'meetings_total': meetings_total,
        'meetings_upcoming': meetings_upcoming,
        'meetings_completed': meetings_completed,
        'meetings_today': meetings_today,
    })

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
    # Get tasks assigned to current user
    my_tasks = Task.objects.filter(assigned_to=request.user).select_related('created_by').order_by('-created_at')
    
    # Calculate task statistics
    tasks_total = my_tasks.count()
    tasks_in_progress = my_tasks.filter(status='InProgress').count()
    tasks_done = my_tasks.filter(status='Done').count()
    tasks_todo = my_tasks.filter(status='Todo').count()
    
    # Get upcoming meetings where user is a participant
    from django.utils import timezone
    my_meetings = Meeting.objects.filter(
        participants__user=request.user,
        start_time__gte=timezone.now()
    ).select_related('created_by').order_by('start_time')[:5]
    
    return render(request, 'works_management/employee_dashboard.html', {
        'my_tasks': my_tasks,
        'my_meetings': my_meetings,
        'tasks_total': tasks_total,
        'tasks_in_progress': tasks_in_progress,
        'tasks_done': tasks_done,
        'tasks_todo': tasks_todo,
    })

@login_required
def all_notifications(request):
    """All notifications page"""
    # Get all tasks where user is assigned_to
    notifications = Task.objects.filter(assigned_to=request.user).select_related('created_by').order_by('-created_at')
    
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
    
    # Get all tasks for the selected date
    tasks = Task.objects.filter(
        deadline__date=selected_date
    ).select_related('assigned_to', 'created_by').order_by('priority', 'title')
    
    return render(request, 'works_management/weekly_schedule.html', {
        'schedules': schedules,
        'tasks': tasks,
        'selected_date': selected_date,
    })

@login_required
def all_tasks(request):
    """All tasks page"""
    tasks = Task.objects.select_related('created_by', 'assigned_to').all().order_by('-created_at')
    
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
    responses = TaskResponse.objects.select_related('task', 'responder').all().order_by('-created_at')
    
    return render(request, 'works_management/all_responses.html', {
        'responses': responses
    })

@login_required
def work_schedules_management(request):
    """Work schedules management page"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Get current week
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    # Get schedules for current week
    schedules = WorkSchedule.objects.select_related('user', 'shift_code').filter(
        week_start=week_start
    ).order_by('work_date', 'user__username')
    
    # Get all users for creating schedules
    users = User.objects.filter(groups__name='Employee').order_by('username')
    
    # Get all shifts
    shifts = WorkShift.objects.all().order_by('start_time')
    
    # Calculate statistics
    total_schedules = schedules.count()
    pending_schedules = schedules.filter(status=0).count()
    accepted_schedules = schedules.filter(status=1).count()
    rejected_schedules = schedules.filter(status=2).count()
    
    return render(request, 'work_schedules_management/work_schedules_management.html', {
        'schedules': schedules,
        'users': users,
        'shifts': shifts,
        'week_start': week_start,
        'total_schedules': total_schedules,
        'pending_schedules': pending_schedules,
        'accepted_schedules': accepted_schedules,
        'rejected_schedules': rejected_schedules,
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
    from datetime import timedelta
    import json
    
    # Get current week
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    # Get schedules for current user
    schedules = WorkSchedule.objects.filter(
        user=request.user
    ).select_related('shift_code').order_by('work_date')
    
    # Get all employees for the schedule table
    employees = User.objects.filter(groups__name='Employee').order_by('username')
    
    # Get all schedules for the week (for all employees)
    all_schedules = WorkSchedule.objects.filter(
        week_start=week_start
    ).select_related('user', 'shift_code').order_by('work_date', 'user__username')
    
    # Organize schedules by employee and date
    schedule_data = {}
    for schedule in all_schedules:
        emp_id = schedule.user.id
        if emp_id not in schedule_data:
            schedule_data[emp_id] = {
                'user': schedule.user,
                'schedules': {}
            }
        date_str = schedule.work_date.strftime('%Y-%m-%d')
        schedule_data[emp_id]['schedules'][date_str] = {
            'id': schedule.id,
            'shift_code': schedule.shift_code.shift_code,
            'shift_name': schedule.shift_code.shift_name,
            'status': schedule.status,
            'employee_note': schedule.employee_note or '',
        }
    
    # Convert to JSON for JavaScript
    schedule_json = json.dumps({
        emp_id: {
            'username': data['user'].username,
            'full_name': f"{data['user'].first_name} {data['user'].last_name}".strip() or data['user'].username,
            'schedules': data['schedules']
        }
        for emp_id, data in schedule_data.items()
    })
    
    return render(request, 'work_schedules_management/employee_work_schedules.html', {
        'schedules': schedules,
        'employees': employees,
        'schedule_json': schedule_json,
        'week_start': week_start,
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
    groups = Group.objects.prefetch_related('members', 'posts').all().order_by('-created_at')
    
    # Add member count and post count for each group
    for group in groups:
        group.member_count = group.members.count()
        group.post_count = group.posts.count()
    
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
    
    # Handle post creation
    if request.method == 'POST' and is_member:
        content = request.POST.get('content', '').strip()
        images = request.FILES.getlist('images')
        
        if content:
            # Create post with group scope
            post = Post.objects.create(
                user=request.user,
                content=content,
                scope='groups'
            )
            post.groups.add(group)
            
            # Save images
            from .models import PostImage
            for index, image in enumerate(images):
                PostImage.objects.create(
                    post=post,
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
            messages.success(request, 'Đã cập nhật nhóm!')
            return redirect('nhom_detail', nhom_id=nhom_id)
    else:
        form = GroupForm(instance=group)
    
    return render(request, 'group_management/nhom_edit.html', {
        'form': form,
        'nhom': group,
        'user': request.user
    })

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
    """Interaction report"""
    # Get interaction statistics
    from django.db.models import Count
    
    interaction_stats = Interaction.objects.values(
        'interaction_type__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')
    
    return render(request, 'report_management/baocao_tuongtac.html', {
        'user': request.user,
        'interaction_stats': interaction_stats
    })

@login_required
def baocao_congviec(request):
    """Work report"""
    from django.db.models import Count, Q
    
    # Get task statistics
    task_stats = {
        'total': Task.objects.count(),
        'pending': Task.objects.filter(status='pending').count(),
        'in_progress': Task.objects.filter(status='in_progress').count(),
        'completed': Task.objects.filter(status='completed').count(),
    }
    
    return render(request, 'report_management/baocao_congviec.html', {
        'user': request.user,
        'task_stats': task_stats
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