// --- 1. ตั้งค่าตัวแปร ---
let usedWords = []; 
const wordInput = document.getElementById('wordInput');
const wordList = document.getElementById('wordList');
const statusBox = document.getElementById('statusBox');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const countSpan = document.getElementById('count');

// เรียกใช้ AI ตัดคำ
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

// --- 2. แยกคลังคำกริยา (Action Words) ออกมาเพื่อใช้แจ้งเตือน ---
const actionKeywords = new Set([
    "กิน", "ทาน", "ดื่ม", "นอน", "หลับ", "ตื่น", 
    "เดิน", "วิ่ง", "นั่ง", "ยืน", "โดด", "กระโดด", 
    "มา", "ไป", "กลับ", "ออก", "เข้า", "ขึ้น", "ลง", "ตก", "หล่น", 
    "ดู", "มอง", "เห็น", "จ้อง", "ฟัง", "ดม", 
    "พูด", "คุย", "บอก", "กล่าว", "เล่า", "ถาม", "ตอบ", "ด่า", "บ่น", "ร้อง", "เรียก",
    "ทำ", "สร้าง", "ก่อ", "ผลิต", "ใช้", "เก็บ", "หา", "เจอ", "พบ", 
    "รัก", "ชอบ", "เกลียด", "โกรธ", "กลัว", "ตกใจ", "ดีใจ", "เสียใจ",
    "คิด", "รู้", "จำ", "ลืม", "ฝัน", "เรียน", "สอน", "อ่าน", "เขียน",
    "เล่น", "แข่ง", "ชนะ", "แพ้", 
    "ซื้อ", "ขาย", "จ่าย", "แจก", "แลก",
    "ขับ", "ขี่", "บิน", "ลอย", "จม", "ว่าย", "พาย",
    "เปิด", "ปิด", "ดับ", "ติด", 
    "ตี", "ตบ", "ต่อย", "ชน", "ยิง", "แทง", "ฟัน", "ฆ่า", "ตาย", "เจ็บ", "ปวด", "ป่วย",
    "ล้าง", "ซัก", "อาบ", "เช็ด", "ถู", "กวาด"
]);

// --- 3. คลังคำรวม (ใช้สำหรับเช็คว่า "ซ้ำ" หรือไม่) ---
// เอาคำกริยามารวมกับคำนามอื่นๆ เพื่อใช้ดักจับคำซ้ำ
const allKeywords = [
    ...actionKeywords, // เอากริยาข้างบนมารวมด้วย
    
    // หมวดอวัยวะ/ร่างกาย
    "ใจ", "จิต", "วิญญาณ", "อารมณ์", "นิสัย",
    "หัว", "หน้า", "ตา", "หู", "จมูก", "ปาก", "ฟัน", "ลิ้น", "คอ", 
    "แขน", "มือ", "นิ้ว", "เล็บ", "ขา", "เท้า", "เข่า",
    "ผม", "ขน", "หนัง", "เนื้อ", "เลือด", "กระดูก", "ท้อง", "ไส้", "อก", "เอว", "หลัง",
    "ตัว", "กาย", "รูป", "ร่าง", "ศพ",

    // หมวดธรรมชาติ
    "น้ำ", "ไฟ", "ลม", "ดิน", "อากาศ", 
    "ฟ้า", "เมฆ", "ฝน", "หมอก", "แดด", "รุ้ง",
    "ดาว", "อาทิตย์", "จันทร์", "ตะวัน", "โลก",
    "ป่า", "ไม้", "ต้น", "ดอก", "ใบ", "ผล", "ลูก", "ราก",
    "ภู", "เขา", "ดอย", "ถ้ำ", "หิน", "ทราย", "ทอง", "เงิน", "เพชร",
    "ทะเล", "หาด", "เกาะ", "แม่น้ำ", "คลอง", "บึง", "สระ",

    // หมวดคน/สถานที่/สิ่งของ
    "คน", "มนุษย์", "ผู้", "ชาว", "นัก", "ช่าง", "หมอ", "ครู", "พระ",
    "พ่อ", "แม่", "ปู่", "ย่า", "ตา", "ยาย", "ลุง", "ป้า", "น้า", "อา", "ลูก", "หลาน", "พี่", "น้อง", "เพื่อน", "แฟน",
    "บ้าน", "เรือน", "หอ", "ตึก", "อาคาร", "โรง", "ร้าน", "ห้าง", "ตลาด", "วัด", "ห้อง",
    "ทาง", "ถนน", "ซอย", "เมือง", "กรุง", "ประเทศ", "จังหวัด", "ไทย", "จีน", "ลาว", "พม่า",
    "รถ", "เรือ", "เครื่อง", "ยา", "อาหาร", "ข้าว", "ผ้า", "เสื้อ", "กางเกง", "รองเท้า",
    "โต๊ะ", "เก้าอี้", "ตู้", "เตียง", "กระดาษ", "สมุด", "หนังสือ", "ปากกา",
    "สี", "ภาพ", "รูป", "เสียง", "กลิ่น",
    "การ", "ความ", "ภัย", "งาน", "เรื่อง", "สิ่ง", "วัน", "คืน", "ปี", "เวลา"
];

// --- 4. ฟังก์ชันแยกส่วนประกอบคำ ---
function getWordParts(text) {
    let parts = new Set(); 

    // วิธีที่ 1: สแกนหาคำจากคลังรวม
    for (let keyword of allKeywords) {
        if (text.includes(keyword)) {
            parts.add(keyword);
        }
    }

    // วิธีที่ 2: AI ช่วยตัด
    const segments = segmenter.segment(text);
    for (const segment of segments) {
        if (segment.isWordLike) {
            parts.add(segment.segment); 
        }
    }
    
    return Array.from(parts);
}

// --- 5. ฟังก์ชันหลัก ---
function submitWord() {
    const rawWord = wordInput.value.trim();
    if (!rawWord) return;

    const newWordParts = getWordParts(rawWord);

    // --- ตรวจสอบการซ้ำ (Duplicate Check) ---
    for (let oldWord of usedWords) {
        if (rawWord.includes(oldWord) || oldWord.includes(rawWord)) {
            announceLoss(`แพ้! "${rawWord}" ซ้ำกับ "${oldWord}"\n(คำนึงซ่อนอยู่ในอีกคำนึง)`);
            return;
        }

        const oldWordParts = getWordParts(oldWord);
        for (let newPart of newWordParts) {
            if (newPart.length < 2 && !allKeywords.includes(newPart)) continue; 

            if (oldWordParts.includes(newPart)) {
                announceLoss(`แพ้! "${rawWord}" ซ้ำกับ "${oldWord}"\n(เพราะมีคำว่า "${newPart}" เหมือนกัน)`);
                return;
            }
        }
    }

    // --- ตรวจสอบว่าเป็นคำกริยาหรือไม่ (Verb Warning) ---
    let containsVerb = false;
    let verbFound = "";

    for (let part of newWordParts) {
        if (actionKeywords.has(part)) {
            containsVerb = true;
            verbFound = part;
            break; 
        }
    }

    // ถ้าไม่ซ้ำ -> บันทึกคำ (พร้อมเลือกสีแจ้งเตือน)
    if (containsVerb) {
        addWord(rawWord, "verb-warn", verbFound); // แจ้งเตือนว่ามีกริยา
    } else {
        addWord(rawWord, "safe", null); // ปลอดภัย
    }
}

function addWord(word, type, verbInfo) {
    usedWords.push(word);
    
    const li = document.createElement('li');
    li.innerHTML = `<div>${word}</div> <span class="index">#${usedWords.length}</span>`;
    wordList.insertBefore(li, wordList.firstChild);
    
    // แยกข้อความแจ้งเตือนตามประเภท
    if (type === "verb-warn") {
        updateStatus(`"${word}" ผ่าน! (ไม่ซ้ำ)\n⚠️ แต่ระวัง! มีคำกริยาว่า "${verbInfo}" ผสมอยู่`, "warning");
    } else {
        updateStatus(`"${word}" ผ่าน! (ไม่ซ้ำและดูปลอดภัย)`, "success");
    }
    
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
    
    // เปลี่ยนสีตามประเภท
    if (type === "success") {
        statusBox.className = `status-box status-success`; // สีเขียว
    } else if (type === "warning") {
        // เพิ่มสไตล์สีส้มสำหรับ Warning
        statusBox.className = `status-box status-warning`; // สีเหลือง/ส้ม
        statusBox.style.backgroundColor = "#fff3cd";
        statusBox.style.color = "#856404";
        statusBox.style.border = "1px solid #ffeeba";
    } else {
        statusBox.className = `status-box status-error`; // สีแดง
    }
    
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
