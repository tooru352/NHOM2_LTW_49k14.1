# Thay đổi Frontend - Chức năng Quản lý Tin nhắn

So sánh dựa trên git diff giữa commit gốc và commit hiện tại.

---

## 1. Dữ liệu hardcode → Load từ Database

**Trước:** Toàn bộ danh sách cuộc trò chuyện và tin nhắn được hardcode trực tiếp trong JS:
```js
const conversations = [
  { id: 1, name: 'Mai Phương', messages: [...] },
  { id: 2, name: 'Trần Văn Hùng', messages: [...] },
  ...
];
```

**Sau:** Danh sách được load từ API khi trang khởi động:
```js
let conversations = [];

fetch('/api/conversations/')
  .then(r => r.json())
  .then(data => {
    conversations = data.conversations.map(c => ({ ...c, messages: [], online: false }));
    renderConvList();
    selectConv(conversations[0].id);
  });
```

---

## 2. Tin nhắn hardcode → Load từ Database

**Trước:** Khi click vào conversation, tin nhắn hiển thị ngay từ dữ liệu hardcode trong JS.

**Sau:** Khi click vào conversation, gọi API để lấy tin nhắn thực từ DB:
```js
fetch(`/api/conversations/${id}/messages/`)
  .then(r => r.json())
  .then(data => {
    conv.messages = data.messages || [];
    renderMessages(conv);
  });
```

---

## 3. Gửi tin nhắn → Lưu vào Database

**Trước:** Gửi tin nhắn chỉ cập nhật local trong JS, không lưu vào DB:
```js
// Chỉ push vào array local
const msg = { id: ++msgIdCounter, from: 'me', text, time: nowTime(), ts: Date.now() };
conv.messages.push(msg);
renderMessages(conv);
```

**Sau:** Gửi tin nhắn POST lên server, lưu vào DB, dùng thời gian từ server:
```js
fetch(`/api/conversations/${activeConvId}/send/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
  body: JSON.stringify({ content: text }),
})
.then(data => {
  conv.messages.push(data);       // Dùng data từ server (id, time thực)
  conv.time = data.time;          // Cập nhật giờ từ server
  renderMessages(conv);
  // Đưa conversation lên đầu danh sách
  conversations.unshift(conversations.splice(idx, 1)[0]);
  renderConvList();
});
```

---

## 4. Conversation lên đầu sau khi nhắn

**Trước:** Không có tính năng này.

**Sau:** Sau khi gửi tin nhắn thành công, conversation tự động nhảy lên đầu danh sách và cập nhật preview + giờ.

---

## 5. Danh sách người dùng → Load từ Database

**Trước:** Danh sách gợi ý khi tạo cuộc trò chuyện mới là hardcode:
```js
const suggestedContacts = [
  { initials: 'AT', name: 'Anh Thư', role: 'Quản lý Front Desk', ... },
  { initials: 'NH', name: 'Nhật Hạ', role: 'Trưởng bộ phận Housekeeping', ... },
  ...
];
```

**Sau:** Load từ API, hỗ trợ tìm kiếm theo tên/bộ phận:
```js
fetch(`/api/users/?q=${search}`)
  .then(data => {
    suggestedContacts.push(...data.users);
    renderContactList('');
  });
```

---

## 6. Tạo cuộc trò chuyện → Lưu vào Database

**Trước:** Click vào người dùng → tạo conversation object local, không lưu DB:
```js
item.addEventListener('click', () => {
  const newConv = { id: conversations.length + 1, name: contact.name, ... };
  conversations.unshift(newConv);
  renderConvList('');
  selectConv(newConv.id);
});
```

**Sau:** Tích chọn nhiều người → click nút → POST lên API → lưu DB → reload:
```js
fetch('/api/conversations/create/', {
  method: 'POST',
  body: JSON.stringify({ user_ids: userIds }),
})
.then(data => {
  // Reload toàn bộ conversations từ DB
  fetch('/api/conversations/').then(...);
  selectConv(data.conversation_id);
});
```

---

## 7. Tạo nhóm chat (nhiều người)

**Trước:** Chỉ có thể tạo chat 1-1, click vào 1 người là tạo ngay.

**Sau:**
- Tích chọn **nhiều người** bằng checkbox
- Nút động hiện ra: `"Bắt đầu trò chuyện"` (1 người) hoặc `"Tạo nhóm (X người)"` (nhiều người)
- Chọn 2+ người → tạo nhóm chat (`status='group'`)

---

## 8. Hiển thị tên nhóm chat

**Trước:** Không có nhóm chat.

**Sau:**
- Chat 1-1: hiển thị tên người kia
- Nhóm chat: hiển thị tên tất cả thành viên, ví dụ `Admin System, Bùi Thị Nga, Bùi Thị Trang`
- Nếu đã đặt tên tùy chỉnh thì hiển thị tên đó

---

## 9. Avatar nhóm chat

**Trước:** Không có nhóm chat.

**Sau:**
- Chat 1-1: hiển thị initials của người kia (như cũ)
- Nhóm chat: hiển thị icon `👥` trên nền gradient tím để phân biệt

---

## 10. Đổi tên nhóm chat

**Trước:** Không có tính năng này.

**Sau:**
- Tên nhóm ở header có icon ✏️, hover chuyển màu tím
- Click vào tên → hộp thoại nhập tên mới
- Lưu vào DB qua `POST /api/conversations/<id>/rename/`
- Cập nhật ngay cả danh sách bên trái lẫn header

---

## 11. Thêm CSRF Token helper

**Trước:** Không có (vì không có API call nào).

**Sau:** Thêm hàm `getCsrfToken()` để đọc CSRF token từ form hoặc cookie, dùng cho tất cả POST request.

---

## 12. Xử lý lỗi (Error Handling)

**Trước:** Không có xử lý lỗi.

**Sau:** Tất cả fetch call đều có `.catch()` hiển thị toast thông báo lỗi cụ thể thay vì crash im lặng.

---

## Tóm tắt

Đây là toàn bộ 12 thay đổi so với frontend ban đầu, dựa trực tiếp từ git diff:

| # | Thay đổi | Trước | Sau |
|---|----------|-------|-----|
| 1 | Danh sách cuộc trò chuyện | Hardcode 7 người trong JS | Load từ DB qua API |
| 2 | Tin nhắn | Hardcode trong JS | Load từ DB khi click vào conversation |
| 3 | **Gửi tin nhắn** | Chỉ cập nhật local, không lưu | POST lên server, lưu DB, dùng thời gian từ server |
| 4 | Conversation lên đầu | Không có | Tự nhảy lên đầu sau khi nhắn |
| 5 | Danh sách người dùng | Hardcode 5 người cố định | Load từ DB, hỗ trợ tìm kiếm |
| 6 | Tạo cuộc trò chuyện | Tạo local, không lưu DB | POST lên API, lưu DB |
| 7 | Tạo nhóm chat | Không có | Tích chọn nhiều người, nút động |
| 8 | Tên nhóm chat | Không có | Hiển thị tên tất cả thành viên |
| 9 | Avatar nhóm | Không có | Icon 👥 gradient tím |
| 10 | Đổi tên nhóm | Không có | Click tên → nhập tên mới → lưu DB |
| 11 | CSRF Token | Không có | Hàm `getCsrfToken()` cho mọi POST |
| 12 | Xử lý lỗi | Không có | Toast thông báo lỗi cụ thể |
