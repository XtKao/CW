// --- 1. ตั้งค่าตัวแปร ---
let usedWords = []; 
const wordInput = document.getElementById('wordInput');
const wordList = document.getElementById('wordList');
const statusBox = document.getElementById('statusBox');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const countSpan = document.getElementById('count');

const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

// --- 2. คลังคำกริยา (Action Words) -> ทำให้เป็นสีเหลือง ---
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

// --- 3. คลังคำรวมทั้งหมด (ใช้เช็คซ้ำ) -> ทำให้เป็นสีแดง ---
const allKeywords = [
    ...actionKeywords, 
    "ใจ", "จิต", "วิญญาณ", "อารมณ์", "นิสัย", "หัว", "หน้า", "ตา", "หู", "จมูก", "ปาก", "ฟัน", "ลิ้น", "คอ", 
    "แขน", "มือ", "นิ้ว", "เล็บ", "ขา", "เท้า", "เข่า", "ผม", "ขน", "หนัง", "เนื้อ", "เลือด", "กระดูก", "ท้อง", "ไส้", "อก", "เอว", "หลัง",
    "ตัว", "กาย", "รูป", "ร่าง", "ศพ", "น้ำ", "ไฟ", "ลม", "ดิน", "อากาศ", "ฟ้า", "เมฆ", "ฝน", "หมอก", "แดด", "รุ้ง",
    "ดาว", "อาทิตย์", "จันทร์", "ตะวัน", "โลก", "ป่า", "ไม้", "ต้น", "ดอก", "ใบ", "ผล", "ลูก", "ราก",
    "ภู", "เขา", "ดอย", "ถ้ำ", "หิน", "ทราย", "ทอง", "เงิน", "เพชร", "ทะเล", "หาด", "เกาะ", "แม่น้ำ", "คลอง", "บึง", "สระ",
    "คน", "มนุษย์", "ผู้", "ชาว", "นัก", "ช่าง", "หมอ", "ครู", "พระ", "พ่อ", "แม่", "ปู่", "ย่า", "ตา", "ยาย", "ลุง", "ป้า", "น้า", "อา", "ลูก", "หลาน", "พี่", "น้อง", "เพื่อน", "แฟน",
    "บ้าน", "เรือน", "หอ", "ตึก", "อาคาร", "โรง", "ร้าน", "ห้าง", "ตลาด", "วัด", "ห้อง", "ทาง", "ถนน", "ซอย", "เมือง", "กรุง", "ประเทศ", "จังหวัด", "ไทย", "จีน", "ลาว", "พม่า",
    "รถ", "เรือ", "เครื่อง", "ยา", "อาหาร", "ข้าว", "ผ้า", "เสื้อ", "กางเกง", "รองเท้า", "โต๊ะ", "เก้าอี้", "ตู้", "เตียง", "กระดาษ", "สมุด", "หนังสือ", "ปากกา",
    "สี", "ภาพ", "รูป", "เสียง", "กลิ่น", "การ", "ความ", "ภัย", "งาน", "เรื่อง", "สิ่ง", "วัน", "คืน", "ปี", "เวลา"
];

// --- 4. ฟังก์ชันแยกส่วนประกอบคำ ---
function getWordParts(text) {
    let parts = new Set(); 
    for (let keyword of allKeywords) {
        if (text.includes(keyword)) parts.add(keyword);
    }
    const segments = segmenter.segment(text);
    for (const segment of segments) {
        if (segment.isWordLike) parts.add(segment.segment); 
    }
    return Array.from(parts);
}

// --- 5. ฟังก์ชันหลัก ---
function submitWord() {
    const rawWord = wordInput.value.trim();
    if (!rawWord) return;

    const newWordParts = getWordParts(rawWord);

    // --- STEP 1: เช็คซ้ำ (สีแดง) ---
    for (let oldWord of usedWords) {
        // 1.1 ซ้ำแบบสิงร่าง
        if (rawWord.includes(oldWord) || oldWord.includes(rawWord)) {
            announceLoss(`แพ้! สีแดง: "${rawWord}" ซ้ำกับ "${oldWord}" (คำซ้อนทับกัน)`);
            return;
        }

        // 1.2 ซ้ำแบบมีรากศัพท์เหมือนกัน
        const oldWordParts = getWordParts(oldWord);
        for (let newPart of newWordParts) {
            if (newPart.length < 2 && !allKeywords.includes(newPart)) continue; 

            if (oldWordParts.includes(newPart)) {
                announceLoss(`แพ้! สีแดง: "${rawWord}" ซ้ำกับ "${oldWord}" (มีคำว่า "${newPart}" เหมือนกัน)`);
                return;
            }
        }
    }

    // --- STEP 2: เช็คกริยา (สีเหลือง) ---
    let containsVerb = false;
    let verbFound = "";

    for (let part of newWordParts) {
        if (actionKeywords.has(part)) {
            containsVerb = true;
            verbFound = part;
            break; 
        }
    }

    // --- STEP 3: แสดงผล ---
    if (containsVerb) {
        // สีเหลือง: ไม่ซ้ำ แต่มีกริยา
        addWord(rawWord, "warning", verbFound); 
    } else {
        // สีเขียว: ไม่ซ้ำ และปลอดภัย
        addWord(rawWord, "success", null); 
    }
}

function addWord(word, type, verbInfo) {
    usedWords.push(word);
    
    const li = document.createElement('li');
    li.innerHTML = `<div>${word}</div> <span class="index">#${usedWords.length}</span>`;
    wordList.insertBefore(li, wordList.firstChild);
    
    // ตั้งค่าข้อความและสีตามสถานะ
    if (type === "warning") {
        updateStatus(`"${word}" ผ่าน! (สีเหลือง)\n⚠️ มีคำกริยาว่า "${verbInfo}" ผสมอยู่`, "warning");
    } else {
        updateStatus(`"${word}" ผ่านฉลุย! (สีเขียว)`, "success");
    }
    
    countSpan.innerText = usedWords.length;
    wordInput.value = '';
    wordInput.focus();
}

function announceLoss(msg) {
    // สีแดง
    updateStatus(msg, "error");
    
    wordInput.value = '';
    wordInput.focus();
    
    statusBox.style.animation = 'none';
    statusBox.offsetHeight; 
    statusBox.style.animation = 'shake 0.5s';
}

function updateStatus(msg, type) {
    statusBox.style.display = 'block';
    
    // ล้าง class เก่า ใส่ class ใหม่ตามสี
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
