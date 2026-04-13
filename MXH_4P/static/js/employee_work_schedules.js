const SHIFTS = {
  M5:   { label: 'M5',   cls: 's-ms'   },
  A1:   { label: 'A1',   cls: 's-a1'   },
  E9:   { label: 'E9',   cls: 's-e9'   },
  M6SS: { label: 'M6SS', cls: 's-mgss' },
  DO:   { label: 'DO',   cls: 's-do'   },
};

// Data from database (injected by template)
let scheduleData = typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA : {};
let myUserId = typeof MY_USER_ID !== 'undefined' ? MY_USER_ID : null;
let weekStart = typeof WEEK_START !== 'undefined' ? WEEK_START : null;

// Convert schedule data to array format
const employees = Object.entries(scheduleData).map(([id, data]) => ({
  id: parseInt(id),
  name: data.full_name,
  role: 'Nhân viên'
}));

// Build week schedules from database
const weekSchedules = {};
weekSchedules['0'] = {};

// Parse schedules for current week
Object.entries(scheduleData).forEach(([empId, empData]) => {
  const schedules = empData.schedules;
  const weekArray = Array(7).fill(null);
  
  // Fill in schedules for each day of the week
  Object.entries(schedules).forEach(([dateStr, schedule]) => {
    const date = new Date(dateStr);
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0
    weekArray[dayOfWeek] = schedule.shift_code;
  });
  
  weekSchedules['0'][parseInt(empId)] = weekArray;
});

// Status tracking for current user
const weekStatus = {};

function getMyStatus(offset) {
  const key = String(offset);
  if (!weekStatus[key]) {
    weekStatus[key] = Array(7).fill('pending');
    
    // Load status from database for current week
    if (offset === 0 && scheduleData[myUserId]) {
      const mySchedules = scheduleData[myUserId].schedules;
      Object.entries(mySchedules).forEach(([dateStr, schedule]) => {
        const date = new Date(dateStr);
        const dayOfWeek = (date.getDay() + 6) % 7;
        const status = schedule.status === 1 ? 'accepted' : schedule.status === 2 ? 'rejected' : 'pending';
        weekStatus[key][dayOfWeek] = status;
      });
    }
  }
  return weekStatus[key];
}

function dotClass(s) {
  return s === 'accepted' ? 'dot-green' : s === 'rejected' ? 'dot-red' : 'dot-yellow';
}

let currentWeekOffset = 0;

function getCurrentMonday() {
  if (weekStart) {
    const parts = weekStart.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const mon = new Date(today);
  mon.setDate(today.getDate() - dow);
  mon.setHours(0,0,0,0);
  return mon;
}

function getWeekRange(offset) {
  const base = getCurrentMonday();
  const start = new Date(base);
  start.setDate(base.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

function getSchedule(offset) {
  const key = String(offset);
  if (!weekSchedules[key]) {
    const empty = {};
    employees.forEach(emp => { empty[emp.id] = Array(7).fill(null); });
    weekSchedules[key] = empty;
  }
  return weekSchedules[key];
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
}

const SHIFT_INFO = {
  M5:   { name: 'Ca Sáng',    time: '5:00 - 13:00', bg: '#1565c0' },
  A1:   { name: 'Ca Chiều',   time: '13:00 - 21:00', bg: '#7c3aed' },
  E9:   { name: 'Ca Tối',     time: '21:00 - 5:00',  bg: '#c2410c' },
  M6SS: { name: 'Ca Đặc Biệt',time: '6:00 - 18:00',  bg: '#9d174d' },
  DO:   { name: 'Nghỉ',       time: 'Day Off',        bg: '#b91c1c' },
};

const DAYS_VI = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'];

let feedbackDayIdx = null;
let feedbackScheduleId = null;

function openFeedback(dayIdx) {
  const sched = getSchedule(currentWeekOffset);
  const shift = sched[myUserId][dayIdx];
  if (!shift) return;

  const st = getMyStatus(currentWeekOffset);
  if (st[dayIdx] !== 'pending') return;

  feedbackDayIdx = dayIdx;

  // Get schedule ID from database
  const base = getCurrentMonday();
  const day = new Date(base);
  day.setDate(base.getDate() + currentWeekOffset * 7 + dayIdx);
  const dateStr = day.toISOString().split('T')[0];
  
  if (scheduleData[myUserId] && scheduleData[myUserId].schedules[dateStr]) {
    feedbackScheduleId = scheduleData[myUserId].schedules[dateStr].id;
  }

  const myName = scheduleData[myUserId]?.full_name || 'Bạn';
  document.getElementById('fbEmpName').textContent = myName;
  document.getElementById('fbDate').textContent = DAYS_VI[dayIdx] + ', ' + day.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });

  const info = SHIFT_INFO[shift];
  document.getElementById('fbShiftIcon').textContent = shift;
  document.getElementById('fbShiftIcon').style.background = info.bg;
  document.getElementById('fbShiftName').textContent = info.name;
  document.getElementById('fbShiftTime').textContent = info.time;

  document.getElementById('fbReason').value = '';
  document.getElementById('fbCharCount').textContent = '0 / 500 ký tự';

  document.getElementById('fbOverlay').classList.add('active');
  document.getElementById('feedbackModal').classList.add('active');
}

function closeFeedback() {
  document.getElementById('fbOverlay').classList.remove('active');
  document.getElementById('feedbackModal').classList.remove('active');
  feedbackDayIdx = null;
  feedbackScheduleId = null;
}

function submitFeedback(decision) {
  if (feedbackDayIdx === null) return;
  const reason = document.getElementById('fbReason').value.trim();
  if (decision === 'rejected' && reason.length < 10) {
    showToast('Thiếu lý do', 'Lý do cần ít nhất 10 ký tự để gửi từ chối.', 'error');
    return;
  }
  
  // TODO: Send to server via AJAX
  // For now, just update UI
  const st = getMyStatus(currentWeekOffset);
  st[feedbackDayIdx] = decision;
  const dot = document.getElementById(`mydot-${feedbackDayIdx}`);
  if (dot) dot.className = `dot ${dotClass(decision)}`;
  closeFeedback();
  if (decision === 'accepted') showToast('Đã chấp nhận ca!', 'Ca làm việc đã được xác nhận.', 'success');
  else showToast('Đã từ chối ca!', 'Phản hồi của bạn đã được ghi nhận.', 'error');
}

function renderTable() {
  const tbody = document.getElementById('scheduleBody');
  tbody.innerHTML = '';
  const sched = getSchedule(currentWeekOffset);
  const mySt  = getMyStatus(currentWeekOffset);

  employees.forEach(emp => {
    const isMe = emp.id === myUserId;
    const tr = document.createElement('tr');
    if (isMe) tr.classList.add('my-row');

    const empSchedule = sched[emp.id] || Array(7).fill(null);
    
    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}${isMe ? ' <span style="font-size:10px;background:#3498db;color:white;padding:1px 6px;border-radius:4px">Bạn</span>' : ''}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${empSchedule.map((s, i) => {
        if (!s) return `<td><span class="shift-empty">—</span></td>`;
        const dotId   = isMe ? `id="mydot-${i}"` : '';
        const dotCls  = isMe ? dotClass(mySt[i]) : 'dot-yellow';
        const onclick = isMe ? `onclick="openFeedback(${i})" title="Bấm để phản hồi ca làm việc"` : '';
        return `<td>
          <span class="shift-cell ${SHIFTS[s]?.cls || ''}">
            ${SHIFTS[s]?.label || s}
            <span class="dot ${dotCls}" ${dotId} ${onclick}></span>
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
  employees.forEach(emp => {
    const empSchedule = sched[emp.id] || [];
    empSchedule.forEach(s => { if (s && counts.hasOwnProperty(s)) counts[s]++; });
  });
  const colors = { M5:'#1565c0', A1:'#4338ca', E9:'#c2410c', M6SS:'#9d174d', DO:'#b91c1c' };
  document.getElementById('shiftTotals').innerHTML = Object.entries(counts).map(([k,v]) =>
    `<div class="total-item"><span class="total-badge" style="background:${colors[k]};color:white">${k[0]}</span>${v}</div>`
  ).join('');
}

function showToast(title, desc='', type='success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent  = desc;
  document.getElementById('toastIcon').textContent  = type === 'success' ? '✓' : '✕';
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  updateWeekUI();
  renderTable();
});
