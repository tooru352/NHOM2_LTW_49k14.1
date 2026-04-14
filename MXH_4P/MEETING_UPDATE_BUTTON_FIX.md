# Fix: Không thể nhấn nút "Cập nhật" sau khi chỉnh sửa lịch họp

## Vấn đề

Khi người dùng:
1. Click vào một cuộc họp để xem chi tiết
2. Click nút "Chỉnh sửa nội dung"
3. Chỉnh sửa thông tin
4. Click nút "Cập nhật"

→ Nút "Cập nhật" không hoạt động, không gửi request lên server

## Nguyên nhân

Trong hàm `closeMeetingDetailModal()`, biến `currentMeetingId` được reset về `null`:

```javascript
function closeMeetingDetailModal() {
    document.getElementById('meetingDetailModal').style.display = 'none';
    currentMeetingId = null;  // ❌ Vấn đề ở đây!
}
```

Khi mở edit modal, hàm `openEditMeetingModal()` gọi `closeMeetingDetailModal()` để đóng detail modal:

```javascript
function openEditMeetingModal() {
    // ... code lấy dữ liệu ...
    
    closeMeetingDetailModal();  // ❌ Gọi hàm này làm mất currentMeetingId
    document.getElementById('editMeetingModal').style.display = 'block';
}
```

Kết quả: `currentMeetingId` bị set về `null` trước khi edit modal mở, nên khi click "Cập nhật", hàm `updateMeeting()` return ngay:

```javascript
function updateMeeting() {
    if (!currentMeetingId) return;  // ❌ Return vì currentMeetingId = null
    // ... code update ...
}
```

## Giải pháp

### 1. Không reset `currentMeetingId` khi đóng detail modal

```javascript
function closeMeetingDetailModal() {
    document.getElementById('meetingDetailModal').style.display = 'none';
    // ✅ Không reset currentMeetingId ở đây
}
```

### 2. Reset `currentMeetingId` khi đóng edit modal

```javascript
function closeEditMeetingModal() {
    document.getElementById('editMeetingModal').style.display = 'none';
    currentMeetingId = null;  // ✅ Reset ở đây thay vì ở detail modal
}
```

### 3. Reset khi click bên ngoài detail modal

```javascript
window.onclick = function(event) {
    const detailModal = document.getElementById('meetingDetailModal');
    const editModal = document.getElementById('editMeetingModal');
    
    if (event.target === detailModal) {
        detailModal.style.display = 'none';
        currentMeetingId = null;  // ✅ Reset khi click outside detail modal
    }
    if (event.target === editModal) {
        closeEditMeetingModal();  // ✅ Gọi hàm close để reset
    }
}
```

## Luồng hoạt động sau khi fix

### Khi xem chi tiết cuộc họp:
1. User click vào meeting card
2. `showMeetingDetail(meetingId)` được gọi
3. `currentMeetingId = meetingId` ✅
4. Detail modal hiển thị

### Khi chỉnh sửa:
1. User click "Chỉnh sửa nội dung"
2. `openEditMeetingModal()` được gọi
3. Lấy dữ liệu từ `currentMeetingId` ✅ (vẫn còn giá trị)
4. `closeMeetingDetailModal()` đóng detail modal (không reset `currentMeetingId`)
5. Edit modal hiển thị với `currentMeetingId` vẫn còn ✅

### Khi cập nhật:
1. User click "Cập nhật"
2. `updateMeeting()` được gọi
3. Check `if (!currentMeetingId)` → Pass ✅
4. Gửi AJAX request với `currentMeetingId` ✅
5. Server xử lý và trả về kết quả
6. `closeEditMeetingModal()` đóng modal và reset `currentMeetingId = null`

### Khi đóng modal:
- Click X hoặc "Hủy" trên edit modal → `closeEditMeetingModal()` → Reset `currentMeetingId`
- Click bên ngoài detail modal → Reset `currentMeetingId`
- Click bên ngoài edit modal → `closeEditMeetingModal()` → Reset `currentMeetingId`

## Files đã sửa

- `MXH_4P/templates/works_management/meeting_schedule.html`
  - Removed `currentMeetingId = null` from `closeMeetingDetailModal()`
  - Added `currentMeetingId = null` to `closeEditMeetingModal()`
  - Updated `window.onclick` to properly reset `currentMeetingId`

## Kết quả

✅ Nút "Cập nhật" hoạt động bình thường
✅ `currentMeetingId` được giữ lại khi chuyển từ detail modal sang edit modal
✅ `currentMeetingId` được reset đúng lúc khi đóng modal
✅ Không có memory leak hay giá trị cũ bị giữ lại
