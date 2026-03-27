// Dữ liệu cuộc họp theo tháng
const meetingsByMonth = {
    '2026-02': [ // Tháng 2/2026 (quá khứ)
        { title: 'Họp tổng kết tháng 2', time: '08:00 - 10:00', date: '28/02/2026', location: 'Phòng họp tầng 3', department: 'Ban giám đốc', host: 'Công Minh Tuấn', icon: '📊', status: 'completed', description: 'Tổng kết công việc tháng 2 và đánh giá hiệu suất nhân viên.' },
        { title: 'Đào tạo nhân viên mới', time: '14:00 - 16:00', date: '25/02/2026', location: 'Phòng đào tạo', department: 'Nhân sự', host: 'Nguyễn Văn Minh', icon: '💎', status: 'completed', description: 'Đào tạo quy trình làm việc cho nhân viên mới.' }
    ],
    '2026-03': [ // Tháng 3/2026 (hiện tại)
        { title: 'Họp ban giám đốc', time: '08:00 - 10:00', date: '28/02/2026', location: 'Phòng họp tầng 3', department: 'Ban giám đốc', host: 'Công Minh Tuấn', icon: '📊', status: 'completed', description: 'Cuộc họp nhằm đánh giá kết quả làm việc của nhân sự trong tháng 2, thảo luận các vấn đề tài, đề xuất phương án cải thiện hiệu suất công việc và kế hoạch phát triển nhân sự trong tháng tiếp theo.' },
        { title: 'Đào tạo quy trình check-in mới', time: '14:00 - 16:00', date: '28/02/2026', location: 'Phòng họp tầng 2', department: 'Lễ tân', host: 'Nguyễn Văn Minh', icon: '💎', status: 'upcoming', description: 'Đào tạo quy trình check-in mới cho nhân viên lễ tân, hướng dẫn sử dụng hệ thống mới và các thủ tục cập nhật.' },
        { title: 'Review báo cáo tài chính Q1', time: '09:00 - 11:00', date: '28/02/2026', location: 'Phòng họp tầng 4', department: 'Tài chính', host: 'Hoàng Ngọc', icon: '💰', status: 'completed', description: 'Xem xét và phân tích báo cáo tài chính quý 1, đánh giá hiệu quả kinh doanh và đề xuất kế hoạch tài chính cho quý tiếp theo.' },
        { title: 'Họp menu mới cho mùa xuân', time: '15:00 - 17:00', date: '07/02/2026', location: 'Nhà hàng tầng 1', department: 'Nhà hàng', host: 'Trần Văn Hùng', icon: '🍽️', status: 'upcoming', description: 'Thảo luận và lên kế hoạch menu mới cho mùa xuân, bao gồm các món ăn đặc sản và thực đơn buffet.' },
        { title: 'Bảo trì hệ thống định kỳ', time: '10:00 - 12:00', date: '08/02/2026', location: 'Phòng kỹ thuật B1', department: 'Kỹ thuật', host: 'Phạm Tuấn', icon: '🔧', status: 'pending', description: 'Kiểm tra và bảo trì định kỳ hệ thống điện, nước, điều hòa và các thiết bị kỹ thuật của khách sạn.' }
    ],
    '2026-04': [ // Tháng 4/2026 (tương lai)
        { title: 'Họp kế hoạch mùa hè', time: '09:00 - 11:00', date: '05/04/2026', location: 'Phòng họp tầng 3', department: 'Ban giám đốc', host: 'Công Minh Tuấn', icon: '📊', status: 'upcoming', description: 'Lên kế hoạch kinh doanh cho mùa hè, chiến lược marketing và chương trình khuyến mãi.' },
        { title: 'Đào tạo dịch vụ khách hàng', time: '14:00 - 16:00', date: '10/04/2026', location: 'Phòng đào tạo', department: 'Lễ tân', host: 'Nguyễn Văn Minh', icon: '💎', status: 'upcoming', description: 'Nâng cao kỹ năng giao tiếp và xử lý tình huống với khách hàng.' },
        { title: 'Kiểm tra an toàn thực phẩm', time: '08:00 - 10:00', date: '15/04/2026', location: 'Nhà hàng', department: 'Nhà hàng', host: 'Trần Văn Hùng', icon: '🍽️', status: 'upcoming', description: 'Kiểm tra quy trình vệ sinh an toàn thực phẩm và đào tạo nhân viên.' }
    ]
};

// Biến lưu tháng hiện tại
let currentMonth = '2026-03';
let currentYear = 2026;
let currentMonthNum = 3;

// Lọc cuộc họp theo trạng thái
function filterMeetings(status) {
    const meetings = document.querySelectorAll('.meeting-item');
    const statCards = document.querySelectorAll('.stat-card');
    
    // Remove active từ tất cả cards
    statCards.forEach(card => card.classList.remove('active'));
    
    // Add active cho card được click
    if (status === 'all') {
        statCards[0].classList.add('active');
    } else if (status === 'upcoming') {
        statCards[1].classList.add('active');
    } else if (status === 'completed') {
        statCards[2].classList.add('active');
    } else if (status === 'pending') {
        statCards[3].classList.add('active');
    }
    
    // Lọc meetings
    meetings.forEach(meeting => {
        const meetingStatus = meeting.dataset.status;
        
        if (status === 'all') {
            meeting.style.display = '';
        } else if (meetingStatus === status) {
            meeting.style.display = '';
        } else {
            meeting.style.display = 'none';
        }
    });
    
    // Thông báo
    const statusNames = {
        'all': 'Tất cả cuộc họp',
        'upcoming': 'Sắp diễn ra',
        'completed': 'Hoàn thành',
        'pending': 'Chưa xử lý'
    };
    showNotification(`📊 Đang hiển thị: ${statusNames[status]}`);
}

// Biến lưu trạng thái edit và meeting item hiện tại
let isEditingMeeting = false;
let currentMeetingItem = null;

// Hiển thị chi tiết cuộc họp
function showMeetingDetail(meetingItem) {
    console.log('showMeetingDetail called', meetingItem);
    
    // Lưu meeting item hiện tại
    currentMeetingItem = meetingItem;
    
    // Lấy dữ liệu từ meeting item
    const title = meetingItem.querySelector('h3').textContent.trim();
    const time = meetingItem.querySelector('.meeting-time').textContent.trim();
    const detailItems = meetingItem.querySelectorAll('.detail-item');
    
    let date = '', location = '', department = '', host = '';
    detailItems.forEach(item => {
        const text = item.textContent.trim();
        if (text.includes('📅')) date = text.replace('📅', '').trim();
        else if (text.includes('📍')) location = text.replace('📍', '').trim();
        else if (text.includes('👤')) department = text.replace('👤', '').trim();
        else if (text.includes('👥')) host = text.replace('👥', '').trim();
    });
    
    const description = meetingItem.querySelector('.meeting-description') ? 
        meetingItem.querySelector('.meeting-description').textContent.trim() : 
        'Không có mô tả chi tiết';
    
    console.log('Meeting data:', { title, time, date, location, department, host, description });
    
    // Cập nhật modal
    document.getElementById('meetingDetailTitle').textContent = title;
    document.getElementById('meetingDetailDescription').textContent = description;
    document.getElementById('meetingDetailDepartment').textContent = department;
    document.getElementById('meetingDetailHost').textContent = host;
    document.getElementById('meetingDetailLocation').textContent = location;
    document.getElementById('meetingDetailDateTime').innerHTML = `${date}<br>${time}`;
    
    // Reset edit mode
    isEditingMeeting = false;
    const btnEdit = document.querySelector('.btn-edit');
    if (btnEdit) {
        btnEdit.textContent = 'Chỉnh sửa nội dung';
        btnEdit.style.background = '#27ae60';
    }
    
    // Reset contenteditable
    const editableElements = [
        document.getElementById('meetingDetailTitle'),
        document.getElementById('meetingDetailDescription'),
        document.getElementById('meetingDetailDepartment'),
        document.getElementById('meetingDetailHost'),
        document.getElementById('meetingDetailLocation')
    ];
    
    editableElements.forEach(el => {
        if (el) {
            el.contentEditable = 'false';
            el.style.background = '';
            el.style.border = '';
            el.style.padding = '';
        }
    });
    
    // Show modal
    document.getElementById('meetingDetailModal').style.display = 'block';
}

// Đóng modal chi tiết cuộc họp
function closeMeetingDetailModal() {
    document.getElementById('meetingDetailModal').style.display = 'none';
}

// Toggle chế độ chỉnh sửa cuộc họp
function editMeeting() {
    const btnEdit = document.querySelector('.btn-edit');
    const editableElements = [
        document.getElementById('meetingDetailTitle'),
        document.getElementById('meetingDetailDescription'),
        document.getElementById('meetingDetailDepartment'),
        document.getElementById('meetingDetailHost'),
        document.getElementById('meetingDetailLocation')
    ];
    
    if (!isEditingMeeting) {
        // Bật chế độ chỉnh sửa
        isEditingMeeting = true;
        btnEdit.textContent = '💾 Lưu thay đổi';
        btnEdit.style.background = '#f39c12';
        
        editableElements.forEach(el => {
            if (el) {
                el.contentEditable = 'true';
                el.style.background = '#fff9e6';
                el.style.border = '1px dashed #f39c12';
                el.style.padding = '8px';
                el.style.borderRadius = '6px';
                el.style.cursor = 'text';
            }
        });
        
        showNotification('✏️ Chế độ chỉnh sửa đã bật. Nhấn vào các trường để chỉnh sửa.');
    } else {
        // Lưu thay đổi
        saveMeetingChanges();
    }
}

// Lưu thay đổi cuộc họp
function saveMeetingChanges() {
    console.log('saveMeetingChanges called');
    
    if (!currentMeetingItem) {
        showNotification('❌ Không tìm thấy cuộc họp để cập nhật');
        return;
    }
    
    // Lấy dữ liệu đã chỉnh sửa
    const newTitle = document.getElementById('meetingDetailTitle').textContent.trim();
    const newDescription = document.getElementById('meetingDetailDescription').textContent.trim();
    const newDepartment = document.getElementById('meetingDetailDepartment').textContent.trim();
    const newHost = document.getElementById('meetingDetailHost').textContent.trim();
    const newLocation = document.getElementById('meetingDetailLocation').textContent.trim();
    
    console.log('New data:', { newTitle, newDescription, newDepartment, newHost, newLocation });
    
    // Cập nhật vào meeting item
    const titleElement = currentMeetingItem.querySelector('h3');
    if (titleElement) {
        titleElement.textContent = newTitle;
    }
    
    const detailItems = currentMeetingItem.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const text = item.textContent.trim();
        if (text.includes('📍')) {
            item.innerHTML = `📍 ${newLocation}`;
        } else if (text.includes('👤')) {
            item.innerHTML = `👤 ${newDepartment}`;
        } else if (text.includes('👥')) {
            item.innerHTML = `👥 ${newHost}`;
        }
    });
    
    // Cập nhật description ẩn nếu có
    const descriptionElement = currentMeetingItem.querySelector('.meeting-description');
    if (descriptionElement) {
        descriptionElement.textContent = newDescription;
    }
    
    // Tắt chế độ chỉnh sửa
    const btnEdit = document.querySelector('.btn-edit');
    const editableElements = [
        document.getElementById('meetingDetailTitle'),
        document.getElementById('meetingDetailDescription'),
        document.getElementById('meetingDetailDepartment'),
        document.getElementById('meetingDetailHost'),
        document.getElementById('meetingDetailLocation')
    ];
    
    isEditingMeeting = false;
    btnEdit.textContent = 'Chỉnh sửa nội dung';
    btnEdit.style.background = '#27ae60';
    
    editableElements.forEach(el => {
        if (el) {
            el.contentEditable = 'false';
            el.style.background = '';
            el.style.border = '';
            el.style.padding = '';
            el.style.cursor = '';
        }
    });
    
    // Hiển thị thông báo thành công
    showNotification('✅ Đã cập nhật thông tin cuộc họp thành công!');
    
    // Đóng modal sau 1.5 giây
    setTimeout(() => {
        closeMeetingDetailModal();
    }, 1500);
}

// Xóa cuộc họp
function deleteMeeting() {
    showConfirmModal(
        'Bạn có chắc chắn muốn xóa cuộc họp này không?',
        function() {
            if (currentMeetingItem) {
                // Animation trước khi xóa
                currentMeetingItem.style.transition = 'all 0.3s ease';
                currentMeetingItem.style.opacity = '0';
                currentMeetingItem.style.transform = 'translateX(-50px)';
                
                setTimeout(() => {
                    currentMeetingItem.remove();
                    closeMeetingDetailModal();
                    showNotification('🗑️ Đã xóa cuộc họp thành công');
                    
                    // Reset biến
                    currentMeetingItem = null;
                }, 300);
            } else {
                closeMeetingDetailModal();
                showNotification('❌ Không tìm thấy cuộc họp để xóa');
            }
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

// Mở modal thêm lịch họp
function openAddMeetingModal() {
    document.getElementById('addMeetingModal').style.display = 'block';
}

// Đóng modal
function closeAddMeetingModal() {
    document.getElementById('addMeetingModal').style.display = 'none';
    clearMeetingForm();
}

// Xóa form
function clearMeetingForm() {
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingDate').value = '';
    document.getElementById('meetingDepartment').selectedIndex = 0;
    document.getElementById('meetingLocation').value = '';
    document.getElementById('meetingStartTime').value = '08:00';
    document.getElementById('meetingEndTime').value = '10:00';
    document.getElementById('meetingHost').value = '';
    document.getElementById('meetingNote').value = '';
}

// Thêm lịch họp mới
function addNewMeeting() {
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;
    const department = document.getElementById('meetingDepartment').value;
    const location = document.getElementById('meetingLocation').value.trim();
    const startTime = document.getElementById('meetingStartTime').value;
    const endTime = document.getElementById('meetingEndTime').value;
    const host = document.getElementById('meetingHost').value.trim();
    const note = document.getElementById('meetingNote').value.trim();

    if (!title) {
        alert('Vui lòng nhập tiêu đề cuộc họp');
        return;
    }

    if (!date) {
        alert('Vui lòng chọn ngày họp');
        return;
    }

    // Icon theo phòng ban
    const icons = {
        'Ban giám đốc': '📊',
        'Lễ tân': '💎',
        'Tài chính': '💰',
        'Nhà hàng': '🍽️',
        'Kỹ thuật': '🔧'
    };
    const icon = icons[department] || '📋';

    // Format ngày
    const dateObj = new Date(date);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    // Tạo meeting item mới
    const container = document.querySelector('.meetings-container');
    const newMeeting = document.createElement('div');
    newMeeting.className = 'meeting-item';
    
    newMeeting.innerHTML = `
        <div class="meeting-time">${startTime} - ${endTime}</div>
        <div class="meeting-content">
            <div class="meeting-header">
                <span class="meeting-icon">${icon}</span>
                <h3>${title}</h3>
            </div>
            <div class="meeting-details">
                <span class="detail-item">📅 ${formattedDate}</span>
                <span class="detail-item">📍 ${location}</span>
                <span class="detail-item">👤 ${department}</span>
                <span class="detail-item">👥 ${host}</span>
            </div>
        </div>
    `;

    container.insertBefore(newMeeting, container.firstChild);

    // Animation
    newMeeting.style.opacity = '0';
    newMeeting.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        newMeeting.style.transition = 'all 0.3s ease';
        newMeeting.style.opacity = '1';
        newMeeting.style.transform = 'translateX(0)';
    }, 10);

    closeAddMeetingModal();
    showNotification('✅ Đã tạo lịch họp thành công!');
}

// Navigation
function previousMonth() {
    currentMonthNum--;
    if (currentMonthNum < 1) {
        currentMonthNum = 12;
        currentYear--;
    }
    currentMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    loadMeetingsByMonth(currentMonth);
    updateMonthDisplay();
    showNotification('📅 Đã chuyển sang tháng trước');
}

function nextMonth() {
    currentMonthNum++;
    if (currentMonthNum > 12) {
        currentMonthNum = 1;
        currentYear++;
    }
    currentMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    loadMeetingsByMonth(currentMonth);
    updateMonthDisplay();
    showNotification('📅 Đã chuyển sang tháng sau');
}

function goToday() {
    currentYear = 2026;
    currentMonthNum = 3;
    currentMonth = '2026-03';
    loadMeetingsByMonth(currentMonth);
    updateMonthDisplay();
    showNotification('📅 Hiển thị lịch tháng hiện tại');
}

// Cập nhật hiển thị tháng
function updateMonthDisplay() {
    const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const displayText = `${monthNames[currentMonthNum]}, ${currentYear}`;
    
    const monthDisplay = document.querySelector('.filter-left strong');
    if (monthDisplay) {
        monthDisplay.textContent = displayText;
    }
}

// Load cuộc họp theo tháng
function loadMeetingsByMonth(monthKey) {
    const meetings = meetingsByMonth[monthKey] || [];
    const container = document.querySelector('.meetings-container');
    
    if (meetings.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Không có cuộc họp nào</div>
                <div style="font-size: 14px;">Chưa có lịch họp nào được lên kế hoạch cho tháng này</div>
            </div>
        `;
        updateMeetingStats(0, 0, 0, 0);
        return;
    }
    
    container.innerHTML = '';
    
    // Kiểm tra xem tháng này có phải là tương lai không
    const now = new Date('2026-03-25'); // Ngày hiện tại giả định
    const selectedDate = new Date(monthKey + '-01');
    const isFuture = selectedDate > now;
    
    let totalCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    
    meetings.forEach((meeting, index) => {
        // Nếu là tháng tương lai, chỉ hiển thị cuộc họp sắp diễn ra
        if (isFuture && meeting.status !== 'upcoming') {
            return;
        }
        
        totalCount++;
        if (meeting.status === 'upcoming') upcomingCount++;
        else if (meeting.status === 'completed') completedCount++;
        else if (meeting.status === 'pending') pendingCount++;
        
        const statusClass = meeting.status === 'completed' ? 'completed' : 
                           meeting.status === 'upcoming' ? 'upcoming' : 'pending';
        const statusText = meeting.status === 'completed' ? '✅ Hoàn thành' : 
                          meeting.status === 'upcoming' ? '⏳ Sắp diễn ra' : '❌ Chưa xử lý';
        
        const meetingItem = document.createElement('div');
        meetingItem.className = 'meeting-item';
        meetingItem.dataset.status = meeting.status;
        meetingItem.onclick = function() { showMeetingDetail(this); };
        
        meetingItem.innerHTML = `
            <div class="meeting-time">${meeting.time}</div>
            <div class="meeting-content">
                <div class="meeting-header">
                    <span class="meeting-icon">${meeting.icon}</span>
                    <h3>${meeting.title}</h3>
                    <span class="status-badge-meeting ${statusClass}">${statusText}</span>
                </div>
                <div class="meeting-details">
                    <span class="detail-item">📅 ${meeting.date}</span>
                    <span class="detail-item">📍 ${meeting.location}</span>
                    <span class="detail-item">👤 ${meeting.department}</span>
                    <span class="detail-item">👥 ${meeting.host}</span>
                </div>
            </div>
            <div style="display:none;" class="meeting-description">${meeting.description}</div>
        `;
        
        container.appendChild(meetingItem);
        
        // Animation
        meetingItem.style.opacity = '0';
        meetingItem.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            meetingItem.style.transition = 'all 0.4s ease';
            meetingItem.style.opacity = '1';
            meetingItem.style.transform = 'translateX(0)';
        }, index * 100);
    });
    
    // Cập nhật stats
    updateMeetingStats(totalCount, upcomingCount, completedCount, pendingCount);
}

// Cập nhật số liệu thống kê
function updateMeetingStats(total, upcoming, completed, pending) {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('h2').textContent = total;
        statCards[1].querySelector('h2').textContent = upcoming;
        statCards[2].querySelector('h2').textContent = completed;
        statCards[3].querySelector('h2').textContent = pending;
    }
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

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    const addModal = document.getElementById('addMeetingModal');
    const detailModal = document.getElementById('meetingDetailModal');
    
    if (event.target === addModal) {
        closeAddMeetingModal();
    }
    if (event.target === detailModal) {
        closeMeetingDetailModal();
    }
}

// Animation cho meetings khi load trang
document.addEventListener('DOMContentLoaded', function() {
    // Load dữ liệu tháng hiện tại
    loadMeetingsByMonth(currentMonth);
    updateMonthDisplay();
    
    // Set active cho card đầu tiên
    const firstCard = document.querySelector('.stat-card');
    if (firstCard) {
        firstCard.classList.add('active');
    }
});
