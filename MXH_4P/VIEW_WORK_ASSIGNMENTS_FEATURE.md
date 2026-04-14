# Chức năng "Xem JA" trong Công việc cá nhân

## Mô tả

Khi nhân viên click nút "Xem JA" trong trang Công việc cá nhân, họ sẽ được chuyển đến trang xem phân công công việc với các đặc điểm:

1. **Giao diện giống Quản lý công việc** - Hiển thị bảng phân công chi tiết
2. **Chế độ read-only** - Không thể chỉnh sửa, chỉ xem
3. **Lọc theo phòng ban** - Chỉ hiển thị công việc của phòng ban mình

## Luồng hoạt động

### 1. Xác định phòng ban của user

Hệ thống xác định phòng ban dựa trên username:

```python
# F&B department
fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 
                'lethilan', 'tranvantu', 'dangthiyen', 'vothixuan']

# HK department  
hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 
                'ngovantung', 'phanthiha', 'phanvanthang', 'tathivan', 'buithinga']

# FO department
fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 
                'lethiphuong', 'luuvanphong', 'hoangvanquan', 'lyvanhai']
```

**Fallback logic:**
- Nếu username không nằm trong danh sách trên, hệ thống sẽ tìm task đầu tiên mà user được phân công
- Lấy department từ task đó
- Nếu vẫn không tìm thấy, hiển thị tất cả tasks (fallback)

### 2. Lọc tasks theo phòng ban

```python
tasks = Task.objects.filter(
    department=user_department,  # Chỉ lấy tasks của phòng ban user
    work_date=selected_date
).order_by('shift', 'title')
```

### 3. Hiển thị giao diện read-only

- Banner thông báo: "Chế độ xem - Bạn đang xem phân công của phòng ban [F&B/HK/FO]"
- Ẩn tất cả nút chỉnh sửa: "Lưu", "Thêm", "Xóa", "×" (remove employee)
- Vô hiệu hóa tương tác với employee tags
- Chỉ giữ lại chức năng xem chi tiết

## Ví dụ

### User: doanxuantoan (F&B Manager)

**Khi click "Xem JA":**
- Phòng ban: F&B
- Hiển thị: 8 công việc F&B cho ngày 14/04/2026
- Không hiển thị: 7 công việc HK, 0 công việc FO

### User: phamxuanthuong (HK Manager)

**Khi click "Xem JA":**
- Phòng ban: HK
- Hiển thị: 7 công việc HK cho ngày 14/04/2026
- Không hiển thị: 8 công việc F&B, 0 công việc FO

### User: vothikimhoa (F&B Employee)

**Khi click "Xem JA":**
- Phòng ban: F&B (cùng với manager)
- Hiển thị: 8 công việc F&B cho ngày 14/04/2026
- Không hiển thị: Công việc của phòng ban khác

## Tính năng

### ✅ Có thể làm:
- Xem danh sách công việc của phòng ban mình
- Lọc theo trạng thái (Tất cả, Đang thực hiện, Hoàn thành, Chưa xử lý)
- Chọn ngày khác để xem phân công
- Click vào công việc để xem chi tiết
- Xem thống kê (Tổng, Đang thực hiện, Hoàn thành, Chưa xử lý)

### ❌ Không thể làm:
- Thêm công việc mới
- Chỉnh sửa công việc
- Xóa công việc
- Thêm/xóa nhân viên khỏi công việc
- Lưu phân công
- Thay đổi trạng thái công việc

## So sánh với Quản lý công việc

| Tính năng | Quản lý công việc | Xem JA (Công việc cá nhân) |
|-----------|-------------------|----------------------------|
| Xem danh sách | ✅ Chỉ tasks do mình tạo | ✅ Chỉ tasks của phòng ban mình |
| Thêm công việc | ✅ | ❌ |
| Chỉnh sửa | ✅ | ❌ |
| Xóa | ✅ | ❌ |
| Phân công nhân viên | ✅ | ❌ |
| Lưu thay đổi | ✅ | ❌ |
| Xem chi tiết | ✅ | ✅ |
| Lọc theo trạng thái | ✅ | ✅ |
| Chọn ngày | ✅ | ✅ |
| Xem phản hồi | ✅ | ❌ |
| Tạo lịch họp | ✅ | ❌ |

## URL và Routes

- **URL**: `/view-work-assignments/`
- **View**: `view_work_assignments(request)`
- **Template**: `works_management/view_work_assignments.html`
- **Nút truy cập**: "Xem JA" trong trang `/employee-dashboard/`

## Files liên quan

### Backend
- `MXH_4P/social_media_4P/views.py`
  - Function: `view_work_assignments()`
  - Logic xác định phòng ban
  - Lọc tasks theo department

### Frontend
- `MXH_4P/templates/works_management/view_work_assignments.html`
  - Giao diện read-only
  - Ẩn các nút chỉnh sửa
  - Hiển thị banner phòng ban

### URLs
- `MXH_4P/MXH_4P/urls.py`
  - Route: `path('view-work-assignments/', views.view_work_assignments, name='view_work_assignments')`

### Employee Dashboard
- `MXH_4P/templates/works_management/employee_dashboard.html`
  - Nút "Xem JA" link đến `/view-work-assignments/`

## Lợi ích

1. **Bảo mật thông tin**: Nhân viên chỉ thấy công việc của phòng ban mình, không thấy phòng ban khác
2. **Tránh nhầm lẫn**: Không hiển thị công việc không liên quan
3. **Giao diện quen thuộc**: Giống với Quản lý công việc, dễ sử dụng
4. **An toàn**: Chế độ read-only ngăn chặn thay đổi không mong muốn
5. **Tiện lợi**: Nhân viên có thể xem toàn bộ phân công của phòng ban mà không cần quyền quản lý

## Test Cases

### Test 1: F&B Employee xem JA
```
User: vothikimhoa (F&B)
Expected: Hiển thị 8 công việc F&B
Actual: ✅ Pass
```

### Test 2: HK Manager xem JA
```
User: phamxuanthuong (HK)
Expected: Hiển thị 7 công việc HK
Actual: ✅ Pass
```

### Test 3: Lọc theo trạng thái
```
User: doanxuantoan (F&B)
Action: Click "Đang thực hiện"
Expected: Chỉ hiển thị tasks F&B có status='InProgress'
Actual: ✅ Pass
```

### Test 4: Chọn ngày khác
```
User: doanxuantoan (F&B)
Action: Chọn ngày 15/04/2026
Expected: Hiển thị tasks F&B của ngày 15/04/2026
Actual: ✅ Pass
```

### Test 5: Không thể chỉnh sửa
```
User: vothikimhoa (F&B)
Action: Cố gắng thêm nhân viên vào task
Expected: Không có nút "Thêm", không thể thêm
Actual: ✅ Pass (nút bị ẩn bằng CSS)
```
