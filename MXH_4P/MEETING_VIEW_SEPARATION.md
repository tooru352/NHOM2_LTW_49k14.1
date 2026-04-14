# Phân biệt hiển thị lịch họp giữa Quản lý công việc và Công việc cá nhân

## Yêu cầu

Cần phân biệt rõ ràng giữa 2 view:

1. **Quản lý công việc** (`/meeting-schedule/`): Chỉ hiển thị lịch họp do chính quản lý đó tạo ra
2. **Công việc cá nhân** (`/employee-dashboard/`): Hiển thị tất cả lịch họp mà người đó tham gia

## Trước khi sửa

### View `meeting_schedule`
```python
meetings = Meeting.objects.filter(
    start_time__year=year,
    start_time__month=month
).order_by('start_time')
```
❌ Hiển thị TẤT CẢ cuộc họp trong tháng, không phân biệt ai tạo

### View `employee_dashboard`
```python
upcoming_meetings = Meeting.objects.filter(
    participants__user=request.user,
    start_time__gte=timezone.now(),
    status='Upcoming'
).order_by('start_time')[:5]
```
✅ Đã đúng - hiển thị cuộc họp mà user tham gia

## Sau khi sửa

### View `meeting_schedule`
```python
meetings = Meeting.objects.filter(
    created_by=request.user,  # ✅ Chỉ lấy cuộc họp do user này tạo
    start_time__year=year,
    start_time__month=month
).order_by('start_time')
```
✅ Chỉ hiển thị cuộc họp do chính user đó tạo ra

### View `employee_dashboard`
```python
upcoming_meetings = Meeting.objects.filter(
    participants__user=request.user,  # ✅ Lấy cuộc họp mà user tham gia
    start_time__gte=timezone.now(),
    status='Upcoming'
).order_by('start_time')[:5]
```
✅ Không thay đổi - vẫn hiển thị cuộc họp mà user tham gia

## Use Cases

### Case 1: Quản lý tạo cuộc họp cho bộ phận khác
- Quản lý F&B (doanxuantoan) tạo cuộc họp cho bộ phận HK
- Location: "HK - Phòng họp tầng 2"
- Participants: 8 nhân viên HK (không bao gồm doanxuantoan)

**Kết quả:**
- ✅ Quản lý công việc của doanxuantoan: Hiển thị cuộc họp này (vì họ tạo)
- ❌ Công việc cá nhân của doanxuantoan: KHÔNG hiển thị (vì họ không tham gia)
- ✅ Công việc cá nhân của nhân viên HK: Hiển thị cuộc họp này (vì họ tham gia)

### Case 2: Quản lý tạo cuộc họp cho bộ phận của mình
- Quản lý F&B (doanxuantoan) tạo cuộc họp cho bộ phận F&B
- Location: "F&B - Nhà hàng tầng 1"
- Participants: 8 nhân viên F&B (bao gồm cả doanxuantoan)

**Kết quả:**
- ✅ Quản lý công việc của doanxuantoan: Hiển thị cuộc họp này (vì họ tạo)
- ✅ Công việc cá nhân của doanxuantoan: Hiển thị cuộc họp này (vì họ tham gia)
- ✅ Công việc cá nhân của nhân viên F&B khác: Hiển thị cuộc họp này (vì họ tham gia)

### Case 3: Nhân viên được mời vào cuộc họp do người khác tạo
- Quản lý HK (phamxuanthuong) tạo cuộc họp training
- Location: "Hội trường"
- Participants: Tất cả nhân viên (bao gồm doanxuantoan)

**Kết quả:**
- ❌ Quản lý công việc của doanxuantoan: KHÔNG hiển thị (vì họ không tạo)
- ✅ Công việc cá nhân của doanxuantoan: Hiển thị cuộc họp này (vì họ tham gia)
- ✅ Quản lý công việc của phamxuanthuong: Hiển thị cuộc họp này (vì họ tạo)

## Test Results

### User: doanxuantoan

**Quản lý công việc** (created_by filter):
```
16: 5678 - 0 participants
17: 123 - 4 participants
18: Test Meeting F&B - 8 participants
19: ưerthn - 8 participants
10: Đánh giá chất lượng dịch vụ - 3 participants
```
Total: 5 meetings

**Công việc cá nhân** (participants filter):
```
17: 123 - Created by: doanxuantoan
18: Test Meeting F&B - Created by: doanxuantoan
11: Training an toàn lao động - Created by: phamxuanthuong
```
Total: 3 meetings

✅ Có sự khác biệt rõ ràng giữa 2 views

## Lợi ích

1. **Quản lý rõ ràng**: Quản lý có thể thấy tất cả cuộc họp họ đã tạo, dù có tham gia hay không
2. **Theo dõi cá nhân**: Mỗi người chỉ thấy cuộc họp liên quan đến mình trong công việc cá nhân
3. **Phân quyền đúng**: Chỉ người tạo cuộc họp mới có thể chỉnh sửa/xóa (đã có check trong `update_meeting_ajax` và `delete_meeting`)
4. **Tránh nhầm lẫn**: Nhân viên không thấy cuộc họp của bộ phận khác trong công việc cá nhân

## Files Modified

- `MXH_4P/social_media_4P/views.py`
  - Updated `meeting_schedule()` to filter by `created_by=request.user`
  - Added comment to clarify the difference between the two views

## Related Features

- Edit/Delete permissions: Already checked `meeting.created_by != request.user` in views
- Meeting creation: Auto-adds participants based on department/group
- Employee dashboard: Shows meetings where user is a participant
