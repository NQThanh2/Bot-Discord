import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  // Mui gio cho nhac hang ngay. VN = +7. Doi qua bien TZ_OFFSET_HOURS neu can.
  tzOffsetHours: Number(process.env.TZ_OFFSET_HOURS ?? 7),
};

// Kiem tra cau hinh bat buoc
const missing = [];
if (!config.token) missing.push('DISCORD_TOKEN');
if (!config.clientId) missing.push('CLIENT_ID');

if (missing.length) {
  console.error(
    `\n[CAU HINH THIEU] Vui long tao file .env va dien: ${missing.join(', ')}\n` +
    `Tham khao file .env.example.\n`
  );
}
