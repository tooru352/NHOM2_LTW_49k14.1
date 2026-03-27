// Tabs
document.querySelectorAll('.profile-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
  });
});

// Edit modal
document.getElementById('editProfileBtn').addEventListener('click', () => {
  document.getElementById('editModal').classList.add('show');
});
document.getElementById('editModalClose').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('show');
});
document.getElementById('editCancelBtn').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('show');
});
document.getElementById('editSaveBtn').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('show');
  showToast('Đã lưu thay đổi thành công!');
});
document.getElementById('editModal').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('show');
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    window.location.href = '/logout/';
  }
});

// 3 nút đính kèm
let attachedFile = null;
let attachedType = null;

document.getElementById('btnPhoto').addEventListener('click', () => document.getElementById('inputPhoto').click());
document.getElementById('btnVideo').addEventListener('click', () => document.getElementById('inputVideo').click());
document.getElementById('btnFile').addEventListener('click', () => document.getElementById('inputFile').click());

['inputPhoto','inputVideo','inputFile'].forEach(id => {
  document.getElementById(id).addEventListener('change', function() {
    if (!this.files[0]) return;
    attachedFile = this.files[0];
    attachedType = id === 'inputPhoto' ? 'image' : id === 'inputVideo' ? 'video' : 'file';
    const preview = document.getElementById('attachPreview');
    preview.style.display = 'block';
    const icon = attachedType === 'image' ? '🖼️' : attachedType === 'video' ? '🎬' : '📎';
    preview.innerHTML = `${icon} <strong>${attachedFile.name}</strong> <span style="cursor:pointer;color:#e74c3c;margin-left:8px;" id="removeAttach">✕ Xóa</span>`;
    document.getElementById('removeAttach').addEventListener('click', () => {
      attachedFile = null; attachedType = null;
      preview.style.display = 'none'; preview.innerHTML = '';
      document.getElementById('inputPhoto').value = '';
      document.getElementById('inputVideo').value = '';
      document.getElementById('inputFile').value = '';
    });
  });
});

// Đăng bài mới
document.getElementById('submitPostBtn').addEventListener('click', () => {
  const input = document.getElementById('newPostInput');
  const text = input.value.trim();
  if (!text && !attachedFile) return;
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  let extraHtml = '';
  if (attachedFile && attachedType === 'image') {
    const url = URL.createObjectURL(attachedFile);
    extraHtml = `<img src="${url}" style="width:100%;border-radius:8px;margin:10px 0;max-height:300px;object-fit:cover;">`;
  } else if (attachedFile) {
    const icon = attachedType === 'video' ? '🎬' : '📎';
    extraHtml = `<div style="padding:8px 12px;background:#f0f2ff;border-radius:8px;margin:8px 0;font-size:13px;color:#667eea;">${icon} ${attachedFile.name}</div>`;
  }
  const card = document.createElement('div');
  card.className = 'post-card-profile';
  card.innerHTML = `
    <div class="post-card-header">
      <div class="post-avatar">PT</div>
      <div><div class="post-author">Phạm Xuân Thương</div><div class="post-time-label">Vừa xong • ${now}</div></div>
    </div>
    ${text ? `<p class="post-text">${text}</p>` : ''}
    ${extraHtml}
    <div class="post-card-footer"><span>👍 0</span><span>💬 0</span><span>🔗 Chia sẻ</span></div>
  `;
  document.getElementById('profilePostsList').insertBefore(card, document.getElementById('profilePostsList').firstChild);
  input.value = '';
  attachedFile = null; attachedType = null;
  document.getElementById('attachPreview').style.display = 'none';
  document.getElementById('attachPreview').innerHTML = '';
  showToast('Đã đăng bài viết!');
});

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:white;padding:12px 24px;border-radius:24px;font-size:13px;z-index:9999;';
  t.textContent = '✅ ' + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
