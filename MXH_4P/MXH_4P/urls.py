"""
URL configuration for MXH_4P project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from social_media_4P import views

# URL patterns for FourPoint Hotel Management System
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('login/', views.login_page, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    path('', views.login_page, name='root'),
    
    # Account Management
    path('account/', views.account, name='account'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    
    # Posts Management
    path('home/', views.home, name='home'),
    path('posts/create/', views.create_post, name='create_post'),
    path('posts/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('posts/<int:post_id>/comment/', views.create_comment, name='create_comment'),
    path('posts/<int:post_id>/react/', views.react_to_post, name='react_to_post'),
    path('post/<int:post_id>/like/', views.react_to_post, name='like_post'),  # Alias for AJAX
    path('post/<int:post_id>/comment/', views.create_comment, name='comment_post'),  # Alias for AJAX
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post_ajax'),  # Alias for AJAX
    path('post/<int:post_id>/edit/', views.edit_post, name='edit_post_ajax'),  # Alias for AJAX
    path('post/<int:post_id>/data/', views.get_post_data, name='get_post_data'),  # Get post data for editing
    
    # Messaging
    path('messaging/', views.messaging, name='messaging'),
    path('api/conversations/', views.api_get_conversations, name='api_get_conversations'),
    path('api/conversations/create/', views.api_create_conversation, name='api_create_conversation'),
    path('api/conversations/<int:conversation_id>/messages/', views.api_get_messages, name='api_get_messages'),
    path('api/conversations/<int:conversation_id>/send/', views.send_message, name='send_message'),
    path('api/conversations/<int:conversation_id>/rename/', views.api_rename_conversation, name='api_rename_conversation'),
    path('api/users/', views.api_get_users, name='api_get_users'),
    
    # Work Management
    path('work-management/', views.work_management, name='work_management'),
    path('tasks/create/', views.create_task, name='create_task'),
    path('tasks/<int:task_id>/edit/', views.edit_task, name='edit_task'),
    path('tasks/<int:task_id>/respond/', views.respond_to_task, name='respond_to_task'),
    path('all-tasks/', views.all_tasks, name='all_tasks'),
    path('all-responses/', views.all_responses, name='all_responses'),
    
    # Meeting Management
    path('meeting-schedule/', views.meeting_schedule, name='meeting_schedule'),
    path('meetings/create/', views.create_meeting, name='create_meeting'),
    path('meetings/<int:meeting_id>/edit/', views.edit_meeting, name='edit_meeting'),
    
    # Employee Dashboard
    path('employee-dashboard/', views.employee_dashboard, name='employee_dashboard'),
    path('all-notifications/', views.all_notifications, name='all_notifications'),
    path('weekly-schedule/', views.weekly_schedule, name='weekly_schedule'),
    
    # Work Schedules Management
    path('work_schedules_management/', views.work_schedules_management, name='work_schedules_management'),
    path('work-schedules/create/', views.create_work_schedule, name='create_work_schedule'),
    path('work-schedules/<int:schedule_id>/edit/', views.edit_work_schedule, name='edit_work_schedule'),
    path('work-shifts/create/', views.create_work_shift, name='create_work_shift'),
    path('employee_work_schedules/', views.employee_work_schedules, name='employee_work_schedules'),
    
    # Group Management
    path('nhom/', views.nhom, name='nhom'),
    path('nhom/quanly/', views.nhom_quanly, name='nhom_quanly'),
    path('nhom/nhanvien/', views.nhom_nhanvien, name='nhom_nhanvien'),
    path('nhom/new/', views.nhom_new, name='nhom_new'),
    path('nhom/new/sua/', views.nhom_new_edit, name='nhom_new_edit'),
    path('nhom/<int:nhom_id>/', views.nhom_detail, name='nhom_detail'),
    path('nhom/<int:nhom_id>/sua/', views.nhom_edit, name='nhom_edit'),
    path('nhom/<int:group_id>/add-member/', views.add_group_member, name='add_group_member'),
    
    # Reports
    path('baocao/tuongtac/', views.baocao_tuongtac, name='baocao_tuongtac'),
    path('baocao/congviec/', views.baocao_congviec, name='baocao_congviec'),
    path('baocao/xephang/', views.baocao_xephang, name='baocao_xephang'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
