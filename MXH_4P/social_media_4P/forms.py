from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import (
    User, Post, Interaction, InteractionType, Group, GroupMember,
    Task, TaskResponse, Meeting, MeetingParticipant,
    Conversation, ConversationMember, Message,
    WorkShift, WorkSchedule
)


# ============================================
# USER FORMS
# ============================================

class UserRegistrationForm(UserCreationForm):
    """Form for user registration"""
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=150, required=True)
    last_name = forms.CharField(max_length=150, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
        }


class UserProfileForm(forms.ModelForm):
    """Form for updating user profile"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar_initials', 'avatar_gradient']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'avatar_initials': forms.TextInput(attrs={'class': 'form-control', 'maxlength': '5', 'placeholder': 'e.g., JD'}),
            'avatar_gradient': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'CSS gradient'}),
        }


class LoginForm(forms.Form):
    """Form for user login"""
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )


# ============================================
# POST FORMS
# ============================================

class PostForm(forms.ModelForm):
    """Form for creating/editing posts"""
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label='Chọn nhóm'
    )
    
    class Meta:
        model = Post
        fields = ['content', 'scope', 'groups']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': "Bạn đang nghĩ gì?"
            }),
            'scope': forms.RadioSelect(attrs={'class': 'scope-radio'}),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        scope = cleaned_data.get('scope')
        groups = cleaned_data.get('groups')
        
        # Validate scope and groups
        if scope == 'groups' and not groups:
            raise forms.ValidationError('Vui lòng chọn ít nhất một nhóm khi đăng theo nhóm')
        
        return cleaned_data

        # Validate file sizes
        if image and image.size > 5 * 1024 * 1024:  # 5MB
            raise forms.ValidationError('Ảnh quá lớn (tối đa 5MB)')
        
        if video and video.size > 50 * 1024 * 1024:  # 50MB
            raise forms.ValidationError('Video quá lớn (tối đa 50MB)')
        
        return cleaned_data


class PostCreateForm(forms.ModelForm):
    """Simplified form for creating posts (without status)"""
    class Meta:
        model = Post
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': "Share something..."
            }),
        }


# ============================================
# INTERACTION FORMS
# ============================================

class InteractionForm(forms.ModelForm):
    """Form for creating interactions (comments, reactions, shares)"""
    class Meta:
        model = Interaction
        fields = ['interaction_type', 'content']
        widgets = {
            'interaction_type': forms.Select(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Write a comment...'
            }),
        }


class CommentForm(forms.ModelForm):
    """Simplified form for comments only"""
    class Meta:
        model = Interaction
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Write a comment...'
            }),
        }


# ============================================
# GROUP FORMS
# ============================================

class GroupForm(forms.ModelForm):
    """Form for creating/editing groups"""
    class Meta:
        model = Group
        fields = ['name', 'description', 'status']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Group name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Group description'
            }),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }


class GroupMemberForm(forms.ModelForm):
    """Form for adding members to group"""
    class Meta:
        model = GroupMember
        fields = ['user']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
        }


# ============================================
# TASK FORMS
# ============================================

class TaskForm(forms.ModelForm):
    """Form for creating/editing tasks"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'assigned_to', 'status']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Task title',
                'maxlength': '200'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Task description'
            }),
            'assigned_to': forms.Select(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def clean_title(self):
        """Validate title is not empty and has reasonable length"""
        title = self.cleaned_data.get('title')
        if title and len(title) < 5:
            raise forms.ValidationError('Title must be at least 5 characters long')
        return title


class TaskResponseForm(forms.ModelForm):
    """Form for responding to tasks"""
    class Meta:
        model = TaskResponse
        fields = ['status', 'reason']
        widgets = {
            'status': forms.RadioSelect(choices=[(True, 'Accept'), (False, 'Reject')]),
            'reason': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Reason for rejection (if applicable)'
            }),
        }


# ============================================
# MEETING FORMS
# ============================================

class MeetingForm(forms.ModelForm):
    """Form for creating/editing meetings"""
    class Meta:
        model = Meeting
        fields = ['title', 'start_time', 'end_time']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Meeting title'
            }),
            'start_time': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            }),
            'end_time': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            }),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')
        
        if start_time and end_time and end_time <= start_time:
            raise forms.ValidationError('End time must be after start time')
        
        return cleaned_data


class MeetingParticipantForm(forms.ModelForm):
    """Form for adding participants to meeting"""
    class Meta:
        model = MeetingParticipant
        fields = ['user']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
        }


# ============================================
# MESSAGE FORMS
# ============================================

class MessageForm(forms.ModelForm):
    """Form for sending messages"""
    class Meta:
        model = Message
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Type a message...'
            }),
        }


class ConversationForm(forms.ModelForm):
    """Form for creating conversations"""
    class Meta:
        model = Conversation
        fields = ['status']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-control'}),
        }


# ============================================
# WORK SCHEDULE FORMS
# ============================================

class WorkShiftForm(forms.ModelForm):
    """Form for creating/editing work shifts"""
    class Meta:
        model = WorkShift
        fields = ['shift_code', 'shift_name', 'start_time', 'end_time', 'color_code']
        widgets = {
            'shift_code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., M5'
            }),
            'shift_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Morning Shift'
            }),
            'start_time': forms.TimeInput(attrs={
                'class': 'form-control',
                'type': 'time'
            }),
            'end_time': forms.TimeInput(attrs={
                'class': 'form-control',
                'type': 'time'
            }),
            'color_code': forms.TextInput(attrs={
                'class': 'form-control',
                'type': 'color',
                'placeholder': '#4CAF50'
            }),
        }


class WorkScheduleForm(forms.ModelForm):
    """Form for creating/editing work schedules"""
    class Meta:
        model = WorkSchedule
        fields = ['user', 'shift_code', 'work_date', 'status', 'employee_note', 'manager_note', 'week_start']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'shift_code': forms.Select(attrs={'class': 'form-control'}),
            'work_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'employee_note': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Employee note'
            }),
            'manager_note': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Manager note'
            }),
            'week_start': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
        }


class WorkScheduleCreateForm(forms.ModelForm):
    """Simplified form for creating work schedules"""
    class Meta:
        model = WorkSchedule
        fields = ['user', 'shift_code', 'work_date', 'week_start']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'shift_code': forms.Select(attrs={'class': 'form-control'}),
            'work_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'week_start': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
        }


class WorkScheduleResponseForm(forms.ModelForm):
    """Form for employees to respond to work schedules"""
    class Meta:
        model = WorkSchedule
        fields = ['status', 'employee_note']
        widgets = {
            'status': forms.RadioSelect(choices=[
                (1, 'Accept'),
                (2, 'Reject')
            ]),
            'employee_note': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Reason for rejection (if applicable)'
            }),
        }
