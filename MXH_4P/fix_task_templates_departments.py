import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import TaskTemplate, Task

# Clear existing templates
TaskTemplate.objects.all().delete()
print("Đã xóa tất cả TaskTemplate cũ")

# Clear existing tasks
Task.objects.all().delete()
print("Đã xóa tất cả Task cũ")

# F&B Department Templates
fb_templates = [
    {
        'title': 'Chuẩn bị bàn ăn sáng',
        'description': 'Sắp xếp bàn ghế, khăn ăn, dao nĩa cho bữa sáng',
        'department': 'F&B',
        'shift': 'Sáng',
        'start_time': '06:00',
        'end_time': '08:00',
        'order': 1
    },
    {
        'title': 'Phục vụ buffet sáng',
        'description': 'Bổ sung món ăn, dọn dẹp bàn ăn, hỗ trợ khách',
        'department': 'F&B',
        'shift': 'Sáng',
        'start_time': '06:30',
        'end_time': '10:00',
        'order': 2
    },
    {
        'title': 'Kiểm tra kho nguyên liệu',
        'description': 'Kiểm tra số lượng nguyên liệu, lập danh sách cần mua',
        'department': 'F&B',
        'shift': 'Sáng',
        'start_time': '08:00',
        'end_time': '09:00',
        'order': 3
    },
    {
        'title': 'Chuẩn bị thực đơn trưa',
        'description': 'Chuẩn bị nguyên liệu và nấu các món ăn cho bữa trưa',
        'department': 'F&B',
        'shift': 'Sáng',
        'start_time': '10:00',
        'end_time': '12:00',
        'order': 4
    },
    {
        'title': 'Phục vụ nhà hàng trưa',
        'description': 'Phục vụ khách ăn trưa, ghi nhận order',
        'department': 'F&B',
        'shift': 'Chiều',
        'start_time': '12:00',
        'end_time': '14:00',
        'order': 5
    },
    {
        'title': 'Vệ sinh nhà bếp',
        'description': 'Dọn dẹp, vệ sinh nhà bếp và khu vực ăn uống',
        'department': 'F&B',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '15:00',
        'order': 6
    },
    {
        'title': 'Chuẩn bị thực đơn tối',
        'description': 'Chuẩn bị nguyên liệu cho bữa tối',
        'department': 'F&B',
        'shift': 'Chiều',
        'start_time': '15:00',
        'end_time': '17:00',
        'order': 7
    },
    {
        'title': 'Phục vụ nhà hàng tối',
        'description': 'Phục vụ khách ăn tối, chăm sóc khách VIP',
        'department': 'F&B',
        'shift': 'Tối',
        'start_time': '18:00',
        'end_time': '21:00',
        'order': 8
    },
]

# HK (Housekeeping) Department Templates
hk_templates = [
    {
        'title': 'Dọn phòng check-out',
        'description': 'Dọn dẹp các phòng khách đã check-out',
        'department': 'HK',
        'shift': 'Sáng',
        'start_time': '08:00',
        'end_time': '12:00',
        'order': 1
    },
    {
        'title': 'Kiểm tra phòng trống',
        'description': 'Kiểm tra tình trạng các phòng trống, báo cáo hư hỏng',
        'department': 'HK',
        'shift': 'Sáng',
        'start_time': '09:00',
        'end_time': '11:00',
        'order': 2
    },
    {
        'title': 'Bổ sung vật dụng phòng',
        'description': 'Bổ sung khăn tắm, dầu gội, xà phòng cho các phòng',
        'department': 'HK',
        'shift': 'Sáng',
        'start_time': '10:00',
        'end_time': '12:00',
        'order': 3
    },
    {
        'title': 'Vệ sinh hành lang',
        'description': 'Lau dọn hành lang, cầu thang, khu vực công cộng',
        'department': 'HK',
        'shift': 'Chiều',
        'start_time': '13:00',
        'end_time': '15:00',
        'order': 4
    },
    {
        'title': 'Dọn phòng theo yêu cầu',
        'description': 'Dọn dẹp phòng theo yêu cầu của khách đang ở',
        'department': 'HK',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '17:00',
        'order': 5
    },
    {
        'title': 'Giặt là đồ vải',
        'description': 'Giặt khăn tắm, ga trải giường, rèm cửa',
        'department': 'HK',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '18:00',
        'order': 6
    },
    {
        'title': 'Kiểm tra phòng cuối ngày',
        'description': 'Kiểm tra lại tất cả các phòng trước khi kết thúc ca',
        'department': 'HK',
        'shift': 'Tối',
        'start_time': '20:00',
        'end_time': '22:00',
        'order': 7
    },
]

# FO (Front Office) Department Templates
fo_templates = [
    {
        'title': 'Check-in khách sáng',
        'description': 'Làm thủ tục check-in cho khách đến sớm',
        'department': 'FO',
        'shift': 'Sáng',
        'start_time': '06:00',
        'end_time': '12:00',
        'order': 1
    },
    {
        'title': 'Xử lý email và booking',
        'description': 'Trả lời email, xác nhận đặt phòng online',
        'department': 'FO',
        'shift': 'Sáng',
        'start_time': '08:00',
        'end_time': '10:00',
        'order': 2
    },
    {
        'title': 'Cập nhật hệ thống',
        'description': 'Cập nhật tình trạng phòng vào hệ thống quản lý',
        'department': 'FO',
        'shift': 'Sáng',
        'start_time': '09:00',
        'end_time': '10:00',
        'order': 3
    },
    {
        'title': 'Check-out khách',
        'description': 'Làm thủ tục check-out, thanh toán cho khách',
        'department': 'FO',
        'shift': 'Sáng',
        'start_time': '10:00',
        'end_time': '12:00',
        'order': 4
    },
    {
        'title': 'Tư vấn dịch vụ',
        'description': 'Tư vấn các dịch vụ của khách sạn cho khách',
        'department': 'FO',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '18:00',
        'order': 5
    },
    {
        'title': 'Check-in khách chiều',
        'description': 'Làm thủ tục check-in cho khách đến chiều',
        'department': 'FO',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '22:00',
        'order': 6
    },
    {
        'title': 'Xử lý khiếu nại',
        'description': 'Tiếp nhận và xử lý khiếu nại của khách hàng',
        'department': 'FO',
        'shift': 'Chiều',
        'start_time': '14:00',
        'end_time': '18:00',
        'order': 7
    },
    {
        'title': 'Bàn giao ca tối',
        'description': 'Bàn giao thông tin cho ca tối, cập nhật sổ giao ca',
        'department': 'FO',
        'shift': 'Tối',
        'start_time': '21:00',
        'end_time': '22:00',
        'order': 8
    },
]

# Create all templates
all_templates = fb_templates + hk_templates + fo_templates
created_count = 0

for template_data in all_templates:
    template = TaskTemplate.objects.create(
        title=template_data['title'],
        description=template_data['description'],
        department=template_data['department'],
        shift=template_data['shift'],
        start_time=template_data['start_time'],
        end_time=template_data['end_time'],
        order=template_data['order'],
        is_active=True
    )
    created_count += 1
    print(f"✓ Đã tạo template: [{template.department}] {template.title}")

print(f"\n✅ Đã tạo {created_count} TaskTemplates thành công!")
print(f"   - F&B: {len(fb_templates)} templates")
print(f"   - HK: {len(hk_templates)} templates")
print(f"   - FO: {len(fo_templates)} templates")
print(f"\n📊 Tổng số TaskTemplates trong database: {TaskTemplate.objects.count()}")
