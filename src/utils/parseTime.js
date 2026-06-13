/**
 * Phan tich chuoi thoi gian kieu "10s", "5m", "2h", "1d", "1h30m"
 * tra ve so mili-giay. Tra ve null neu khong hop le.
 *
 * Vi du: "1h30m" -> 5400000
 */
export function parseDuration(input) {
  if (!input || typeof input !== 'string') return null;
  const regex = /(\d+)\s*(d|h|m|s)/gi;
  const units = { d: 86400000, h: 3600000, m: 60000, s: 1000 };

  let total = 0;
  let matched = false;
  let match;
  while ((match = regex.exec(input.toLowerCase())) !== null) {
    matched = true;
    total += parseInt(match[1], 10) * units[match[2]];
  }

  if (!matched || total <= 0) return null;
  // Gioi han toi da 30 ngay
  if (total > 30 * 86400000) return null;
  return total;
}

/**
 * Phan tich gio trong ngay dang "HH:MM" (24 gio). Vi du "7:00", "21:30".
 * Tra ve { hour, minute } hoac null neu khong hop le.
 */
export function parseTimeOfDay(input) {
  if (!input || typeof input !== 'string') return null;
  const m = input.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/**
 * Tinh moc thoi gian (timestamp ms, theo UTC) cho lan ke tiep dat gio HH:MM
 * theo mui gio offsetHours (vd VN = +7). Neu hom nay da qua gio do thi lay ngay mai.
 */
export function computeNextDailyTrigger(hour, minute, offsetHours) {
  const offsetMs = offsetHours * 3600000;
  const now = Date.now();
  // Doi "now" sang gio dia phuong de doc dung ngay/thang theo mui gio do
  const local = new Date(now + offsetMs);
  const targetLocal = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    hour,
    minute,
    0,
    0
  );
  let triggerUtc = targetLocal - offsetMs; // doi nguoc ve UTC
  if (triggerUtc <= now) triggerUtc += 86400000; // da qua -> ngay mai
  return triggerUtc;
}

/**
 * Dinh dang khoang thoi gian (ms) thanh chuoi de doc: "1 ngay 2 gio 3 phut".
 */
export function formatDuration(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  const parts = [];
  if (d) parts.push(`${d} ngay`);
  if (h) parts.push(`${h} gio`);
  if (m) parts.push(`${m} phut`);
  if (s) parts.push(`${s} giay`);
  return parts.length ? parts.join(' ') : '0 giay';
}
