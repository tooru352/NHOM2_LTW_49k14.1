from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, Http404
import json

def login_page(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Try to authenticate
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Email hoặc mật khẩu không đúng!')
    
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def account(request):
    return render(request, 'account_management/account.html')

@login_required
def home(request):
    return render(request, 'posts_management/posts.html')

@login_required
def messaging(request):
    return render(request, 'messanging_management/messaging.html')

@login_required
def work_management(request):
    return render(request, 'works_management/work_management.html')

@login_required
def meeting_schedule(request):
    return render(request, 'works_management/meeting_schedule.html')

@login_required
def employee_dashboard(request):
    return render(request, 'works_management/employee_dashboard.html')

@login_required
def all_notifications(request):
    return render(request, 'works_management/all_notifications.html')

@login_required
def weekly_schedule(request):
    return render(request, 'works_management/weekly_schedule.html')

@login_required
def all_tasks(request):
    return render(request, 'works_management/all_tasks.html')

@login_required
def all_responses(request):
    return render(request, 'works_management/all_responses.html')

@login_required
def work_schedules_management(request):
    return render(request, 'work_schedules_management/work_schedules_management.html')

@login_required
def employee_work_schedules(request):
    return render(request, 'work_schedules_management/employee_work_schedules.html')

@login_required
def profile(request):
    return render(request, 'profile_management/profile.html')
# Vai tro nguoi dung hien tai: 'quanly' hoac 'nhanvien'
# Thay doi gia tri nay de test giao dien tuong ung
CURRENT_USER = {
    'av': 'PT',
    'ten': 'Phạm Xuân Thương',
    'role': 'quanly',  # 'quanly' hoac 'nhanvien'
}

NHOM_DATA = [
    {
        'id': 1, 'ten': 'Ban quản lý', 'admin': 'PT', 'mo_ta': 'Nhóm dành cho ban quản lý khách sạn',
        'loai': 'riengtu', 'loai_label': 'Riêng tư',
        'gradient': 'linear-gradient(135deg,#667eea,#764ba2)',
        'so_tv': 6, 'so_bv': 45,
        'thanh_vien': [
            {'ten': 'Phạm Xuân Thương', 'av': 'PT', 'color': '#3498db'},
            {'ten': 'Nguyễn Hải An',    'av': 'NA', 'color': '#e74c3c'},
            {'ten': 'Trần Văn Hùng',    'av': 'TH', 'color': '#2ecc71'},
            {'ten': 'Lê Minh Châu',     'av': 'LC', 'color': '#f39c12'},
        ],
        'bai_viet': [
            {'id':1,'tac_gia':'Phạm Xuân Thương','av':'PT','color':'#3498db','tg':'10:00 - 20/03/2026','noi_dung':'Moi toan the ban quan ly tham du cuoc hop vao luc 9h sang thu Hai tai phong hop tang 3.','like':5,'cmt':2},
            {'id':2,'tac_gia':'Nguyễn Hải An','av':'NA','color':'#e74c3c','tg':'14:30 - 18/03/2026','noi_dung':'Doanh thu thang 3 tang 12% so voi cung ky nam ngoai. Chi tiet xem file dinh kem.','like':8,'cmt':3},
        ]
    },
    {
        'id': 2, 'ten': 'Nhóm lễ tân', 'admin': 'PT', 'mo_ta': 'Chia sẻ kinh nghiệm và hỗ trợ khách hàng',
        'loai': 'phongban', 'loai_label': 'Phòng ban',
        'gradient': 'linear-gradient(135deg,#43e97b,#38f9d7)',
        'so_tv': 15, 'so_bv': 128,
        'thanh_vien': [
            {'ten': 'Lê Thị Hường',  'av': 'LH', 'color': '#e74c3c'},
            {'ten': 'Nguyễn Văn Minh','av': 'NM', 'color': '#3498db'},
            {'ten': 'Trần Thị Mai',  'av': 'TM', 'color': '#2ecc71'},
            {'ten': 'Hoàng Văn Nam', 'av': 'HN', 'color': '#f39c12'},
        ],
        'bai_viet': [
            {'id':3,'tac_gia':'Lê Thị Hường','av':'LH','color':'#e74c3c','tg':'09:00 - 22/03/2026','noi_dung':'Tu tuan toi ap dung quy trinh check-in moi, rut ngan thoi gian xuong con 3 phut.','like':12,'cmt':5},
        ]
    },
    {
        'id': 3, 'ten': 'Bộ phận F&B', 'admin': 'PT', 'mo_ta': 'Nhóm cho nhân viên F&B',
        'loai': 'phongban', 'loai_label': 'Phòng ban',
        'gradient': 'linear-gradient(135deg,#f093fb,#f5576c)',
        'so_tv': 22, 'so_bv': 89,
        'thanh_vien': [
            {'ten': 'Trần Văn Hùng', 'av': 'TH', 'color': '#2ecc71'},
            {'ten': 'Lê Minh Châu',  'av': 'LC', 'color': '#f39c12'},
            {'ten': 'Vũ Thị Hà',     'av': 'VH', 'color': '#9b59b6'},
            {'ten': 'Đỗ Quang Minh', 'av': 'DM', 'color': '#1abc9c'},
        ],
        'bai_viet': [
            {'id':4,'tac_gia':'Trần Văn Hùng','av':'TH','color':'#2ecc71','tg':'08:00 - 23/03/2026','noi_dung':'Menu buffet sang tuan toi da duoc cap nhat voi 5 mon moi.','like':9,'cmt':4},
        ]
    },
    {
        'id': 4, 'ten': 'Bộ phận Marketing năm 2025-2026', 'admin': 'PT', 'mo_ta': 'Đề xuất và thảo luận các ý tưởng cải tiến',
        'loai': 'congkhai', 'loai_label': 'Công khai',
        'gradient': 'linear-gradient(135deg,#4facfe,#00f2fe)',
        'so_tv': 34, 'so_bv': 67,
        'thanh_vien': [
            {'ten': 'Đỗ Quang Minh',     'av': 'DM', 'color': '#1abc9c'},
            {'ten': 'Phạm Xuân Thương',  'av': 'PT', 'color': '#3498db'},
            {'ten': 'Nguyễn Hải An',     'av': 'NA', 'color': '#e74c3c'},
            {'ten': 'Trần Thị Mai',      'av': 'TM', 'color': '#2ecc71'},
        ],
        'bai_viet': [
            {'id':5,'tac_gia':'Đỗ Quang Minh','av':'DM','color':'#1abc9c','tg':'11:00 - 24/03/2026','noi_dung':'Ke hoach dang bai thang 4 da san sang. Moi ngay 2 bai tren Facebook va Instagram.','like':15,'cmt':6},
        ]
    },
    {
        'id': 5, 'ten': 'Đào tạo nghiệp vụ 2025-2026', 'admin': 'PT', 'mo_ta': 'Tập huấn và khóa học cho nhân viên',
        'loai': 'congkhai', 'loai_label': 'Công khai',
        'gradient': 'linear-gradient(135deg,#fa8231,#f7b731)',
        'so_tv': 56, 'so_bv': 203,
        'thanh_vien': [
            {'ten': 'Nguyễn Hải An', 'av': 'NA', 'color': '#e74c3c'},
            {'ten': 'Trần Thị Mai',  'av': 'TM', 'color': '#2ecc71'},
            {'ten': 'Vũ Thị Hà',     'av': 'VH', 'color': '#9b59b6'},
            {'ten': 'Hoàng Văn Nam', 'av': 'HN', 'color': '#f39c12'},
        ],
        'bai_viet': [
            {'id':6,'tac_gia':'Nguyễn Hải An','av':'NA','color':'#e74c3c','tg':'09:30 - 25/03/2026','noi_dung':'Lich dao tao thang 4 da duoc xep. Gom 3 buoi ky nang giao tiep va 2 buoi nghiep vu.','like':18,'cmt':7},
        ]
    },
    {
        'id': 6, 'ten': 'Xử lí yêu cầu khách hàng năm 2026', 'admin': 'PT', 'mo_ta': 'Hoạt động thể thao và sức khỏe cho nhân viên',
        'loai': 'riengtu', 'loai_label': 'Riêng tư',
        'gradient': 'linear-gradient(135deg,#2c3e50,#4ca1af)',
        'so_tv': 28, 'so_bv': 82,
        'thanh_vien': [
            {'ten': 'Vũ Thị Hà',     'av': 'VH', 'color': '#9b59b6'},
            {'ten': 'Hoàng Văn Nam', 'av': 'HN', 'color': '#f39c12'},
            {'ten': 'Lê Thị Hường',  'av': 'LH', 'color': '#e74c3c'},
            {'ten': 'Nguyễn Văn Minh','av': 'NM', 'color': '#3498db'},
        ],
        'bai_viet': [
            {'id':7,'tac_gia':'Vũ Thị Hà','av':'VH','color':'#9b59b6','tg':'14:00 - 24/03/2026','noi_dung':'Tong hop 45 phan hoi tu khach trong tuan. Diem hai long trung binh dat 4.7/5.','like':11,'cmt':4},
        ]
    },
]


@login_required
def nhom(request):
    return render(request, 'group_management/nhom.html', {'nhom_list': NHOM_DATA, 'user': request.user})

@login_required
def nhom_quanly(request):
    user = {'av': 'PT', 'ten': 'Phạm Xuân Thương', 'role': 'quanly'}
    return render(request, 'group_management/nhom.html', {'nhom_list': NHOM_DATA, 'user': user})

@login_required
def nhom_nhanvien(request):
    user = {'av': 'NA', 'ten': 'Nguyễn Hải An', 'role': 'nhanvien'}
    return render(request, 'group_management/nhom.html', {'nhom_list': NHOM_DATA, 'user': user})

@login_required
def nhom_new(request):
    # Only managers can create new groups
    if request.user.role != 'quanly':
        return redirect('nhom')
    return render(request, 'group_management/nhom_new.html')

@login_required
def nhom_new_edit(request):
    # Only managers can create new groups
    if request.user.role != 'quanly':
        return redirect('nhom')
    return render(request, 'group_management/nhom_new_edit.html')

@login_required
def nhom_detail(request, nhom_id):
    n = next((x for x in NHOM_DATA if x['id'] == nhom_id), None)
    if not n: raise Http404
    role = request.GET.get('role', CURRENT_USER['role'])
    user = {'av': CURRENT_USER['av'], 'ten': CURRENT_USER['ten'], 'role': role}
    return render(request, 'group_management/nhom_detail.html', {'nhom': n, 'user': user})

@login_required
def nhom_edit(request, nhom_id):
    n = next((x for x in NHOM_DATA if x['id'] == nhom_id), None)
    if not n: raise Http404
    role = request.GET.get('role', CURRENT_USER['role'])
    user = {'av': CURRENT_USER['av'], 'ten': CURRENT_USER['ten'], 'role': role}
    return render(request, 'group_management/nhom_edit.html', {'nhom': n, 'user': user})

@login_required
def baocao_tuongtac(request):
    return render(request, 'report_management/baocao_tuongtac.html', {'user': CURRENT_USER})

@login_required
def baocao_congviec(request):
    return render(request, 'report_management/baocao_congviec.html', {'user': CURRENT_USER})

@login_required
def baocao_xephang(request):
    return render(request, 'report_management/baocao_xephang.html', {'user': CURRENT_USER})
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