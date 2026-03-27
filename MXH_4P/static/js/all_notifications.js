// Dữ liệu thông báo cũ để tải thêm
const oldNotifications = [
    { icon: '📧', title: 'Email từ Ban quản lý', desc: 'Thông báo về chính sách mới liên quan đến giờ làm việc và nghỉ phép. Vui lòng đọc kỹ tài liệu đính kèm.', time: '3 ngày trước' },
    { icon: '🎉', title: 'Chúc mừng sinh nhật!', desc: 'Chúc mừng sinh nhật Anh Thư! Đội ngũ quản lý chúc bạn một ngày thật vui vẻ và hạnh phúc.', time: '4 ngày trước' },
    { icon: '📊', title: 'Báo cáo hiệu suất tháng 1', desc: 'Báo cáo hiệu suất công việc của bạn trong tháng 1 đã sẵn sàng. Xem chi tiết tại mục "Báo cáo".', time: '5 ngày trước' },
    { icon: '🔔', title: 'Nhắc nhở: Đào tạo bắt buộc', desc: 'Bạn có một khóa đào tạo bắt buộc về "An toàn lao động" vào ngày 10/02. Vui lòng đăng ký tham gia.', time: '1 tuần trước' },
    { icon: '💰', title: 'Phiếu lương tháng 1', desc: 'Phiếu lương tháng 1/2026 đã được gửi vào email của bạn. Vui lòng kiểm tra và liên hệ nếu có thắc mắc.', time: '1 tuần trước' }
];

let currentCount = 5;
const totalCount = 42;

// Đánh dấu tất cả đã đọc
function markAllAsReadPage() {
    const unreadItems = document.querySelectorAll('.notification-item-page.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
        const dot = item.querySelector('.unread-dot');
        if (dot) dot.remove();
    });
    
    // Cập nhật subtitle
    const subtitle = document.querySelector('.notifications-subtitle');
    subtitle.textContent = 'Xin chào Anh Thư, bạn không có thông báo mới nào.';
    
    showNotification('✅ Đã đánh dấu tất cả thông báo là đã đọc');
}

// Xóa tất cả thông báo đã đọc
function deleteAllRead() {
    showConfirmModal(
        'Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc?',
        function() {
            const readItems = document.querySelectorAll('.notification-item-page:not(.unread)');
            readItems.forEach(item => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateX(-50px)';
                setTimeout(() => item.remove(), 300);
            });
            showNotification('🗑️ Đã xóa tất cả thông báo đã đọc');
        }
    );
}

// Hiển thị modal xác nhận
function showConfirmModal(message, onConfirm) {
    // Tạo modal
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-modal-overlay"></div>
        <div class="confirm-modal-content">
            <div class="confirm-modal-icon">
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="hour-dot"></div>
                <div class="minute-hand"></div>
            </div>
            <p class="confirm-modal-message">${message}</p>
            <div class="confirm-modal-buttons">
                <button class="confirm-btn cancel" onclick="closeConfirmModal()">Hủy</button>
                <button class="confirm-btn ok" onclick="confirmAction()">Đồng ý</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Lưu callback
    window.currentConfirmCallback = onConfirm;
    
    // Animation
    setTimeout(() => {
        modal.querySelector('.confirm-modal-overlay').style.opacity = '1';
        modal.querySelector('.confirm-modal-content').style.transform = 'scale(1)';
        modal.querySelector('.confirm-modal-content').style.opacity = '1';
    }, 10);
}

// Đóng modal
function closeConfirmModal() {
    const modal = document.querySelector('.confirm-modal');
    if (modal) {
        modal.querySelector('.confirm-modal-overlay').style.opacity = '0';
        modal.querySelector('.confirm-modal-content').style.transform = 'scale(0.9)';
        modal.querySelector('.confirm-modal-content').style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
    window.currentConfirmCallback = null;
}

// Xác nhận hành động
function confirmAction() {
    if (window.currentConfirmCallback) {
        window.currentConfirmCallback();
    }
    closeConfirmModal();
}

// Tải thêm thông báo
function loadMoreNotifications() {
    const list = document.getElementById('notificationsList');
    const btn = document.querySelector('.btn-load-more');
    
    // Hiển thị loading
    btn.textContent = 'Đang tải...';
    btn.disabled = true;
    
    setTimeout(() => {
        // Thêm 5 thông báo cũ
        oldNotifications.forEach((notif, index) => {
            const item = document.createElement('div');
            item.className = 'notification-item-page new';
            item.innerHTML = `
                <div class="notification-icon-page">${notif.icon}</div>
                <div class="notification-content-page">
                    <h3>${notif.title}</h3>
                    <p>${notif.desc}</p>
                    <span class="notification-time-page">${notif.time}</span>
                </div>
            `;
            list.appendChild(item);
        });
        
        currentCount += oldNotifications.length;
        
        // Cập nhật số lượng
        const hint = document.querySelector('.load-more-hint');
        hint.textContent = `Hiện tại ${currentCount} trên ${totalCount} thông báo`;
        
        // Reset button
        btn.textContent = 'Tải thêm thông báo ↓';
        btn.disabled = false;
        
        // Nếu đã tải hết
        if (currentCount >= totalCount) {
            btn.style.display = 'none';
            hint.textContent = 'Đã hiển thị tất cả thông báo';
        }
        
        showNotification('✅ Đã tải thêm ' + oldNotifications.length + ' thông báo');
    }, 1000);
}

// Hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation
document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.notification-item-page');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
