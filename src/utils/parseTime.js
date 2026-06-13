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
