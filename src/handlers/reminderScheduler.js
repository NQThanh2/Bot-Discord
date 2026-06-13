import { loadReminders, saveReminders } from '../utils/store.js';
import { computeNextDailyTrigger } from '../utils/parseTime.js';

/**
 * Bo lap lich nhac nho. Moi 15 giay quet 1 lan cac reminder den han va gui di.
 * - Reminder mot lan (once): gui xong thi xoa.
 * - Reminder hang ngay (daily): gui xong tu dat lai cho ngay hom sau.
 * Du lieu luu o store (file/Redis) nen khong mat khi bot restart.
 */
const CHECK_INTERVAL = 15_000;

async function deliver(client, reminder) {
  const prefix = reminder.repeat === 'daily' ? '🔁' : '🔔';
  const content =
    `${prefix} <@${reminder.userId}> Nhac nho cua ban:\n> ${reminder.message}`;

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
    if (!reminders.some((r) => r.triggerAt <= now)) return;

    const next = [];
    for (const reminder of reminders) {
      if (reminder.triggerAt > now) {
        next.push(reminder);
        continue;
      }
      await deliver(client, reminder);
      if (reminder.repeat === 'daily') {
        // Tinh lai moc cho ngay hom sau (du bot offline lau van khong gui don)
        reminder.triggerAt = computeNextDailyTrigger(
          reminder.hour,
          reminder.minute,
          reminder.offsetHours ?? 7
        );
        next.push(reminder);
      }
      // reminder mot lan -> khong day vao next -> bi xoa
    }

    await saveReminders(next);
  };

  // Chay ngay 1 lan luc khoi dong (bat cac reminder qua han khi bot offline)
  tick().catch((e) => console.error('[reminder] tick error:', e));
  setInterval(() => tick().catch((e) => console.error('[reminder] tick error:', e)), CHECK_INTERVAL);
  console.log('[reminder] Da bat bo lap lich nhac nho.');
}
