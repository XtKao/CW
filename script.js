// --- 1. ตั้งค่าตัวแปร ---
let usedWords = []; 
const wordInput = document.getElementById('wordInput');
const wordList = document.getElementById('wordList');
const statusBox = document.getElementById('statusBox');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const countSpan = document.getElementById('count');

const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

// --- คลังคำหลัก (Keywords) อัปเกรดใหม่ ---
// เพิ่ม "คำกริยา" (Action Words) เข้าไปเยอะๆ เพื่อแก้เคส ฝนตก, ตกสระ, กินข้าว
const commonKeywords = [
    // กริยา / อาการ (สำคัญมากสำหรับเคสของคุณ)
    "ตก", "ออก", "เข้า", "ขึ้น", "ลง", "ไป", "มา", "กิน", "นอน", "เล่น", "เดิน", "วิ่ง", 
    "ดู", "ฟัง", "ทำ", "เรียน", "สอน", "ขับ", "ขี่", "บิน", "ว่าย", "จับ", "ถือ", "วาง", 
    "รัก", "เกลียด", "ชอบ", "รู้", "คิด", "ฝัน", "เห็น", "มอง", "เปิด", "ปิด",
    
    // ธรรมชาติ
    "ป่า", "ไม้", "ต้น", "ดอก", "ใบ", "ผล", "ลูก", "ราก", 
    "น้ำ", "ไฟ", "ดิน", "ลม", "ฟ้า", "อากาศ", "เมฆ", "ฝน", "ดาว", "อาทิตย์", "จันทร์", "ทะเล", "ภูเขา", "หิน", "ทราย", "แสง",
    
    // สัตว์
    "หมา", "แมว", "นก", "กา", "ไก่", "เป็ด", "ปลา", "งู", "เสือ", "ช้าง", "ม้า", "วัว", "ควาย", "ลิง", "หมู", "มด", "ผึ้ง",
    
    // คน/อาชีพ/ความสัมพันธ์
    "คน", "มนุษย์", "ผู้", "นัก", "ชาว", "ช่าง", "หมอ", "ครู", "พ่อ", "แม่", "พี่", "น้อง", "ปู่", "ย่า", "ตา", "ยาย", "ลุง", "ป้า", "น้า", "อา", "ลูก", "หลาน", "เพื่อน", "แฟน",
    
    // สิ่งของ/สถานที่
    "บ้าน", "รถ", "เรือ", "เครื่อง", "ร้าน", "โรง", "ห้อง", "ทาง", "ถนน", "เมือง", "วัด", "ตลาด", "ยา", "ของ", "สี", "รูป", "ภาพ",
    
    // นามธรรม/คำนำหน้า
    "การ", "ความ", "ใจ", "งาน", "เงิน", "ทอง", "วัน", "คืน", "ปี", "เวลา"
];

// --- 2. ฟังก์ชันแยกคำ (System Scan) ---
function getWordParts(text) {
    let parts = new Set(); 

    // 2.1 สแกนหาคำหลักจากในคลัง (Force Detect)
    // ตรงนี้จะจับ "ตก" ใน "ฝนตก" และ "ตก" ใน "ตกสระ" ได้แน่นอน
    for (let keyword of commonKeywords) {
        if (text.includes(keyword)) {
            parts.add(keyword);
        }
    }

    // 2.2 ให้ AI ช่วยตัดคำส่วนที่เหลือ
    const segments = segmenter.segment(text);
    for (const segment of segments) {
        if (segment.isWordLike) {
            parts.add(segment.segment); 
        }
    }
    
    return Array.from(parts);
}

// --- 3. ฟังก์ชันหลัก ---
function submitWord() {
    const rawWord = wordInput.value.trim();
    if (!rawWord) return;

    // แยกชิ้นส่วนคำใหม่
    const newWordParts = getWordParts(rawWord);

    for (let oldWord of usedWords) {
        
        // แยกชิ้นส่วนคำเก่า
        const oldWordParts = getWordParts(oldWord);

        // เช็คการชนกันของชิ้นส่วน (Intersection)
        for (let newPart of newWordParts) {
            // กรองคำสั้นๆ ทิ้ง (เช่น สระลอยๆ) แต่ถ้าเป็นคำใน Keywords (เช่น ปู่, ย่า, งู) ให้ผ่าน
            if (newPart.length < 2) continue; 

            if (oldWordParts.includes(newPart)) {
                announceLoss(`แพ้! "${rawWord}" ซ้ำกับ "${oldWord}"\n(เพราะมีคำว่า "${newPart}" เหมือนกัน)`);
                return;
            }
        }
    }

    addWord(rawWord);
}

function addWord(word) {
    usedWords.push(word);
    
    const li = document.createElement('li');
    li.innerHTML = `<div>${word}</div> <span class="index">#${usedWords.length}</span>`;
    wordList.insertBefore(li, wordList.firstChild);
    
    updateStatus(`"${word}" ผ่าน! (ไม่ซ้ำใคร)`, "warning");
    
    countSpan.innerText = usedWords.length;
    wordInput.value = '';
    wordInput.focus();
}

function announceLoss(msg) {
    updateStatus(msg + " -> คัดออก!", "error");
    
    wordInput.value = '';
    wordInput.focus();
    
    statusBox.style.animation = 'none';
    statusBox.offsetHeight; 
    statusBox.style.animation = 'shake 0.5s';
}

function updateStatus(msg, type) {
    statusBox.style.display = 'block';
    statusBox.className = `status-box status-${type}`;
    statusBox.innerText = msg;
}

function resetGame() {
    if(confirm('ล้างกระดานเริ่มใหม่?')) {
        usedWords = [];
        wordList.innerHTML = '';
        countSpan.innerText = '0';
        statusBox.style.display = 'none';
        wordInput.value = '';
        wordInput.focus();
    }
}

wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWord();
});
submitBtn.addEventListener('click', submitWord);
restartBtn.addEventListener('click', resetGame);
