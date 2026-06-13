import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Redis } from '@upstash/redis';

/**
 * Kho luu tru reminder.
 * - Neu co bien moi truong Upstash (UPSTASH_REDIS_REST_URL + TOKEN): dung Redis,
 *   du lieu BEN VUNG ke ca khi Render restart/redeploy (phu hop free tier).
 * - Neu khong: fallback ve file JSON (tien chay local khi dev).
 *
 * Toan bo reminder luu duoi 1 key "reminders" dang mang JSON, giu nguyen
 * logic don gian giong ban file truoc day.
 */

const REDIS_KEY = 'reminders';
const useRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis = null;
if (useRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('[store] Dung Upstash Redis de luu reminder (ben vung).');
} else {
  console.log('[store] Dung file JSON de luu reminder (chi nen dung khi chay local).');
}

// ---- Backend: file JSON ----
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const REMINDERS_FILE = join(DATA_DIR, 'reminders.json');

async function fileLoad() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(REMINDERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function fileSave(reminders) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2), 'utf8');
}

// ---- API chung ----
export async function loadReminders() {
  if (useRedis) {
    const data = await redis.get(REDIS_KEY); // @upstash tu parse JSON
    return Array.isArray(data) ? data : [];
  }
  return fileLoad();
}

export async function saveReminders(reminders) {
  if (useRedis) {
    await redis.set(REDIS_KEY, reminders); // @upstash tu stringify
    return;
  }
  await fileSave(reminders);
}

export async function addReminder(reminder) {
  const reminders = await loadReminders();
  reminders.push(reminder);
  await saveReminders(reminders);
  return reminder;
}

export async function removeReminder(id, userId) {
  const reminders = await loadReminders();
  const idx = reminders.findIndex((r) => r.id === id && r.userId === userId);
  if (idx === -1) return null;
  const [removed] = reminders.splice(idx, 1);
  await saveReminders(reminders);
  return removed;
}

export async function getUserReminders(userId) {
  const reminders = await loadReminders();
  return reminders.filter((r) => r.userId === userId);
}
