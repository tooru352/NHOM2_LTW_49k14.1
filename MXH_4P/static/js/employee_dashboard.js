// Toggle notification dropdown
function toggleNotificationDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('show');
}

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const notificationIcon = document.querySelector('.notification-icon-header');
    
    if (dropdown && !dropdown.contains(event.target) && event.target !== notificationIcon) {
        dropdown.classList.remove('show');
    }
});

// Đánh dấu tất cả đã đọc
function markAllAsRead() {
    const unreadItems = document.querySelectorAll('.notification-dropdown-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });
    showNotification('✅ Đã đánh dấu tất cả thông báo là đã đọc');
}

// Xem tất cả thông báo
function viewAllNotifications() {
    window.location.href = '/all-notifications/';
}

// Báo cáo hoàn thành nhiệm vụ
function reportTask(taskName) {
    currentReportingTask = taskName;
    document.getElementById('reportTaskName').textContent = taskName;
    document.getElementById('confirmCheckbox').checked = false;
    document.getElementById('reportNote').value = '';
    document.getElementById('imageUploadArea').innerHTML = `
        <div class="upload-placeholder">
            <span class="upload-icon">📷</span>
            <div class="upload-text">Tải lên ảnh minh họa</div>
            <div class="upload-hint">PNG, JPG tối đa 5MB</div>
        </div>
    `;
    document.getElementById('reportTaskModal').style.display = 'flex';
}

let currentReportingTask = null;

// Đóng modal báo cáo
function closeReportModal() {
    document.getElementById('reportTaskModal').style.display = 'none';
    currentReportingTask = null;
}

// Xử lý upload ảnh
document.addEventListener('DOMContentLoaded', function() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    
    if (imageUploadArea && imageInput) {
        imageUploadArea.addEventListener('click', function() {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imageUploadArea.innerHTML = `
                        <div class="image-preview">
                            <img src="${event.target.result}" alt="Preview">
                            <button class="remove-image" onclick="removeImage(event)">×</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Xóa ảnh
function removeImage(event) {
    event.stopPropagation();
    const imageUploadArea = document.getElementById('imageUploadArea');
    imageUploadArea.innerHTML = `
        <div class="upload-placeholder">
            <span class="upload-icon">📷</span>
            <div class="upload-text">Tải lên ảnh minh họa</div>
            <div class="upload-hint">PNG, JPG tối đa 5MB</div>
        </div>
    `;
    document.getElementById('imageInput').value = '';
}

// Gửi báo cáo
function submitReport() {
    const checkbox = document.getElementById('confirmCheckbox');
    
    if (!checkbox.checked) {
        alert('Vui lòng xác nhận đã hoàn thành nhiệm vụ');
        return;
    }
    
    if (!currentReportingTask) {
        alert('Không tìm thấy nhiệm vụ để báo cáo');
        return;
    }
    
    // Tìm task item và cập nhật trạng thái
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        const taskTitle = item.querySelector('h3').textContent;
        if (taskTitle === currentReportingTask) {
            // Thêm class completed
            item.classList.add('completed');
            
            // Cập nhật nút action
            const actionsDiv = item.querySelector('.task-actions');
            actionsDiv.innerHTML = '<button class="btn-task-action done">Đã xong</button>';
        }
    });
    
    // Đóng modal
    closeReportModal();
    
    // Hiển thị thông báo thành công
    showNotification('✅ Đã gửi báo cáo hoàn thành nhiệm vụ thành công!');
}

// Xử lý phản hồi nhiệm vụ
function respondToTask(action) {
    const feedbackInput = document.querySelector('.feedback-input');
    const notificationItem = document.querySelector('.notification-item');
    const actionsDiv = document.querySelector('.notification-actions');
    
    if (action === 'accept') {
        // Ẩn các nút và textarea
        actionsDiv.style.display = 'none';
        feedbackInput.style.display = 'none';
        
        // Hiển thị badge đã đồng ý
        const acceptedBadge = document.createElement('div');
        acceptedBadge.innerHTML = '<button class="response-badge accepted">✓ ĐÃ ĐỒNG Ý</button>';
        notificationItem.querySelector('.notification-content').appendChild(acceptedBadge);
        
        showNotification('✅ Đã chấp nhận nhiệm vụ');
        
    } else if (action === 'reject') {
        const feedback = feedbackInput.value.trim();
        if (!feedback) {
            alert('Vui lòng nhập lý do từ chối');
            feedbackInput.focus();
            return;
        }
        
        // Ẩn các nút và textarea
        actionsDiv.style.display = 'none';
        feedbackInput.style.display = 'none';
        
        // Hiển thị badge đã từ chối
        const rejectedBadge = document.createElement('div');
        rejectedBadge.innerHTML = '<button class="response-badge rejected">✕ ĐÃ TỪ CHỐI</button>';
        notificationItem.querySelector('.notification-content').appendChild(rejectedBadge);
        
        showNotification('📝 Đã gửi phản hồi từ chối');
    }
}

// Xem chi tiết nhiệm vụ
function showTaskDetailModal(title, location, time, description, employees, status) {
    // Cập nhật tiêu đề
    document.getElementById('taskModalTitle').textContent = `Chi tiết nhiệm vụ: ${title}`;
    
    // Cập nhật badges
    document.getElementById('taskTimeBadge').textContent = time;
    document.getElementById('taskLocationBadge').textContent = location;
    
    // Cập nhật status badge
    const statusBadge = document.getElementById('taskStatusBadge');
    if (status === 'completed') {
        statusBadge.innerHTML = '<span class="badge-icon">✅</span> Đã hoàn thành';
        statusBadge.style.background = '#d4edda';
        statusBadge.style.color = '#27ae60';
    } else {
        statusBadge.innerHTML = '<span class="badge-icon">⏰</span> Đang thực hiện';
        statusBadge.style.background = '#fff3cd';
        statusBadge.style.color = '#f39c12';
    }
    
    // Cập nhật mô tả
    document.getElementById('taskDescription').textContent = description;
    
    // Cập nhật danh sách nhân viên
    const employeesContainer = document.getElementById('taskEmployees');
    employeesContainer.innerHTML = '';
    employees.forEach((emp, index) => {
        const initials = emp.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
        const role = index === 0 ? 'Chính' : 'Hỗ trợ';
        const empItem = document.createElement('div');
        empItem.className = 'task-employee-item';
        empItem.innerHTML = `
            <div class="task-employee-avatar">${initials}</div>
            <div class="task-employee-info">
                <strong>${emp}</strong>
                <span>${role}</span>
            </div>
        `;
        employeesContainer.appendChild(empItem);
    });
    
    // Hiển thị modal
    document.getElementById('taskDetailModal').style.display = 'flex';
}

// Đóng modal chi tiết nhiệm vụ
function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').style.display = 'none';
}

// Xem chi tiết nhiệm vụ
function viewTaskDetail(taskName) {
    showNotification(`📋 Đang mở chi tiết: ${taskName}`);
}

// Gửi tin nhắn cho quản lý
function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const message = messageInput.value.trim();
    
    if (!message) {
        alert('Vui lòng nhập nội dung tin nhắn');
        return;
    }
    
    showNotification('📨 Đã gửi tin nhắn cho quản lý');
    messageInput.value = '';
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

// Thêm event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Nút đồng ý/từ chối
    const btnAccept = document.querySelector('.btn-action.primary');
    const btnReject = document.querySelector('.btn-action.secondary');
    
    if (btnAccept) {
        btnAccept.addEventListener('click', () => respondToTask('accept'));
    }
    
    if (btnReject) {
        btnReject.addEventListener('click', () => respondToTask('reject'));
    }
    
    // Nút đánh dấu đã đọc
    const btnMarkAllRead = document.querySelector('.mark-all-read');
    if (btnMarkAllRead) {
        btnMarkAllRead.addEventListener('click', markAllAsRead);
    }
    
    // Nút xem tất cả thông báo
    const btnViewAll = document.querySelector('.view-all-notifications');
    if (btnViewAll) {
        btnViewAll.addEventListener('click', viewAllNotifications);
    }
    
    // Nút gửi tin nhắn
    const btnSend = document.querySelector('.btn-send');
    if (btnSend) {
        btnSend.addEventListener('click', sendMessage);
    }
    
    // Nút chi tiết và báo cáo trong task list
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        const taskName = item.querySelector('h3').textContent;
        const btnDetail = item.querySelector('.btn-task-action.detail');
        const btnComplete = item.querySelector('.btn-task-action.complete');
        
        if (btnDetail) {
            btnDetail.addEventListener('click', () => viewTaskDetail(taskName));
        }
        
        if (btnComplete) {
            btnComplete.addEventListener('click', () => reportTask(taskName));
        }
    });
    
    // Animation cho các phần tử
    const animateElements = document.querySelectorAll('.task-item, .daily-note, .manager-message, .image-section');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
