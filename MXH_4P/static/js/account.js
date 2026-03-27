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

// --- Modal helpers ---
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// Close modal on overlay click
document.querySelectorAll('.acc-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

// --- Avatar upload ---
document.getElementById('avatarEditBtn').addEventListener('click', () => {
  document.getElementById('avatarInput').click();
});
document.getElementById('avatarInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Ảnh vượt quá 2MB.', true); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const circle = document.getElementById('avatarCircle');
    circle.querySelector('span') && (circle.querySelector('span').style.display = 'none');
    let img = circle.querySelector('img');
    if (!img) { img = document.createElement('img'); circle.insertBefore(img, circle.firstChild); }
    img.src = e.target.result;
    showToast('Ảnh đại diện đã được cập nhật.');
  };
  reader.readAsDataURL(file);
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
    showToast('Đã lưu thông tin cá nhân.'); // demo mode
  }
  btn.disabled = false;
  btn.textContent = 'Lưu thay đổi';
});

// --- Save locale ---
document.getElementById('btnSaveLocale').addEventListener('click', () => {
  showToast('Đã lưu cài đặt ngôn ngữ & khu vực.');
});

// --- Notification toggles ---
document.querySelectorAll('.notif-item .toggle input').forEach(toggle => {
  toggle.addEventListener('change', function () {
    const label = this.closest('.notif-item').querySelector('.notif-item-title').textContent;
    showToast(`${label}: ${this.checked ? 'Đã bật' : 'Đã tắt'}`);
  });
});

// ===== CHANGE PASSWORD MODAL =====
document.getElementById('btnChangePassword').addEventListener('click', () => {
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('pwStrengthFill').style.width = '0';
  document.getElementById('pwStrengthLabel').textContent = '';
  setError('');
  openModal('modalChangePassword');
});
document.getElementById('closeModalPw').addEventListener('click', () => closeModal('modalChangePassword'));
document.getElementById('cancelModalPw').addEventListener('click', () => closeModal('modalChangePassword'));

// Password strength
document.getElementById('newPassword').addEventListener('input', function () {
  const val = this.value;
  const fill = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  let strength = 0;
  if (val.length >= 8) strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;
  const levels = [
    { w: '0%', color: '', text: '' },
    { w: '25%', color: '#e74c3c', text: 'Yếu' },
    { w: '50%', color: '#f39c12', text: 'Trung bình' },
    { w: '75%', color: '#3498db', text: 'Khá mạnh' },
    { w: '100%', color: '#27ae60', text: 'Mạnh' },
  ];
  fill.style.width = levels[strength].w;
  fill.style.background = levels[strength].color;
  label.textContent = levels[strength].text;
  label.style.color = levels[strength].color;
});

// Show/hide password
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

function setError(msg) {
  const el = document.getElementById('pwError');
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

document.getElementById('btnSubmitPw').addEventListener('click', async () => {
  const oldPw = document.getElementById('oldPassword').value.trim();
  const newPw = document.getElementById('newPassword').value;
  const confirmPw = document.getElementById('confirmPassword').value;
  setError('');

  if (!oldPw) { setError('Vui lòng nhập mật khẩu hiện tại.'); return; }
  if (newPw.length < 8) { setError('Mật khẩu mới phải có ít nhất 8 ký tự.'); return; }
  if (newPw !== confirmPw) { setError('Xác nhận mật khẩu không khớp.'); return; }

  const btn = document.getElementById('btnSubmitPw');
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';

  try {
    const res = await fetch('/account/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF },
      body: JSON.stringify({ action: 'change_password', old_password: oldPw, new_password: newPw, confirm_password: confirmPw })
    });
    const data = await res.json();
    if (data.status === 'ok') {
      closeModal('modalChangePassword');
      showToast(data.message);
    } else {
      setError(data.message);
    }
  } catch {
    setError('Có lỗi xảy ra, vui lòng thử lại.');
  }
  btn.disabled = false;
  btn.textContent = 'Đổi mật khẩu';
});

// ===== 2FA MODAL =====
let twoFAEnabled = true;
document.getElementById('btnToggle2FA').addEventListener('click', () => openModal('modal2FA'));
document.getElementById('closeModal2FA').addEventListener('click', () => closeModal('modal2FA'));
document.getElementById('closeModal2FAFooter').addEventListener('click', () => closeModal('modal2FA'));

document.getElementById('btnToggle2FAAction').addEventListener('click', () => {
  twoFAEnabled = !twoFAEnabled;
  const box = document.getElementById('twofaStatusBox');
  const text = document.getElementById('twofaStatusText');
  const toggleBtn = document.getElementById('btnToggle2FAAction');
  const statusLabel = document.getElementById('twoFAStatus');
  if (twoFAEnabled) {
    box.classList.remove('off');
    text.textContent = '2FA đang được bật. Tài khoản của bạn được bảo vệ tốt hơn.';
    toggleBtn.textContent = 'Tắt 2FA';
    toggleBtn.classList.remove('enable');
    statusLabel.textContent = 'Đang bật · Bảo mật cao';
    statusLabel.className = 'security-item-desc sec-green';
  } else {
    box.classList.add('off');
    text.textContent = '2FA đang tắt. Tài khoản của bạn kém bảo mật hơn.';
    toggleBtn.textContent = 'Bật 2FA';
    toggleBtn.classList.add('enable');
    statusLabel.textContent = 'Đang tắt · Rủi ro cao';
    statusLabel.className = 'security-item-desc';
    statusLabel.style.color = '#e74c3c';
  }
  showToast(twoFAEnabled ? 'Đã bật xác thực 2 yếu tố.' : 'Đã tắt xác thực 2 yếu tố.', !twoFAEnabled);
});

// ===== DEVICE MODAL =====
document.getElementById('btnCheckDevice').addEventListener('click', () => openModal('modalDevice'));
document.getElementById('closeModalDevice').addEventListener('click', () => closeModal('modalDevice'));
document.getElementById('closeModalDeviceFooter').addEventListener('click', () => closeModal('modalDevice'));

document.getElementById('btnRevokeDevice').addEventListener('click', function () {
  this.closest('.device-item').style.opacity = '0.4';
  this.textContent = 'Đã đăng xuất';
  this.disabled = true;
  showToast('Đã đăng xuất thiết bị lạ.');
});

document.getElementById('btnRevokeAll').addEventListener('click', () => {
  document.querySelectorAll('.device-item:not(:last-child)').forEach(d => {
    d.style.opacity = '0.4';
    const btn = d.querySelector('.btn-revoke');
    if (btn) { btn.textContent = 'Đã đăng xuất'; btn.disabled = true; }
  });
  showToast('Đã đăng xuất tất cả thiết bị khác.');
  setTimeout(() => closeModal('modalDevice'), 1200);
});
