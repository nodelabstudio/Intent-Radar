import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./data');
const FILE_PATH = path.join(DATA_DIR, 'ai-usage.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load() {
  ensureDir();

  if (!fs.existsSync(FILE_PATH)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

function dayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDailyAiCount(date = new Date()) {
  const data = load();
  const key = dayKey(date);
  return data?.[key]?.count ?? 0;
}

export function canUseAiToday(maxPerDay, date = new Date()) {
  if (!Number.isFinite(maxPerDay) || maxPerDay <= 0) return false;
  return getDailyAiCount(date) < maxPerDay;
}

export function incrementDailyAiCount(by = 1, date = new Date()) {
  const inc = Number.isFinite(by) ? by : 1;
  const data = load();
  const key = dayKey(date);

  if (!data[key]) {
    data[key] = { count: 0, lastUpdated: null };
  }

  data[key].count += inc;
  data[key].lastUpdated = new Date().toISOString();

  save(data);

  return data[key].count;
}
