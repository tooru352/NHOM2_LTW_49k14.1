// ===== POSTS PAGE - FourPoint Hotel =====

// Thích bài viết
document.addEventListener('DOMContentLoaded', function() {
    // Handle like buttons
    const likeButtons = document.querySelectorAll('.post-action-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent.includes('Thích')) {
                this.classList.toggle('liked');
                
                if (this.classList.contains('liked')) {
                    this.innerHTML = '<span>❤️</span> Đã thích';
                } else {
                    this.innerHTML = '<span>👍</span> Thích';
                }
            }
        });
    });
    
    // Handle notification items
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Notification clicked:', this.querySelector('.notification-text').textContent);
        });
    });
    
    // Handle online users
    const onlineUsers = document.querySelectorAll('.online-user');
    onlineUsers.forEach(user => {
        user.addEventListener('click', function() {
            const userName = this.querySelector('.online-user-name').textContent;
            console.log('User clicked:', userName);
        });
    });
});

// ===== QUẢN LÝ NHÓM =====

let selectedIcon = '👥';
let selectedColor = 'linear-gradient(135deg,#667eea,#764ba2)';
let currentCard = null;

const gradients = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#fa8231,#f7b731)',
  'linear-gradient(135deg,#2c3e50,#4ca1af)',
];

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function openTaoNhom() {
  openModal('modalTaoNhom');
}

function openChiTiet(card) {
  currentCard = card;
  const inner = card.querySelector('.nhom-card-inner');
  const ten = card.dataset.ten;
  const icon = inner.querySelector('.nhom-icon').textContent;
  const mota = inner.querySelector('p').textContent;
  const stats = inner.querySelectorAll('.nhom-stats span');
  const bg = inner.style.background;
  const badge = inner.querySelector('.nhom-badge').textContent;

  document.getElementById('modalCtHeader').style.background = bg;
  document.getElementById('modalCtIcon').textContent = icon;
  document.getElementById('modalCtTen').textContent = ten;
  document.getElementById('modalCtMota').textContent = mota;
  if (stats[0]) document.getElementById('modalCtTV').textContent = stats[0].textContent;
  if (stats[1]) document.getElementById('modalCtBV').textContent = stats[1].textContent;

  // Điền tab quản lý
  document.getElementById('qlTenNhom').value = ten;
  document.getElementById('qlMota').value = mota;
  const loaiMap = { 'Đóng lại': 'dong', 'Phòng ban': 'phong', 'Công khai': 'cong' };
  document.getElementById('qlLoai').value = loaiMap[badge] || 'cong';

  // Reset tab
  switchTab('tab-tv', document.querySelector('.tab-btn'));

  openModal('modalChiTiet');
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

function filterNhom() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.nhom-card').forEach(card => {
    const ten = card.dataset.ten.toLowerCase();
    card.style.display = ten.includes(q) ? '' : 'none';
  });
}

function chonIcon(el) {
  document.querySelectorAll('.icon-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedIcon = el.textContent;
}

function chonMau(el) {
  document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedColor = el.style.background;
}

function taoNhom() {
  const ten = document.getElementById('newTen').value.trim();
  const mota = document.getElementById('newMota').value.trim();
  const loai = document.getElementById('newLoai').value;
  if (!ten) { showToast('Vui lòng nhập tên nhóm'); return; }

  const loaiLabel = { dong: 'Đóng lại', phong: 'Phòng ban', cong: 'Công khai' };
  const loaiClass = loai;

  const card = document.createElement('div');
  card.className = 'nhom-card';
  card.dataset.ten = ten;
  card.setAttribute('onclick', 'openChiTiet(this)');
  card.innerHTML = `
    <div class="nhom-card-inner" style="background:${selectedColor}">
      <span class="nhom-badge ${loaiClass}">${loaiLabel[loai]}</span>
      <div class="nhom-icon">${selectedIcon}</div>
      <h3>${ten}</h3>
      <p>${mota || 'Chưa có mô tả'}</p>
      <div clas
// ===== QUẢN LÝ NHÓM =====

let selectedIcon = '👥';
let selectedColor = 'linear-gradient(135deg,#667eea,#764ba2)';
let currentCard = null;

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function openTaoNhom() { openModal('modalTaoNhom'); }

function openChiTiet(card) {
  currentCard = card;
  const inner = card.querySelector('.nhom-card-inner');
  const ten = card.dataset.ten;
  const icon = inner.querySelector('.nhom-icon').textContent;
  const mota = inner.querySelector('p').textContent;
  const stats = inner.querySelectorAll('.nhom-stats span');
  const badge = inner.querySelector('.nhom-badge').textContent.trim();

  document.getElementById('modalCtHeader').style.background = inner.style.background;
  document.getElementById('modalCtIcon').textContent = icon;
  document.getElementById('modalCtTen').textContent = ten;
  document.getElementById('modalCtMota').textContent = mota;
  if (stats[0]) document.getElementById('modalCtTV').textContent = stats[0].textContent;
  if (stats[1]) document.getElementById('modalCtBV').textContent = stats[1].textContent;

  document.getElementById('qlTenNhom').value = ten;
  document.getElementById('qlMota').value = mota;
  const loaiMap = { 'Dong lai': 'dong', 'Phong ban': 'phong', 'Cong khai': 'cong', 'Đóng lại': 'dong', 'Phòng ban': 'phong', 'Công khai': 'cong' };
  document.getElementById('qlLoai').value = loaiMap[badge] || 'cong';

  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-tv').classList.add('active');
  document.querySelector('.tab-btn').classList.add('active');

  openModal('modalChiTiet');
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

function filterNhom() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.nhom-card').forEach(card => {
    card.style.display = card.dataset.ten.toLowerCase().includes(q) ? '' : 'none';
  });
}

function chonIcon(el) {
  document.querySelectorAll('.icon-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedIcon = el.textContent;
}

function chonMau(el) {
  document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedColor = el.style.background;
}

function taoNhom() {
  const ten = document.getElementById('newTen').value.trim();
  const mota = document.getElementById('newMota').value.trim();
  const loai = document.getElementById('newLoai').value;
  if (!ten) { showToast('Vui lòng nhập tên nhóm'); return; }

  const loaiLabel = { dong: 'Đóng lại', phong: 'Phòng ban', cong: 'Công khai' };
  const card = document.createElement('div');
  card.className = 'nhom-card';
  card.dataset.ten = ten;
  card.setAttribute('onclick', 'openChiTiet(this)');
  card.innerHTML =
    '<div class="nhom-card-inner" style="background:' + selectedColor + '">' +
    '<span class="nhom-badge ' + loai + '">' + loaiLabel[loai] + '</span>' +
    '<div class="nhom-icon">' + selectedIcon + '</div>' +
    '<h3>' + ten + '</h3>' +
    '<p>' + (mota || 'Chưa có mô tả') + '</p>' +
    '<div class="nhom-stats"><span>👥 0 thành viên</span><span>📝 0 bài viết</span></div>' +
    '<div class="nhom-avatars"><div class="mini-av more">+0</div></div>' +
    '</div>';

  document.getElementById('nhomGrid').appendChild(card);
  card.style.opacity = '0';
  setTimeout(() => { card.style.transition = 'opacity 0.3s'; card.style.opacity = '1'; }, 10);

  document.getElementById('newTen').value = '';
  document.getElementById('newMota').value = '';
  closeModal('modalTaoNhom');
  showToast('Đã tạo nhóm "' + ten + '"');
}

function luuNhom() {
  if (!currentCard) return;
  const ten = document.getElementById('qlTenNhom').value.trim();
  const mota = document.getElementById('qlMota').value.trim();
  const loai = document.getElementById('qlLoai').value;
  const loaiLabel = { dong: 'Đóng lại', phong: 'Phòng ban', cong: 'Công khai' };

  currentCard.dataset.ten = ten;
  currentCard.querySelector('h3').textContent = ten;
  currentCard.querySelector('p').textContent = mota;
  const badge = currentCard.querySelector('.nhom-badge');
  badge.textContent = loaiLabel[loai];
  badge.className = 'nhom-badge ' + loai;

  document.getElementById('modalCtTen').textContent = ten;
  document.getElementById('modalCtMota').textContent = mota;
  closeModal('modalChiTiet');
  showToast('Đã lưu thay đổi');
}

function xoaNhom() {
  if (!currentCard) return;
  const ten = currentCard.dataset.ten;
  if (confirm('Bạn có chắc muốn xoá nhóm "' + ten + '"?')) {
    currentCard.style.transition = 'opacity 0.3s';
    currentCard.style.opacity = '0';
    setTimeout(() => { currentCard.remove(); }, 300);
    closeModal('modalChiTiet');
    showToast('Đã xoá nhóm "' + ten + '"');
  }
}

function xoaTV(btn) {
  const item = btn.closest('.tv-item');
  const ten = item.querySelector('strong').textContent;
  if (confirm('Xoá thành viên "' + ten + '"?')) {
    item.remove();
    showToast('Đã xoá thành viên');
  }
}

function themTV() {
  const input = document.getElementById('inputThemTV');
  const ten = input.value.trim();
  if (!ten) return;
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#1abc9c'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initial = ten.charAt(0).toUpperCase();
  const list = document.querySelector('.tv-list');
  const item = document.createElement('div');
  item.className = 'tv-item';
  item.innerHTML =
    '<div class="mini-av lg" style="background:' + color + '">' + initial + '</div>' +
    '<div><strong>' + ten + '</strong><span>Thành viên</span></div>' +
    '<button class="btn-xoa-tv" onclick="xoaTV(this)">Xoá</button>';
  list.appendChild(item);
  input.value = '';
  showToast('Đã thêm "' + ten + '"');
}

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

