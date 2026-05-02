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

// Build week schedules từ scheduleData (tuần đang xem)
const weekSchedules = {};
weekSchedules['0'] = {};

// Parse schedules cho offset=0 (tuần đang xem = WEEK_START)
Object.entries(scheduleData).forEach(([empId, empData]) => {
  const arr = Array(7).fill(null);
  const [wy, wm, wd] = WEEK_START.split('-').map(Number);
  Object.entries(empData.schedules || {}).forEach(([dateStr, rec]) => {
    // Tìm index ngày trong tuần
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    const diff = Math.round((new Date(dy, dm-1, dd) - new Date(wy, wm-1, wd)) / 86400000);
    if (diff >= 0 && diff < 7) {
      const shiftMap = { MS:'M5', M5:'M5', A1:'A1', E9:'E9', M6SS:'M6SS', DO:'DO' };
      arr[diff] = shiftMap[rec.shift_code] || rec.shift_code;
    }
  });
  weekSchedules['0'][parseInt(empId)] = arr;
});

console.log('weekSchedules[0] built for', Object.keys(weekSchedules['0']).length, 'employees');

// Status tracking — load từ MY_STATUS_MAP (tất cả ca của user hiện tại)
const weekStatus = {};

function getMyStatus(offset) {
  const key = String(offset);
  if (!weekStatus[key]) {
    weekStatus[key] = Array(7).fill(null);
    const [wy, wm, wd] = WEEK_START.split('-').map(Number);
    // Tính ngày thực tế của tuần theo offset (relative to WEEK_START)
    const weekDiff = offset - currentWeekOffset;
    for (let i = 0; i < 7; i++) {
      const d = new Date(wy, wm - 1, wd + weekDiff * 7 + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const rec = MY_STATUS_MAP[dateStr];
      if (rec) {
        weekStatus[key][i] = rec.status === 1 ? 'accepted' : rec.status === 2 ? 'rejected' : 'pending';
      }
    }
  }
  return weekStatus[key];
}

// Lấy schedule ID từ MY_STATUS_MAP theo ngày
function getMyScheduleId(offset, dayIdx) {
  const [wy, wm, wd] = WEEK_START.split('-').map(Number);
  const weekDiff = offset - currentWeekOffset;
  const d = new Date(wy, wm - 1, wd + weekDiff * 7 + dayIdx);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return MY_STATUS_MAP[dateStr]?.id || null;
}

function dotClass(s) {
  return s === 'accepted' ? 'dot-green' : s === 'rejected' ? 'dot-red' : 'dot-yellow';
}

let currentWeekOffset = 0;

function getCurrentMonday() {
  if (weekStart) {
    const [y, m, d] = weekStart.split('-').map(Number);
    return new Date(y, m - 1, d); // local time, tránh timezone shift
  }
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const mon = new Date(today);
  mon.setDate(today.getDate() - dow);
  mon.setHours(0,0,0,0);
  return mon;
}

function getWeekRange(offset) {
  const today  = new Date();
  const dow    = (today.getDay() + 6) % 7;
  const curMon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
  const start  = new Date(curMon.getFullYear(), curMon.getMonth(), curMon.getDate() + offset * 7);
  const end    = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function getSchedule(offset) {
  const key = String(offset);
  if (weekSchedules[key]) return weekSchedules[key];

  const result = {};
  employees.forEach(emp => { result[emp.id] = Array(7).fill(null); });

  const shiftMap = { MS:'M5', M5:'M5', A1:'A1', E9:'E9', M6SS:'M6SS', DO:'DO' };

  // scheduleData chứa data của WEEK_START (offset=currentWeekOffset khi page load)
  // Khi offset == currentWeekOffset: dùng scheduleData trực tiếp
  // Khi offset != currentWeekOffset: chỉ có MY_STATUS_MAP cho user hiện tại

  if (offset === currentWeekOffset) {
    // Dùng scheduleData — đây là tuần đang xem
    employees.forEach(emp => {
      const empSchedules = scheduleData[emp.id]?.schedules || {};
      Object.entries(empSchedules).forEach(([dateStr, rec]) => {
        const [wy, wm, wd] = WEEK_START.split('-').map(Number);
        const [dy, dm, dd] = dateStr.split('-').map(Number);
        const diff = Math.round((new Date(dy, dm-1, dd) - new Date(wy, wm-1, wd)) / 86400000);
        if (diff >= 0 && diff < 7 && rec?.shift_code) {
          result[emp.id][diff] = shiftMap[rec.shift_code] || rec.shift_code;
        }
      });
    });
  } else {
    // Tuần khác: dùng MY_STATUS_MAP cho user hiện tại
    const [wy, wm, wd] = WEEK_START.split('-').map(Number);
    for (let i = 0; i < 7; i++) {
      const d = new Date(wy, wm - 1, wd + (offset - currentWeekOffset) * 7 + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const myRec = MY_STATUS_MAP[dateStr];
      if (myRec?.shift_code && result[myUserId]) {
        result[myUserId][i] = shiftMap[myRec.shift_code] || myRec.shift_code;
      }
    }
  }

  weekSchedules[key] = result;
  return result;
}

function changeWeek(dir) {
  const next = currentWeekOffset + dir;
  // Chỉ cho xem tối đa tuần sau (offset=1 so với tuần thực tế hôm nay)
  if (next > 1) return;

  const today  = new Date();
  const dow    = (today.getDay() + 6) % 7;
  const curMon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
  // Tính thứ 2 của tuần mới từ tuần thực tế hôm nay
  const newMon = new Date(curMon.getFullYear(), curMon.getMonth(), curMon.getDate() + next * 7);
  const y = newMon.getFullYear();
  const m = String(newMon.getMonth() + 1).padStart(2, '0');
  const d = String(newMon.getDate()).padStart(2, '0');
  window.location.href = `/employee_work_schedules/?week=${y}-${m}-${d}`;
}

function updateWeekUI() {
  document.getElementById('weekRange').textContent = getWeekRange(currentWeekOffset);
  document.getElementById('badgeCurrent').style.display = currentWeekOffset === 0 ? 'inline-block' : 'none';
  const btnNext = document.getElementById('btnNext');
  if (btnNext) btnNext.style.display = currentWeekOffset >= 1 ? 'none' : 'inline-block';
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
  if (currentWeekOffset < 0) return; // tuần trước không cho phản hồi
  const sched = getSchedule(currentWeekOffset);
  const shift = sched[myUserId] && sched[myUserId][dayIdx];
  if (!shift) return;

  const st = getMyStatus(currentWeekOffset);
  if (st[dayIdx] === 'accepted' || st[dayIdx] === 'rejected') return;

  feedbackDayIdx = dayIdx;
  feedbackScheduleId = getMyScheduleId(currentWeekOffset, dayIdx);

  // Tính ngày hiển thị — WEEK_START là thứ 2 của tuần đang xem (offset=currentWeekOffset)
  const [wy, wm, wd] = WEEK_START.split('-').map(Number);
  const dayDate = new Date(wy, wm - 1, wd + dayIdx);
  const dayStr  = dayDate.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });

  const myName = scheduleData[myUserId]?.full_name || 'Bạn';
  document.getElementById('fbEmpName').textContent = myName;
  document.getElementById('fbDate').textContent    = DAYS_VI[dayIdx] + ', ' + dayStr;

  const info = SHIFT_INFO[shift] || { name: shift, time: '', bg: '#888' };
  document.getElementById('fbShiftIcon').textContent      = shift;
  document.getElementById('fbShiftIcon').style.background = info.bg;
  document.getElementById('fbShiftName').textContent      = info.name;
  document.getElementById('fbShiftTime').textContent      = info.time;

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

async function submitFeedback(decision) {
  if (feedbackDayIdx === null) return;
  const reason = document.getElementById('fbReason').value.trim();
  if (decision === 'rejected' && reason.length < 10) {
    showToast('Thiếu lý do', 'Lý do cần ít nhất 10 ký tự để gửi từ chối.', 'error');
    return;
  }

  if (!feedbackScheduleId) {
    showToast('Lỗi', 'Không tìm thấy ID lịch làm việc.', 'error');
    return;
  }

  const statusVal = decision === 'accepted' ? 1 : 2;
  try {
    const res = await fetch(`/api/update_schedule_status/${feedbackScheduleId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN
      },
      body: JSON.stringify({ status: statusVal, employee_note: reason })
    });
    const data = await res.json();
    if (!data.success) {
      showToast('Lỗi', data.error || 'Không thể cập nhật.', 'error');
      return;
    }
  } catch (e) {
    showToast('Lỗi kết nối', 'Không thể gửi phản hồi.', 'error');
    return;
  }

  const st = getMyStatus(currentWeekOffset);
  st[feedbackDayIdx] = decision;
  const dot = document.getElementById(`mydot-${feedbackDayIdx}`);
  if (dot) {
    dot.className = `dot ${dotClass(decision)}`;
    dot.onclick = null;
    dot.style.cursor = 'default';
    dot.title = '';
  }
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
        const st = isMe ? mySt[i] : null;
        const isPastWeek = currentWeekOffset < 0;
        const isPending = !isPastWeek && isMe && (!st || st === 'pending');

        let dotCls;
        if (isPastWeek) {
          dotCls = 'dot-green'; // tuần trước: tất cả xanh
        } else if (isMe) {
          dotCls = st === 'accepted' ? 'dot-green' : st === 'rejected' ? 'dot-red' : 'dot-yellow';
        } else {
          dotCls = 'dot-yellow'; // nhân viên khác: vàng
        }

        return `<td>
          <span class="shift-cell ${SHIFTS[s]?.cls || ''}">
            ${SHIFTS[s]?.label || s}
            <span class="dot ${dotCls}"
              ${isMe ? `id="mydot-${i}"` : ''}
              ${isPending ? `onclick="openFeedback(${i})" style="cursor:pointer" title="Bấm để phản hồi"` : 'style="cursor:default"'}
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
  employees.forEach(emp => {
    const empSchedule = sched[emp.id] || [];
    empSchedule.forEach(s => { if (s && counts.hasOwnProperty(s)) counts[s]++; });
  });
  const colors = { M5:'#1d4ed8', A1:'#7c3aed', E9:'#ea580c', M6SS:'#d97706', DO:'#dc2626' };
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
  const today  = new Date();
  const dow    = (today.getDay() + 6) % 7;
  const curMon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);

  const [wy, wm, wd] = WEEK_START.split('-').map(Number);
  const dbMon = new Date(wy, wm - 1, wd);

  const diffDays = Math.round((dbMon - curMon) / 86400000);
  currentWeekOffset = Math.round(diffDays / 7);

  console.log('WEEK_START:', WEEK_START, '| curMon:', `${curMon.getFullYear()}-${curMon.getMonth()+1}-${curMon.getDate()}`, '| offset:', currentWeekOffset);

  updateWeekUI();
  renderTable();
});
