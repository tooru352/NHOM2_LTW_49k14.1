const SHIFTS = {
  M5:   { label: 'M5',   cls: 's-ms'   },
  A1:   { label: 'A1',   cls: 's-a1'   },
  E9:   { label: 'E9',   cls: 's-e9'   },
  M6SS: { label: 'M6SS', cls: 's-mgss' },
  DO:   { label: 'DO',   cls: 's-do'   },
};

// ID nhân viên hiện tại (nhân viên đang đăng nhập)
const MY_EMP_ID = 2; // Hoàng Hải Yến

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

const weekSchedules = {};
weekSchedules['-1'] = {
  1:['A1','E9','M5','A1','DO','M5','E9'], 2:['M5','DO','A1','M5','E9','A1','M5'],
  3:['DO','M5','E9','A1','M5','M6SS','A1'], 4:['M5','A1','DO','E9','A1','M5','DO'],
  5:['E9','M5','M5','DO','A1','E9','M5'], 6:['A1','M6SS','A1','M5','DO','A1','E9'],
  7:['M5','A1','M5','A1','M5','DO','A1'], 8:['DO','M5','A1','M5','A1','M5','M5'],
  9:['M5','A1','DO','A1','M5','A1','DO'], 10:['A1','M5','M5','DO','A1','M5','A1'],
};
weekSchedules['0'] = {
  1:['M5','A1','E9','DO','E9','E9','A1'], 2:['M5','A1','E9','A1','A1','A1','DO'],
  3:['E9','M6SS','M6SS','DO','A1','DO','A1'], 4:['DO','M5','M5','DO','M5','A1','M5'],
  5:['DO','A1','DO','M5','DO','A1','M5'], 6:['A1','M5','M5','M6SS','M5','A1','A1'],
  7:['A1','M5','A1','DO','M6SS','M5','M5'], 8:['A1','M5','A1','DO','M6SS','M5','M5'],
  9:['A1','M5','A1','DO','M6SS','M5','M5'], 10:['A1','M5','A1','DO','M6SS','M5','M5'],
};

// Status chỉ lưu của nhân viên hiện tại: weekStatus[offset][dayIdx]
const weekStatus = {};

function getMyStatus(offset) {
  const key = String(offset);
  if (!weekStatus[key]) weekStatus[key] = Array(7).fill('pending');
  return weekStatus[key];
}

function dotClass(s) {
  return s === 'accepted' ? 'dot-green' : s === 'rejected' ? 'dot-red' : 'dot-yellow';
}

let currentWeekOffset = 0;

function getCurrentMonday() {
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
  if (next > 1) return; // xem tối đa 1 tuần tới
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

function openFeedback(dayIdx) {
  const sched = getSchedule(currentWeekOffset);
  const shift = sched[MY_EMP_ID][dayIdx];
  if (!shift) return;

  // Chỉ mở nếu dot đang vàng (pending)
  const st = getMyStatus(currentWeekOffset);
  if (st[dayIdx] !== 'pending') return;

  feedbackDayIdx = dayIdx;

  // Tính ngày
  const base = getCurrentMonday();
  const day  = new Date(base);
  day.setDate(base.getDate() + currentWeekOffset * 7 + dayIdx);
  const dateStr = day.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
  dateStr.charAt(0).toUpperCase();

  // Fill thông tin
  document.getElementById('fbEmpName').textContent = employees.find(e => e.id === MY_EMP_ID)?.name || '';
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
}

function submitFeedback(decision) {
  if (feedbackDayIdx === null) return;
  const reason = document.getElementById('fbReason').value.trim();
  if (decision === 'rejected' && reason.length < 10) {
    showToast('Thiếu lý do', 'Lý do cần ít nhất 10 ký tự để gửi từ chối.', 'error');
    return;
  }
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
    const isMe = emp.id === MY_EMP_ID;
    const tr = document.createElement('tr');
    if (isMe) tr.classList.add('my-row');

    tr.innerHTML = `
      <td class="col-emp">
        <div class="emp-name">${emp.name}${isMe ? ' <span style="font-size:10px;background:#3498db;color:white;padding:1px 6px;border-radius:4px">Bạn</span>' : ''}</div>
        <div class="emp-role">${emp.role}</div>
      </td>
      ${sched[emp.id].map((s, i) => {
        if (!s) return `<td><span class="shift-empty">—</span></td>`;
        const dotId   = isMe ? `id="mydot-${i}"` : '';
        const dotCls  = isMe ? dotClass(mySt[i]) : (() => { const r = Math.random(); return r < 0.4 ? 'dot-green' : r < 0.7 ? 'dot-yellow' : 'dot-red'; })();
        const onclick = isMe ? `onclick="openFeedback(${i})" title="Bấm để phản hồi ca làm việc"` : '';
        return `<td>
          <span class="shift-cell ${SHIFTS[s].cls}">
            ${SHIFTS[s].label}
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
  employees.forEach(emp => sched[emp.id].forEach(s => { if (s) counts[s]++; }));
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
