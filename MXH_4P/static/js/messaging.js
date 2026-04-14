// ===== CSRF HELPER =====
function getCsrfToken() {
  // Đọc từ hidden input do {% csrf_token %} tạo ra
  const el = document.querySelector('[name=csrfmiddlewaretoken]');
  if (el) return el.value;
  // Fallback: đọc từ cookie
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
  return cookie ? cookie.trim().split('=')[1] : '';
}

// ===== DATA =====
const ME = { id: 'me', name: '', initials: '', avatar: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' };

// conversations được load từ DB, không hardcode nữa
let conversations = [];

// Suggested contacts for new conversation modal
const suggestedContacts = [];

// ===== STATE =====
let activeConvId = null;
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
  if (!conv) return;
  conv.unread = 0;
  renderConvList(document.getElementById('convSearchInput').value);
  renderChatHeader(conv);

  // Load messages từ DB
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
    ? `<h3 id="chatHeaderName" class="editable-group-name" title="Click để đổi tên nhóm">${conv.name} ✏️</h3>`
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
        ${conv.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
      </div>
    </div>
  `;
  // Update call button with current conv info
  document.getElementById('callBtn').onclick = () => openCallModal(conv);
  
  // Add click handler for group name to rename
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

  // Edit mode (vẫn local, chưa có API edit)
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

  // Normal send — POST lên DB
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
        conv.time = data.time;  // Cập nhật giờ từ server
        renderMessages(conv);
        
        // Đưa conversation này lên đầu danh sách
        const idx = conversations.findIndex(c => c.id === activeConvId);
        if (idx > 0) {
          const [movedConv] = conversations.splice(idx, 1);
          movedConv.time = data.time;  // Cập nhật giờ hiển thị
          movedConv.preview = text;     // Cập nhật preview
          conversations.unshift(movedConv);
        } else if (idx === 0) {
          // Đã ở đầu rồi, chỉ cần cập nhật time
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
    // Tạo nút nếu chưa có
    const btn = document.createElement('button');
    btn.className = 'create-group-btn-dynamic';
    btn.style.cssText = 'width:100%;padding:12px;background:#5b7ce6;color:white;border:none;border-radius:8px;font-weight:600;margin-top:16px;cursor:pointer;display:none;';
    btn.textContent = 'Tạo cuộc trò chuyện';
    btn.addEventListener('click', createConversation);
    // Thêm sau contactList
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
        console.error('HTTP Error:', r.status, r.statusText);
        return r.text().then(text => {
          console.error('Response:', text);
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        });
      }
      return r.json();
    })
    .then(data => {
      if (data.conversation_id) {
        hideModal('newConvModal');
        // Reload conversations và chọn conversation mới
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
fetch('/api/conversations/')
  .then(r => r.json())
  .then(data => {
    conversations = (data.conversations || []).map(c => ({ ...c, messages: [], online: false }));
    renderConvList();
    if (conversations.length > 0) {
      selectConv(conversations[0].id);
    } else {
      document.getElementById('messagesArea').innerHTML =
        '<div style="text-align:center;color:#aaa;margin-top:40px;">Chưa có cuộc trò chuyện nào</div>';
    }
  })
  .catch(() => {
    renderConvList();
  });

// ===== RENAME GROUP =====
function showRenameModal(conv) {
  const newName = prompt('Nhập tên mới cho nhóm:', conv.name);
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
        // Cập nhật tên trong conversations array
        const conv = getConv(convId);
        if (conv) {
          conv.name = newName;
          renderConvList(document.getElementById('convSearchInput').value);
          // Cập nhật header nếu đang xem conversation này
          if (activeConvId === convId) {
            document.getElementById('chatHeaderName').textContent = newName;
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
