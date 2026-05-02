
// ===== CONFIG =====
const SHIFTS = {
  M5:   { label: 'M5',   cls: 's-ms'   },
  A1:   { label: 'A1',   cls: 's-a1'   },
  E9:   { label: 'E9',   cls: 's-e9'   },
  M6SS: { label: 'M6SS', cls: 's-mgss' },
  DO:   { label: 'DO',   cls: 's-do'   },
};
const SHIFT_OPTS = [
  { key: 'M5',   cls: 'opt-ms',   label: 'M5'   },
  { key: 'A1',   cls: 'opt-a1',   label: 'A1'   },
  { key: 'E9',   cls: 'opt-e9',   label: 'E9'   },
  { key: 'M6SS', cls: 'opt-mgss', label: 'M6SS' },
  { key: 'DO',   cls: 'opt-do',   label: 'DO'   },
];
const SHIFT_INFO = {
  M5:   { name: 'Ca Sáng',     time: '5:00 - 13:00',  bg: '#1d4ed8' },
  A1:   { name: 'Ca Chiều',    time: '13:00 - 21:00', bg: '#7c3aed' },
  E9:   { name: 'Ca Tối',      time: '21:00 - 5:00',  bg: '#ea580c' },
  M6SS: { name: 'Ca Đặc Biệt', time: '6:00 - 14:00',  bg: '#d97706' },
  DO:   { name: 'Nghỉ',        time: 'Day Off',        bg: '#dc2626' },
};
const DAYS_VI = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'];

// ===== STATE =====
// employees & weekSchedules/weekStatus được khởi tạo từ DB_EMPLOYEES, DB_SCHEDULES
const employees = (typeof DB_EMPLOYEES !== 'undefined') ? DB_EMPLOYEES : [];
const weekSchedules = {}; // offset -> {empId: [7 shifts]}
const weekStatus    = {}; // offset -> {empId: [7 statuses]}
const scheduleIds   = {}; // offset -> {empId: [7 ids]}  (DB id)
let currentWeekOffset = 0;
let rejectContext = null;
let changedCells  = {};

// ===== INIT FROM DB =====
function initFromDB() {
  if (typeof DB_SCHEDULES === 'undefined' || typeof DB_WEEK_START === 'undefined') return;

  // Parse DB_WEEK_START an toàn (tránh timezone shift)
  const [dy, dm, dd] = DB_WEEK_START.split('-').map(Number);
  const dbMonday = new Date(dy, dm - 1, dd); // local time, không bị timezone

  const curMonday = getCurrentMonday();
  const diffWeeks = Math.round((dbMonday - curMonday) / (7 * 86400000));
  currentWeekOffset = diffWeeks; // ← sync offset với tuần đang xem
  const key = String(diffWeeks);

  weekSchedules[key] = {};
  weekStatus[key]    = {};
  scheduleIds[key]   = {};

  employees.forEach(emp => {
    weekSchedules[key][emp.id] = Array(7).fill(null);
    weekStatus[key][emp.id]    = Array(7).fill(null);
    scheduleIds[key][emp.id]   = Array(7).fill(null);

    for (let i = 0; i < 7; i++) {
      const day = new Date(dy, dm - 1, dd + i); // local time
      const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
      const rec = DB_SCHEDULES[emp.id] && DB_SCHEDULES[emp.id][dateStr];
      if (rec) {
        const shiftMap = { MS:'M5', M5:'M5', A1:'A1', E9:'E9', M6SS:'M6SS', DO:'DO' };
        weekSchedules[key][emp.id][i] = shiftMap[rec.shift] || rec.shift;
        const stMap = { 0:'pending', 1:'accepted', 2:'rejected' };
        weekStatus[key][emp.id][i]  = stMap[rec.status] ?? 'pending';
        scheduleIds[key][emp.id][i] = rec.id;
      }
    }
  });
}

// ===== HELPERS =====
function getCurrentMonday() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0=Mon
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
}

function getWeekDates(offset) {
  const base = getCurrentMonday();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset * 7 + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

function getWeekRange(offset) {
  const dates = getWeekDates(offset);
  const fmt = s => {
    const [y,m,d] = s.split('-');
    return `${d}/${m}/${y}`;
  };
  return `${fmt(dates[0])} - ${fmt(dates[6])}`;
}

function getSchedule(offset) {
  const key = String(offset);
  if (!weekSchedules[key]) {
    weekSchedules[key] = {};
    weekStatus[key]    = {};
    scheduleIds[key]   = {};
    employees.forEach(emp => {
      weekSchedules[key][emp.id] = Array(7).fill(null);
      weekStatus[key][emp.id]    = Array(7).fill(null);
      scheduleIds[key][emp.id]   = Array(7).fill(null);
    });
  }
  return weekSchedules[key];
}

function getStatus(offset) {
  getSchedule(offset);
  return weekStatus[String(offset)];
}

function getIds(offset) {
  getSchedule(offset);
  return scheduleIds[String(offset)];
}

function isWeekEmpty(offset) {
  const sched = getSchedule(offset);
  return employees.every(emp => (sched[emp.id] || []).every(s => !s));
}

function dotClass(status) {
  if (status === 'accepted') return 'dot-green';
  if (status === 'rejected') return 'dot-red';
  if (status === 'pending')  return 'dot-yellow';
  return 'dot-hidden';
}

function getShiftBg(key) {
  const map = { M5:'#BFECFF', A1:'#E0E7FF', E9:'#FDDCB5', M6SS:'#FEF3C7', DO:'#FFE4E6' };
  return map[key] || 'white';
}
function getShiftColor(key) {
  const map = { M5:'#1565c0', A1:'#3730a3', E9:'#c2410c', M6SS:'#d97706', DO:'#9f1239' };
  return map[key] || '#333';
}

// ===== API HELPERS =====
async function apiPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ===== WEEK UI =====
function changeWeek(dir) {
  const next = currentWeekOffset + dir;
  if (next > 1) return;
  currentWeekOffset = next;
  // Reload page với week param để lấy dữ liệu từ DB
  const dates = getWeekDates(currentWeekOffset);
  window.location.href = `/work_schedules_management/?week=${dates[0]}`;
}

function updateWeekUI() {
  document.getElementById('weekRange').textContent = getWeekRange(currentWeekOffset);
  const isCurrent = currentWeekOffset === 0;
  document.getElementById('badgeCurrent').style.display = isCurrent ? 'inline-block' : 'none';
  document.getElementById('btnNext').style.display = currentWeekOffset >= 1 ? 'none' : 'inline-block';
  updateActionButtons();
}

function updateActionButtons() {
  const btnCreate = document.getElementById('btnCreate');
  const btnEdit   = document.getElementById('btnEdit');
  const btnDel    = document.getElementById('btnDel');
  const empty     = isWeekEmpty(currentWeekOffset);

  if (currentWeekOffset < 0) {
    btnCreate.style.display = 'none';
    btnEdit.style.display   = 'none';
    btnDel.style.display    = 'none';
  } else {
    btnCreate.style.display = empty ? 'inline-flex' : 'none';
    btnEdit.style.display   = empty ? 'none' : 'inline-flex';
    btnDel.style.display    = empty ? 'none' : 'inline-flex';
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
    const empSched = sched[emp.id] || Array(7).fill(null);
    const empSt    = st[emp.id]    || Array(7).fill(null);

    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${empSched.map((s, i) => {
        if (!s) return `<td><span class="shift-empty">—</span></td>`;
        const dotCls = dotClass(empSt[i]);
        const isRejected = empSt[i] === 'rejected';
        return `<td>
          <span class="shift-cell ${SHIFTS[s]?.cls || ''}">
            ${SHIFTS[s]?.label || s}
            <span class="dot ${dotCls}"
              id="dot-${emp.id}-${i}"
              ${isRejected ? `onclick="openRejectPopup(${emp.id},${i})" style="cursor:pointer" title="Xem lý do từ chối"` : 'style="cursor:default"'}
            ></span>
          </span>
        </td>`;
      }).join('')}
    `;
    tbody.appendChild(tr);
  });
  renderTotals();
}

function renderTotals() {
  const sched = getSchedule(currentWeekOffset);
  const counts = { M5:0, A1:0, E9:0, M6SS:0, DO:0 };
  employees.forEach(emp => (sched[emp.id]||[]).forEach(s => { if (s && counts[s]!==undefined) counts[s]++; }));
  const colors = { M5:'#1d4ed8', A1:'#7c3aed', E9:'#ea580c', M6SS:'#d97706', DO:'#dc2626' };
  document.getElementById('shiftTotals').innerHTML = Object.entries(counts).map(([k,v]) =>
    `<div class="total-item"><span class="total-badge" style="background:${colors[k]};color:white">${k[0]}</span>${v}</div>`
  ).join('');
}

// ===== SHIFT PICKER =====
function togglePicker(id, e) {
  e.stopPropagation();
  document.querySelectorAll('.shift-picker-dropdown.open').forEach(d => {
    if (d.closest('.shift-picker').id !== id) d.classList.remove('open');
  });
  document.querySelector(`#${id} .shift-picker-dropdown`).classList.toggle('open');
}

document.addEventListener('click', () => {
  document.querySelectorAll('.shift-picker-dropdown.open').forEach(d => d.classList.remove('open'));
  const popup = document.getElementById('calPopup');
  if (popup) popup.classList.remove('open');
});

function makeShiftPicker(empId, dayIdx) {
  const id = `picker-${empId}-${dayIdx}`;
  const opts = SHIFT_OPTS.map(o =>
    `<div class="shift-option ${o.cls}" onclick="selectShift('${id}','${o.key}')">${o.label}</div>`
  ).join('');
  return `
    <div class="shift-picker" id="${id}">
      <button type="button" class="shift-picker-btn" onclick="togglePicker('${id}',event)">
        <span class="picker-label">---</span>
        <span class="shift-picker-arrow">▼</span>
      </button>
      <div class="shift-picker-dropdown">${opts}</div>
    </div>`;
}

function selectShift(pickerId, key) {
  const picker = document.getElementById(pickerId);
  const btn    = picker.querySelector('.shift-picker-btn');
  btn.style.background  = getShiftBg(key);
  btn.style.color       = getShiftColor(key);
  btn.style.borderColor = 'transparent';
  btn.className = 'shift-picker-btn has-value';
  btn.querySelector('.picker-label').textContent = key;
  picker.dataset.value = key;
  picker.querySelector('.shift-picker-dropdown').classList.remove('open');
  updateCreateTotals();
}

function makeEditPicker(empId, dayIdx, currentVal, dotStatus) {
  const id  = `epicker-${empId}-${dayIdx}`;
  const bg  = currentVal ? getShiftBg(currentVal)  : 'white';
  const clr = currentVal ? getShiftColor(currentVal): '#999';
  const lbl = currentVal || '---';
  const dotHtml = currentVal
    ? `<span class="dot ${dotClass(dotStatus)}" id="edot-${empId}-${dayIdx}"></span>`
    : `<span class="dot" id="edot-${empId}-${dayIdx}" style="visibility:hidden"></span>`;
  const opts = SHIFT_OPTS.map(o =>
    `<div class="shift-option ${o.cls}" onclick="selectEditShift('${id}','${o.key}',${empId},${dayIdx})">${o.label}</div>`
  ).join('');
  return `
    <div class="shift-picker" id="${id}" data-value="${currentVal||''}" data-orig="${currentVal||''}">
      <button type="button" class="shift-picker-btn ${currentVal?'has-value':''}"
        style="background:${bg};color:${clr};border-color:${currentVal?'transparent':''};justify-content:space-between"
        onclick="togglePicker('${id}',event)">
        <span style="flex:1;text-align:center" class="picker-label">${lbl}</span>
        <span style="display:flex;align-items:center;gap:3px;flex-shrink:0">
          ${dotHtml}<span class="shift-picker-arrow">▼</span>
        </span>
      </button>
      <div class="shift-picker-dropdown">${opts}</div>
    </div>`;
}

function selectEditShift(pickerId, key, empId, dayIdx) {
  const picker = document.getElementById(pickerId);
  const btn    = picker.querySelector('.shift-picker-btn');
  const dot    = document.getElementById(`edot-${empId}-${dayIdx}`);
  btn.style.background  = getShiftBg(key);
  btn.style.color       = getShiftColor(key);
  btn.style.borderColor = 'transparent';
  btn.className = 'shift-picker-btn has-value';
  btn.querySelector('.picker-label').textContent = key;
  picker.dataset.value = key;
  if (dot) { dot.style.visibility = 'visible'; dot.className = 'dot dot-yellow'; }
  picker.querySelector('.shift-picker-dropdown').classList.remove('open');
  if (!changedCells[empId]) changedCells[empId] = {};
  changedCells[empId][dayIdx] = key;
  renderEditTotals();
}

// ===== CREATE VIEW =====
function openCreateView() {
  document.getElementById('scheduleView').style.display = 'none';
  document.getElementById('editView').classList.remove('active');
  document.getElementById('createView').classList.add('active');
  const d = new Date(getCurrentMonday());
  d.setDate(d.getDate() + currentWeekOffset * 7);
  const year = d.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const sw1  = new Date(jan4);
  sw1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekNum = Math.round((d - sw1) / (7 * 86400000)) + 1;
  document.getElementById('weekDisplayText').textContent = `Week ${String(weekNum).padStart(2,'0')}, ${year}`;
  buildCalendar(d, weekNum);
  renderCreateTable();
}

function closeCreateView() {
  document.getElementById('createView').classList.remove('active');
  document.getElementById('scheduleView').style.display = 'block';
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
      ${Array.from({length:7}, (_,i) => `<td>${makeShiftPicker(emp.id, i)}</td>`).join('')}`;
    tbody.appendChild(tr);
  });
  updateCreateTotals();
}

function updateCreateTotals() {
  const counts = { M5:0, A1:0, E9:0, M6SS:0, DO:0 };
  document.querySelectorAll('#createBody .shift-picker[data-value]').forEach(p => {
    const v = p.dataset.value;
    if (v && counts[v] !== undefined) counts[v]++;
  });
  const colors = { M5:'#1d4ed8', A1:'#7c3aed', E9:'#ea580c', M6SS:'#d97706', DO:'#dc2626' };
  document.getElementById('createTotals').innerHTML = Object.entries(counts).map(([k,v]) =>
    `<div class="total-item"><span class="total-badge" style="background:${colors[k]};color:white">${k[0]}</span>${v}</div>`
  ).join('');
}

async function saveCreateView() {
  const dates   = getWeekDates(currentWeekOffset);
  const updates = [];
  let hasAny = false;

  employees.forEach(emp => {
    for (let i = 0; i < 7; i++) {
      const picker = document.getElementById(`picker-${emp.id}-${i}`);
      const val    = picker?.dataset.value || null;
      if (val) {
        hasAny = true;
        updates.push({
          action:     'create',
          user_id:    emp.id,
          shift_code: val,
          work_date:  dates[i],
          week_start: dates[0],
        });
      }
    }
  });

  if (!hasAny) { showToast('Chưa có ca làm việc', 'Vui lòng chọn ít nhất một ca.', 'error'); return; }

  try {
    console.log('Saving', updates.length, 'schedules, week:', dates[0]);
    const res = await apiPost('/api/batch_update_schedules/', { updates });
    console.log('API response:', res);
    if (res.success) {
      showToast('Thêm lịch làm việc thành công!', 'Lịch làm việc đã được thêm vào.', 'success');
      setTimeout(() => window.location.href = `/work_schedules_management/?week=${dates[0]}`, 1200);
    } else {
      showToast('Lỗi', res.error || 'Không thể tạo lịch.', 'error');
      console.error('saveCreateView error:', res);
    }
  } catch(e) {
    showToast('Lỗi kết nối', e.message, 'error');
    console.error(e);
  }
}

// ===== EDIT VIEW =====
function openEditView() {
  document.getElementById('scheduleView').style.display = 'none';
  document.getElementById('createView').classList.remove('active');
  document.getElementById('editView').classList.add('active');
  document.getElementById('editWeekRange').textContent = getWeekRange(currentWeekOffset);
  document.getElementById('editBadgeCurrent').style.display = currentWeekOffset === 0 ? 'inline-block' : 'none';
  changedCells = {};
  renderEditTable();
}

function closeEditView() {
  document.getElementById('editView').classList.remove('active');
  document.getElementById('scheduleView').style.display = 'block';
}

function renderEditTable() {
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
      ${(sched[emp.id]||Array(7).fill(null)).map((s,i) =>
        `<td>${makeEditPicker(emp.id, i, s, (st[emp.id]||[])[i])}</td>`
      ).join('')}`;
    tbody.appendChild(tr);
  });
  renderEditTotals();
}

function renderEditTotals() {
  const sched  = getSchedule(currentWeekOffset);
  const counts = { M5:0, A1:0, E9:0, M6SS:0, DO:0 };
  employees.forEach(emp => {
    (sched[emp.id]||[]).forEach((s,i) => {
      const val = (changedCells[emp.id] && changedCells[emp.id][i] !== undefined)
        ? changedCells[emp.id][i] : s;
      if (val && counts[val] !== undefined) counts[val]++;
    });
  });
  const colors = { M5:'#1d4ed8', A1:'#7c3aed', E9:'#ea580c', M6SS:'#d97706', DO:'#dc2626' };
  document.getElementById('editTotals').innerHTML = Object.entries(counts).map(([k,v]) =>
    `<div class="total-item"><span class="total-badge" style="background:${colors[k]};color:white">${k[0]}</span>${v}</div>`
  ).join('');
}

async function saveEditView() {
  const dates      = getWeekDates(currentWeekOffset);
  const ids        = getIds(currentWeekOffset);
  const updates    = [];

  employees.forEach(emp => {
    for (let i = 0; i < 7; i++) {
      const picker  = document.getElementById(`epicker-${emp.id}-${i}`);
      if (!picker) continue;
      const newVal  = picker.dataset.value || null;
      const origVal = picker.dataset.orig   || null;
      console.log(`emp=${emp.id} day=${i} orig=${origVal} new=${newVal} changed=${newVal !== origVal}`);
      if (newVal === origVal) continue;

      const schedId = (ids[emp.id]||[])[i];
      if (schedId && newVal) {
        // Có sẵn trong DB, đổi ca
        updates.push({ action:'update', schedule_id: schedId, shift_code: newVal });
      } else if (schedId && !newVal) {
        // Xóa ca
        updates.push({ action:'delete', schedule_id: schedId });
      } else if (!schedId && newVal) {
        // Chưa có trong DB, tạo mới
        updates.push({
          action:     'create',
          user_id:    emp.id,
          shift_code: newVal,
          work_date:  dates[i],
          week_start: dates[0],
        });
      }
    }
  });

  if (!updates.length) {
    showToast('Không có thay đổi', 'Bạn chưa chỉnh sửa ca nào.', 'error');
    closeEditView();
    return;
  }

  const res = await apiPost('/api/batch_update_schedules/', { updates });
  if (res.success) {
    showToast('Cập nhật thành công!', `Đã lưu ${updates.length} thay đổi.`, 'success');
    setTimeout(() => window.location.href = `/work_schedules_management/?week=${dates[0]}`, 1000);
  } else {
    showToast('Lỗi', res.error || 'Không thể cập nhật.', 'error');
  }
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

async function deleteSchedule() {
  const ids   = getIds(currentWeekOffset);
  const dates = getWeekDates(currentWeekOffset);
  const deletes = [];

  employees.forEach(emp => {
    (ids[emp.id]||[]).forEach(id => { if (id) deletes.push({ action:'delete', schedule_id: id }); });
  });

  closeDelete();
  if (!deletes.length) { showToast('Không có lịch để xóa', '', 'error'); return; }

  const res = await apiPost('/api/batch_update_schedules/', { updates: deletes });
  if (res.success) {
    showToast('Xóa lịch thành công!', 'Lịch làm việc của tuần đã được xóa.', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } else {
    showToast('Lỗi', res.error || 'Không thể xóa.', 'error');
  }
}

// ===== REJECT POPUP (quản lý) =====
function openRejectPopup(empId, dayIdx) {
  const sched = getSchedule(currentWeekOffset);
  const shift = (sched[empId]||[])[dayIdx];
  if (!shift) return;

  rejectContext = { empId, dayIdx };
  const emp  = employees.find(e => e.id === empId);
  const dates = getWeekDates(currentWeekOffset);
  const dateStr = dates[dayIdx];
  const [y,m,d] = dateStr.split('-');

  document.getElementById('rjEmpName').textContent  = emp?.name || '';
  document.getElementById('rjDate').textContent     = `${DAYS_VI[dayIdx]}, ${d}/${m}/${y}`;

  const info = SHIFT_INFO[shift] || { name: shift, time: '', bg: '#888' };
  const icon = document.getElementById('rjShiftIcon');
  icon.textContent       = shift;
  icon.style.background  = info.bg;
  document.getElementById('rjShiftName').textContent = info.name;
  document.getElementById('rjShiftTime').textContent = info.time;

  // Lấy lý do từ chối từ DB_SCHEDULES
  const rec = DB_SCHEDULES[empId] && DB_SCHEDULES[empId][dateStr];
  document.getElementById('rjReasonText').textContent =
    (rec && rec.employee_note) ? `"${rec.employee_note}"` : '"Nhân viên chưa cung cấp lý do."';

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

async function handleReassign() {
  // Sắp xếp lại: đóng popup và mở Edit View để quản lý chỉnh ca
  if (!rejectContext) return;
  const { empId, dayIdx } = rejectContext;
  const ids     = getIds(currentWeekOffset);
  const schedId = (ids[empId]||[])[dayIdx];
  const reply   = document.getElementById('rjReply').value.trim();

  // Lưu manager_note nếu có
  if (schedId && reply) {
    await apiPost(`/api/update_schedule/${schedId}/`, { manager_note: reply });
  }

  closeRejectPopup();
  // Mở Edit View để quản lý chỉnh sửa ca
  openEditView();
}

async function handleManagerCancel() {
  // Quản lý chấp nhận từ chối → status = accepted (xanh), dot chuyển xanh
  if (!rejectContext) return;
  const { empId, dayIdx } = rejectContext;
  const ids     = getIds(currentWeekOffset);
  const schedId = (ids[empId]||[])[dayIdx];
  const reply   = document.getElementById('rjReply').value.trim();

  if (!schedId) {
    showToast('Lỗi', 'Không tìm thấy ID lịch làm việc.', 'error');
    return;
  }

  // Cập nhật status = 1 (accepted) và lưu manager_note
  const res = await apiPost(`/api/update_schedule_status_manager/${schedId}/`, {
    status: 1,
    manager_note: reply,
  });

  if (!res.success) {
    showToast('Lỗi', res.error || 'Không thể cập nhật trạng thái.', 'error');
    return;
  }

  // Cập nhật dot thành xanh ngay lập tức
  const dot = document.getElementById(`dot-${empId}-${dayIdx}`);
  if (dot) {
    dot.className = 'dot dot-green';
    dot.style.cursor = 'default';
    dot.onclick = null;
    dot.title = '';
  }
  // Cập nhật weekStatus local
  if (weekStatus[String(currentWeekOffset)] && weekStatus[String(currentWeekOffset)][empId]) {
    weekStatus[String(currentWeekOffset)][empId][dayIdx] = 'accepted';
  }

  closeRejectPopup();
}

// ===== CALENDAR =====
function toggleCalPopup(e) {
  e.stopPropagation();
  document.getElementById('calPopup').classList.toggle('open');
}

function buildCalendar(activeMonday, activeWeekNum) {
  const month = activeMonday.getMonth();
  const year  = activeMonday.getFullYear();
  document.getElementById('calMonthTitle').textContent =
    activeMonday.toLocaleDateString('vi-VN', { month:'long', year:'numeric' }).replace(/^./, s => s.toUpperCase());
  const firstDay = new Date(year, month, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));
  const tbody = document.getElementById('calBody');
  tbody.innerHTML = '';
  for (let w = 0; w < 6; w++) {
    const rowStart = new Date(startDay);
    rowStart.setDate(startDay.getDate() + w * 7);
    const jan4w = new Date(rowStart.getFullYear(), 0, 4);
    const sw1   = new Date(jan4w);
    sw1.setDate(jan4w.getDate() - ((jan4w.getDay() + 6) % 7));
    const wn = Math.round((rowStart - sw1) / (7 * 86400000)) + 1;
    const isActive = wn === activeWeekNum && rowStart.getFullYear() === year;
    const tr = document.createElement('tr');
    if (isActive) tr.classList.add('active-week');
    let html = `<td class="week-num">${wn}</td>`;
    for (let d = 0; d < 7; d++) {
      const day = new Date(rowStart);
      day.setDate(rowStart.getDate() + d);
      html += `<td class="${day.getMonth() !== month ? 'other-month' : ''}">${day.getDate()}</td>`;
    }
    tr.innerHTML = html;
    tbody.appendChild(tr);
  }
}

// ===== TOAST =====
function showToast(title, desc = '', type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent  = desc;
  const iconWrap = document.getElementById('toastIconWrap');
  const iconSvg  = document.getElementById('toastIconSvg');

  if (type === 'success') {
    iconWrap.style.background = '#22c55e';
    // Dùng namespace SVG để tạo polyline đúng cách
    iconSvg.innerHTML = '';
    const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pl.setAttribute('points', '4 12 9 17 20 6');
    iconSvg.appendChild(pl);
  } else {
    iconWrap.style.background = '#ef4444';
    iconSvg.innerHTML = '';
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l1.setAttribute('x1','18'); l1.setAttribute('y1','6');
    l1.setAttribute('x2','6');  l1.setAttribute('y2','18');
    const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l2.setAttribute('x1','6');  l2.setAttribute('y1','6');
    l2.setAttribute('x2','18'); l2.setAttribute('y2','18');
    iconSvg.appendChild(l1);
    iconSvg.appendChild(l2);
  }
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initFromDB();
  updateWeekUI();
  renderTable();
  startPolling();
});

// ===== POLLING — tự động cập nhật dot khi nhân viên phản hồi =====
function startPolling() {
  setInterval(async () => {
    // Không poll khi đang ở edit/create view
    const editActive   = document.getElementById('editView')?.classList.contains('active');
    const createActive = document.getElementById('createView')?.classList.contains('active');
    if (editActive || createActive) return;

    try {
      const dates = getWeekDates(currentWeekOffset);
      const res = await fetch(`/api/week_schedule_status/?week=${dates[0]}`);
      const json = await res.json();
      if (!json.success) return;

      const stMap = { 0:'pending', 1:'accepted', 2:'rejected' };
      let changed = false;

      employees.forEach(emp => {
        const empData = json.data[emp.id];
        if (!empData) return;
        const key = String(currentWeekOffset);

        for (let i = 0; i < 7; i++) {
          const dateStr = dates[i];
          const rec = empData[dateStr];
          if (!rec) continue;

          const newStatus = stMap[rec.status] ?? 'pending';
          const oldStatus = (weekStatus[key]?.[emp.id]?.[i]);

          if (newStatus !== oldStatus) {
            // Cập nhật local state
            if (!weekStatus[key]) weekStatus[key] = {};
            if (!weekStatus[key][emp.id]) weekStatus[key][emp.id] = Array(7).fill(null);
            weekStatus[key][emp.id][i] = newStatus;

            // Cập nhật dot trực tiếp
            const dot = document.getElementById(`dot-${emp.id}-${i}`);
            if (dot) {
              dot.className = `dot ${dotClass(newStatus)}`;
              if (newStatus === 'rejected') {
                dot.style.cursor = 'pointer';
                dot.title = 'Xem lý do từ chối';
                dot.onclick = () => openRejectPopup(emp.id, i);
              } else {
                dot.style.cursor = 'default';
                dot.title = '';
                dot.onclick = null;
              }
            }

            // Cập nhật employee_note cho popup từ chối
            if (rec.employee_note && DB_SCHEDULES[emp.id]?.[dateStr]) {
              DB_SCHEDULES[emp.id][dateStr].employee_note = rec.employee_note;
            }
            changed = true;
          }
        }
      });

      if (changed) renderTotals();
    } catch(e) {
      // Bỏ qua lỗi mạng
    }
  }, 15000); // 15 giây
}
