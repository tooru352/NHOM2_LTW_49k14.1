from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Post, InteractionType, Interaction, Group, GroupMember,
    Task, TaskResponse, Meeting, MeetingParticipant,
    Conversation, ConversationMember, Message,
    WorkShift, WorkSchedule
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'get_groups', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'groups']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar_initials', 'avatar_gradient')}),
    )
    
    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_groups.short_description = 'Role'

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'get_short_content', 'created_at', 'status']
    list_filter = ['created_at', 'status']
    search_fields = ['content', 'user__username']
    date_hierarchy = 'created_at'
    
    def get_short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_short_content.short_description = 'Content'

@admin.register(InteractionType)
class InteractionTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'interaction_type', 'get_short_content']
    list_filter = ['interaction_type']
    search_fields = ['post__id', 'user__username', 'content']
    
    def get_short_content(self, obj):
        if obj.content:
            return obj.content[:30] + '...' if len(obj.content) > 30 else obj.content
        return '-'
    get_short_content.short_description = 'Content'

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_by', 'created_at', 'status']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description']

@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ['group', 'user', 'joined_at']
    list_filter = ['joined_at']
    search_fields = ['group__name', 'user__username']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'assigned_to', 'created_by', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']

@admin.register(TaskResponse)
class TaskResponseAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'status', 'responded_at']
    list_filter = ['status', 'responded_at']

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'start_time', 'end_time', 'created_by']
    list_filter = ['start_time']
    search_fields = ['title']

@admin.register(MeetingParticipant)
class MeetingParticipantAdmin(admin.ModelAdmin):
    list_display = ['meeting', 'user']
    search_fields = ['meeting__title', 'user__username']

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'created_at']
    list_filter = ['status', 'created_at']

@admin.register(ConversationMember)
class ConversationMemberAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'user']
    search_fields = ['user__username']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'get_short_content', 'created_at', 'is_edited']
    list_filter = ['created_at', 'is_edited']
    search_fields = ['content', 'sender__username']
    
    def get_short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_short_content.short_description = 'Content'

@admin.register(WorkShift)
class WorkShiftAdmin(admin.ModelAdmin):
    list_display = ['shift_code', 'shift_name', 'start_time', 'end_time', 'color_code']
    search_fields = ['shift_code', 'shift_name']

@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'shift_code', 'work_date', 'status', 'week_start']
    list_filter = ['status', 'work_date', 'week_start']
    search_fields = ['user__username']
    date_hierarchy = 'work_date'

