// ===== ACCOUNT MANAGEMENT JS =====

const CSRF = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

// --- Toast ---
function showToast(msg, isError = false) {
  const t = document.getElementById('accToast');
  const icon = document.getElementById('accToastIcon');
  document.getElementById('accToastMsg').textContent = msg;
  icon.textContent = isError ? '❌' : '✅';
  t.classList.toggle('error', isError);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// --- Avatar upload ---
document.getElementById('avatarEditBtn').addEventListener('click', () => {
  document.getElementById('avatarInput').click();
});

document.getElementById('avatarInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) { 
    showToast('Ảnh vượt quá 2MB.', true); 
    return; 
  }
  
  // Preview image
  const reader = new FileReader();
  reader.onload = e => {
    const circle = document.getElementById('avatarCircle');
    const textSpan = circle.querySelector('#avatarText');
    if (textSpan) textSpan.style.display = 'none';
    
    // Set background image
    circle.style.backgroundImage = `url(${e.target.result})`;
    circle.style.backgroundSize = 'cover';
    circle.style.backgroundPosition = 'center';
  };
  reader.readAsDataURL(file);
  
  // Upload immediately
  const formData = new FormData();
  formData.append('action', 'update_profile');
  formData.append('avatar', file);
  formData.append('first_name', document.getElementById('fullName').value.split(' ').slice(-1)[0] || '');
  formData.append('last_name', document.getElementById('fullName').value.split(' ').slice(0, -1).join(' ') || '');
  formData.append('email', document.getElementById('email').value);
  formData.append('csrfmiddlewaretoken', CSRF);
  
  console.log('Uploading avatar...');
  console.log('CSRF token:', CSRF);
  console.log('File:', file.name, file.size, 'bytes');
  
  try {
    const res = await fetch('/account/', { method: 'POST', body: formData });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
    showToast(data.message || 'Đã cập nhật ảnh đại diện.', data.status !== 'ok');
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Lỗi khi tải ảnh lên. Vui lòng thử lại.', true);
  }
});

// --- Save profile ---
document.getElementById('btnSaveProfile').addEventListener('click', async () => {
  const btn = document.getElementById('btnSaveProfile');
  btn.disabled = true;
  btn.textContent = 'Đang lưu...';
  try {
    const formData = new FormData();
    formData.append('action', 'update_profile');
    formData.append('first_name', document.getElementById('fullName').value.split(' ').slice(-1)[0] || '');
    formData.append('last_name', document.getElementById('fullName').value.split(' ').slice(0, -1).join(' ') || '');
    formData.append('email', document.getElementById('email').value);
    formData.append('csrfmiddlewaretoken', CSRF);
    const res = await fetch('/account/', { method: 'POST', body: formData });
    const data = await res.json();
    showToast(data.message, data.status !== 'ok');
  } catch {
    showToast('Đã lưu thông tin cá nhân.');
  }
  btn.disabled = false;
  btn.textContent = 'Lưu thay đổi';
});
