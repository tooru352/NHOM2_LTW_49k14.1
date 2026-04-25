from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# ============================================
# 1. USER MODEL
# ============================================
class User(AbstractUser):
    avatar_initials = models.CharField(max_length=5, blank=True)
    avatar_gradient = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'Users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username}"
    
    def get_initials(self):
        if self.avatar_initials:
            return self.avatar_initials
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        return self.username[:2].upper()
    
    def is_manager(self):
        return self.groups.filter(name='Manager').exists()
    
    def is_employee(self):
        return self.groups.filter(name='Employee').exists()
    
    def get_role_display(self):
        if self.is_manager():
            return 'Manager'
        elif self.is_employee():
            return 'Employee'
        return 'No Role'


# ============================================
# 2. GROUP MODEL
# ============================================
class Group(models.Model):
    STATUS_CHOICES = (
        ('group', 'Group'),
        ('private', 'Private'),
    )
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='group')
    
    class Meta:
        db_table = 'Groups'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


# ============================================
# 3. GROUP MEMBERS
# ============================================
class GroupMember(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    joined_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'GroupMembers'
        unique_together = ('group', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.group.name}"


# ============================================
# 4. INTERACTION TYPE (Lookup table)
# ============================================
class InteractionType(models.Model):
    name = models.CharField(max_length=50, unique=True)  # 'comment', 'reaction', 'share'
    
    class Meta:
        db_table = 'InteractionTypes'
        verbose_name = 'Interaction Type'
        verbose_name_plural = 'Interaction Types'
    
    def __str__(self):
        return self.name


# ============================================
# 5. POST MODEL
# ============================================
class Post(models.Model):
    SCOPE_CHOICES = (
        ('hotel', 'Toàn khách sạn'),
        ('groups', 'Theo nhóm'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default='active')  # active, deleted, hidden
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='hotel')  # Phạm vi bài đăng
    groups = models.ManyToManyField('Group', related_name='group_posts', blank=True)  # Các nhóm được chọn (nếu scope='groups')
    
    class Meta:
        db_table = 'Posts'
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
    
    def __str__(self):
        return f"Post by {self.user.username} - {self.created_at.strftime('%d/%m/%Y')}"
    
    def get_time_display(self):
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days == 0:
            hours = diff.seconds // 3600
            if hours == 0:
                minutes = diff.seconds // 60
                return f"{minutes} minutes ago"
            return f"{hours} hours ago"
        elif diff.days == 1:
            return "Yesterday"
        else:
            return self.created_at.strftime("%d/%m/%Y")
    
    def has_media(self):
        """Check if post has any media (images)"""
        return self.images.exists()
    
    def is_hotel_wide(self):
        """Check if post is for entire hotel"""
        return self.scope == 'hotel'
    
    def get_scope_display_text(self):
        """Get display text for scope"""
        if self.scope == 'hotel':
            return '🏨 Toàn khách sạn'
        else:
            group_names = [g.name for g in self.groups.all()]
            if len(group_names) == 0:
                return '👥 Không có nhóm'
            elif len(group_names) == 1:
                return f'👥 {group_names[0]}'
            else:
                return f'👥 {len(group_names)} nhóm'


# ============================================
# 5B. POST IMAGE MODEL (Multiple images per post)
# ============================================
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='posts/images/%Y/%m/%d/')
    order = models.IntegerField(default=0)  # For ordering images
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'PostImages'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"Image for Post {self.post.id}"


# ============================================
# 6. INTERACTION (comment, reaction, share)
# ============================================
class Interaction(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='interactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.ForeignKey(InteractionType, on_delete=models.CASCADE, related_name='interactions')
    content = models.TextField(blank=True, null=True)  # For comment content
    created_at = models.DateTimeField(default=timezone.now)  # Timestamp for interaction
    
    class Meta:
        db_table = 'Interactions'
        verbose_name = 'Interaction'
        verbose_name_plural = 'Interactions'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'user', 'interaction_type']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.interaction_type.name} - Post {self.post.id}"


# ============================================
# 7. TASK TEMPLATE (Template for daily tasks)
# ============================================
class TaskTemplate(models.Model):
    SHIFT_CHOICES = (
        ('Sáng', 'Ca Sáng'),
        ('Chiều', 'Ca Chiều'),
        ('Tối', 'Ca Tối'),
        ('Cả ngày', 'Cả ngày'),
    )
    DEPARTMENT_CHOICES = (
        ('F&B', 'Food & Beverage'),
        ('HK', 'Housekeeping'),
        ('FO', 'Front Office'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='Sáng')
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    order = models.IntegerField(default=0)  # For ordering templates
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'TaskTemplates'
        ordering = ['department', 'order', 'shift']
    
    def __str__(self):
        return f"{self.department} - {self.title}"


# ============================================
# 7.5. TASK MODEL
# ============================================
class Task(models.Model):
    STATUS_CHOICES = (
        ('Todo', 'To Do'),
        ('InProgress', 'In Progress'),
        ('Done', 'Done'),
        ('Cancelled', 'Cancelled'),
    )
    SHIFT_CHOICES = (
        ('Sáng', 'Ca Sáng'),
        ('Chiều', 'Ca Chiều'),
        ('Tối', 'Ca Tối'),
        ('Cả ngày', 'Cả ngày'),
    )
    DEPARTMENT_CHOICES = (
        ('F&B', 'Food & Beverage'),
        ('HK', 'Housekeeping'),
        ('FO', 'Front Office'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Todo')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='Sáng')
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    work_date = models.DateField(default=timezone.now)  # Ngày làm việc
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'Tasks'
        ordering = ['-work_date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    def get_department_display_name(self):
        """Get full department name"""
        dept_map = {
            'F&B': 'Food & Beverage',
            'HK': 'Housekeeping',
            'FO': 'Front Office',
        }
        return dept_map.get(self.department, self.department or 'Chưa xác định')


# ============================================
# 7.5. TASK ASSIGNMENT (Many-to-Many relationship for multiple employees per task)

class TaskAssignment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_assignments')
    assigned_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'TaskAssignments'
        unique_together = ('task', 'user')
        ordering = ['assigned_at']
    
    def __str__(self):
        return f"{self.task.title} - {self.user.get_full_name() or self.user.username}"


# ============================================
# 8. TASK RESPONSE
# ============================================
class TaskResponse(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_responses')
    status = models.BooleanField()  # True = Accept, False = Reject
    reason = models.CharField(max_length=500, blank=True, null=True)
    responded_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'TaskResponses'
        ordering = ['-responded_at']
    
    def __str__(self):
        status_text = "Accepted" if self.status else "Rejected"
        return f"{self.user.username} - {status_text} - Task {self.task.id}"


# ============================================
# 9. MEETING MODEL
# ============================================
class Meeting(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_meetings')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    group = models.ForeignKey('Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='meetings')
    
    STATUS_CHOICES = [
        ('Upcoming', 'Sắp diễn ra'),
        ('Completed', 'Hoàn thành'),
        ('Cancelled', 'Đã hủy'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Upcoming')
    
    class Meta:
        db_table = 'Meetings'
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%d/%m/%Y %H:%M')}"
    
    def get_status_display_name(self):
        status_map = {
            'Upcoming': 'Sắp diễn ra',
            'Completed': 'Hoàn thành',
            'Cancelled': 'Đã hủy',
        }
        return status_map.get(self.status, self.status)


# ============================================
# 10. MEETING PARTICIPANTS
# ============================================
class MeetingParticipant(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_participations')
    
    class Meta:
        db_table = 'MeetingParticipants'
        unique_together = ('meeting', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.meeting.title}"


# ============================================
# 11. CONVERSATION MODEL
# ============================================
class Conversation(models.Model):
    STATUS_CHOICES = (
        ('group', 'Group'),
        ('private', 'Private'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='private')
    name = models.CharField(max_length=200, blank=True, null=True)  # Tên tùy chỉnh cho nhóm chat
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'Conversations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Conversation {self.id} - {self.get_status_display()}"


# ============================================
# 12. CONVERSATION MEMBERS
# ============================================
class ConversationMember(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversation_memberships')
    
    class Meta:
        db_table = 'ConversationMembers'
        unique_together = ('conversation', 'user')
    
    def __str__(self):
        return f"{self.user.username} - Conversation {self.conversation.id}"


# ============================================
# 13. MESSAGE MODEL
# ============================================
class Message(models.Model):
    TYPE_CHOICES = (
        ('text', 'Văn bản'),
        ('image', 'Hình ảnh'),
        ('file', 'Tệp đính kèm'),
        ('call', 'Cuộc gọi'),
    )
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='text')
    image = models.ImageField(upload_to='messages/images/%Y/%m/%d/', null=True, blank=True)
    file = models.FileField(upload_to='messages/files/%Y/%m/%d/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'Messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"


# ============================================
# 14. WORK SHIFT MODEL
# ============================================
class WorkShift(models.Model):
    shift_code = models.CharField(max_length=10, primary_key=True)  # M5, A1, E9, DO
    shift_name = models.CharField(max_length=50)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    color_code = models.CharField(max_length=7, blank=True, null=True)  # #2196F3
    
    class Meta:
        db_table = 'WorkShifts'
    
    def __str__(self):
        if self.start_time and self.end_time:
            return f"{self.shift_code} - {self.shift_name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"
        return f"{self.shift_code} - {self.shift_name}"


# ============================================
# 15. WORK SCHEDULE MODEL
# ============================================
class WorkSchedule(models.Model):
    STATUS_CHOICES = (
        (0, 'Pending'),
        (1, 'Accepted'),
        (2, 'Rejected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_schedules')
    shift_code = models.ForeignKey(WorkShift, on_delete=models.CASCADE, related_name='schedules')
    work_date = models.DateField()
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    employee_note = models.CharField(max_length=500, blank=True, null=True)
    manager_note = models.CharField(max_length=500, blank=True, null=True)
    week_start = models.DateField()  # Monday of the week
    
    class Meta:
        db_table = 'WorkSchedules'
        unique_together = ('user', 'work_date')
        ordering = ['work_date', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.work_date} - {self.shift_code.shift_code} - {self.get_status_display()}"


# ============================================
# 16. CALL REQUEST MODEL
# ============================================
class CallRequest(models.Model):
    STATUS_CHOICES = (
        ('calling', 'Đang gọi'),
        ('accepted', 'Đã chấp nhận'),
        ('rejected', 'Đã từ chối'),
        ('missed', 'Nhỡ máy'),
        ('ended', 'Đã kết thúc'),
    )
    caller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outgoing_calls')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incoming_calls')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='calls')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='calling')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'CallRequests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.caller.username} → {self.receiver.username} ({self.status})"
