// ===== LOGIN PAGE JS - FourPoints Hotel =====

// Toggle password visibility
function togglePassword() {
  const pwInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');
  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    pwInput.type = 'password';
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');
  
  // Clear previous errors
  errorMsg.style.display = 'none';
  
  // Basic validation
  if (!username || !password) {
    errorMsg.textContent = 'Vui lòng nhập đầy đủ thông tin đăng nhập.';
    errorMsg.style.display = 'block';
    return;
  }
  
  // Demo login - accept any credentials
  const btn = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  btn.disabled = true;
  btnText.textContent = 'Đang đăng nhập...';
  
  // Simulate API call
  setTimeout(() => {
    // In production, this would be an actual API call
    // For demo, redirect to home page
    window.location.href = '/home/';
  }, 800);
}

// Handle forgot password
function handleForgotPassword() {
  document.getElementById('forgot-modal').style.display = 'flex';
  document.getElementById('step-email').style.display = 'block';
  document.getElementById('step-otp').style.display = 'none';
  document.getElementById('step-newpass').style.display = 'none';
  document.getElementById('step-success').style.display = 'none';
}

function closeForgotModal() {
  document.getElementById('forgot-modal').style.display = 'none';
}

// Step 1: Find account
function findAccount() {
  const username = document.getElementById('forgot-username').value.trim();
  const errorEl = document.getElementById('forgot-error');
  
  if (!username) {
    errorEl.textContent = 'Vui lòng nhập tên đăng nhập hoặc email.';
    errorEl.style.display = 'block';
    return;
  }
  
  errorEl.style.display = 'none';
  
  // Demo: show phone number (in production, this would be an API call)
  document.getElementById('phone-display').textContent = '+84 987 *** 321';
  document.getElementById('step-email').style.display = 'none';
  document.getElementById('step-otp').style.display = 'block';
}

// Step 2: Send OTP
function sendOtp() {
  document.getElementById('otp-input-wrap').style.display = 'block';
  document.getElementById('otp-error').textContent = 'Mã OTP đã được gửi đến số điện thoại của bạn.';
  document.getElementById('otp-error').style.display = 'block';
  document.getElementById('otp-error').style.background = '#e8f5e9';
  document.getElementById('otp-error').style.color = '#2e7d32';
  document.getElementById('otp-error').style.borderColor = '#c8e6c9';
}

// Step 3: Verify OTP
function verifyOtp() {
  const otp = document.getElementById('otp-input').value.trim();
  const errorEl = document.getElementById('otp-error');
  
  if (!otp || otp.length !== 6) {
    errorEl.textContent = 'Vui lòng nhập mã OTP 6 số.';
    errorEl.style.display = 'block';
    errorEl.style.background = '#fff0f0';
    errorEl.style.color = '#c0392b';
    errorEl.style.borderColor = '#ffcccc';
    return;
  }
  
  // Demo: accept any 6-digit code
  document.getElementById('step-otp').style.display = 'none';
  document.getElementById('step-newpass').style.display = 'block';
}

// Toggle new password visibility
function toggleNewPass() {
  const pwInput = document.getElementById('new-password');
  const eyeIcon = document.getElementById('eye-new');
  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    pwInput.type = 'password';
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// Step 4: Reset password
function resetPassword() {
  const newPw = document.getElementById('new-password').value;
  const confirmPw = document.getElementById('confirm-password').value;
  const errorEl = document.getElementById('newpass-error');
  
  if (!newPw || newPw.length < 6) {
    errorEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
    errorEl.style.display = 'block';
    return;
  }
  
  if (newPw !== confirmPw) {
    errorEl.textContent = 'Xác nhận mật khẩu không khớp.';
    errorEl.style.display = 'block';
    return;
  }
  
  errorEl.style.display = 'none';
  
  // Demo: show success
  document.getElementById('step-newpass').style.display = 'none';
  document.getElementById('step-success').style.display = 'block';
}
