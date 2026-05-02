// ===== CSRF HELPER =====
function getCsrfToken() {
  const el = document.querySelector('[name=csrfmiddlewaretoken]');
  if (el) return el.value;
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
  return cookie ? cookie.trim().split('=')[1] : '';
}

// ===== DATA =====
const ME = { id: 'me', name: '', initials: '', avatar: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' };

// conversations duoc load tu DB, khong hardcode nua
let conversations = [];

// Suggested contacts for new conversation modal
const suggestedContacts = [];

// ===== STATE =====
let activeConvId = null;
let deleteTarget = null;
let editingTarget = null;
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
    item.addEventListener('click', () => {
      console.log(`Clicked on conversation ${conv.id}, calling selectConv with markAsRead=true`);
      selectConv(conv.id, true);
    });
    list.appendChild(item);
  });
  
  // Cập nhật số unread trong tab
  updateUnreadCount();
}

function updateUnreadCount() {
  const unreadCount = conversations.filter(c => c.unread > 0).length;
  const unreadCountEl = document.getElementById('unreadCount');
  if (unreadCountEl) {
    unreadCountEl.textContent = unreadCount > 0 ? `(${unreadCount})` : '';
  }
}

// ===== SELECT CONVERSATION =====
function selectConv(id, markAsRead = true) {
  activeConvId = id;
  const conv = getConv(id);
  if (!conv) return;
  
  // Chỉ đánh dấu đã đọc nếu markAsRead = true (user click)
  if (markAsRead) {
    conv.unread = 0;
    renderConvList(document.getElementById('convSearchInput').value);
    
    // Gọi API để đánh dấu đã đọc ở backend
    console.log(`Marking conversation ${id} as read...`);
    fetch(`/api/conversations/${id}/mark-read/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      }
    })
    .then(r => {
      console.log(`Mark-read response status: ${r.status}`);
      return r.json();
    })
    .then(data => {
      console.log('Mark-read response:', data);
    })
    .catch(err => {
      console.error('Mark-read error:', err);
    });
  }
  
  renderChatHeader(conv);

  // Load messages tu DB
  fetch(`/api/conversations/${id}/messages/`)
    .then(r => r.json())
    .then(data => {
      conv.messages = data.messages || [];
      renderMessages(conv);
    })
    .catch(() => {
      conv.messages = conv.messages || [];
      renderMessages(conv);
    });
}

// ===== RENDER CHAT HEADER =====
function renderChatHeader(conv) {
  const isGroup = conv.status === 'group';
  const nameHtml = isGroup
    ? `<h3 id="chatHeaderName" class="editable-group-name" title="Click de doi ten nhom">${conv.name} &#9999;&#65039;</h3>`
    : `<h3 id="chatHeaderName">${conv.name}</h3>`;

  document.getElementById('chatHeaderUser').innerHTML = `
    <div class="chat-header-avatar" style="background:${conv.avatar};position:relative;">
      ${conv.initials}
      <span class="online-dot ${conv.online ? '' : 'offline'}" style="position:absolute;bottom:1px;right:1px;"></span>
    </div>
    <div class="chat-header-info">
      ${nameHtml}
      <div class="chat-header-status">
        <span class="status-dot" style="background:${conv.online ? '#2ecc71' : '#95a5a6'}"></span>
        ${conv.online ? 'Dang hoat dong' : 'Ngoai tuyen'}
      </div>
    </div>
  `;
  document.getElementById('callBtn').onclick = () => openCallModal(conv);

  if (isGroup) {
    const nameEl = document.getElementById('chatHeaderName');
    if (nameEl) {
      nameEl.style.cursor = 'pointer';
      nameEl.onclick = () => showRenameModal(conv);
    }
  }
}

// ===== RENDER MESSAGES =====
function renderMessages(conv) {
  const area = document.getElementById('messagesArea');
  area.innerHTML = '';

  const dateDiv = document.createElement('div');
  dateDiv.className = 'msg-date-divider';
  dateDiv.textContent = 'HOM NAY, 05/02/2026';
  area.appendChild(dateDiv);

  conv.messages.forEach(msg => {
    if (msg.hidden) return;
    area.appendChild(createMsgEl(msg, conv));
  });

  area.scrollTop = area.scrollHeight;
}

// ===== CREATE MESSAGE ELEMENT =====
function createMsgEl(msg, conv) {
  const isSent = msg.from === 'me';
  const isGroup = conv.status === 'group';
  const row = document.createElement('div');
  row.className = 'msg-row' + (isSent ? ' sent' : '');
  row.dataset.msgId = msg.id;

  // Trong nhóm: avatar riêng từng người, ngoài nhóm: dùng avatar conv
  const avatarBg = isSent ? ME.avatar : (isGroup ? getAvatarForSender(msg) : conv.avatar);
  const avatarText = isSent ? ME.initials : (isGroup ? getInitialsForSender(msg) : conv.initials);

  const bubbleHtml = msg.deleted
    ? `<div class="msg-bubble deleted">🚫 Tin nhắn đã bị thu hồi</div>`
    : msg.message_type === 'call'
      ? `<div class="msg-bubble msg-bubble-call">${escapeHtml(msg.text)}</div>`
      : msg.image_url
      ? `<div class="msg-bubble msg-bubble-img"><img src="${msg.image_url}" alt="ảnh" style="max-width:240px;max-height:200px;border-radius:8px;cursor:pointer;" onclick="window.open('${msg.image_url}','_blank')"></div>`
      : msg.file_url
        ? `<div class="msg-bubble msg-bubble-file">📎 <a href="${msg.file_url}" target="_blank" style="color:inherit;">${escapeHtml(msg.file_name || 'Tệp đính kèm')}</a></div>`
        : `<div class="msg-bubble">${escapeHtml(msg.text)}</div>`;

  const editedLabel = (!msg.deleted && msg.edited)
    ? `<span class="msg-edited">Đã chỉnh sửa</span>` : '';

  // Hiện tên người gửi trong nhóm (chỉ tin nhắn của người khác)
  const senderName = (!isSent && isGroup && msg.sender_name)
    ? `<div class="msg-sender-name">${escapeHtml(msg.sender_name)}</div>` : '';

  const canEdit = isSent && !msg.deleted && isWithin10Min(msg.ts);
  const ctxEdit = canEdit
    ? `<div class="ctx-item ctx-edit-btn"><span class="ctx-icon">✏️</span> Chỉnh sửa</div>` : '';
  const ctxCopy = !msg.deleted
    ? `<div class="ctx-item ctx-copy-btn"><span class="ctx-icon">📋</span> Sao chép</div>` : '';

  row.innerHTML = `
    <div class="msg-avatar" style="background:${avatarBg}">${avatarText}</div>
    <div class="msg-content">
      ${senderName}
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

// Cache avatar/initials cho từng sender trong group
const senderCache = {};
function getAvatarForSender(msg) {
  if (msg.sender_avatar) return msg.sender_avatar;
  return senderCache[msg.sender_name]?.avatar || 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)';
}
function getInitialsForSender(msg) {
  if (msg.sender_initials) return msg.sender_initials;
  if (msg.sender_name) {
    const parts = msg.sender_name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : msg.sender_name.slice(0,2).toUpperCase();
  }
  return '??';
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
  if (!isWithin10Min(msg.ts)) return;

  const editBar = document.getElementById('editBar');
  const editBarText = document.getElementById('editBarText');
  editBar.style.display = 'flex';
  editBarText.textContent = msg.text;

  const input = document.getElementById('msgInput');
  input.value = msg.text;
  input.focus();
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';

  editingTarget = { msgId: msg.id, convId: conv.id, row, oldText: msg.text };
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
  showToast('✅', 'Đã xóa tin nhắn');
  deleteTarget = null;
}
function doDeleteForAll() {
  if (!deleteTarget) return;
  const msgId = deleteTarget.msgId;
  const convId = deleteTarget.convId;

  // Gọi API xóa thật sự trong DB
  fetch(`/api/messages/${msgId}/delete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({}),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const msg = getMsg(convId, msgId);
        if (msg) { msg.deleted = true; msg.text = ''; }
        const conv = getConv(convId);
        // Nếu tin nhắn bị xóa là tin cuối → cập nhật preview
        if (conv && conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg.id === msgId) {
            conv.preview = 'Tin nhắn đã bị thu hồi';
          }
        }
        renderMessages(getConv(convId));
        renderConvList(document.getElementById('convSearchInput').value);
        showToast('✅', 'Thu hồi thành công');
      } else {
        showToast('❌', data.error || 'Thu hồi thất bại');
      }
    })
    .catch(() => showToast('❌', 'Lỗi kết nối'));

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
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== SEND / CONFIRM EDIT =====
function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text) return;

  // Edit mode — POST lên DB
  if (document.getElementById('sendBtn').dataset.mode === 'edit' && editingTarget) {
    const { msgId, convId } = editingTarget;
    fetch(`/api/messages/${msgId}/edit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
      body: JSON.stringify({ content: text }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const msg = getMsg(convId, msgId);
          if (msg) { msg.text = data.text; msg.edited = true; }
          cancelEdit();
          renderMessages(getConv(activeConvId));
          showToast('✅', 'Đã chỉnh sửa tin nhắn');
        } else {
          showToast('❌', data.error || 'Chỉnh sửa thất bại');
        }
      })
      .catch(() => showToast('❌', 'Lỗi kết nối'));
    return;
  }

  // Normal send - POST len DB
  const conv = getConv(activeConvId);
  if (!conv) return;

  input.value = '';
  input.style.height = 'auto';

  fetch(`/api/conversations/${activeConvId}/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({ content: text }),
  })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (data.id) {
        conv.messages.push(data);
        conv.preview = text;
        conv.time = data.time;
        renderMessages(conv);

        // Dua conversation len dau danh sach
        const idx = conversations.findIndex(c => c.id === activeConvId);
        if (idx > 0) {
          const [movedConv] = conversations.splice(idx, 1);
          movedConv.time = data.time;
          movedConv.preview = text;
          conversations.unshift(movedConv);
        } else if (idx === 0) {
          conversations[0].time = data.time;
          conversations[0].preview = text;
        }
        renderConvList(document.getElementById('convSearchInput').value);
      } else {
        showToast('❌', data.error || 'Gửi thất bại');
      }
    })
    .catch(err => {
      console.error('Send message error:', err);
      showToast('❌', 'Lỗi kết nối: ' + err.message);
    });
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

// ===== NÚT ĐÍNH KÈM FILE =====
function sendMediaMessage(file, type) {
  const conv = getConv(activeConvId);
  if (!conv) return;

  const formData = new FormData();
  formData.append('content', '');
  formData.append(type, file);

  fetch(`/api/conversations/${activeConvId}/send/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCsrfToken() },
    body: formData,
  })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      if (data.id) {
        conv.messages.push(data);
        conv.preview = type === 'image' ? '🖼️ Hình ảnh' : `📎 ${data.file_name || 'Tệp đính kèm'}`;
        conv.time = data.time;
        renderMessages(conv);
        const idx = conversations.findIndex(c => c.id === activeConvId);
        if (idx > 0) { const [m] = conversations.splice(idx, 1); m.time = data.time; conversations.unshift(m); }
        renderConvList(document.getElementById('convSearchInput').value);
      }
    })
    .catch(err => showToast('❌', 'Lỗi gửi: ' + err.message));
}

// Nút đính kèm file
const attachBtn = document.querySelector('.input-icon-btn[title="Đính kèm"]');
if (attachBtn) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '*/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) { sendMediaMessage(fileInput.files[0], 'file'); fileInput.value = ''; }
  });
}

// Nút gửi ảnh
const imageBtn = document.querySelector('.input-icon-btn[title="Hình ảnh"]');
if (imageBtn) {
  const imgInput = document.createElement('input');
  imgInput.type = 'file';
  imgInput.accept = 'image/*';
  imgInput.style.display = 'none';
  document.body.appendChild(imgInput);
  imageBtn.addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', () => {
    if (imgInput.files[0]) { sendMediaMessage(imgInput.files[0], 'image'); imgInput.value = ''; }
  });
}

// ===== EMOJI PICKER =====
const EMOJIS = ['😊','😂','❤️','👍','🙏','😍','🥰','😘','😭','😅','🤣','😁','🎉','✅','🔥','💪','👏','🤔','😢','😎',
  '🥳','😴','🤗','😡','😱','🤩','😏','🙄','😤','🥺','💯','🎊','👋','✨','💬','📞','🏨','⭐','🌟','💼'];

let emojiPickerVisible = false;
let emojiPicker = null;

const emojiBtn = document.querySelector('.input-icon-btn[title="Emoji"]');
if (emojiBtn) {
  emojiPicker = document.createElement('div');
  emojiPicker.id = 'emojiPicker';
  emojiPicker.style.cssText = `
    position:absolute; bottom:70px; left:60px; background:white; border-radius:12px;
    box-shadow:0 8px 32px rgba(0,0,0,0.15); padding:12px; display:none;
    width:280px; z-index:1000; display:none;
    display:grid; grid-template-columns:repeat(8,1fr); gap:4px;
  `;
  emojiPicker.style.display = 'none';
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.style.cssText = 'background:none;border:none;font-size:20px;cursor:pointer;padding:4px;border-radius:6px;';
    btn.addEventListener('mouseenter', () => btn.style.background = '#f0f4ff');
    btn.addEventListener('mouseleave', () => btn.style.background = 'none');
    btn.addEventListener('click', () => {
      const input = document.getElementById('msgInput');
      const pos = input.selectionStart;
      input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
      input.focus();
      input.selectionStart = input.selectionEnd = pos + emoji.length;
      emojiPicker.style.display = 'none';
      emojiPickerVisible = false;
    });
    emojiPicker.appendChild(btn);
  });

  document.querySelector('.chat-input-area').style.position = 'relative';
  document.querySelector('.chat-input-area').appendChild(emojiPicker);

  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPickerVisible = !emojiPickerVisible;
    emojiPicker.style.display = emojiPickerVisible ? 'grid' : 'none';
  });

  document.addEventListener('click', (e) => {
    if (emojiPickerVisible && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.style.display = 'none';
      emojiPickerVisible = false;
    }
  });
}

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
  loadUsers('');
});

document.getElementById('newConvClose').addEventListener('click', () => hideModal('newConvModal'));

document.getElementById('newConvSearch').addEventListener('input', function () {
  loadUsers(this.value);
});

function loadUsers(search) {
  const url = search ? `/api/users/?q=${encodeURIComponent(search)}` : '/api/users/';
  fetch(url)
    .then(r => r.json())
    .then(data => {
      suggestedContacts.length = 0;
      suggestedContacts.push(...data.users);
      renderContactList('');
      if (!document.getElementById('newConvModal').classList.contains('show')) {
        showModal('newConvModal');
      }
    })
    .catch(() => {
      showToast('❌', 'Không thể tải danh sách người dùng');
    });
}

function renderContactList(filter) {
  const list = document.getElementById('contactList');
  list.innerHTML = '';

  suggestedContacts.forEach(contact => {
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.innerHTML = `
      <div class="contact-avatar" style="background:${contact.avatar}">${contact.initials}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-role">${contact.role}</div>
      </div>
      <input type="checkbox" class="contact-check" data-user-id="${contact.id}">
    `;

    const checkbox = item.querySelector('.contact-check');
    checkbox.addEventListener('change', updateCreateGroupButton);

    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('contact-check')) return;
      checkbox.checked = !checkbox.checked;
      updateCreateGroupButton();
    });

    list.appendChild(item);
  });
}

function updateCreateGroupButton() {
  const checked = document.querySelectorAll('.contact-check:checked');
  let createGroupBtn = document.querySelector('.create-group-btn-dynamic');

  if (!createGroupBtn) {
    const btn = document.createElement('button');
    btn.className = 'create-group-btn-dynamic';
    btn.style.cssText = 'width:100%;padding:12px;background:#5b7ce6;color:white;border:none;border-radius:8px;font-weight:600;margin-top:16px;cursor:pointer;display:none;';
    btn.textContent = 'Tao cuoc tro chuyen';
    btn.addEventListener('click', createConversation);
    const contactList = document.getElementById('contactList');
    contactList.parentElement.insertBefore(btn, contactList.nextSibling);
    createGroupBtn = btn;
  }

  if (checked.length > 0) {
    createGroupBtn.style.display = 'block';
    createGroupBtn.textContent = checked.length === 1 
      ? 'Bắt đầu trò chuyện' 
      : `Tạo nhóm (${checked.length} người)`;
  } else {
    createGroupBtn.style.display = 'none';
  }
}

function createConversation() {
  const checked = Array.from(document.querySelectorAll('.contact-check:checked'));
  const userIds = checked.map(cb => parseInt(cb.dataset.userId));

  if (userIds.length === 0) return;

  fetch('/api/conversations/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({ user_ids: userIds }),
  })
    .then(r => {
      if (!r.ok) {
        return r.text().then(text => {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        });
      }
      return r.json();
    })
    .then(data => {
      if (data.conversation_id) {
        hideModal('newConvModal');
        fetch('/api/conversations/')
          .then(r => r.json())
          .then(result => {
            conversations = (result.conversations || []).map(c => ({ ...c, messages: [], online: false }));
            renderConvList();
            selectConv(data.conversation_id);
          });
      } else {
        showToast('❌', data.error || 'Tạo thất bại');
      }
    })
    .catch(err => {
      console.error('Create conversation error:', err);
      showToast('❌', 'Lỗi kết nối: ' + err.message);
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
  function ring() {
    const ctx = getRingAudioCtx();
    const pattern = [
      { freq: 480, start: 0,   dur: 0.4 },
      { freq: 480, start: 0.5, dur: 0.4 },
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
let activeCallIds = [];  // IDs của call requests đang gọi
let activeCallIdForEnd = null;  // ID để end call sau khi accepted
let callConvId = null;
let callStartTime = null;

function openCallModal(conv) {
  const modal = document.getElementById('callModal');
  document.getElementById('callAvatar').style.background = conv.avatar;
  document.getElementById('callAvatarText').textContent = conv.initials;
  document.getElementById('callName').textContent = conv.name;
  document.getElementById('callStatus').textContent = `Đang gọi cho ${conv.name}...`;
  document.body.appendChild(modal);
  showModal('callModal');
  playRingTone();
  startCallTimer();
  callConvId = conv.id;
  callStartTime = Date.now();

  // POST lên server để tạo call request
  fetch(`/api/conversations/${conv.id}/call/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({}),
  })
    .then(r => r.json())
    .then(data => {
      if (data.call_ids) {
        activeCallIds = data.call_ids;
        startPollCallStatus();  // Bắt đầu poll trạng thái
      }
    })
    .catch(err => console.error('Call error:', err));
}

let callStatusPollInterval = null;
let callActivePollInterval = null;  // Poll khi cuộc gọi đang diễn ra
let receiverPollInterval = null;  // Poll khi là người nhận cuộc gọi

function startPollCallStatus() {
  clearInterval(callStatusPollInterval);
  console.log('Start polling call status for IDs:', activeCallIds);
  callStatusPollInterval = setInterval(() => {
    if (activeCallIds.length === 0) {
      clearInterval(callStatusPollInterval);
      return;
    }
    fetch(`/api/calls/${activeCallIds[0]}/status/`)
      .then(r => r.json())
      .then(data => {
        console.log('Call status:', data.status);
        if (data.status === 'rejected') {
          clearInterval(callStatusPollInterval);
          clearInterval(callTimerInterval);
          stopRingTone();
          playEndTone();
          hideModal('callModal');
          showToast('📵', 'Cuộc gọi bị từ chối');
          saveCallLog('rejected');
          activeCallIds = [];
        } else if (data.status === 'accepted') {
          clearInterval(callStatusPollInterval);
          // Lưu call ID để dùng khi end
          activeCallIdForEnd = activeCallIds[0];
          // Bắt đầu đếm giây bên người gọi
          callStartTime = Date.now();
          stopRingTone();
          let sec = 0;
          clearInterval(callTimerInterval);
          callTimerInterval = setInterval(() => {
            sec++;
            const m = String(Math.floor(sec / 60)).padStart(2, '0');
            const s = String(sec % 60).padStart(2, '0');
            document.getElementById('callStatus').textContent = `🟢 ${m}:${s}`;
          }, 1000);
          // Bắt đầu poll liên tục khi cuộc gọi đang diễn ra
          startActivePollCallStatus(activeCallIdForEnd);
          activeCallIds = [];
        } else if (data.status === 'ended') {
          clearInterval(callStatusPollInterval);
          clearInterval(callTimerInterval);
          stopRingTone();
          hideModal('callModal');
          saveCallLog('ended');
          activeCallIds = [];
        }
      })
      .catch(() => {});
  }, 1000);  // Poll mỗi 1 giây để phát hiện nhanh khi bắt máy
}

// Poll liên tục khi cuộc gọi đang diễn ra (mỗi 500ms)
function startActivePollCallStatus(callId) {
  clearInterval(callActivePollInterval);
  callActivePollInterval = setInterval(() => {
    fetch(`/api/calls/${callId}/status/`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ended') {
          console.log('Call ended detected');
          clearInterval(callActivePollInterval);
          clearInterval(callTimerInterval);
          stopRingTone();
          playEndTone();
          hideModal('callModal');
          showToast('📞', 'Cuộc gọi đã kết thúc');
          const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
          saveCallLog(duration > 3 ? 'ended' : 'missed');
          activeCallIdForEnd = null;
        }
      })
      .catch(() => {});
  }, 500);  // Poll mỗi 500ms để phát hiện ngay khi cuộc gọi kết thúc
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
    // Tự động hủy sau 30 giây nếu không ai trả lời
    if (sec >= 30) {
      clearInterval(callTimerInterval);
      clearInterval(callStatusPollInterval);
      stopRingTone();
      hideModal('callModal');
      showToast('📵', 'Không có người trả lời');
      activeCallIds = [];
    }
  }, 1000);
}

function saveCallLog(status) {
  if (!callConvId) return;
  const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
  fetch(`/api/conversations/${callConvId}/call-log/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({ status, duration }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.id && activeConvId === callConvId) {
        const conv = getConv(callConvId);
        if (conv) {
          conv.messages.push(data);
          renderMessages(conv);
        }
      }
    })
    .catch(() => {});
  callConvId = null;
  callStartTime = null;
}

document.getElementById('callEndBtn').addEventListener('click', () => {
  const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
  clearInterval(callTimerInterval);
  clearInterval(callStatusPollInterval);
  clearInterval(callActivePollInterval);  // Dừng poll liên tục
  clearInterval(receiverPollInterval);  // Dừng poll khi là người nhận
  stopRingTone();
  playEndTone();
  hideModal('callModal');
  saveCallLog(duration > 3 ? 'ended' : 'missed');

  // End tất cả call IDs (đang gọi chưa bắt máy)
  const idsToEnd = activeCallIds.length > 0 ? activeCallIds : (activeCallIdForEnd ? [activeCallIdForEnd] : []);
  idsToEnd.forEach(id => {
    fetch(`/api/calls/${id}/respond/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
      body: JSON.stringify({ action: 'end' }),
    }).catch(() => {});
  });
  activeCallIds = [];
  activeCallIdForEnd = null;
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
fetch('/api/conversations/')
  .then(r => r.json())
  .then(data => {
    console.log('=== CONVERSATIONS LOADED ===');
    console.log('Raw data:', data);
    conversations = (data.conversations || []).map(c => ({ ...c, messages: [], online: false }));
    console.log('Conversations with unread:', conversations.filter(c => c.unread > 0).map(c => ({ id: c.id, name: c.name, unread: c.unread })));
    renderConvList();
    if (conversations.length > 0) {
      selectConv(conversations[0].id, false); // false = không đánh dấu đã đọc khi auto-select
    } else {
      document.getElementById('messagesArea').innerHTML =
        '<div style="text-align:center;color:#aaa;margin-top:40px;">Chua co cuoc tro chuyen nao</div>';
    }
  })
  .catch(() => {
    renderConvList();
  });

// ===== POLLING: Tự động nhận tin nhắn mới mỗi 3 giây =====
let lastMsgId = 0; // ID tin nhắn cuối cùng đã biết trong conversation đang mở

function pollNewMessages() {
  if (!activeConvId) return;

  const conv = getConv(activeConvId);
  if (!conv) return;

  // Lấy ID tin nhắn cuối cùng hiện có
  const lastKnownId = conv.messages.length > 0
    ? Math.max(...conv.messages.map(m => m.id))
    : 0;

  fetch(`/api/conversations/${activeConvId}/messages/`)
    .then(r => r.json())
    .then(data => {
      const newMsgs = (data.messages || []).filter(m => m.id > lastKnownId);
      if (newMsgs.length > 0) {
        // Có tin nhắn mới — thêm vào và render
        conv.messages.push(...newMsgs);

        // Cập nhật preview và time trong danh sách
        const lastMsg = newMsgs[newMsgs.length - 1];
        conv.preview = lastMsg.text;
        conv.time = lastMsg.time;

        // Nếu tin nhắn mới từ người khác → đưa conversation lên đầu
        if (lastMsg.from === 'them') {
          const idx = conversations.findIndex(c => c.id === activeConvId);
          if (idx > 0) {
            const [movedConv] = conversations.splice(idx, 1);
            conversations.unshift(movedConv);
          }
        }

        renderMessages(conv);
        renderConvList(document.getElementById('convSearchInput').value);
      }

      // Kiểm tra tin nhắn bị thu hồi hoặc chỉnh sửa
      (data.messages || []).forEach(serverMsg => {
        const localMsg = conv.messages.find(m => m.id === serverMsg.id);
        if (localMsg) {
          // Tin nhắn bị thu hồi
          if (serverMsg.deleted && !localMsg.deleted) {
            localMsg.deleted = true;
            localMsg.text = '';
            renderMessages(conv);
          }
          // Tin nhắn bị chỉnh sửa
          if (serverMsg.edited && localMsg.text !== serverMsg.text && !serverMsg.deleted) {
            localMsg.text = serverMsg.text;
            localMsg.edited = true;
            renderMessages(conv);
          }
        }
      });
    })
    .catch(() => {}); // Bỏ qua lỗi mạng khi poll
}

// Poll conversation list để phát hiện tin nhắn mới ở các conversation khác
function pollConversationList() {
  fetch('/api/conversations/')
    .then(r => r.json())
    .then(data => {
      const updated = data.conversations || [];
      updated.forEach(serverConv => {
        const localConv = getConv(serverConv.id);
        if (!localConv) {
          // Conversation mới (chưa có local) — thêm vào
          conversations.push({ ...serverConv, messages: [], online: false });
          renderConvList(document.getElementById('convSearchInput').value);
          return;
        }

        // Cập nhật unread từ server (backend tính chính xác)
        const oldUnread = localConv.unread || 0;
        localConv.unread = serverConv.unread;
        localConv.preview = serverConv.preview;
        localConv.time = serverConv.time;

        // Nếu có tin nhắn mới (unread tăng), đưa lên đầu danh sách
        if (serverConv.unread > oldUnread && serverConv.id !== activeConvId) {
          const idx = conversations.findIndex(c => c.id === serverConv.id);
          if (idx > 0) {
            const [movedConv] = conversations.splice(idx, 1);
            conversations.unshift(movedConv);
          }
          renderConvList(document.getElementById('convSearchInput').value);
        } else if (serverConv.unread !== oldUnread) {
          // Chỉ cập nhật UI nếu unread thay đổi
          renderConvList(document.getElementById('convSearchInput').value);
        }
      });
    })
    .catch(() => {});
}

// Chạy polling
setInterval(pollNewMessages, 3000);       // Check tin nhắn mới trong conv đang mở
setInterval(pollConversationList, 5000);  // Check tin nhắn mới ở tất cả conv

// ===== INCOMING CALL POLLING =====
let currentIncomingCallId = null;

function pollIncomingCall() {
  fetch('/api/calls/incoming/')
    .then(r => r.json())
    .then(data => {
      if (data.has_call && data.call_id !== currentIncomingCallId) {
        console.log('Incoming call detected:', data);
        currentIncomingCallId = data.call_id;
        showIncomingCall(data);
      }
    })
    .catch(err => console.error('Poll call error:', err));
}

function showIncomingCall(data) {
  document.getElementById('incomingCallAvatar').style.background = data.avatar;
  document.getElementById('incomingCallAvatarText').textContent = data.initials;
  document.getElementById('incomingCallName').textContent = data.caller_name;
  document.body.appendChild(document.getElementById('incomingCallModal'));
  showModal('incomingCallModal');
  playRingTone();
  // Lưu conversation_id để dùng khi kết thúc
  document.getElementById('incomingCallModal').dataset.convId = data.conversation_id;
}

document.getElementById('incomingAcceptBtn').addEventListener('click', () => {
  if (!currentIncomingCallId) return;
  const callId = currentIncomingCallId;
  const callerName = document.getElementById('incomingCallName').textContent;
  const callerAvatar = document.getElementById('incomingCallAvatar').style.background;
  const callerInitials = document.getElementById('incomingCallAvatarText').textContent;

  fetch(`/api/calls/${callId}/respond/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({ action: 'accept' }),
  }).catch(() => {});

  stopRingTone();
  hideModal('incomingCallModal');
  currentIncomingCallId = null;

  // Chuyển sang màn hình đang gọi
  const modal = document.getElementById('callModal');
  document.getElementById('callAvatar').style.background = callerAvatar;
  document.getElementById('callAvatarText').textContent = callerInitials;
  document.getElementById('callName').textContent = callerName;
  document.getElementById('callStatus').textContent = '🟢 Đang trong cuộc gọi...';
  document.body.appendChild(modal);
  showModal('callModal');
  callStartTime = Date.now();
  // Lưu convId để log sau khi kết thúc
  callConvId = document.getElementById('incomingCallModal').dataset.convId
    ? parseInt(document.getElementById('incomingCallModal').dataset.convId) : null;
  activeCallIdForEnd = callId;  // Lưu để end khi bấm HỦY
  // Bắt đầu đếm giây
  let sec = 0;
  clearInterval(callTimerInterval);
  callTimerInterval = setInterval(() => {
    sec++;
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    document.getElementById('callStatus').textContent = `🟢 ${m}:${s}`;
  }, 1000);
  // Poll xem bên gọi có tắt không
  const acceptedCallId = callId;
  clearInterval(receiverPollInterval);
  receiverPollInterval = setInterval(() => {
    fetch(`/api/calls/${acceptedCallId}/status/`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ended') {
          clearInterval(receiverPollInterval);
          clearInterval(callTimerInterval);
          stopRingTone();
          playEndTone();
          hideModal('callModal');
          saveCallLog('ended');
          showToast('📞', 'Cuộc gọi đã kết thúc');
        }
      })
      .catch(() => {});
  }, 500);  // Poll mỗi 500ms để phát hiện ngay khi cuộc gọi kết thúc
});

document.getElementById('incomingRejectBtn').addEventListener('click', () => {
  if (!currentIncomingCallId) return;
  fetch(`/api/calls/${currentIncomingCallId}/respond/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({ action: 'reject' }),
  }).catch(() => {});
  stopRingTone();
  hideModal('incomingCallModal');
  clearInterval(callActivePollInterval);  // Dừng poll nếu có
  clearInterval(receiverPollInterval);  // Dừng poll khi là người nhận
  showToast('📵', 'Đã từ chối cuộc gọi');
  currentIncomingCallId = null;
});

setInterval(pollIncomingCall, 1000);  // Check cuộc gọi đến mỗi 1 giây

// ===== TẠO NHÓM TRÒ CHUYỆN =====
let selectedGroupMembers = {}; // { userId: { name, initials, avatar } }

document.getElementById('openCreateGroupBtn').addEventListener('click', () => {
  selectedGroupMembers = {};
  hideModal('newConvModal');
  loadGroupMembers('');
  showModal('createGroupModal');
});

document.getElementById('createGroupClose').addEventListener('click', () => {
  hideModal('createGroupModal');
});

document.getElementById('groupMemberSearch').addEventListener('input', function () {
  loadGroupMembers(this.value);
});

document.getElementById('createGroupSubmitBtn').addEventListener('click', () => {
  const userIds = Object.keys(selectedGroupMembers).map(Number);
  if (userIds.length < 2) {
    showToast('⚠️', 'Chọn ít nhất 2 người để tạo nhóm');
    return;
  }

  fetch('/api/conversations/create/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    body: JSON.stringify({ user_ids: userIds }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.conversation_id) {
        hideModal('createGroupModal');
        fetch('/api/conversations/')
          .then(r => r.json())
          .then(result => {
            conversations = (result.conversations || []).map(c => ({ ...c, messages: [], online: false }));
            renderConvList();
            selectConv(data.conversation_id);
          });
        showToast('✅', 'Đã tạo nhóm trò chuyện');
      } else {
        showToast('❌', data.error || 'Tạo nhóm thất bại');
      }
    })
    .catch(() => showToast('❌', 'Lỗi kết nối'));
});

function loadGroupMembers(search) {
  const url = search ? `/api/users/?q=${encodeURIComponent(search)}` : '/api/users/';
  fetch(url)
    .then(r => r.json())
    .then(data => renderGroupMemberList(data.users || []))
    .catch(() => {});
}

function renderGroupMemberList(users) {
  const list = document.getElementById('groupMemberList');
  list.innerHTML = '';

  if (users.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#aaa;padding:16px;">Không tìm thấy nhân viên</div>';
    return;
  }

  users.forEach(user => {
    const isSelected = !!selectedGroupMembers[user.id];
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.style.background = isSelected ? '#f0f4ff' : '';
    item.innerHTML = `
      <div class="contact-avatar" style="background:${user.avatar}">${user.initials}</div>
      <div class="contact-info">
        <div class="contact-name">${user.name}</div>
        <div class="contact-role">${user.role}</div>
      </div>
      <input type="checkbox" class="contact-check" ${isSelected ? 'checked' : ''}>
    `;

    item.addEventListener('click', () => {
      if (selectedGroupMembers[user.id]) {
        delete selectedGroupMembers[user.id];
      } else {
        selectedGroupMembers[user.id] = user;
      }
      updateSelectedMembersBar();
      renderGroupMemberList(users);
    });

    list.appendChild(item);
  });
}

function updateSelectedMembersBar() {
  const bar = document.getElementById('selectedMembersBar');
  const btn = document.getElementById('createGroupSubmitBtn');
  const count = Object.keys(selectedGroupMembers).length;

  if (count === 0) {
    bar.style.display = 'none';
    btn.style.display = 'none';
  } else {
    const names = Object.values(selectedGroupMembers).map(u => u.name).join(', ');
    bar.style.display = 'block';
    bar.textContent = `Đã chọn (${count}): ${names}`;
    btn.style.display = 'block';
    btn.textContent = count < 2 ? 'Chọn thêm ít nhất 1 người' : `Tạo nhóm (${count + 1} người)`;
    btn.style.background = count < 2 ? '#aaa' : '#5b7ce6';
  }
}
function showRenameModal(conv) {
  const newName = prompt('Nhap ten moi cho nhom:', conv.name);
  if (newName && newName.trim() && newName.trim() !== conv.name) {
    renameGroup(conv.id, newName.trim());
  }
}

function renameGroup(convId, newName) {
  fetch(`/api/conversations/${convId}/rename/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({ name: newName }),
  })
    .then(r => {
      if (!r.ok) {
        return r.json().then(data => {
          throw new Error(data.error || `HTTP ${r.status}`);
        });
      }
      return r.json();
    })
    .then(data => {
      if (data.success) {
        const conv = getConv(convId);
        if (conv) {
          conv.name = newName;
          renderConvList(document.getElementById('convSearchInput').value);
          if (activeConvId === convId) {
            document.getElementById('chatHeaderName').textContent = newName + ' ✏️';
          }
        }
        showToast('✅', 'Đã đổi tên nhóm thành công');
      } else {
        showToast('❌', data.error || 'Đổi tên thất bại');
      }
    })
    .catch(err => {
      console.error('Rename group error:', err);
      showToast('❌', 'Lỗi: ' + err.message);
    });
}
