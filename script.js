// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {

    // เลือกปุ่ม .status-btn ทั้งหมดในหน้า
    const allButtons = document.querySelectorAll('.status-btn');

    // วนลูปเพื่อเพิ่มอีเวนต์ให้ทุกปุ่ม
    allButtons.forEach(button => {
        
        button.addEventListener('click', (event) => {
            
            // 'clickedButton' คือปุ่มที่เพิ่งถูกคลิก
            const clickedButton = event.currentTarget;
            
            // 'buttonGroup' คือแถบสีเทา (div.button-group) ที่ปุ่มนี้อยู่
            const buttonGroup = clickedButton.parentElement;

            // 1. ค้นหาปุ่มทั้งหมดที่อยู่ในกลุ่มเดียวกัน
            const buttonsInGroup = buttonGroup.querySelectorAll('.status-btn');

            // 2. ลบคลาส 'active' ออกจากปุ่มทั้งหมดในกลุ่มนี้
            buttonsInGroup.forEach(btn => {
                btn.classList.remove('active');
            });

            // 3. เพิ่มคลาส 'active' ให้กับปุ่มที่ถูกคลิก
            clickedButton.classList.add('active');
        });
    });
});