// --- 1. ส่วนกลาง (ใช้ทุกหน้า) ---

const API_HOST = "https://app-87q3k0clt-flasks-projects-987fd076.vercel.app";
const hostElement = document.getElementById('api-host');
if (hostElement) {
  hostElement.textContent = API_HOST;
}

// Helpers ที่ต้องตรวจสอบ Element ก่อน
const debug = document.getElementById('debug');
const createResult = document.getElementById('create-result');
// 💡 เปลี่ยนจาก usersArea เป็น attendanceList
const attendanceList = document.getElementById('attendance-list'); 

function setDebug(title, obj) {
  if (debug) {
    debug.textContent = `${title}\n\n${JSON.stringify(obj, null, 2)}`;
  }
}

function setCreateResult(r) {
  if (createResult) {
    createResult.textContent = JSON.stringify(r, null, 2);
  }
}

// Helper: apiFetch (เหมือนเดิม)
async function apiFetch(path, opts = {}) {
  const url = `${API_HOST}${path}`;
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { ...(opts.headers || {}), 'Content-Type': 'application/json' }
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: null, error: String(err) };
  }
}

// --- 2. ฟังก์ชันสำหรับแต่ละหน้า ---

// --- 💡 (สำหรับ index.html) - เขียนใหม่ ---
// --- (นี่คือฟังก์ชัน refreshUsers จากข้อ 10) ---
async function refreshUsers() {
  if (!attendanceList) return; 
  attendanceList.textContent = "กำลังโหลด...";
  const r = await apiFetch('/api/users', { method: 'GET' });

  if (!r.ok) {
    attendanceList.textContent = `เกิดข้อผิดพลาด: ${r.status || r.error}`;
    return;
  }
  const users = r.data || [];
  attendanceList.innerHTML = '';
  if (users.length === 0) {
    attendanceList.textContent = "ไม่มีผู้ใช้ในระบบ (ลองไปหน้า 'สร้าง' เพื่อเพิ่ม user)";
    return;
  }

  users.forEach(u => {
    // 💡 สร้าง URL รูป Avatar อัตโนมัติ (ขนาด 60px)
    const nameParam = encodeURIComponent(u.name);
    // (ใช้สีเขียวเดียวกับธีมเป็นพื้นหลัง)
    const avatarUrl = `https://ui-avatars.com/api/?name=${nameParam}&background=00A884&color=fff&size=60`;
    
    const nickname = u.role || u.email; 

    // 💡 เราใช้ <img class="avatar"> ตรงนี้
    const cardHTML = `
      <div class="student-card" data-user-id="${u.id}">
        <div class="student-info">
          <img src="${avatarUrl}" alt="${u.name}" class="avatar">
          <div class="student-details">
            <div class="student-name">${u.name}</div>
            <div class="student-nickname">${nickname}</div>
          </div>
        </div>
        <div class="button-group">
          <button class="status-btn present active" data-status="present">มาเรียน</button>
          <button class="status-btn late" data-status="late">มาสาย</button>
          <button class="status-btn sick" data-status="sick">ป่วย</button>
          <button class="status-btn absent" data-status="absent">ขาด</button>
        </div>
      </div>
    `;
    attendanceList.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// --- 💡 (สำหรับ index.html) - ฟังก์ชันใหม่สำหรับปุ่มสถานะ ---
function handleStatusClick(event) {
  const target = event.target;
  // ตรวจสอบว่าที่คลิกคือปุ่ม .status-btn จริงๆ
  if (!target.classList.contains('status-btn')) {
    return;
  }

  // 1. หา .button-group ที่เป็นแม่
  const buttonGroup = target.parentElement;
  // 2. หปุ่มทั้งหมดในกลุ่มนี้
  const allButtons = buttonGroup.querySelectorAll('.status-btn');
  // 3. เอา .active ออกจากทุกปุ่ม
  allButtons.forEach(btn => btn.classList.remove('active'));
  // 4. เพิ่ม .active ให้ปุ่มที่เพิ่งกด
  target.classList.add('active');

  // (Optional) แสดงผลการคลิก
  const card = target.closest('.student-card');
  const userId = card.dataset.userId;
  const status = target.dataset.status;
  console.log(`User ID: ${userId} เปลี่ยนสถานะเป็น: ${status}`);
  
  // (ขั้นสูง) ถ้าจะส่งข้อมูลนี้กลับไปที่ API จริงๆ
  // เราจะเรียกใช้ apiFetch(`/api/attendance/${userId}`, { method: 'POST', body: ... })
  // แต่ตอนนี้ให้ทำงานแค่ในหน้าเว็บก่อนครับ
}


// --- (สำหรับ health.html) ---
async function checkHealth() {
  const r = await apiFetch('/health', { method: 'GET' });
  setDebug('GET /health', r);
  alert(r.ok ? `Healthy: ${JSON.stringify(r.data)}` : `Health check failed: ${r.status || r.error}`);
}

// --- (สำหรับ create.html) ---
async function handleCreateSubmit(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = {};
  for (const [k, v] of fd.entries()) {
    if (v && v.trim() !== '') payload[k] = v.trim();
  }
  const r = await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setCreateResult(r); 
  setDebug('POST /api/users', r);
  if (r.ok) {
    alert('สร้างผู้ใช้สำเร็จ!');
    ev.target.reset();
  }
}

// --- (สำหรับ search.html) ---
async function handleGetById() {
  const id = document.getElementById('target-id').value.trim();
  if (!id) { alert('โปรดใส่ user id'); return; }
  const r = await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: 'GET' });
  setDebug(`GET /api/users/${id}`, r);
  if (r.ok) {
    alert(`พบผู้ใช้: ${r.data.name} (${r.data.email})`);
  } else {
    alert(`ไม่พบหรือเกิดข้อผิดพลาด: ${r.status}`);
  }
}

async function handleDeleteById() {
  const id = document.getElementById('target-id').value.trim();
  if (!id) { alert('โปรดใส่ user id'); return; }
  if (!confirm(`จะลบผู้ใช้ id='${id}' หรือไม่?`)) return;
  const r = await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
  setDebug(`DELETE /api/users/${id}`, r);
  if (r.ok) {
    alert(`ลบแล้ว: ${JSON.stringify(r.data)}`);
  } else {
    alert(`ลบไม่สำเร็จ: ${r.status}`);
  }
}

async function handleUpdateById(ev) {
  ev.preventDefault();
  const id = document.getElementById('target-id').value.trim();
  if (!id) { alert('โปรดใส่ user id'); return; }
  const fd = new FormData(document.getElementById('update-form'));
  const payload = {};
  for (const [k, v] of fd.entries()) {
    if (v && v.trim() !== '') payload[k] = v.trim();
  }
  if (Object.keys(payload).length === 0) {
    alert('โปรดใส่ field ที่ต้องการอัปเดต (name, email, role)');
    return;
  }
  const r = await apiFetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  setDebug(`PUT /api/users/${id}`, r);
  if (r.ok) {
    alert('อัปเดตสำเร็จ');
    document.getElementById('update-form').reset();
  } else {
    alert(`อัปเดตไม่สำเร็จ: ${r.status}`);
  }
}

// --- 3. ส่วนผูก Event (ตรวจสอบก่อนผูก) ---
document.addEventListener('DOMContentLoaded', () => {
  
  // -- 💡 หน้า index.html --
  if (attendanceList) {
    refreshUsers(); // โหลดครั้งแรกเมื่อเปิดหน้า
    // เพิ่ม Event Listener สำหรับปุ่มสถานะ
    attendanceList.addEventListener('click', handleStatusClick);
  }

  // -- (ลบปุ่ม Refresh ออก) --
  // const btnRefresh = document.getElementById('btn-refresh');
  // if (btnRefresh) { ... }

  // -- หน้า create.html --
  const createForm = document.getElementById('create-form');
  if (createForm) {
    createForm.addEventListener('submit', handleCreateSubmit);
  }

  // -- หน้า search.html --
  const btnGet = document.getElementById('btn-get');
  if (btnGet) {
    btnGet.addEventListener('click', handleGetById);
  }
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', handleDeleteById);
  }
  const btnPut = document.getElementById('btn-put');
  if (btnPut) {
    btnPut.addEventListener('click', handleUpdateById);
  }

  // -- หน้า health.html --
  const btnHealth = document.getElementById('btn-health');
  if (btnHealth) {
    btnHealth.addEventListener('click', checkHealth);
  }
});