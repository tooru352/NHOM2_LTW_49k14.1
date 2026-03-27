// ===== SHIFTS CONFIG =====
const SHIFTS = {
  M5:   { label: 'M5',   cls: 's-ms'   },
  A1:   { label: 'A1',   cls: 's-a1'   },
  E9:   { label: 'E9',   cls: 's-e9'   },
  M6SS: { label: 'M6SS', cls: 's-mgss' },
  DO:   { label: 'DO',   cls: 's-do'   },
};

// status: 'pending'=vàng, 'accepted'=xanh, 'rejected'=đỏ
// weekStatus[key][empId][dayIdx] = status
const weekStatus = {};

// ===== EMPLOYEES =====
const employees = [
  { id: 1,  name: 'Đại Trung Tuấn',       role: 'Lễ tân'            },
  { id: 2,  name: 'Hoàng Hải Yến',        role: 'Lễ tân'            },
  { id: 3,  name: 'Nguyễn Lê Bảo Hân',   role: 'Lễ tân'            },
  { id: 4,  name: 'Vũ Nguyễn Đức Trinh', role: 'Lễ tân'            },
  { id: 5,  name: 'Dương Thị Quỳnh',     role: 'Lễ tân'            },
  { id: 6,  name: 'Lê Quang Hải',        role: 'Lễ tân'            },
  { id: 7,  name: 'Hoài Lâm',            role: 'Nhân viên phục vụ' },
  { id: 8,  name: 'Hoài Lâm',            role: 'Nhân viên phục vụ' },
  { id: 9,  name: 'Hoài Lâm',            role: 'Nhân viên phục vụ' },
  { id: 10, name: 'Hoài Lâm',            role: 'Nhân viên phục vụ' },
];

// ===== WEEK SCHEDULES =====
// key = string offset, value = {empId: [7 ca]}
const weekSchedules = {};
weekSchedules['-1'] = {
  1:  ['A1','E9','M5','A1','DO','M5','E9'],
  2:  ['M5','DO','A1','M5','E9','A1','M5'],
  3:  ['DO','M5','E9','A1','M5','M6SS','A1'],
  4:  ['M5','A1','DO','E9','A1','M5','DO'],
  5:  ['E9','M5','M5','DO','A1','E9','M5'],
  6:  ['A1','M6SS','A1','M5','DO','A1','E9'],
  7:  ['M5','A1','M5','A1','M5','DO','A1'],
  8:  ['DO','M5','A1','M5','A1','M5','M5'],
  9:  ['M5','A1','DO','A1','M5','A1','DO'],
  10: ['A1','M5','M5','DO','A1','M5','A1'],
};
weekSchedules['0'] = {
  1:  ['M5','A1','E9','DO','E9','E9','A1'],
  2:  ['M5','A1','E9','A1','A1','A1','DO'],
  3:  ['E9','M6SS','M6SS','DO','A1','DO','A1'],
  4:  ['DO','M5','M5','DO','M5','A1','M5'],
  5:  ['DO','A1','DO','M5','DO','A1','M5'],
  6:  ['A1','M5','M5','M6SS','M5','A1','A1'],
  7:  ['A1','M5','A1','DO','M6SS','M5','M5'],
  8:  ['A1','M5','A1','DO','M6SS','M5','M5'],
  9:  ['A1','M5','A1','DO','M6SS','M5','M5'],
  10: ['A1','M5','A1','DO','M6SS','M5','M5'],
};

let currentWeekOffset = 0;

// Lấy status tuần
function getStatus(offset) {
  const key = String(offset);
  if (!weekStatus[key]) {
    const s = {};
    const statuses = ['pending', 'accepted', 'rejected'];
    employees.forEach(emp => {
      s[emp.id] = Array(7).fill(null).map(() =>
        statuses[Math.floor(Math.random() * statuses.length)]
      );
    });
    weekStatus[key] = s;
  }
  return weekStatus[key];
}

function dotClass(status) {
  if (status === 'accepted') return 'dot-green';
  if (status === 'rejected') return 'dot-red';
  return 'dot-yellow';
}

function toggleDot(empId, dayIdx) {
  // Quản lý không được click đổi dot — chỉ dot đỏ mới mở popup
  return;
}

// Lấy lịch tuần, nếu chưa có thì tạo trống
function getSchedule(offset) {
  const key = String(offset);
  if (!weekSchedules[key]) {
    const empty = {};
    employees.forEach(emp => { empty[emp.id] = Array(7).fill(null); });
    weekSchedules[key] = empty;
  }
  return weekSchedules[key];
}

// Kiểm tra tuần có trống không
function isWeekEmpty(offset) {
  const sched = getSchedule(offset);
  return employees.every(emp => sched[emp.id].every(s => s === null));
}

const SHIFT_INFO = {
  M5:   { name: 'Ca Sáng',     time: '5:00 - 13:00',  bg: '#1565c0' },
  A1:   { name: 'Ca Chiều',    time: '13:00 - 21:00', bg: '#7c3aed' },
  E9:   { name: 'Ca Tối',      time: '21:00 - 5:00',  bg: '#c2410c' },
  M6SS: { name: 'Ca Đặc Biệt', time: '6:00 - 18:00',  bg: '#9d174d' },
  DO:   { name: 'Nghỉ',        time: 'Day Off',        bg: '#b91c1c' },
};
const DAYS_VI = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'];
const rejectReasons = {};
let rejectContext = null;

function openRejectPopup(empId, dayIdx) {
  const sched = getSchedule(currentWeekOffset);
  const shift = sched[empId][dayIdx];
  if (!shift) return;
  rejectContext = { empId, dayIdx };
  const emp  = employees.find(e => e.id === empId);
  const base = getCurrentMonday();
  const day  = new Date(base);
  day.setDate(base.getDate() + currentWeekOffset * 7 + dayIdx);
  document.getElementById('rjEmpName').textContent = emp?.name || '';
  document.getElementById('rjDate').textContent = DAYS_VI[dayIdx] + ', ' + day.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  const info = SHIFT_INFO[shift];
  document.getElementById('rjShiftIcon').textContent = shift;
  document.getElementById('rjShiftIcon').style.background = info.bg;
  document.getElementById('rjShiftName').textContent = info.name;
  document.getElementById('rjShiftTime').textContent = info.time;
  const key = `${empId}-${currentWeekOffset}-${dayIdx}`;
  document.getElementById('rjReasonText').textContent =
    rejectReasons[key] || '"Tôi có lịch khám bệnh định kỳ vào buổi sáng ngày này và đã đặt lịch từ trước. Rất mong quản lý thông cảm."';
  document.getElementById('rjReply').value = '';
  document.getElementById('rjCharCount').textContent = '0 / 500 ký tự';
  document.getElementById('rejectOverlay').classList.add('active');
  document.getElementById('rejectModal').classList.add('active');
}

function closeRejectPopup() {
  document.getElementById('rejectOverlay').classList.remove('active');
  document.getElementById('rejectModal').classList.remove('active');
  rejectContext = null;
}

function handleReassign() {
  if (!rejectContext) return;
  const { empId, dayIdx } = rejectContext;
  const key = String(currentWeekOffset);
  if (weekStatus[key]) weekStatus[key][empId][dayIdx] = 'pending';
  // Đóng popup trước
  document.getElementById('rejectOverlay').classList.remove('active');
  document.getElementById('rejectModal').classList.remove('active');
  rejectContext = null;
  // Đảm bảo scheduleView hiện trước khi openEditView ẩn nó
  document.getElementById('scheduleView').style.display = 'block';
  renderTable();
  openEditView();
}

function handleManagerCancel() {
  if (!rejectContext) return;
  const { empId, dayIdx } = rejectContext;
  const key = String(currentWeekOffset);
  if (weekStatus[key]) weekStatus[key][empId][dayIdx] = 'accepted';
  const dot = document.getElementById(`dot-${empId}-${dayIdx}`);
  if (dot) {
    dot.className = 'dot dot-green';
    // Cập nhật onclick — dot xanh không click được nữa
    dot.setAttribute('onclick', '');
    dot.style.cursor = 'default';
    dot.title = '';
  }
  closeRejectPopup();
  showToast('Đã xác nhận ca!', 'Ca làm việc đã được chấp nhận dù nhân viên từ chối.', 'success');
}

// Lấy thứ 2 của tuần hiện tại (thực tế)
function getCurrentMonday() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0=Mon
  const mon = new Date(today);
  mon.setDate(today.getDate() - dow);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function getWeekRange(offset) {
  const base = getCurrentMonday();
  const start = new Date(base);
  start.setDate(base.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

function changeWeek(dir) {
  const next = currentWeekOffset + dir;
  if (next > 1) return;
  currentWeekOffset = next;
  updateWeekUI();
  renderTable();
}

function updateWeekUI() {
  document.getElementById('weekRange').textContent = getWeekRange(currentWeekOffset);
  document.getElementById('badgeCurrent').style.display = currentWeekOffset === 0 ? 'inline-block' : 'none';
  document.getElementById('btnNext').style.display = currentWeekOffset >= 1 ? 'none' : 'inline-block';
  updateActionButtons();
}

// ===== ACTION BUTTONS =====
function updateActionButtons() {
  const btnCreate = document.getElementById('btnCreate');
  const btnEdit   = document.getElementById('btnEdit');
  const btnDel    = document.getElementById('btnDel');
  const empty     = isWeekEmpty(currentWeekOffset);

  if (currentWeekOffset < 0) {
    btnCreate.style.display = 'none';
    btnEdit.style.display   = 'none';
    btnDel.style.display    = 'none';
  } else if (currentWeekOffset === 0) {
    btnCreate.style.display = empty ? 'inline-block' : 'none';
    btnEdit.style.display   = empty ? 'none' : 'inline-block';
    btnDel.style.display    = empty ? 'none' : 'inline-block';
  } else {
    // Tuần sau: trống → Tạo; có lịch → Sửa + Xóa
    btnCreate.style.display = empty ? 'inline-block' : 'none';
    btnEdit.style.display   = empty ? 'none' : 'inline-block';
    btnDel.style.display    = empty ? 'none' : 'inline-block';
  }
}

// ===== RENDER TABLE =====
function renderTable() {
  const tbody = document.getElementById('scheduleBody');
  tbody.innerHTML = '';
  const sched = getSchedule(currentWeekOffset);
  const st    = getStatus(currentWeekOffset);

  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${sched[emp.id].map((s, i) => `
        <td>${s
          ? `<span class="shift-cell ${SHIFTS[s].cls}">
               ${SHIFTS[s].label}
               <span class="dot ${dotClass(st[emp.id][i])}" id="dot-${emp.id}-${i}"
                 onclick="${st[emp.id][i] === 'rejected' ? `openRejectPopup(${emp.id},${i})` : ''}"
                 style="cursor:${st[emp.id][i] === 'rejected' ? 'pointer' : 'default'}"
                 title="${st[emp.id][i] === 'rejected' ? 'Xem lý do từ chối' : ''}"></span>
             </span>`
          : '<span class="shift-empty">—</span>'
        }</td>
      `).join('')}
    `;
    tbody.appendChild(tr);
  });

  renderTotals();
}

function renderTotals() {
  const sched = getSchedule(currentWeekOffset);
  const counts = { M5: 0, A1: 0, E9: 0, M6SS: 0, DO: 0 };
  employees.forEach(emp => sched[emp.id].forEach(s => { if (s) counts[s]++; }));
  const colors = { M5: '#1565c0', A1: '#4338ca', E9: '#c2410c', M6SS: '#9d174d', DO: '#b91c1c' };
  document.getElementById('shiftTotals').innerHTML = Object.entries(counts).map(([key, val]) => `
    <div class="total-item">
      <span class="total-badge" style="background:${colors[key]};color:white">${key[0]}</span>
      ${val}
    </div>
  `).join('');
}

const SHIFT_OPTS = [
  { key: 'M5',   cls: 'opt-ms',   label: 'M5'   },
  { key: 'A1',   cls: 'opt-a1',   label: 'A1'   },
  { key: 'E9',   cls: 'opt-e9',   label: 'E9'   },
  { key: 'M6SS', cls: 'opt-mgss', label: 'M6SS' },
  { key: 'DO',   cls: 'opt-do',   label: 'DO'   },
];

function makeShiftPicker(empId, dayIdx) {
  const id = `picker-${empId}-${dayIdx}`;
  const optionsHtml = SHIFT_OPTS.map(o =>
    `<div class="shift-option ${o.cls}" onclick="selectShift('${id}','${o.key}',this)">${o.label}</div>`
  ).join('');
  return `
    <div class="shift-picker" id="${id}">
      <button type="button" class="shift-picker-btn"
        onclick="togglePicker('${id}',event)">
        <span class="picker-label">---</span>
        <span class="shift-picker-arrow">▼</span>
      </button>
      <div class="shift-picker-dropdown">${optionsHtml}</div>
    </div>
  `;
}

function togglePicker(id, e) {
  e.stopPropagation();
  // Đóng tất cả picker khác
  document.querySelectorAll('.shift-picker-dropdown.open').forEach(d => {
    if (d.closest('.shift-picker').id !== id) d.classList.remove('open');
  });
  document.querySelector(`#${id} .shift-picker-dropdown`).classList.toggle('open');
}

function selectShift(pickerId, key, optEl) {
  const picker = document.getElementById(pickerId);
  const btn = picker.querySelector('.shift-picker-btn');
  const label = btn.querySelector('.picker-label');
  // Xóa màu cũ
  btn.className = 'shift-picker-btn has-value';
  const shift = SHIFTS[key];
  btn.style.background = getShiftBg(key);
  btn.style.color = getShiftColor(key);
  btn.style.borderColor = 'transparent';
  label.textContent = key;
  picker.dataset.value = key;
  picker.querySelector('.shift-picker-dropdown').classList.remove('open');
  updateCreateTotals();
}

function getShiftBg(key) {
  const map = { M5:'#cce8ff', A1:'#E0E7FF', E9:'#ffe8cc', M6SS:'#ffd6e7', DO:'#ffd6d6' };
  return map[key] || 'white';
}
function getShiftColor(key) {
  const map = { M5:'#1565c0', A1:'#3730a3', E9:'#b85c00', M6SS:'#9b1a5a', DO:'#c0392b' };
  return map[key] || '#333';
}

// Đóng picker và calendar khi click ngoài
document.addEventListener('click', (e) => {
  document.querySelectorAll('.shift-picker-dropdown.open')
    .forEach(d => d.classList.remove('open'));
  const popup = document.getElementById('calPopup');
  if (popup && !e.target.closest('.create-week-pick')) {
    popup.classList.remove('open');
  }
});
function openCreateView() {
  document.getElementById('scheduleView').style.display = 'none';
  const cv = document.getElementById('createView');
  cv.classList.add('active');
  // Tính tuần hiện tại thực tế
  const d = new Date(getCurrentMonday());
  d.setDate(d.getDate() + currentWeekOffset * 7);
  const year = d.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekNum = Math.round((d - startOfWeek1) / (7 * 86400000)) + 1;
  document.getElementById('weekDisplayText').textContent =
    `Week ${String(weekNum).padStart(2,'0')}, ${year}`;
  buildCalendar(d, weekNum);
  renderCreateTable();
}

function buildCalendar(activeMonday, activeWeekNum) {
  const month = activeMonday.getMonth();
  const year  = activeMonday.getFullYear();
  document.getElementById('calMonthTitle').textContent =
    activeMonday.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
      .replace(/^./, s => s.toUpperCase());

  // Ngày đầu tháng, lùi về thứ 2
  const firstDay = new Date(year, month, 1);
  const startDay = new Date(firstDay);
  const dow = (firstDay.getDay() + 6) % 7; // 0=Mon
  startDay.setDate(firstDay.getDate() - dow);

  const tbody = document.getElementById('calBody');
  tbody.innerHTML = '';

  for (let w = 0; w < 6; w++) {
    const rowStart = new Date(startDay);
    rowStart.setDate(startDay.getDate() + w * 7);

    // Tính số tuần ISO cho hàng này
    const jan4w = new Date(rowStart.getFullYear(), 0, 4);
    const sw1 = new Date(jan4w);
    sw1.setDate(jan4w.getDate() - ((jan4w.getDay() + 6) % 7));
    const wn = Math.round((rowStart - sw1) / (7 * 86400000)) + 1;

    const isActive = wn === activeWeekNum && rowStart.getFullYear() === year;
    const tr = document.createElement('tr');
    if (isActive) tr.classList.add('active-week');

    let html = `<td class="week-num">${wn}</td>`;
    for (let d = 0; d < 7; d++) {
      const day = new Date(rowStart);
      day.setDate(rowStart.getDate() + d);
      const otherMonth = day.getMonth() !== month;
      html += `<td class="${otherMonth ? 'other-month' : ''}">${day.getDate()}</td>`;
    }
    tr.innerHTML = html;
    tbody.appendChild(tr);
  }
}

function toggleCalPopup(e) {
  e.stopPropagation();
  document.getElementById('calPopup').classList.toggle('open');
}

// (calendar close handled above)

function closeCreateView() {
  document.getElementById('createView').classList.remove('active');
  const sv = document.getElementById('scheduleView');
  sv.style.display = 'block';
  sv.scrollTop = 0;
}

function renderCreateTable() {
  const tbody = document.getElementById('createBody');
  tbody.innerHTML = '';

  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${Array.from({length: 7}, (_, i) => `<td>${makeShiftPicker(emp.id, i)}</td>`).join('')}
    `;
    tbody.appendChild(tr);
  });
  updateCreateTotals();
}

function updateCreateTotals() {
  const counts = { M5: 0, A1: 0, E9: 0, M6SS: 0, DO: 0 };
  document.querySelectorAll('#createBody .shift-picker[data-value]').forEach(p => {
    const v = p.dataset.value;
    if (v && counts[v] !== undefined) counts[v]++;
  });
  const colors = { M5: '#1565c0', A1: '#4338ca', E9: '#c2410c', M6SS: '#9d174d', DO: '#b91c1c' };
  document.getElementById('createTotals').innerHTML = Object.entries(counts).map(([key, val]) => `
    <div class="total-item">
      <span class="total-badge" style="background:${colors[key]};color:white">${key[0]}</span>
      ${val}
    </div>
  `).join('');
}

function saveCreateView() {
  const key = String(currentWeekOffset);
  if (!weekSchedules[key]) getSchedule(currentWeekOffset);
  let hasAny = false;
  employees.forEach(emp => {
    const row = Array.from({length: 7}, (_, i) => {
      const picker = document.getElementById(`picker-${emp.id}-${i}`);
      const val = picker && picker.dataset.value ? picker.dataset.value : null;
      if (val) hasAny = true;
      return val;
    });
    weekSchedules[key][emp.id] = row;
  });
  if (!hasAny) {
    showToast('Chưa có ca làm việc', 'Vui lòng chọn ít nhất một ca.', 'error');
    return;
  }
  closeCreateView();
  // Reset status về pending cho tuần mới tạo
  const stKey = String(currentWeekOffset);
  weekStatus[stKey] = {};
  employees.forEach(emp => { weekStatus[stKey][emp.id] = Array(7).fill('pending'); });
  renderTable();
  updateActionButtons();
  showToast('Thêm lịch làm việc thành công!', 'Lịch làm việc đã được thêm vào.', 'success');
}

// ===== EDIT VIEW =====
function openEditView() {
  document.getElementById('scheduleView').style.display = 'none';
  document.getElementById('editView').classList.add('active');
  document.getElementById('editWeekRange').textContent = getWeekRange(currentWeekOffset);
  document.getElementById('editBadgeCurrent').style.display = currentWeekOffset === 0 ? 'inline-block' : 'none';
  renderEditTable();
}

function closeEditView() {
  document.getElementById('editView').classList.remove('active');
  document.getElementById('scheduleView').style.display = 'block';
}

// Track ô đã thay đổi: changedCells[empId][dayIdx] = newVal
let changedCells = {};

function makeEditPicker(empId, dayIdx, currentVal, dotStatus) {
  const id  = `epicker-${empId}-${dayIdx}`;
  const bg  = currentVal ? getShiftBg(currentVal)    : 'white';
  const clr = currentVal ? getShiftColor(currentVal) : '#999';
  const lbl = currentVal || '---';
  // Chỉ hiện dot nếu ô có ca
  const dotHtml = currentVal
    ? `<span class="dot ${dotClass(dotStatus)}" id="edot-${empId}-${dayIdx}"></span>`
    : `<span class="dot" id="edot-${empId}-${dayIdx}" style="visibility:hidden"></span>`;

  const optionsHtml = [
    `<div class="shift-option" style="background:#f5f5f5;color:#999;text-align:center"
       onclick="selectEditShift('${id}',null,${empId},${dayIdx})">---</div>`,
    ...SHIFT_OPTS.map(o =>
      `<div class="shift-option ${o.cls}"
         onclick="selectEditShift('${id}','${o.key}',${empId},${dayIdx})">${o.label}</div>`
    )
  ].join('');

  return `
    <div class="shift-picker" id="${id}" data-value="${currentVal || ''}" data-orig="${currentVal || ''}">
      <button type="button" class="shift-picker-btn ${currentVal ? 'has-value' : ''}"
        style="background:${bg};color:${clr};border-color:${currentVal ? 'transparent' : ''};justify-content:space-between"
        onclick="togglePicker('${id}',event)">
        <span style="flex:1;text-align:center" class="picker-label">${lbl}</span>
        <span style="display:flex;align-items:center;gap:3px;flex-shrink:0">
          ${dotHtml}
          <span class="shift-picker-arrow">▼</span>
        </span>
      </button>
      <div class="shift-picker-dropdown">${optionsHtml}</div>
    </div>
  `;
}

function selectEditShift(pickerId, key, empId, dayIdx) {
  const picker = document.getElementById(pickerId);
  const btn    = picker.querySelector('.shift-picker-btn');
  const label  = btn.querySelector('.picker-label');
  const dot    = document.getElementById(`edot-${empId}-${dayIdx}`);

  if (key) {
    btn.style.background   = getShiftBg(key);
    btn.style.color        = getShiftColor(key);
    btn.style.borderColor  = 'transparent';
    btn.className = 'shift-picker-btn has-value';
    label.textContent = key;
    picker.dataset.value = key;
    // Hiện dot vàng khi chọn ca
    if (dot) { dot.style.visibility = 'visible'; dot.className = 'dot dot-yellow'; }
  } else {
    btn.style.background  = 'white';
    btn.style.color       = '#999';
    btn.style.borderColor = '';
    btn.className = 'shift-picker-btn';
    label.textContent = '---';
    picker.dataset.value = '';
    // Ẩn dot khi xóa ca
    if (dot) dot.style.visibility = 'hidden';
  }

  picker.querySelector('.shift-picker-dropdown').classList.remove('open');

  if (!changedCells[empId]) changedCells[empId] = {};
  changedCells[empId][dayIdx] = key || null;
  renderEditTotals();
}

function renderEditTable() {
  changedCells = {};
  const tbody = document.getElementById('editBody');
  tbody.innerHTML = '';
  const sched = getSchedule(currentWeekOffset);
  const st    = getStatus(currentWeekOffset);

  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${sched[emp.id].map((s, i) => `
        <td>
          ${makeEditPicker(emp.id, i, s, st[emp.id][i])}
        </td>
      `).join('')}
    `;
    tbody.appendChild(tr);
  });
  renderEditTotals();
}

function renderEditTotals() {
  const sched  = getSchedule(currentWeekOffset);
  const counts = { M5: 0, A1: 0, E9: 0, M6SS: 0, DO: 0 };
  employees.forEach(emp => {
    sched[emp.id].forEach((s, i) => {
      const val = (changedCells[emp.id] && changedCells[emp.id][i] !== undefined)
        ? changedCells[emp.id][i] : s;
      if (val && counts[val] !== undefined) counts[val]++;
    });
  });
  const colors = { M5: '#1565c0', A1: '#4338ca', E9: '#c2410c', M6SS: '#9d174d', DO: '#b91c1c' };
  document.getElementById('editTotals').innerHTML = Object.entries(counts).map(([key, val]) => `
    <div class="total-item">
      <span class="total-badge" style="background:${colors[key]};color:white">${key[0]}</span>${val}
    </div>
  `).join('');
}

function saveEditView() {
  const key = String(currentWeekOffset);
  const st  = getStatus(currentWeekOffset);

  employees.forEach(emp => {
    Array.from({length: 7}, (_, i) => {
      const picker = document.getElementById(`epicker-${emp.id}-${i}`);
      if (!picker) return;
      const newVal = picker.dataset.value || null;
      const orig   = picker.dataset.orig || null;
      weekSchedules[key][emp.id][i] = newVal;
      // Nếu ô đã thay đổi → reset dot về pending (vàng)
      if (newVal !== orig) {
        st[emp.id][i] = 'pending';
      }
    });
  });

  closeEditView();
  renderTable();
  updateActionButtons();
  showToast('Cập nhật thành công!', 'Lịch làm việc đã được sửa.', 'success');
}

// ===== MODAL (Sửa lịch) =====
function openModal(mode) {
  document.getElementById('modalTitle').textContent =
    mode === 'create' ? 'Tạo lịch làm việc' : 'Sửa lịch làm việc';
  populateEmpSelect();
  buildShiftInputs();
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('scheduleModal').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('scheduleModal').classList.remove('active');
}

function populateEmpSelect() {
  document.getElementById('empSelect').innerHTML =
    '<option value="">-- Chọn nhân viên --</option>' +
    employees.map(e => `<option value="${e.id}">${e.name} - ${e.role}</option>`).join('');
}

function buildShiftInputs() {
  const opts = Object.keys(SHIFTS).map(k => `<option value="${k}">${k}</option>`).join('');
  document.getElementById('shiftInputRow').innerHTML =
    '<span>Ca làm</span>' +
    ['T2','T3','T4','T5','T6','T7','CN'].map((_, i) =>
      `<select id="shiftDay${i}">${opts}</select>`
    ).join('');
}

function saveSchedule() {
  const empId = parseInt(document.getElementById('empSelect').value);
  if (!empId) { showToast('Thiếu thông tin', 'Vui lòng chọn nhân viên.', 'error'); return; }
  const newSchedule = Array.from({ length: 7 }, (_, i) =>
    document.getElementById(`shiftDay${i}`).value
  );
  const key = String(currentWeekOffset);
  if (!weekSchedules[key]) getSchedule(currentWeekOffset);
  weekSchedules[key][empId] = newSchedule;
  renderTable();
  updateActionButtons();
  closeModal();
  showToast('Cập nhật thành công!', 'Lịch làm việc đã được sửa.', 'success');
}

// ===== DELETE =====
function confirmDelete() {
  document.getElementById('deleteOverlay').classList.add('active');
  document.getElementById('deleteModal').classList.add('active');
}

function closeDelete() {
  document.getElementById('deleteOverlay').classList.remove('active');
  document.getElementById('deleteModal').classList.remove('active');
}

function deleteSchedule() {
  const key = String(currentWeekOffset);
  employees.forEach(emp => { weekSchedules[key][emp.id] = Array(7).fill(null); });
  delete weekStatus[key];
  closeDelete();
  renderTable();
  updateActionButtons();
  showToast('Xóa lịch làm việc thành công!', 'Lịch làm việc của tuần đã được thêm xóa.', 'success');
}

// ===== TOAST =====
function showToast(title, desc = '', type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent  = desc;
  document.getElementById('toastIcon').textContent  = type === 'success' ? '✓' : '✕';
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateWeekUI();
  renderTable();
});
