import { loadReminders, saveReminders } from '../utils/store.js';

/**
 * Bo lap lich nhac nho. Moi 15 giay quet 1 lan cac reminder den han va gui di.
 * Khi bot khoi dong lai, reminder van con (luu file) nen khong bi mat.
 */
const CHECK_INTERVAL = 15_000;

async function deliver(client, reminder) {
  const content =
    `🔔 <@${reminder.userId}> Nhac nho cua ban:\n> ${reminder.message}`;

  try {
    // Uu tien gui vao dung kenh da dat lenh; neu khong duoc thi gui DM.
    const channel = await client.channels.fetch(reminder.channelId).catch(() => null);
    if (channel && channel.isTextBased()) {
      await channel.send({ content });
      return;
    }
    const user = await client.users.fetch(reminder.userId);
    await user.send({ content });
  } catch (err) {
    console.error(`[reminder] Khong gui duoc reminder ${reminder.id}:`, err.message);
  }
}

export function startReminderScheduler(client) {
  const tick = async () => {
    const reminders = await loadReminders();
    if (!reminders.length) return;

    const now = Date.now();
    const due = reminders.filter((r) => r.triggerAt <= now);
    if (!due.length) return;

    for (const reminder of due) {
      await deliver(client, reminder);
    }

    // Loai bo cac reminder da gui
    const remaining = reminders.filter((r) => r.triggerAt > now);
    await saveReminders(remaining);
  };

  // Chay ngay 1 lan luc khoi dong (bat cac reminder qua han khi bot offline)
  tick().catch((e) => console.error('[reminder] tick error:', e));
  setInterval(() => tick().catch((e) => console.error('[reminder] tick error:', e)), CHECK_INTERVAL);
  console.log('[reminder] Da bat bo lap lich nhac nho.');
}
