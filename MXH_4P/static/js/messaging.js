// ===== DATA =====
const ME = { id: 'me', name: 'Nguyễn Long', initials: 'NL', avatar: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' };

const conversations = [
  {
    id: 1, name: 'Mai Phương', initials: 'MP',
    avatar: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    online: true, unread: 3, time: '10:30',
    preview: 'Chào anh, em đã hoàn thành báo cáo...',
    messages: [
      { id: 1, from: 'them', text: 'Chào anh Long! Chúc anh buổi sáng tốt lành ạ 😊', time: '08:00', ts: Date.now() - 3600000 * 3 },
      { id: 2, from: 'me', text: 'Chào em Mai Phương! Có việc gì cần anh hỗ trợ không em?', time: '08:02', ts: Date.now() - 3600000 * 2.9 },
      { id: 3, from: 'them', text: 'Dạ em đã hoàn thành báo cáo check-in của các khách hàng hôm qua rồi ạ.', time: '08:05', ts: Date.now() - 3600000 * 2.8 },
      { id: 4, from: 'them', text: 'Tổng cộng có 28 khách check-in, 15 khách check-out. Có 2 phòng VIP đặt trước cho tuần sau ạ.', time: '08:05', ts: Date.now() - 3600000 * 2.8 },
      { id: 5, from: 'me', text: 'Tốt lắm! Em làm việc rất tận tâm. Anh sẽ ghi nhận vào báo cáo tháng này.', time: '08:10', ts: Date.now() - 3600000 * 2.7 },
      { id: 6, from: 'me', text: 'Về 2 phòng VIP đặt trước, em nhớ phối hợp với bộ phận buồng phòng chuẩn bị kỹ càng nhé!', time: '08:11', ts: Date.now() - 3600000 * 2.6 },
      { id: 7, from: 'them', text: 'Dạ em đã gửi thông tin cho chị Mai bên buồng phòng rồi ạ. Cảm ơn anh nhiều! 🙏', time: '08:15', ts: Date.now() - 3600000 * 2.5 },
      { id: 8, from: 'me', text: 'Được rồi. Nếu có vấn đề gì cứ liên hệ anh nhé!', time: '08:20', ts: Date.now() - 3600000 * 2.4 },
    ]
  },
  {
    id: 2, name: 'Trần Văn Hùng', initials: 'TH',
    avatar: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    online: true, unread: 2, time: '09:15',
    preview: 'Thực đơn hôm nay đã được duyệt chưa anh?',
    messages: [
      { id: 1, from: 'them', text: 'Anh ơi, thực đơn hôm nay đã được duyệt chưa ạ?', time: '09:10', ts: Date.now() - 3600000 * 2 },
      { id: 2, from: 'them', text: 'Bếp đang chờ để chuẩn bị nguyên liệu ạ.', time: '09:12', ts: Date.now() - 3600000 * 1.9 },
      { id: 3, from: 'me', text: 'Anh đang xem lại, 15 phút nữa anh phản hồi nhé.', time: '09:15', ts: Date.now() - 3600000 * 1.8 },
    ]
  },
  {
    id: 3, name: 'Lê Thị Mai', initials: 'LM',
    avatar: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    online: true, unread: 0, time: 'Hôm qua',
    preview: 'Đã dọn dẹp xong tất cả các phòng rồi ạ!',
    messages: [
      { id: 1, from: 'them', text: 'Anh ơi em đã dọn dẹp xong tất cả các phòng rồi ạ!', time: 'Hôm qua', ts: Date.now() - 86400000 },
      { id: 2, from: 'me', text: 'Tốt lắm em, cảm ơn em nhé!', time: 'Hôm qua', ts: Date.now() - 86400000 + 60000 },
    ]
  },
  {
    id: 4, name: 'Phạm Minh Tuấn', initials: 'MT',
    avatar: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    online: false, unread: 1, time: 'Hôm qua',
    preview: 'Hệ thống điều hòa phòng 302 cần kiểm tra',
    messages: [
      { id: 1, from: 'them', text: 'Anh Long ơi, hệ thống điều hòa phòng 302 cần kiểm tra gấp ạ.', time: 'Hôm qua', ts: Date.now() - 86400000 * 1.2 },
    ]
  },
  {
    id: 5, name: 'Nguyễn Thị Hà', initials: 'NH',
    avatar: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
    online: false, unread: 0, time: '2 ngày trước',
    preview: 'Cảm ơn anh đã hỗ trợ!',
    messages: [
      { id: 1, from: 'them', text: 'Cảm ơn anh đã hỗ trợ em ạ!', time: '2 ngày trước', ts: Date.now() - 86400000 * 2 },
      { id: 2, from: 'me', text: 'Không có gì em, cứ liên hệ anh khi cần nhé!', time: '2 ngày trước', ts: Date.now() - 86400000 * 2 + 60000 },
    ]
  },
  {
    id: 6, name: 'Sếp Kiên Bùi', initials: 'KB',
    avatar: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    online: true, unread: 0, time: '3 ngày trước',
    preview: 'JA tuần sau đã có chưa anh?',
    messages: [
      { id: 1, from: 'them', text: 'Anh ơi JA tuần sau đã có chưa ạ?', time: '3 ngày trước', ts: Date.now() - 86400000 * 3 },
    ]
  },
  {
    id: 7, name: 'Ban Giám Đốc', initials: 'BGĐ',
    avatar: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    online: false, unread: 2, time: '5 ngày trước',
    preview: 'Thông báo họp ban quản lý ngày 15/02',
    messages: [
      { id: 1, from: 'them', text: 'Thông báo họp ban quản lý ngày 15/02 lúc 9:00 sáng tại phòng họp A.', time: '5 ngày trước', ts: Date.now() - 86400000 * 5 },
      { id: 2, from: 'them', text: 'Đề nghị tất cả trưởng bộ phận tham dự đầy đủ.', time: '5 ngày trước', ts: Date.now() - 86400000 * 5 + 60000 },
    ]
  },
];

// Suggested contacts for new conversation modal
const suggestedContacts = [
  { initials: 'AT', name: 'Anh Thư', role: 'Quản lý Front Desk', avatar: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' },
  { initials: 'NH', name: 'Nhật Hạ', role: 'Trưởng bộ phận Housekeeping', avatar: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)' },
  { initials: 'XTo', name: 'Xuân Toàn', role: 'Kỹ thuật & Maintenance', avatar: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' },
  { initials: 'XTh', name: 'Xuân Thương', role: 'Tiếp tân sảnh (Front Desk)', avatar: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' },
  { initials: 'KH', name: 'Kim Hoa', role: 'Bộ phận F&B', avatar: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
];

// ===== STATE =====
let activeConvId = 1;
let deleteTarget = null;
let editingTarget = null; // { msgId, convId, row, oldText }
let msgIdCounter = 100;

// ===== HELPERS =====
function getConv(id) { return conversations.find(c => c.id === id); }
function getMsg(convId, msgId) {
  const conv = getConv(convId);
  return conv ? conv.messages.find(m => m.id === msgId) : null;
}
function nowTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function isWithin10Min(ts) { return Date.now() - ts < 10 * 60 * 1000; }
function isWithin1Min(ts) { return Date.now() - ts < 60 * 1000; }
function escapeHtml(text) {
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== RENDER CONV LIST =====
function renderConvList(filter = '') {
  const list = document.getElementById('convList');
  list.innerHTML = '';
  const tab = document.querySelector('.conv-tab.active')?.dataset.tab || 'all';

  conversations.forEach(conv => {
    if (filter && !conv.name.toLowerCase().includes(filter.toLowerCase())) return;
    if (tab === 'unread' && conv.unread === 0) return;

    const item = document.createElement('div');
    item.className = 'conv-item' + (conv.id === activeConvId ? ' active' : '') + (conv.unread > 0 ? ' unread' : '');
    item.dataset.id = conv.id;
    item.innerHTML = `
      <div class="conv-avatar" style="background:${conv.avatar}">
        ${conv.initials}
        <span class="online-dot ${conv.online ? '' : 'offline'}"></span>
      </div>
      <div class="conv-info">
        <div class="conv-top">
          <span class="conv-name">${conv.name}</span>
          <span class="conv-time">${conv.time}</span>
        </div>
        <div class="conv-preview">${conv.preview}</div>
      </div>
      ${conv.unread > 0 ? `<span class="unread-count">${conv.unread}</span>` : ''}
    `;
    item.addEventListener('click', () => selectConv(conv.id));
    list.appendChild(item);
  });
}

// ===== SELECT CONVERSATION =====
function selectConv(id) {
  activeConvId = id;
  const conv = getConv(id);
  conv.unread = 0;
  renderConvList(document.getElementById('convSearchInput').value);
  renderChatHeader(conv);
  renderMessages(conv);
}

// ===== RENDER CHAT HEADER =====
function renderChatHeader(conv) {
  document.getElementById('chatHeaderUser').innerHTML = `
    <div class="chat-header-avatar" style="background:${conv.avatar};position:relative;">
      ${conv.initials}
      <span class="online-dot ${conv.online ? '' : 'offline'}" style="position:absolute;bottom:1px;right:1px;"></span>
    </div>
    <div class="chat-header-info">
      <h3>${conv.name}</h3>
      <div class="chat-header-status">
        <span class="status-dot" style="background:${conv.online ? '#2ecc71' : '#95a5a6'}"></span>
        ${conv.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
      </div>
    </div>
  `;
  // Update call button with current conv info
  document.getElementById('callBtn').onclick = () => openCallModal(conv);
}

// ===== RENDER MESSAGES =====
function renderMessages(conv) {
  const area = document.getElementById('messagesArea');
  area.innerHTML = '';

  const dateDiv = document.createElement('div');
  dateDiv.className = 'msg-date-divider';
  dateDiv.textContent = 'HÔM NAY, 05/02/2026';
  area.appendChild(dateDiv);

  conv.messages.forEach(msg => {
    if (msg.hidden) return;
    area.appendChild(createMsgEl(msg, conv));
  });

  if (conv.id === 1) {
    const typing = document.createElement('div');
    typing.className = 'typing-row';
    typing.innerHTML = `
      <div class="msg-avatar" style="background:${conv.avatar}">${conv.initials}</div>
      <div class="typing-bubble">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    `;
    area.appendChild(typing);
  }

  area.scrollTop = area.scrollHeight;
}

// ===== CREATE MESSAGE ELEMENT =====
function createMsgEl(msg, conv) {
  const isSent = msg.from === 'me';
  const row = document.createElement('div');
  row.className = 'msg-row' + (isSent ? ' sent' : '');
  row.dataset.msgId = msg.id;

  const avatarBg = isSent ? ME.avatar : conv.avatar;
  const avatarText = isSent ? ME.initials : conv.initials;

  const bubbleHtml = msg.deleted
    ? `<div class="msg-bubble deleted">🚫 Tin nhắn đã bị xóa</div>`
    : `<div class="msg-bubble">${escapeHtml(msg.text)}</div>`;

  const editedLabel = (!msg.deleted && msg.edited)
    ? `<span class="msg-edited">Đã chỉnh sửa.</span>` : '';

  // Context menu: edit only if sent + within 10 min, copy always (if not deleted), delete always
  const canEdit = isSent && !msg.deleted && isWithin10Min(msg.ts);
  const ctxEdit = canEdit
    ? `<div class="ctx-item ctx-edit-btn"><span class="ctx-icon">✏️</span> Chỉnh sửa</div>` : '';
  const ctxCopy = !msg.deleted
    ? `<div class="ctx-item ctx-copy-btn"><span class="ctx-icon">📋</span> Sao chép</div>` : '';

  row.innerHTML = `
    <div class="msg-avatar" style="background:${avatarBg}">${avatarText}</div>
    <div class="msg-content">
      ${bubbleHtml}
      <div class="msg-meta">
        ${editedLabel}
        <span>${msg.time}</span>
        ${isSent ? '<span class="msg-tick">✓✓</span>' : ''}
      </div>
    </div>
    <div class="msg-context-menu ${isSent ? 'right' : 'left'}" id="ctx-${msg.id}">
      ${ctxEdit}
      ${ctxCopy}
      <div class="ctx-item danger ctx-delete-btn"><span class="ctx-icon">🗑️</span> Xóa tin nhắn</div>
    </div>
  `;

  const bubble = row.querySelector('.msg-bubble');
  if (bubble) {
    bubble.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      hideAllContextMenus();
      row.querySelector(`#ctx-${msg.id}`).classList.add('show');
    });
  }

  const editBtn = row.querySelector('.ctx-edit-btn');
  const copyBtn = row.querySelector('.ctx-copy-btn');
  const deleteBtn = row.querySelector('.ctx-delete-btn');

  if (editBtn) editBtn.addEventListener('click', () => { hideAllContextMenus(); startInlineEdit(msg, conv, row); });
  if (copyBtn) copyBtn.addEventListener('click', () => { hideAllContextMenus(); copyMessage(msg.text); });
  if (deleteBtn) deleteBtn.addEventListener('click', () => { hideAllContextMenus(); openDeleteModal(msg.id, conv.id, isSent, msg.ts); });

  return row;
}

// ===== CONTEXT MENU =====
function hideAllContextMenus() {
  document.querySelectorAll('.msg-context-menu.show').forEach(m => m.classList.remove('show'));
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.msg-context-menu') && !e.target.closest('.msg-bubble')) {
    hideAllContextMenus();
  }
});

// ===== COPY =====
function copyMessage(text) {
  navigator.clipboard.writeText(text).then(() => showToast('✅', 'Sao chép thành công'));
}

// ===== INLINE EDIT =====
function startInlineEdit(msg, conv, row) {
  if (!isWithin10Min(msg.ts)) return; // double-check

  // Show edit bar above input
  const editBar = document.getElementById('editBar');
  const editBarText = document.getElementById('editBarText');
  editBar.style.display = 'flex';
  editBarText.textContent = msg.text;

  // Put text into input
  const input = document.getElementById('msgInput');
  input.value = msg.text;
  input.focus();
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';

  editingTarget = { msgId: msg.id, convId: conv.id, row, oldText: msg.text };

  // Change send button to confirm edit
  document.getElementById('sendBtn').dataset.mode = 'edit';
}

function cancelEdit() {
  editingTarget = null;
  document.getElementById('editBar').style.display = 'none';
  document.getElementById('msgInput').value = '';
  document.getElementById('msgInput').style.height = 'auto';
  document.getElementById('sendBtn').dataset.mode = '';
}

document.getElementById('editBarClose').addEventListener('click', cancelEdit);

// ===== DELETE MODAL =====
function openDeleteModal(msgId, convId, isSent, ts) {
  deleteTarget = { msgId, convId, isSent, ts };
  if (!isSent) { showModal('deleteOldModal'); return; }
  showModal(isWithin10Min(ts) ? 'deleteModal' : 'deleteOldModal');
}

document.getElementById('deleteForAll').addEventListener('click', () => {
  hideModal('deleteModal'); showModal('deleteForAllModal');
});
document.getElementById('deleteForMe').addEventListener('click', () => {
  hideModal('deleteModal'); doDeleteForMe();
});
document.getElementById('deleteCancelBtn').addEventListener('click', () => hideModal('deleteModal'));
document.getElementById('deleteForAllConfirmBtn').addEventListener('click', () => {
  hideModal('deleteForAllModal'); doDeleteForAll();
});
document.getElementById('deleteForAllCancelBtn').addEventListener('click', () => {
  hideModal('deleteForAllModal'); showModal('deleteModal');
});
document.getElementById('deleteOldForMe').addEventListener('click', () => {
  hideModal('deleteOldModal'); doDeleteForMe();
});
document.getElementById('deleteOldCancelBtn').addEventListener('click', () => hideModal('deleteOldModal'));

function doDeleteForMe() {
  if (!deleteTarget) return;
  const msg = getMsg(deleteTarget.convId, deleteTarget.msgId);
  if (msg) msg.hidden = true;
  renderMessages(getConv(deleteTarget.convId));
  showToast('✅', 'Xóa thành công');
  deleteTarget = null;
}
function doDeleteForAll() {
  if (!deleteTarget) return;
  const msg = getMsg(deleteTarget.convId, deleteTarget.msgId);
  if (msg) { msg.deleted = true; msg.text = ''; }
  renderMessages(getConv(deleteTarget.convId));
  showToast('✅', 'Xóa thành công');
  deleteTarget = null;
}

// ===== MODAL HELPERS =====
function showModal(id) { document.getElementById(id).classList.add('show'); }
function hideModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', (e) => { if (e.target === o) o.classList.remove('show'); });
});

// ===== TOAST =====
function showToast(icon, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.querySelector('.toast-icon').textContent = icon;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== SEND / CONFIRM EDIT =====
function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text) return;

  // Edit mode
  if (document.getElementById('sendBtn').dataset.mode === 'edit' && editingTarget) {
    const msg = getMsg(editingTarget.convId, editingTarget.msgId);
    if (msg) {
      msg.text = text;
      msg.edited = true;
    }
    cancelEdit();
    renderMessages(getConv(activeConvId));
    showToast('✅', 'Đã chỉnh sửa tin nhắn');
    return;
  }

  // Normal send
  const conv = getConv(activeConvId);
  const msg = { id: ++msgIdCounter, from: 'me', text, time: nowTime(), ts: Date.now() };
  conv.messages.push(msg);
  conv.preview = text;
  conv.time = nowTime();
  input.value = '';
  input.style.height = 'auto';
  renderMessages(conv);
  renderConvList(document.getElementById('convSearchInput').value);
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('msgInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  if (e.key === 'Escape' && editingTarget) cancelEdit();
});
document.getElementById('msgInput').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// ===== CONV SEARCH =====
document.getElementById('convSearchInput').addEventListener('input', function () {
  renderConvList(this.value);
});

// ===== CONV TABS =====
document.querySelectorAll('.conv-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    renderConvList(document.getElementById('convSearchInput').value);
  });
});

// ===== NEW CONVERSATION MODAL =====
document.getElementById('newConvBtn').addEventListener('click', () => {
  renderContactList('');
  showModal('newConvModal');
});
document.getElementById('newConvClose').addEventListener('click', () => hideModal('newConvModal'));
document.getElementById('newConvSearch').addEventListener('input', function () {
  renderContactList(this.value);
});

function renderContactList(filter) {
  const list = document.getElementById('contactList');
  list.innerHTML = '';
  suggestedContacts.forEach(contact => {
    if (filter && !contact.name.toLowerCase().includes(filter.toLowerCase()) &&
        !contact.role.toLowerCase().includes(filter.toLowerCase())) return;
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.innerHTML = `
      <div class="contact-avatar" style="background:${contact.avatar}">${contact.initials}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-role">${contact.role}</div>
      </div>
      <input type="checkbox" class="contact-check">
    `;
    item.addEventListener('click', () => {
      hideModal('newConvModal');
      // Check if conversation already exists
      const existing = conversations.find(c => c.name === contact.name);
      if (existing) {
        selectConv(existing.id);
        return;
      }
      // Create new conversation
      const newConv = {
        id: conversations.length + 1,
        name: contact.name,
        initials: contact.initials,
        avatar: contact.avatar,
        online: true,
        unread: 0,
        time: nowTime(),
        preview: 'Bắt đầu cuộc trò chuyện...',
        messages: [],
      };
      conversations.unshift(newConv);
      renderConvList('');
      selectConv(newConv.id);
    });
    list.appendChild(item);
  });
}

// ===== CALL SOUND (Web Audio API) =====
let audioCtx = null;
let ringingNodes = [];
let ringingInterval = null;

function getRingAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function playRingTone() {
  stopRingTone();
  // Play a ring pattern: beep-beep ... pause ... repeat
  function ring() {
    const ctx = getRingAudioCtx();
    const pattern = [
      { freq: 480, start: 0,    dur: 0.4 },
      { freq: 480, start: 0.5,  dur: 0.4 },
    ];
    pattern.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + dur - 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
      ringingNodes.push(osc);
    });
  }
  ring();
  ringingInterval = setInterval(ring, 2000);
}

function stopRingTone() {
  clearInterval(ringingInterval);
  ringingNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  ringingNodes = [];
}

function playEndTone() {
  const ctx = getRingAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = 300;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

// ===== CALL MODAL =====
function openCallModal(conv) {
  const modal = document.getElementById('callModal');
  document.getElementById('callAvatar').style.background = conv.avatar;
  document.getElementById('callAvatarText').textContent = conv.initials;
  document.getElementById('callName').textContent = conv.name;
  document.getElementById('callStatus').textContent = `••• Đang gọi cho ${conv.name}...`;
  // Move to body to escape any parent stacking context
  document.body.appendChild(modal);
  showModal('callModal');
  playRingTone();
  startCallTimer();
}

let callTimerInterval = null;
function startCallTimer() {
  let sec = 0;
  clearInterval(callTimerInterval);
  callTimerInterval = setInterval(() => {
    sec++;
    if (sec === 5) {
      document.getElementById('callStatus').textContent = 'Đang kết nối...';
    }
  }, 1000);
}

document.getElementById('callEndBtn').addEventListener('click', () => {
  clearInterval(callTimerInterval);
  stopRingTone();
  playEndTone();
  hideModal('callModal');
});
document.getElementById('callMuteBtn').addEventListener('click', function () {
  this.classList.toggle('active');
  const muted = this.classList.contains('active');
  this.innerHTML = muted
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
});
document.getElementById('callSpeakerBtn').addEventListener('click', function () {
  this.classList.toggle('active');
  const on = this.classList.contains('active');
  this.innerHTML = on
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
});

// ===== INIT =====
renderConvList();
selectConv(1);
