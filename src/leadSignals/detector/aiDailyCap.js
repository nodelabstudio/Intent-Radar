import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./data');
const FILE_PATH = path.join(DATA_DIR, 'ai-usage.json');

let cache = {};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(FILE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    } catch {
      cache = {};
    }
  }
}

function save() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(cache, null, 2));
}

load();

export function getTodayUsage() {
  const key = todayKey();
  return cache[key]?.count ?? 0;
}

export function incrementTodayUsage() {
  const key = todayKey();

  if (!cache[key]) {
    cache[key] = {
      count: 0,
      lastUpdated: null,
    };
  }

  cache[key].count += 1;
  cache[key].lastUpdated = new Date().toISOString();

  save();
}
