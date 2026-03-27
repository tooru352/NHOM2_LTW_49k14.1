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
from social_media_4P import views

# URL patterns for FourPoint Hotel Management System
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_page, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('account/', views.account, name='account'),
    path('', views.login_page, name='root'),
    path('home/', views.home, name='home'),
    path('messaging/', views.messaging, name='messaging'),
    path('work-management/', views.work_management, name='work_management'),
    path('meeting-schedule/', views.meeting_schedule, name='meeting_schedule'),
    path('employee-dashboard/', views.employee_dashboard, name='employee_dashboard'),
    path('all-notifications/', views.all_notifications, name='all_notifications'),
    path('weekly-schedule/', views.weekly_schedule, name='weekly_schedule'),
    path('all-responses/', views.all_responses, name='all_responses'),
    path('work_schedules_management/', views.work_schedules_management, name='work_schedules_management'),
    path('employee_work_schedules/', views.employee_work_schedules, name='employee_work_schedules'),
    path('profile/', views.profile, name='profile'),
    path('nhom/', views.nhom, name='nhom'),
    path('nhom/quanly/', views.nhom_quanly, name='nhom_quanly'),
    path('nhom/nhanvien/', views.nhom_nhanvien, name='nhom_nhanvien'),
    path('nhom/new/', views.nhom_new, name='nhom_new'),
    path('nhom/new/sua/', views.nhom_new_edit, name='nhom_new_edit'),
    path('nhom/<int:nhom_id>/', views.nhom_detail, name='nhom_detail'),
    path('nhom/<int:nhom_id>/sua/', views.nhom_edit, name='nhom_edit'),
    path('baocao/tuongtac/', views.baocao_tuongtac, name='baocao_tuongtac'),
    path('baocao/congviec/', views.baocao_congviec, name='baocao_congviec'),
    path('baocao/xephang/', views.baocao_xephang, name='baocao_xephang'),
]
