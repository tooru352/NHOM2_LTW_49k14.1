# 📝 HƯỚNG DẪN ĐĂNG BÁI TRONG NHÓM

## ✅ TÍNH NĂNG MỚI

Đã thêm tính năng đăng bài viết trong nhóm cho thành viên!

---

## 🎯 TÍNH NĂNG

### 1. Đăng bài trong nhóm
- Chỉ thành viên của nhóm mới có thể đăng bài
- Form đăng bài đơn giản với textarea
- Bài viết hiển thị ngay sau khi đăng
- Hiển thị avatar và tên người đăng
- Hiển thị thời gian đăng (timesince)

### 2. Xem bài viết trong nhóm
- Tab "Bài viết" trong trang chi tiết nhóm
- Hiển thị tất cả bài viết của nhóm
- Sắp xếp theo thời gian mới nhất
- Empty state khi chưa có bài viết

### 3. Quản lý bài viết
- Người đăng có thể xóa bài của mình
- Admin nhóm có thể xóa bất kỳ bài viết nào
- Hiển thị số bài viết trong danh sách nhóm

---

## 🔧 THAY ĐỔI KỸ THUẬT

### 1. Database Migration
**Thêm field `group` vào Post model**:
```python
group = models.ForeignKey(
    'Group', 
    on_delete=models.CASCADE, 
    related_name='posts', 
    blank=True, 
    null=True
)
```

**Migration đã chạy**:
- `0002_post_group.py` - Thêm field group vào Post
- Database đã được cập nhật

### 2. Model Updates
**Post model**:
- Thêm field `group` (ForeignKey to Group)
- Thêm method `is_group_post()` để check post thuộc nhóm

**Group model**:
- Related name `posts` để truy cập bài viết: `group.posts.all()`

### 3. View Updates
**nhom_detail view**:
- Lấy posts của nhóm: `Post.objects.filter(group=group)`
- Xử lý POST request để tạo bài viết mới
- Kiểm tra `is_member` trước khi cho phép đăng bài

**nhom view**:
- Prefetch posts: `prefetch_related('posts')`
- Tính số bài viết: `group.posts.count()`

### 4. Template Updates
**nhom_detail.html**:
- Thêm form đăng bài (chỉ hiện cho thành viên)
- Hiển thị danh sách bài viết
- Nút xóa bài (cho người đăng và admin)
- Empty state khi chưa có bài viết

---

## 📊 DỮ LIỆU MẪU

### Đã tạo:
- ✅ 18 bài viết trong 6 nhóm
- ✅ Mỗi nhóm có 3 bài viết
- ✅ Bài viết từ các thành viên khác nhau
- ✅ Nội dung liên quan đến từng nhóm

### Chạy lại script (nếu cần):
```bash
cd MXH_4P
python create_group_posts.py
```

---

## 🚀 CÁCH SỬ DỤNG

### 1. Xem bài viết trong nhóm

**Bước 1**: Truy cập danh sách nhóm
```
http://127.0.0.1:8000/nhom/
```

**Bước 2**: Click vào nhóm muốn xem

**Bước 3**: Xem tab "Bài viết"
- Hiển thị tất cả bài viết trong nhóm
- Sắp xếp theo thời gian mới nhất

---

### 2. Đăng bài trong nhóm

**Điều kiện**: Phải là thành viên của nhóm

**Bước 1**: Vào trang chi tiết nhóm
```
http://127.0.0.1:8000/nhom/{id}/
```

**Bước 2**: Ở tab "Bài viết", tìm form đăng bài ở đầu trang

**Bước 3**: Nhập nội dung vào textarea

**Bước 4**: Click nút "📝 Đăng bài"

**Kết quả**: 
- Bài viết được tạo ngay lập tức
- Hiển thị ở đầu danh sách bài viết
- Thông báo "Đã đăng bài thành công!"

---

### 3. Xóa bài viết

**Quyền hạn**:
- Người đăng có thể xóa bài của mình
- Admin nhóm có thể xóa bất kỳ bài viết nào

**Cách xóa**:
- Click icon 🗑️ ở góc phải bài viết
- Xác nhận xóa
- Bài viết bị xóa ngay lập tức

---

## 📝 VÍ DỤ BÀI VIẾT

### Bộ phận F&B:
```
Thông báo: Thực đơn buffet sáng tuần này đã được cập nhật. 
Vui lòng kiểm tra và chuẩn bị nguyên liệu.
```

### Bộ phận Housekeeping:
```
Cảm ơn team đã làm việc chăm chỉ! 
Tất cả phòng đã sẵn sàng cho đợt khách check-in chiều nay.
```

### Dự án Nâng cấp:
```
Tiến độ dự án: Đã hoàn thành 60% công việc nâng cấp hệ thống điện. 
Dự kiến hoàn thành vào cuối tuần.
```

---

## 🎨 UI/UX

### Form đăng bài:
- Avatar người dùng
- Textarea với placeholder
- Nút "Đăng bài" với gradient
- Responsive design

### Hiển thị bài viết:
- Card design với shadow
- Avatar và tên người đăng
- Thời gian đăng (timesince)
- Nội dung bài viết
- Nút xóa (nếu có quyền)

### Empty state:
- Icon 📝
- Tiêu đề "Chưa có bài viết nào"
- Mô tả khuyến khích đăng bài
- Phân biệt thành viên/không phải thành viên

---

## 🔒 PHÂN QUYỀN

### Xem bài viết:
- ✅ Tất cả mọi người có thể xem (nếu nhóm công khai)
- ✅ Chỉ thành viên có thể xem (nếu nhóm riêng tư)

### Đăng bài:
- ✅ Chỉ thành viên của nhóm
- ❌ Không phải thành viên không thể đăng

### Xóa bài:
- ✅ Người đăng bài
- ✅ Admin nhóm (người tạo nhóm)
- ❌ Thành viên khác không thể xóa

---

## 🐛 XỬ LÝ LỖI

### Lỗi: Không thấy form đăng bài
**Nguyên nhân**: Bạn chưa là thành viên của nhóm

**Giải pháp**: 
- Liên hệ admin nhóm để được thêm vào
- Hoặc tham gia nhóm (nếu là nhóm công khai)

### Lỗi: Không thể đăng bài
**Nguyên nhân**: Nội dung trống

**Giải pháp**: 
- Nhập nội dung vào textarea
- Nội dung phải có ít nhất 1 ký tự

### Lỗi: Không thấy nút xóa
**Nguyên nhân**: Bạn không có quyền xóa bài này

**Giải pháp**: 
- Chỉ người đăng hoặc admin mới có quyền xóa
- Liên hệ admin nếu cần xóa bài vi phạm

---

## 📊 THỐNG KÊ

### Dữ liệu hiện tại:
- 6 nhóm
- 29 thành viên (tổng)
- 18 bài viết trong nhóm
- Trung bình 3 bài viết/nhóm

### Tính năng đã hoàn thành:
- ✅ Đăng bài trong nhóm
- ✅ Xem bài viết trong nhóm
- ✅ Xóa bài viết
- ✅ Phân quyền đúng
- ✅ UI/UX đẹp mắt
- ✅ Dữ liệu mẫu

---

## 🎯 TÍNH NĂNG CÓ THỂ THÊM

### Trong tương lai:
- [ ] Upload ảnh/video trong bài viết nhóm
- [ ] Like/Comment bài viết nhóm
- [ ] Pin bài viết quan trọng
- [ ] Thông báo khi có bài viết mới
- [ ] Tìm kiếm bài viết trong nhóm
- [ ] Filter bài viết theo người đăng
- [ ] Edit bài viết đã đăng
- [ ] Share bài viết ra ngoài nhóm

---

## 👥 TÀI KHOẢN TEST

### Thành viên nhóm F&B:
```
Username: doanxuantoan (Admin)
Password: doanxuantoan123

Username: vothikimhoa (Thành viên)
Password: vothikimhoa123
```

### Thành viên nhóm Housekeeping:
```
Username: phamxuanthuong (Admin)
Password: phamxuanthuong123

Username: nguyendinhkhoa (Thành viên)
Password: nguyendinhkhoa123
```

---

## 🎉 HOÀN THÀNH!

Tính năng đăng bài trong nhóm đã hoàn thiện và sẵn sàng sử dụng!

**Truy cập ngay**: http://127.0.0.1:8000/nhom/

**Các bước thử nghiệm**:
1. Đăng nhập với tài khoản thành viên
2. Vào một nhóm bạn là thành viên
3. Xem tab "Bài viết"
4. Đăng bài mới
5. Xem bài viết hiển thị ngay lập tức
6. Thử xóa bài viết của mình

**Chúc bạn sử dụng vui vẻ!** 🎊
