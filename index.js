function formatYMDLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// -------------------------
// CẤU HÌNH ICONS (thay đường dẫn ảnh của bạn)
// -------------------------
const iconMap = {
    1: "./mutations/Fragile.webp",
    2: "./mutations/Spell.webp",
    3: "./mutations/StrongFire.webp",
    4: "./mutations/Raging.webp",
    5: "./mutations/Fighting.webp",
    6: "./mutations/Dash.webp",
    7: "./mutations/Skillful.webp"
};

const day = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sar",
}

// -------------------------
// MỐC: tuần gốc (6–12 Oct 2025)
// Lưu map theo dayOfWeek (0=Sun .. 6=Sat)
// -------------------------
const baseWeekByDow = {
    1: { y: 2025, m: 9, d: 6, index: 5, name: "fighting" },     // Mon(1)
    2: { y: 2025, m: 9, d: 7, index: 6, name: "dash" },         // Tue(2)
    3: { y: 2025, m: 9, d: 8, index: 7, name: "skillful" },     // Wed(3)
    4: { y: 2025, m: 9, d: 9, index: 1, name: "fragile" },      // Thu(4)
    5: { y: 2025, m: 9, d: 10, index: 2, name: "curse spell" }, // Fri(5)
    6: { y: 2025, m: 9, d: 11, index: 3, name: "strong fire" }, // Sat(6)
    0: { y: 2025, m: 9, d: 12, index: 4, name: "raging wind" }  // Sun(0)
};

// Tạo Date local midnight cho mỗi weekday mốc
const baseWeekDate = {};
for (const dow of Object.keys(baseWeekByDow)) {
    const cfg = baseWeekByDow[dow];
    baseWeekDate[dow] = new Date(cfg.y, cfg.m, cfg.d); // local midnight
}

// -------------------------
// Lấy index cho 1 ngày (an toàn timezone)
// - Tìm weekday (0..6)
// - Lấy base date cho weekday trong tuần gốc (local midnight)
// - Tính weekDiff = floor((date - baseDate) / (7*86400000))
// - index = (baseIndex + weekDiff -1) mod 7 +1
// -------------------------
function getIconIndexForDate(date) {
    const dow = date.getDay(); // 0..6
    const base = baseWeekByDow[dow];
    if (!base) return { index: null, name: null };

    const baseDate = baseWeekDate[dow]; // local midnight for that weekday in base week
    // Tính số ngày chênh lệch (local midnights) — đảm bảo bội số 86400000
    const MS_DAY = 24 * 60 * 60 * 1000;
    // Sử dụng Math.floor với chia cho MS_DAY (hai Date là local midnights)
    const diffDays = Math.round((date - baseDate) / MS_DAY); // có thể âm
    // số tuần chênh lệch: floor(diffDays / 7) nhưng lưu ý diffDays âm => floor đúng
    const weekDiff = Math.floor(diffDays / 7);

    // base.index là 1..7
    let idx = ((base.index - 1 + weekDiff) % 7 + 7) % 7 + 1; // 1..7
    // tên theo index (bạn có thể map khác nếu muốn)
    const nameByIndex = {
        1: "fragile",
        2: "curse spell",
        3: "strong fire",
        4: "raging wind",
        5: "fighting",
        6: "dash",
        7: "skillful"
    };
    return { index: idx, name: nameByIndex[idx] };
}

// -------------------------
// Build calendar (tháng hiện tại) - có thể mở rộng prev/next
// -------------------------
function buildCalendarForMonth(year, month) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); // CN=0
    const total = lastDay.getDate();

    // trống đầu
    for (let i = 0; i < startOffset; i++) {
        const e = document.createElement('div');
        e.className = 'cell empty';
        grid.appendChild(e);
    }

    const today = new Date();
    for (let d = 1; d <= total; d++) {
        const date = new Date(year, month, d); // local midnight
        const dow = date.getDay();

        const cell = document.createElement('div');
        cell.className = `cell ${day[dow]}`;
        if (date.toDateString() === today.toDateString()) cell.classList.add('today');

        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = d;

        const { index, name } = getIconIndexForDate(date);
        const iconEl = document.createElement('div');
        iconEl.className = 'mutation';
        if (index) {
            const img = document.createElement('img');
            img.className = 'icon';
            img.src = iconMap[index] || '';
            img.alt = name || (`icon ${index}`);
            iconEl.appendChild(img);

            // const caption = document.createElement('div');
            // caption.style.fontSize = '12px';
            // caption.style.color = '#6b7280';
            // caption.textContent = `${index} — ${name}`;
            // iconEl.appendChild(caption);
        } else {
            iconEl.textContent = '-';
        }

        cell.appendChild(dayEl);
        cell.appendChild(iconEl);
        grid.appendChild(cell);
    }

    // trống cuối
    const totalCells = startOffset + total;
    const rem = totalCells % 7;
    if (rem !== 0) {
        for (let i = 0; i < 7 - rem; i++) {
            const e = document.createElement('div');
            e.className = 'cell empty';
            grid.appendChild(e);
        }
    }
}

function init() {
    const now = new Date();
    const monthTitle = document.getElementById('monthTitle');
    const todayLabel = document.getElementById('todayLabel');
    monthTitle.textContent = `${now.toLocaleString('vi-VN', { month: 'long' })} ${now.getFullYear()}`;
    todayLabel.textContent = `Hôm nay: ${formatYMDLocal(now)}`;
    buildCalendarForMonth(now.getFullYear(), now.getMonth());

    setInterval(() => {
        const current = new Date();
        const label = document.getElementById('todayLabel').textContent;
        const currentDateStr = `Hôm nay: ${formatYMDLocal(current)}`;
        if (label !== currentDateStr) {
            updateTodayInfo();
        }
    }, 300000);
}

init();