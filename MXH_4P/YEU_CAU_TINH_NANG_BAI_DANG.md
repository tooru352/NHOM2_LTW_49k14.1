# 📋 YÊU CẦU TÍNH NĂNG BÀI ĐĂNG

## ✅ ĐÃ SỬA LỖI
- [x] Thêm field `created_at` vào Interaction model
- [x] Migration đã chạy thành công
- [x] Post model đã có `scope` và `groups` (ManyToMany)

## 🎯 YÊU CẦU CHÍNH

### 1. Tương tác bài đăng
- [ ] **Like (Thả cảm xúc)**: Click để like/unlike
- [ ] **Comment (Bình luận)**: Form nhập và hiển thị comments
- [ ] **Bỏ Share**: Không cần chức năng share

### 2. Hiển thị thông tin bài đăng
- [ ] **Chức vụ**: Hiển thị Manager/Employee
- [ ] **Phạm vi**: Hiển thị "Toàn khách sạn" hoặc tên nhóm

### 3. Tạo bài đăng với phạm vi
**Phạm vi "Toàn khách sạn"**:
- [ ] Chỉ chọn được "Toàn khách sạn"
- [ ] Không thể chọn nhóm

**Phạm vi "Theo nhóm"**:
- [ ] Có thể chọn nhiều nhóm cùng lúc
- [ ] Checkbox để chọn nhóm

### 4. Hiển thị bài đăng
**Trang chủ (/home/)**:
- [ ] Hiển thị bài đăng "Toàn khách sạn"
- [ ] Hiển thị bài đăng từ các nhóm mà user là thành viên

**Trang nhóm (/nhom/{id}/)**:
- [ ] Hiển thị bài đăng có phạm vi chứa nhóm đó
- [ ] Bài đăng "Toàn khách sạn" KHÔNG hiển thị ở đây

## 📝 CHI TIẾT IMPLEMENTATION

### Migration đã có:
```python
# Post model
scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='hotel')
groups = models.ManyToManyField('Group', related_name='group_posts', blank=True)

# Interaction model  
created_at = models.DateTimeField(default=timezone.now)
```

### Cần làm tiếp:
1. Cập nhật view `home()` để lọc posts đúng
2. Cập nhật view `nhom_detail()` để lọc posts đúng
3. Tạo form đăng bài với chọn phạm vi
4. Thêm tính năng like/unlike
5. Thêm tính năng comment
6. Cập nhật template hiển thị đầy đủ

## 🚀 KẾ HOẠCH THỰC HIỆN

### Bước 1: Sửa lỗi hiện tại ✅
- Đã thêm `created_at` vào Interaction
- Đã chạy migration

### Bước 2: Cập nhật views
- [ ] `home()`: Lọc posts theo scope và groups
- [ ] `nhom_detail()`: Lọc posts theo nhóm
- [ ] `create_post()`: Xử lý scope và groups

### Bước 3: Cập nhật templates
- [ ] Form tạo bài với chọn phạm vi
- [ ] Hiển thị like/comment
- [ ] Hiển thị chức vụ và phạm vi

### Bước 4: Thêm AJAX cho like/comment
- [ ] API endpoint cho like
- [ ] API endpoint cho comment
- [ ] JavaScript xử lý

### Bước 5: Testing
- [ ] Test tạo bài "Toàn khách sạn"
- [ ] Test tạo bài "Theo nhóm"
- [ ] Test like/unlike
- [ ] Test comment
- [ ] Test hiển thị đúng phạm vi

## 📌 LƯU Ý

- Bỏ chức năng Share
- Chỉ có Like và Comment
- Phạm vi "Toàn khách sạn" = tất cả mọi người xem được
- Phạm vi "Theo nhóm" = chỉ thành viên nhóm đó xem được
- Có thể chọn nhiều nhóm cùng lúc
