// Dữ liệu mẫu theo ngày (giả lập API)
const tasksByDate = {
    '2025-02-04': [
        { name: 'Tài sản Core', employees: ['Nguyễn Văn An'], quantity: 1, shift: 'Sáng', time: '06:00 - 14:00', status: 'completed', note: 'Quản lý tài sản khách sạn', highlight: 'yellow' },
        { name: 'Quản lý F&B', employees: ['Phạm Xuân Thương'], quantity: 1, shift: 'Cả ngày', time: '08:00 - 20:00', status: 'pending', note: 'Giám sát nhà hàng và bar' },
        { name: 'Nhân viên lễ tân', employees: ['Nguyễn Thị Lan'], quantity: 1, shift: 'Sáng', time: '06:00 - 14:00', status: 'overdue', note: 'Check-in/out khách' },
        { name: 'Thu ngân', employees: ['Yến'], quantity: 1, shift: 'Sáng', time: '08:00 - 16:00', status: 'completed', note: 'Thanh toán và KT/Dịch' },
        { name: 'Nhà hàng - Nhân viên phục vụ', employees: ['Ngọc', 'Hiền', 'Mai'], quantity: 3, shift: 'Buổi trưa', time: '11:00 - 15:00', status: 'pending', note: 'Phục vụ bữa trưa buffet', highlight: 'yellow' },
        { name: 'ELITE ROOMS', employees: ['Team Housekeeping'], quantity: 1, shift: 'Sáng', time: '06:00 - 10:00', status: 'completed', note: 'Phòng cao cấp dịch vụ', highlight: 'green' },
        { name: 'F&B Morning Service', employees: ['Team F&B'], quantity: 4, shift: 'Sáng', time: '11:00 - 15:00', status: 'completed', note: 'Phục vụ buffet sáng - KT%' },
        { name: 'Quản lý ca', employees: ['Kiên'], quantity: 1, shift: 'Cả ngày', time: '08:00 - 20:00', status: 'pending', note: 'Giám sát toàn bộ hoạt động' },
        { name: 'Thu ngân phụ', employees: ['Yến'], quantity: 1, shift: 'Chiều', time: '14:00 - 22:00', status: 'overdue', note: 'Hỗ trợ thanh toán buổi tối' }
    ],
    '2025-02-05': [
        { name: 'Lễ tân sáng', employees: ['Trần Văn Hùng'], quantity: 1, shift: 'Sáng', time: '06:00 - 14:00', status: 'pending', note: 'Ca sáng lễ tân' },
        { name: 'Housekeeping', employees: ['Lê Minh Châu', 'Vũ Thị Hà'], quantity: 2, shift: 'Sáng', time: '07:00 - 15:00', status: 'pending', note: 'Dọn phòng' },
        { name: 'Bảo vệ', employees: ['Kiên'], quantity: 1, shift: 'Cả ngày', time: '00:00 - 24:00', status: 'pending', note: 'An ninh khách sạn' },
        { name: 'Nhà hàng buổi tối', employees: ['Ngọc', 'Hiền'], quantity: 2, shift: 'Tối', time: '17:00 - 23:00', status: 'pending', note: 'Phục vụ bữa tối' }
    ],
    '2025-02-06': [
        { name: 'Quản lý tổng', employees: ['Phạm Xuân Thương'], quantity: 1, shift: 'Cả ngày', time: '08:00 - 20:00', status: 'pending', note: 'Giám sát toàn bộ' },
        { name: 'Lễ tân chiều', employees: ['Nguyễn Thị Lan'], quantity: 1, shift: 'Chiều', time: '14:00 - 22:00', status: 'pending', note: 'Ca chiều lễ tân' },
        { name: 'Kỹ thuật', employees: ['Trần Văn Hùng'], quantity: 1, shift: 'Sáng', time: '08:00 - 16:00', status: 'pending', note: 'Bảo trì thiết bị' }
    ]
};

// Load dữ liệu công việc theo ngày
function loadTasksByDate(dateString) {
    const tasks = tasksByDate[dateString] || [];
    const tbody = document.getElementById('tasksTableBody');
    
    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                    <div style="font-size: 16px;">Không có công việc nào trong ngày này</div>
                </td>
            </tr>
        `;
        updateStats(0, 0, 0, 0);
        return;
    }
    
    tbody.innerHTML = '';
    
    let totalTasks = tasks.length;
    let pendingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;
    
    tasks.forEach((task, index) => {
        // Đếm trạng thái
        if (task.status === 'pending') pendingCount++;
        else if (task.status === 'completed') completedCount++;
        else if (task.status === 'overdue') overdueCount++;
        
        const row = document.createElement('tr');
        row.className = 'task-row' + (task.highlight ? ` highlight-${task.highlight}` : '');
        
        // Thêm onclick handler
        row.onclick = function() {
            showTaskDetailFromData(task);
        };
        
        const shiftClass = task.shift === 'Sáng' ? 'morning' : 
                          task.shift === 'Chiều' ? 'afternoon' : 
                          task.shift === 'Tối' ? 'evening' : 
                          task.shift === 'Buổi trưa' ? 'afternoon' : 'fullday';
        
        const statusClass = task.status === 'completed' ? 'completed' : 
                           task.status === 'pending' ? 'pending' : 'overdue';
        
        const statusText = task.status === 'completed' ? '✅ Hoàn thành' : 
                          task.status === 'pending' ? '⏳ Đang thực hiện' : '❌ Chưa xử lý';
        
        const employeeTags = task.employees.map(emp => {
            if (task.status === 'completed') {
                return `<span class="employee-tag">${emp}</span>`;
            } else {
                return `<span class="employee-tag">${emp}<span class="remove-tag" onclick="event.stopPropagation(); removeEmployee(this)">×</span></span>`;
            }
        }).join('');
        
        const addButton = task.status === 'completed' ? '' : 
            '<button class="add-employee-btn" onclick="event.stopPropagation(); addEmployee(this)">+ Thêm</button>';
        
        const disabled = task.status === 'completed' ? 'disabled' : '';
        
        row.innerHTML = `
            <td class="task-name">${task.name}</td>
            <td class="employee-cell">
                <div class="employee-tags">
                    ${employeeTags}
                    ${addButton}
                </div>
            </td>
            <td><input type="number" value="${task.quantity}" class="quantity-input" ${disabled} onclick="event.stopPropagation()"></td>
            <td><span class="shift-badge ${shiftClass}">${task.shift}</span></td>
            <td class="time-cell">${task.time}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="note-cell">${task.note}</td>
        `;
        
        tbody.appendChild(row);
        
        // Animation
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
    
    // Cập nhật stats
    updateStats(totalTasks, pendingCount, completedCount, overdueCount);
}

// Hiển thị chi tiết từ dữ liệu task object
function showTaskDetailFromData(task) {
    console.log('showTaskDetailFromData called', task);
    
    // Tìm row tương ứng trong bảng để lưu vào currentEditingRow
    const rows = document.querySelectorAll('.task-row');
    rows.forEach(row => {
        const taskName = row.querySelector('.task-name').textContent.trim();
        if (taskName === task.name) {
            currentEditingRow = row;
            console.log('Found and saved currentEditingRow:', currentEditingRow);
        }
    });
    
    const employees = task.employees.join(', ');
    const department = 'Quản lý & Vận hành';
    const description = task.note + '. Đây là mô tả chi tiết về công việc này.';
    
    // Cập nhật modal
    document.getElementById('detailTaskName').textContent = 'Chi tiết công việc';
    document.getElementById('detailTaskTitle').textContent = task.name;
    document.getElementById('detailDescription').textContent = description;
    document.getElementById('detailDepartment').textContent = department;
    
    // Format shift và time
    const shiftNames = {
        'Sáng': 'Ca Sáng',
        'Chiều': 'Ca Chiều',
        'Tối': 'Ca Tối',
        'Cả ngày': 'Ca Cả ngày',
        'Buổi trưa': 'Ca Buổi trưa'
    };
    const timeFormatted = task.time.replace(' - ', ' — ');
    document.getElementById('detailShiftTime').innerHTML = `${shiftNames[task.shift] || task.shift}<br>${timeFormatted}`;
    
    // Employees
    const employeesHTML = task.employees.map(emp => {
        const initials = emp.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
        const statusTextEmp = task.status === 'completed' ? 'Đã hoàn thành công việc' : 
                          task.status === 'pending' ? 'Đang thực hiện công việc' : 'Chưa bắt đầu';
        return `
            <div class="employee-item-detail">
                <div class="employee-avatar">${initials}</div>
                <div class="employee-info-detail">
                    <strong>${emp}</strong>
                    <span>${statusTextEmp}</span>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('detailEmployees').innerHTML = employeesHTML;
    
    // Note
    document.getElementById('detailNote').textContent = `"${task.note}"`;
    
    // Show modal
    console.log('Opening modal...');
    document.getElementById('taskDetailModal').style.display = 'block';
}

// Cập nhật số liệu thống kê
function updateStats(total, pending, completed, overdue) {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('h2').textContent = total;
        statCards[1].querySelector('h2').textContent = pending;
        statCards[2].querySelector('h2').textContent = completed;
        statCards[3].querySelector('h2').textContent = overdue;
    }
}

// Biến lưu trạng thái edit và row hiện tại
let isEditMode = false;
let currentEditingRow = null;

// Toggle chế độ chỉnh sửa
function toggleEditMode() {
    const btnEdit = document.getElementById('btnEdit');
    const editableElements = [
        document.getElementById('detailTaskTitle'),
        document.getElementById('detailDescription'),
        document.getElementById('detailDepartment'),
        document.getElementById('detailNote')
    ];
    
    if (!isEditMode) {
        // Bật chế độ chỉnh sửa
        isEditMode = true;
        btnEdit.textContent = '💾 Lưu thay đổi';
        btnEdit.style.background = '#27ae60';
        
        editableElements.forEach(el => {
            if (el) {
                el.contentEditable = 'true';
                el.style.background = '#fff9e6';
                el.style.border = '1px dashed #f39c12';
                el.style.padding = '8px';
                el.style.borderRadius = '6px';
            }
        });
        
        showNotification('✏️ Chế độ chỉnh sửa đã bật. Nhấn vào các trường để chỉnh sửa.');
    } else {
        // Lưu thay đổi
        saveTaskChanges();
    }
}

// Lưu thay đổi
function saveTaskChanges() {
    console.log('saveTaskChanges called');
    console.log('currentEditingRow:', currentEditingRow);
    
    if (!currentEditingRow) {
        showNotification('❌ Không tìm thấy công việc để cập nhật');
        return;
    }
    
    // Lấy dữ liệu đã chỉnh sửa
    const newTaskName = document.getElementById('detailTaskTitle').textContent.trim();
    const newDescription = document.getElementById('detailDescription').textContent.trim();
    const newDepartment = document.getElementById('detailDepartment').textContent.trim();
    const newNote = document.getElementById('detailNote').textContent.trim().replace(/"/g, '');
    
    console.log('New data:', { newTaskName, newDescription, newDepartment, newNote });
    
    // Cập nhật vào bảng
    const taskNameCell = currentEditingRow.querySelector('.task-name');
    const noteCellCell = currentEditingRow.querySelector('.note-cell');
    
    if (taskNameCell) {
        taskNameCell.textContent = newTaskName;
        console.log('Updated task name');
    }
    
    if (noteCellCell) {
        noteCellCell.textContent = newNote;
        console.log('Updated note');
    }
    
    if (currentEditingRow.querySelector('.task-department')) {
        currentEditingRow.querySelector('.task-department').textContent = newDepartment;
        console.log('Updated department');
    }
    if (currentEditingRow.querySelector('.task-description')) {
        currentEditingRow.querySelector('.task-description').textContent = newDescription;
        console.log('Updated description');
    }
    
    // Tắt chế độ chỉnh sửa
    const btnEdit = document.getElementById('btnEdit');
    const editableElements = [
        document.getElementById('detailTaskTitle'),
        document.getElementById('detailDescription'),
        document.getElementById('detailDepartment'),
        document.getElementById('detailNote')
    ];
    
    isEditMode = false;
    btnEdit.textContent = 'Chỉnh sửa công việc';
    btnEdit.style.background = '#27ae60';
    
    editableElements.forEach(el => {
        if (el) {
            el.contentEditable = 'false';
            el.style.background = '';
            el.style.border = '';
            el.style.padding = '';
        }
    });
    
    // Đánh dấu có thay đổi
    markAsChanged();
    
    // Hiển thị thông báo thành công
    showNotification('✅ Đã cập nhật thông tin công việc! Nhớ bấm "Lưu phân công" để lưu vào hệ thống.');
    
    // Đóng modal sau 1.5 giây
    setTimeout(() => {
        closeTaskDetailModal();
    }, 1500);
}

// Hiển thị chi tiết công việc
function showTaskDetail(row) {
    console.log('showTaskDetail called', row);
    
    // Lưu row hiện tại để cập nhật sau
    currentEditingRow = row;
    
    // Lấy dữ liệu từ row
    const taskName = row.querySelector('.task-name').textContent.trim();
    const employeeTags = row.querySelectorAll('.employee-tag');
    const employees = Array.from(employeeTags).map(tag => tag.textContent.replace('×', '').trim()).join(', ');
    const shift = row.querySelector('.shift-badge').textContent.trim();
    const time = row.querySelector('.time-cell').textContent.trim();
    const statusBadge = row.querySelector('.status-badge');
    const statusText = statusBadge.textContent.trim();
    const note = row.querySelector('.note-cell').textContent.trim();
    const department = row.querySelector('.task-department') ? row.querySelector('.task-department').textContent.trim() : 'Quản lý & Vận hành';
    const description = row.querySelector('.task-description') ? row.querySelector('.task-description').textContent.trim() : note;
    
    // Xác định status
    let status = 'pending';
    if (statusBadge.classList.contains('completed')) status = 'completed';
    else if (statusBadge.classList.contains('overdue')) status = 'overdue';
    
    console.log('Task data:', { taskName, employees, shift, time, status, note, department, description });
    console.log('Current editing row saved:', currentEditingRow);
    
    // Cập nhật modal
    document.getElementById('detailTaskName').textContent = 'Chi tiết công việc';
    document.getElementById('detailTaskTitle').textContent = taskName;
    document.getElementById('detailDescription').textContent = description;
    document.getElementById('detailDepartment').textContent = department;
    
    // Format shift và time
    const shiftNames = {
        'Sáng': 'Ca Sáng',
        'Chiều': 'Ca Chiều',
        'Tối': 'Ca Tối',
        'Cả ngày': 'Ca Cả ngày',
        'Buổi trưa': 'Ca Buổi trưa'
    };
    const timeFormatted = time.replace(' - ', ' — ');
    document.getElementById('detailShiftTime').innerHTML = `${shiftNames[shift] || shift}<br>${timeFormatted}`;
    
    // Employees
    const employeeList = employees.split(',').map(emp => emp.trim());
    const employeesHTML = employeeList.map(emp => {
        const initials = emp.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
        const statusTextEmp = status === 'completed' ? 'Đã hoàn thành công việc' : 
                          status === 'pending' ? 'Đang thực hiện công việc' : 'Chưa bắt đầu';
        return `
            <div class="employee-item-detail">
                <div class="employee-avatar">${initials}</div>
                <div class="employee-info-detail">
                    <strong>${emp}</strong>
                    <span>${statusTextEmp}</span>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('detailEmployees').innerHTML = employeesHTML;
    
    // Note
    document.getElementById('detailNote').textContent = `"${note}"`;
    
    // Show modal
    console.log('Opening modal...');
    document.getElementById('taskDetailModal').style.display = 'block';
}

// Đóng modal chi tiết
function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').style.display = 'none';
    
    // Reset edit mode
    isEditMode = false;
    currentEditingRow = null;
    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) {
        btnEdit.textContent = 'Chỉnh sửa công việc';
        btnEdit.style.background = '#27ae60';
    }
    
    // Reset contenteditable
    const editableElements = [
        document.getElementById('detailTaskTitle'),
        document.getElementById('detailDescription'),
        document.getElementById('detailDepartment'),
        document.getElementById('detailNote')
    ];
    
    editableElements.forEach(el => {
        if (el) {
            el.contentEditable = 'false';
            el.style.background = '';
            el.style.border = '';
            el.style.padding = '';
        }
    });
}

// Chỉnh sửa công việc
function editTask() {
    closeTaskDetailModal();
    showNotification('✏️ Chức năng chỉnh sửa đang được phát triển');
}

// Xóa công việc
function deleteTask() {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        closeTaskDetailModal();
        showNotification('🗑️ Đã xóa công việc thành công');
    }
}

// Đánh dấu có thay đổi chưa lưu
let hasUnsavedChanges = false;

// Đánh dấu khi có thay đổi
function markAsChanged() {
    hasUnsavedChanges = true;
    const saveBtn = document.querySelector('.btn-filter');
    if (saveBtn) {
        saveBtn.style.animation = 'pulse 1s infinite';
        saveBtn.innerHTML = '💾 Lưu phân công *';
    }
}

// Thêm CSS animation cho nút lưu
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(pulseStyle);

// Danh sách nhân viên có sẵn
const availableEmployees = [
    'Nguyễn Văn An', 'Phạm Xuân Thương', 'Nguyễn Thị Lan', 
    'Trần Văn Hùng', 'Lê Minh Châu', 'Vũ Thị Hà',
    'Yến', 'Hiền', 'Ngọc', 'Mai', 'Kiên', 'Hương',
    'Team F&B', 'Team Housekeeping'
];

// Thêm nhân viên
function addEmployee(button) {
    console.log('addEmployee called', button);
    const container = button.parentElement;
    
    // Tạo dropdown để chọn nhân viên
    const select = document.createElement('select');
    select.className = 'employee-select-temp';
    select.style.cssText = 'margin-right: 5px; padding: 4px 8px; border-radius: 4px; border: 1px solid #5b6cf5;';
    
    // Lấy danh sách nhân viên đã chọn
    const selectedEmployees = Array.from(container.querySelectorAll('.employee-tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    console.log('Selected employees:', selectedEmployees);
    
    // Thêm option cho các nhân viên chưa được chọn
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- Chọn nhân viên --';
    select.appendChild(option);
    
    availableEmployees.forEach(emp => {
        if (!selectedEmployees.includes(emp)) {
            const opt = document.createElement('option');
            opt.value = emp;
            opt.textContent = emp;
            select.appendChild(opt);
        }
    });
    
    // Thêm select vào trước button
    container.insertBefore(select, button);
    select.focus();
    
    // Xử lý khi chọn nhân viên
    select.addEventListener('change', function() {
        console.log('Selected:', this.value);
        if (this.value) {
            const tag = document.createElement('span');
            tag.className = 'employee-tag';
            tag.innerHTML = `
                ${this.value}
                <span class="remove-tag" onclick="removeEmployee(this)">×</span>
            `;
            container.insertBefore(tag, button);
            
            // Animation
            tag.style.opacity = '0';
            tag.style.transform = 'scale(0.8)';
            setTimeout(() => {
                tag.style.transition = 'all 0.2s ease';
                tag.style.opacity = '1';
                tag.style.transform = 'scale(1)';
            }, 10);
            
            // Đánh dấu có thay đổi
            markAsChanged();
        }
        this.remove();
    });
    
    // Xử lý khi click ra ngoài
    select.addEventListener('blur', function() {
        setTimeout(() => this.remove(), 200);
    });
}

// Xóa nhân viên
function removeEmployee(element) {
    const tag = element.parentElement;
    tag.style.transition = 'all 0.2s ease';
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    setTimeout(() => {
        tag.remove();
        // Đánh dấu có thay đổi
        markAsChanged();
    }, 200);
}

// Thêm nhân viên vào modal
function addEmployeeToModal() {
    const container = document.getElementById('modalEmployees');
    const button = container.querySelector('.add-employee-btn');
    
    // Tạo dropdown
    const select = document.createElement('select');
    select.className = 'employee-select-temp';
    select.style.cssText = 'margin-right: 5px; margin-bottom: 5px; padding: 8px 12px; border-radius: 6px; border: 1px solid #5b6cf5;';
    
    // Lấy danh sách nhân viên đã chọn
    const selectedEmployees = Array.from(container.querySelectorAll('.employee-tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    // Thêm options
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- Chọn nhân viên --';
    select.appendChild(option);
    
    availableEmployees.forEach(emp => {
        if (!selectedEmployees.includes(emp)) {
            const opt = document.createElement('option');
            opt.value = emp;
            opt.textContent = emp;
            select.appendChild(opt);
        }
    });
    
    container.insertBefore(select, button);
    select.focus();
    
    select.addEventListener('change', function() {
        if (this.value) {
            const tag = document.createElement('span');
            tag.className = 'employee-tag';
            tag.innerHTML = `
                ${this.value}
                <span class="remove-tag" onclick="removeEmployee(this)">×</span>
            `;
            container.insertBefore(tag, button);
            
            tag.style.opacity = '0';
            tag.style.transform = 'scale(0.8)';
            setTimeout(() => {
                tag.style.transition = 'all 0.2s ease';
                tag.style.opacity = '1';
                tag.style.transform = 'scale(1)';
            }, 10);
        }
        this.remove();
    });
    
    select.addEventListener('blur', function() {
        setTimeout(() => this.remove(), 200);
    });
}

// Theo dõi thay đổi số lượng
document.addEventListener('DOMContentLoaded', function() {
    // Thêm event listener cho tất cả quantity input
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            markAsChanged();
        }
    });
});

// Mở modal thêm công việc
function openAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'block';
}

// Đóng modal
function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    clearModalForm();
}

// Xử lý shift buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('shift-btn')) {
        // Remove active từ tất cả buttons
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active cho button được click
        e.target.classList.add('active');
    }
});

// Xóa form
function clearModalForm() {
    document.getElementById('taskName').value = '';
    
    // Xóa tất cả employee tags
    const modalEmployees = document.getElementById('modalEmployees');
    const tags = modalEmployees.querySelectorAll('.employee-tag');
    tags.forEach(tag => tag.remove());
    
    document.getElementById('taskQuantity').value = '1';
    
    // Reset shift buttons
    document.querySelectorAll('.shift-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.shift-btn[data-shift="Sáng"]').classList.add('active');
    
    document.getElementById('taskStartTime').value = '08:00';
    document.getElementById('taskEndTime').value = '16:00';
    document.getElementById('taskNote').value = '';
}

// Thêm công việc mới
function addNewTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const modalEmployees = document.getElementById('modalEmployees');
    const employeeTags = Array.from(modalEmployees.querySelectorAll('.employee-tag'));
    
    const taskQuantity = document.getElementById('taskQuantity').value;
    const activeShiftBtn = document.querySelector('.shift-btn.active');
    const taskShift = activeShiftBtn ? activeShiftBtn.dataset.shift : 'Sáng';
    const taskStartTime = document.getElementById('taskStartTime').value;
    const taskEndTime = document.getElementById('taskEndTime').value;
    const taskNote = document.getElementById('taskNote').value.trim();

    if (!taskName) {
        alert('Vui lòng nhập tên công việc');
        return;
    }

    if (employeeTags.length === 0) {
        alert('Vui lòng chọn ít nhất một nhân viên');
        return;
    }

    // Xác định class cho shift badge
    let shiftClass = 'morning';
    if (taskShift === 'Chiều') shiftClass = 'afternoon';
    else if (taskShift === 'Tối') shiftClass = 'evening';
    else if (taskShift === 'Cả ngày') shiftClass = 'fullday';

    // Tạo HTML cho employee tags
    const employeeTagsHTML = employeeTags.map(tag => {
        const empName = tag.textContent.replace('×', '').trim();
        return `<span class="employee-tag">
            ${empName}
            <span class="remove-tag" onclick="removeEmployee(this)">×</span>
        </span>`;
    }).join('');

    // Tạo row mới
    const tbody = document.getElementById('tasksTableBody');
    const newRow = document.createElement('tr');
    newRow.className = 'task-row';
    
    newRow.innerHTML = `
        <td class="task-name">${taskName}</td>
        <td class="employee-cell">
            <div class="employee-tags">
                ${employeeTagsHTML}
                <button class="add-employee-btn" onclick="addEmployee(this)">+ Thêm</button>
            </div>
        </td>
        <td><input type="number" value="${taskQuantity}" class="quantity-input"></td>
        <td><span class="shift-badge ${shiftClass}">${taskShift}</span></td>
        <td class="time-cell">${taskStartTime} - ${taskEndTime}</td>
        <td><span class="status-badge pending">⏳ Đang thực hiện</span></td>
        <td class="note-cell">${taskNote || 'Không có ghi chú'}</td>
    `;

    tbody.appendChild(newRow);

    // Animation
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateX(0)';
    }, 10);

    // Đóng modal và reset form
    closeAddTaskModal();
    
    // Đánh dấu có thay đổi
    markAsChanged();
    
    // Thông báo thành công
    showNotification('✅ Đã thêm công việc mới thành công!');
}

// Hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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
    const addModal = document.getElementById('addTaskModal');
    const detailModal = document.getElementById('taskDetailModal');
    
    if (event.target === addModal) {
        closeAddTaskModal();
    }
    if (event.target === detailModal) {
        closeTaskDetailModal();
    }
}

// Lưu phân công
function saveAssignments() {
    if (!hasUnsavedChanges) {
        showNotification('ℹ️ Không có thay đổi nào để lưu');
        return;
    }
    
    const rows = document.querySelectorAll('.task-row');
    const assignments = [];
    
    rows.forEach(row => {
        const taskName = row.querySelector('.task-name').textContent;
        const employeeCell = row.querySelector('.employee-cell');
        const employees = Array.from(employeeCell.querySelectorAll('.employee-tag'))
            .map(tag => tag.textContent.replace('×', '').trim());
        const quantity = row.querySelector('.quantity-input').value;
        const shift = row.querySelector('.shift-badge').textContent;
        const time = row.querySelector('.time-cell').textContent;
        const status = row.querySelector('.status-badge').textContent;
        const note = row.querySelector('.note-cell').textContent;
        
        assignments.push({
            taskName,
            employees,
            quantity,
            shift,
            time,
            status,
            note
        });
    });
    
    console.log('Đang lưu phân công:', assignments);
    
    // Giả lập gọi API (thay bằng fetch thực tế)
    // Hiển thị loading
    const saveBtn = document.querySelector('.btn-filter');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '⏳ Đang lưu...';
    saveBtn.disabled = true;
    
    // Giả lập delay API call
    setTimeout(() => {
        // Thành công
        hasUnsavedChanges = false;
        saveBtn.style.animation = '';
        saveBtn.innerHTML = '📋 Lưu phân công';
        saveBtn.disabled = false;
        
        // Hiển thị notification thành công với style đặc biệt
        showSuccessNotification();
        
        // Trong thực tế, gọi API:
        /*
        fetch('/api/save-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: document.getElementById('filterDate').value,
                assignments: assignments
            })
        })
        .then(response => response.json())
        .then(data => {
            hasUnsavedChanges = false;
            saveBtn.style.animation = '';
            saveBtn.innerHTML = '📋 Lưu phân công';
            saveBtn.disabled = false;
            showSuccessNotification();
        })
        .catch(error => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            showNotification('❌ Lỗi khi lưu: ' + error.message);
        });
        */
    }, 1000);
}

// Hiển thị notification thành công đặc biệt
function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 40px;">✅</div>
            <div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">Lưu PCCV thành công!</div>
                <div style="font-size: 14px; opacity: 0.9;">Công việc mới của nhân viên đã được cập nhật</div>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: white;
        color: #27ae60;
        padding: 25px 35px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(39, 174, 96, 0.3);
        z-index: 2000;
        opacity: 0;
        transition: all 0.3s ease;
        border: 2px solid #27ae60;
    `;
    
    document.body.appendChild(notification);
    
    // Animation vào
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Animation ra
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Xuất dữ liệu
function exportData() {
    showNotification('📥 Đang xuất dữ liệu...');
}

// Thay đổi trạng thái công việc
function changeTaskStatus(element, status) {
    const row = element.closest('tr');
    const statusBadge = row.querySelector('.status-badge');
    const employeeCell = row.querySelector('.employee-cell');
    const quantityInput = row.querySelector('.quantity-input');
    
    statusBadge.className = 'status-badge';
    
    if (status === 'completed') {
        statusBadge.classList.add('completed');
        statusBadge.textContent = '✅ Hoàn thành';
        
        // Disable editing khi hoàn thành
        quantityInput.disabled = true;
        
        // Xóa nút thêm và nút xóa nhân viên
        const addBtn = employeeCell.querySelector('.add-employee-btn');
        if (addBtn) addBtn.remove();
        
        const removeTags = employeeCell.querySelectorAll('.remove-tag');
        removeTags.forEach(tag => tag.remove());
        
    } else if (status === 'pending') {
        statusBadge.classList.add('pending');
        statusBadge.textContent = '⏳ Đang thực hiện';
        
        // Enable editing
        quantityInput.disabled = false;
        
        // Thêm lại nút thêm nếu chưa có
        const container = employeeCell.querySelector('.employee-tags');
        if (!container.querySelector('.add-employee-btn')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-employee-btn';
            addBtn.textContent = '+ Thêm';
            addBtn.onclick = function() { addEmployee(this); };
            container.appendChild(addBtn);
        }
        
        // Thêm lại nút xóa cho các tag
        const tags = container.querySelectorAll('.employee-tag');
        tags.forEach(tag => {
            if (!tag.querySelector('.remove-tag')) {
                const removeSpan = document.createElement('span');
                removeSpan.className = 'remove-tag';
                removeSpan.textContent = '×';
                removeSpan.onclick = function() { removeEmployee(this); };
                tag.appendChild(removeSpan);
            }
        });
        
    } else if (status === 'overdue') {
        statusBadge.classList.add('overdue');
        statusBadge.textContent = '❌ Chưa xử lý';
        
        // Enable editing
        quantityInput.disabled = false;
        
        // Thêm lại nút thêm nếu chưa có
        const container = employeeCell.querySelector('.employee-tags');
        if (!container.querySelector('.add-employee-btn')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-employee-btn';
            addBtn.textContent = '+ Thêm';
            addBtn.onclick = function() { addEmployee(this); };
            container.appendChild(addBtn);
        }
        
        // Thêm lại nút xóa cho các tag
        const tags = container.querySelectorAll('.employee-tag');
        tags.forEach(tag => {
            if (!tag.querySelector('.remove-tag')) {
                const removeSpan = document.createElement('span');
                removeSpan.className = 'remove-tag';
                removeSpan.textContent = '×';
                removeSpan.onclick = function() { removeEmployee(this); };
                tag.appendChild(removeSpan);
            }
        });
    }
}

// Lọc theo trạng thái
function filterByStatus(status) {
    console.log('Filter by status:', status);
    
    const rows = document.querySelectorAll('.task-row');
    const statCards = document.querySelectorAll('.stat-card');
    
    // Remove active class from all cards
    statCards.forEach(card => card.classList.remove('active'));
    
    // Add active class to clicked card
    if (status === 'all') {
        statCards[0].classList.add('active');
    } else if (status === 'pending') {
        statCards[1].classList.add('active');
    } else if (status === 'completed') {
        statCards[2].classList.add('active');
    } else if (status === 'overdue') {
        statCards[3].classList.add('active');
    }
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        const statusText = statusBadge.textContent.trim();
        
        if (status === 'all') {
            row.style.display = '';
        } else if (status === 'pending' && statusText.includes('Đang thực hiện')) {
            row.style.display = '';
        } else if (status === 'completed' && statusText.includes('Hoàn thành')) {
            row.style.display = '';
        } else if (status === 'overdue' && statusText.includes('Chưa xử lý')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show notification
    const statusNames = {
        'all': 'Tất cả công việc',
        'pending': 'Đang thực hiện',
        'completed': 'Hoàn thành',
        'overdue': 'Chưa xử lý'
    };
    showNotification(`📊 Đang hiển thị: ${statusNames[status]}`);
}

// Định dạng ngày tiếng Việt
function formatDateVN(dateString) {
    const date = new Date(dateString);
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${dayName}, ${day}/${month}/${year}`;
}

// Lọc theo ngày
document.addEventListener('DOMContentLoaded', function() {
    // Set active cho card đầu tiên
    const firstCard = document.querySelector('.stat-card');
    if (firstCard) {
        firstCard.classList.add('active');
    }
    
    const dateInput = document.getElementById('filterDate');
    const dateLabel = document.getElementById('dateLabel');
    
    if (dateInput && dateLabel) {
        // Hiển thị ngày ban đầu
        dateLabel.textContent = formatDateVN(dateInput.value);
        
        // Load dữ liệu ngày ban đầu
        loadTasksByDate(dateInput.value);
        
        dateInput.addEventListener('change', function() {
            const selectedDate = formatDateVN(this.value);
            dateLabel.textContent = selectedDate;
            
            // Load dữ liệu theo ngày mới
            loadTasksByDate(this.value);
            
            showNotification('📅 Đã chuyển sang ngày: ' + selectedDate);
        });
    }
    
    // Thêm animation cho stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// CSS cho animations
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

// Toggle Response Notification Dropdown
function toggleResponseNotification() {
    const dropdown = document.getElementById('responseDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('responseDropdown');
    const btn = document.querySelector('.btn-notification');
    
    if (dropdown && !dropdown.contains(event.target) && event.target !== btn && !btn.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Reassign task
function reassignTask(taskName) {
    showNotification(`🔄 Đang phân công lại: ${taskName}`);
    // Có thể mở modal phân công lại ở đây
}
