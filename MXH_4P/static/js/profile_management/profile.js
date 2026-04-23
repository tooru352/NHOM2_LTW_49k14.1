document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('tab-' + this.dataset.tab).classList.add('active');
    });
  });

  // Avatar upload
  const avatarEditBtn = document.getElementById('avatarEditBtn');
  const avatarInput = document.getElementById('avatarInput');
  
  if (avatarEditBtn && avatarInput) {
    avatarEditBtn.addEventListener('click', () => {
      console.log('Avatar edit button clicked');
      avatarInput.click();
    });

    avatarInput.addEventListener('change', function() {
      if (!this.files || !this.files[0]) return;
      
      const file = this.files[0];
      console.log('File selected:', file.name, file.size, file.type);
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('Uploading avatar...', file.name);
      
      // Upload avatar
      fetch('/api/upload_avatar/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Response data:', data);
        if (data.success) {
          showToast('Đã cập nhật ảnh đại diện!');
          setTimeout(() => location.reload(), 1000);
        } else {
          alert('Có lỗi xảy ra: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tải ảnh lên: ' + error.message);
      });
    });
  } else {
    console.error('Avatar elements not found:', {avatarEditBtn, avatarInput});
  }

  // Edit modal
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editModal = document.getElementById('editModal');
  const editModalClose = document.getElementById('editModalClose');
  const editCancelBtn = document.getElementById('editCancelBtn');
  const editSaveBtn = document.getElementById('editSaveBtn');
  
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      editModal.classList.add('show');
    });
  }
  
  if (editModalClose) {
    editModalClose.addEventListener('click', () => {
      editModal.classList.remove('show');
    });
  }
  
  if (editCancelBtn) {
    editCancelBtn.addEventListener('click', () => {
      editModal.classList.remove('show');
    });
  }
  
  if (editSaveBtn) {
    editSaveBtn.addEventListener('click', () => {
      const firstName = document.getElementById('editFirstName').value;
      const lastName = document.getElementById('editLastName').value;
      const email = document.getElementById('editEmail').value;
      
      // Send AJAX request to update profile
      fetch('/api/update_profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          editModal.classList.remove('show');
          showToast('Đã lưu thay đổi thành công!');
          // Reload page to show updated info
          setTimeout(() => location.reload(), 1000);
        } else {
          alert('Có lỗi xảy ra: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi lưu thông tin');
      });
    });
  }

  if (editModal) {
    editModal.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('show');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/logout/';
      }
    });
  }

  // 3 nút đính kèm
  let attachedFile = null;
  let attachedType = null;

  const btnPhoto = document.getElementById('btnPhoto');
  const btnVideo = document.getElementById('btnVideo');
  const btnFile = document.getElementById('btnFile');
  
  if (btnPhoto) {
    btnPhoto.addEventListener('click', () => document.getElementById('inputPhoto').click());
  }
  if (btnVideo) {
    btnVideo.addEventListener('click', () => document.getElementById('inputVideo').click());
  }
  if (btnFile) {
    btnFile.addEventListener('click', () => document.getElementById('inputFile').click());
  }

  ['inputPhoto','inputVideo','inputFile'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener('change', function() {
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
    }
  });

  // Đăng bài mới
  const submitPostBtn = document.getElementById('submitPostBtn');
  if (submitPostBtn) {
    submitPostBtn.addEventListener('click', () => {
      const input = document.getElementById('newPostInput');
      const text = input.value.trim();
      if (!text && !attachedFile) return;
      
      // Get user info from data attributes
      const createPostBox = document.querySelector('.create-post-box');
      const userAvatar = createPostBox.dataset.userAvatar;
      const userInitials = createPostBox.dataset.userInitials;
      const userName = createPostBox.dataset.userName;
      
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      let extraHtml = '';
      if (attachedFile && attachedType === 'image') {
        const url = URL.createObjectURL(attachedFile);
        extraHtml = `<img src="${url}" style="width:100%;border-radius:8px;margin:10px 0;max-height:300px;object-fit:cover;">`;
      } else if (attachedFile) {
        const icon = attachedType === 'video' ? '🎬' : '📎';
        extraHtml = `<div style="padding:8px 12px;background:#f0f2ff;border-radius:8px;margin:8px 0;font-size:13px;color:#667eea;">${icon} ${attachedFile.name}</div>`;
      }
      
      // Create avatar HTML
      let avatarHtml = '';
      if (userAvatar) {
        avatarHtml = `<div class="post-avatar" style="background-image: url('${userAvatar}'); background-size: cover; background-position: center;"></div>`;
      } else {
        avatarHtml = `<div class="post-avatar">${userInitials}</div>`;
      }
      
      const card = document.createElement('div');
      card.className = 'post-card-profile';
      card.innerHTML = `
        <div class="post-card-header">
          ${avatarHtml}
          <div><div class="post-author">${userName}</div><div class="post-time-label">Vừa xong • ${now}</div></div>
        </div>
        ${text ? `<p class="post-text">${text}</p>` : ''}
        ${extraHtml}
        <div class="post-card-footer"><span>👍 0</span><span>💬 0</span><span>🔗 Chia sẻ</span></div>
      `;
      const postsList = document.getElementById('profilePostsList');
      if (postsList) {
        postsList.insertBefore(card, postsList.firstChild);
      }
      input.value = '';
      attachedFile = null; attachedType = null;
      document.getElementById('attachPreview').style.display = 'none';
      document.getElementById('attachPreview').innerHTML = '';
      showToast('Đã đăng bài viết!');
    });
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:white;padding:12px 24px;border-radius:24px;font-size:13px;z-index:9999;';
    t.textContent = '✅ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
});
