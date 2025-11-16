// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. สร้างตัวแปรหลักเพื่อเก็บข้อมูล
    // เราจะใช้ object ที่มี key เป็น ID นักเรียน (s1, s2, s3)
    // และ value เป็นสถานะ (present, late, sick, absent)
    let attendanceData = {};

    // 2. ฟังก์ชัน: บันทึกข้อมูลลง localStorage (นี่คือส่วน "เก็บค่าไว้")
    function saveDataToStorage() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    // 3. ฟังก์ชัน: โหลดข้อมูลจาก localStorage หรือตั้งค่าเริ่มต้น
    function loadDataFromStorage() {
        const storedData = localStorage.getItem('attendanceData');

        if (storedData) {
            // ถ้ามีข้อมูลเก่า ให้ดึงมาใช้
            attendanceData = JSON.parse(storedData);
        } else {
            // ถ้าไม่มี (เข้าครั้งแรก) ให้สร้างข้อมูลดีฟอลต์ (ทุกคน "มาเรียน")
            document.querySelectorAll('.student-card').forEach(card => {
                const studentId = card.dataset.studentId;
                attendanceData[studentId] = 'present'; // ตั้งค่าดีฟอลต์เป็น 'present'
            });
            saveDataToStorage(); // บันทึกค่าดีฟอลต์ลง Storage
        }

        // อัปเดตหน้าเว็บ (ปุ่ม active) ให้ตรงกับข้อมูลที่โหลดมา
        updateUI();
    }

    // 4. ฟังก์ชัน: อัปเดต UI (ปุ่ม) ให้ตรงกับข้อมูลใน 'attendanceData'
    function updateUI() {
        document.querySelectorAll('.student-card').forEach(card => {
            const studentId = card.dataset.studentId;
            const currentStatus = attendanceData[studentId];

            // ลบ .active ออกจากทุกปุ่มในแถวนี้ก่อน
            card.querySelectorAll('.status-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // เพิ่ม .active ให้กับปุ่มที่สถานะตรงกัน
            const buttonToActivate = card.querySelector(`.status-btn[data-status="${currentStatus}"]`);
            if (buttonToActivate) {
                buttonToActivate.classList.add('active');
            }
        });
    }

    // 5. ฟังก์ชัน: ตั้งค่าการคลิกปุ่ม
    function setupButtonListeners() {
        const allButtons = document.querySelectorAll('.status-btn');
        allButtons.forEach(button => {
            
            button.addEventListener('click', (event) => {
                const clickedButton = event.currentTarget;
                const studentCard = clickedButton.closest('.student-card');
                
                const studentId = studentCard.dataset.studentId;
                const newStatus = clickedButton.dataset.status;

                // --- 1. ส่งค่าออกมา (แสดงใน Console ทันที) ---
                console.log(`ส่งค่า: นักเรียน ID ${studentId} เปลี่ยนสถานะเป็น ${newStatus}`);

                // --- 2. เก็บค่าไว้ (อัปเดต object และบันทึกลง Storage) ---
                attendanceData[studentId] = newStatus;
                saveDataToStorage();

                // อัปเดต UI (ย้าย .active)
                updateUI();
            });
        });
    }

    // 6. ฟังก์ชัน: ตั้งค่าปุ่ม "แสดงข้อมูลทั้งหมด"
    function setupExportButton() {
        const exportBtn = document.getElementById('export-button');
        exportBtn.addEventListener('click', () => {
            console.log("--- ข้อมูลการเช็คชื่อทั้งหมดที่เก็บไว้ ---");
            console.log(attendanceData);
            alert("ข้อมูลทั้งหมดถูกแสดงใน Console แล้ว (กด F12 เพื่อดู)");
        });
    }

    // --- สั่งให้โค้ดทำงาน ---
    loadDataFromStorage();    // โหลดข้อมูลตอนเริ่ม
    setupButtonListeners();   // ตั้งค่าการคลิกปุ่ม
    setupExportButton();      // ตั้งค่าปุ่ม export
});