import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const REMINDERS_FILE = join(DATA_DIR, 'reminders.json');

/**
 * Kho luu tru reminder don gian dung file JSON.
 * Du dung cho bot nho/vua. Voi quy mo lon nen thay bang database (SQLite/Postgres).
 */
async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(REMINDERS_FILE, 'utf8');
  } catch {
    await writeFile(REMINDERS_FILE, '[]', 'utf8');
  }
}

export async function loadReminders() {
  await ensureFile();
  const raw = await readFile(REMINDERS_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveReminders(reminders) {
  await ensureFile();
  await writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2), 'utf8');
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
