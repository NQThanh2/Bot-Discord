# 🤖 Bot Discord — Nhắc nhở & Mini Game

Bot Discord viết bằng Node.js (discord.js v14) với:
- ⏰ **Nhắc nhở**: đặt lời nhắc theo thời gian, bot tự gửi đúng giờ (lưu vào file nên không mất khi restart).
- 🎮 **Mini game**: tung xu, tung xúc xắc, oẳn tù tì, đoán số, quả cầu 8.
- 🌍 **Vào được mọi server**: dùng slash command global + link mời OAuth2.

## 1. Cài đặt

```bash
npm install
```

## 2. Tạo bot trên Discord

1. Vào https://discord.com/developers/applications → **New Application**.
2. Tab **Bot** → **Reset Token** → copy token.
3. Tab **General Information** → copy **Application ID**.
4. Tạo file `.env` (copy từ `.env.example`) rồi điền:

```env
DISCORD_TOKEN=token-cua-ban
CLIENT_ID=application-id-cua-ban
GUILD_ID=          # de trong de deploy global; hoac dien ID server de test nhanh
```

## 3. Đăng ký lệnh (slash commands)

```bash
npm run deploy
```

- Có `GUILD_ID` → lệnh hiện **ngay lập tức** trên server đó (tiện test).
- Để trống → deploy **global**, áp dụng cho mọi server (có thể mất tới ~1 giờ để hiện).

## 4. Chạy bot

```bash
npm start
# hoac che do tu reload khi sua code:
npm run dev
```

## 5. Mời bot vào server (bất kỳ server nào)

Thay `CLIENT_ID` bằng Application ID của bạn:

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=274877942784&scope=bot%20applications.commands
```

Bất kỳ ai có quyền **Manage Server** trên server của họ đều có thể dùng link này để thêm bot vào.

> Mẹo: Trong Developer Portal → **OAuth2 → URL Generator**, chọn scope `bot` + `applications.commands` và quyền `Send Messages`, `Embed Links` để tự sinh link.

## Danh sách lệnh

| Lệnh | Chức năng |
|------|-----------|
| `/remind <thời_gian> <nội_dung>` | Đặt nhắc nhở (vd `10m`, `2h`, `1d`, `1h30m`) |
| `/reminders` | Xem các nhắc nhở của bạn |
| `/delremind <mã>` | Xoá 1 nhắc nhở |
| `/coinflip` | Tung đồng xu |
| `/dice [mặt] [số_lượng]` | Tung xúc xắc |
| `/rps` | Oẳn tù tì (kéo búa bao) |
| `/guess <số>` | Đoán số 1-100 |
| `/8ball <câu_hỏi>` | Hỏi quả cầu pha lê |
| `/ping` | Kiểm tra độ trễ |
| `/help` | Xem trợ giúp |

## Cấu trúc thư mục

```
src/
├── index.js              # Khởi động bot, lắng nghe sự kiện
├── deploy-commands.js    # Đăng ký slash command
├── commands/             # Mỗi file = 1 lệnh (data + execute)
│   ├── reminder/
│   ├── games/
│   └── util/
├── handlers/
│   ├── loadCommands.js       # Tự nạp lệnh từ thư mục
│   └── reminderScheduler.js  # Vòng lặp gửi nhắc nhở đúng giờ
├── utils/
│   ├── store.js          # Lưu/đọc reminder (file JSON)
│   └── parseTime.js      # Phân tích "1h30m" -> ms
└── data/                 # reminders.json (tự sinh)
```

## 6. Deploy lên Render

Bot Discord chạy nền liên tục nên có 2 cách:

### Cách A — Background Worker (chuẩn nhất, trả phí ~$7/tháng)
1. Push code lên GitHub.
2. Render Dashboard → **New + → Background Worker** → chọn repo.
3. Điền:
   - **Root Directory**: để trống (code ở thư mục gốc repo)
   - **Build Command**: `npm install && npm run deploy`
   - **Start Command**: `npm start`
4. Tab **Environment** → thêm biến: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` (GUILD_ID để trống cho global).

> Background Worker không cần cổng HTTP nên đúng bản chất bot nhất.

### Cách B — Web Service (dùng được FREE tier)
1. Push code lên GitHub.
2. Render Dashboard → **New + → Web Service** → chọn repo. (Hoặc dùng **Blueprint** trỏ tới `render.yaml` có sẵn trong repo.)
3. Điền:
   - **Root Directory**: để trống
   - **Build Command**: `npm install && npm run deploy`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Thêm biến môi trường như trên.

Code đã có sẵn HTTP keep-alive server (`src/handlers/keepAlive.js`): khi Render cấp biến `PORT`, bot tự mở cổng trả `200` để Render không báo lỗi.

> ⚠️ **Free Web Service ngủ sau 15 phút không có request** → bot mất kết nối, nhắc nhở không chạy. Khắc phục: dùng dịch vụ ping miễn phí (UptimeRobot, cron-job.org) gọi URL `https://<ten-app>.onrender.com/health` mỗi ~10 phút để giữ bot thức.

### ⚠️ Lưu ý quan trọng: ổ đĩa Render bị xoá khi redeploy/restart
Reminder lưu trong `src/data/reminders.json`. Trên Render, filesystem là **ephemeral** — mỗi lần deploy lại hoặc restart, file này **mất sạch** → reminder đang chờ sẽ bị xoá.
- **Free tier**: chấp nhận hạn chế này, hoặc đổi sang lưu bằng dịch vụ ngoài (vd Redis/Postgres miễn phí của Render, hoặc Supabase).
- **Trả phí**: gắn **Persistent Disk** (Render) mount vào `src/data` để giữ dữ liệu.

### Tóm tắt các ô cần điền trên Render
| Ô | Giá trị |
|---|---------|
| Root Directory | *(để trống)* |
| Build Command | `npm install && npm run deploy` |
| Start Command | `npm start` |
| Health Check Path (Web Service) | `/health` |
| Env vars | `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` |

## Ghi chú
- Reminder lưu trong `src/data/reminders.json`. Với quy mô lớn nên đổi sang database (SQLite/Postgres).
- Bot chỉ cần intent `Guilds`, không cần intent đặc quyền (Message Content...).
