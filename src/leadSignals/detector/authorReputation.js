import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../../data');
const FILE_PATH = path.join(DATA_DIR, 'author-reputation.json');

let cache = {};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadCache() {
  ensureDataDir();
  if (fs.existsSync(FILE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    } catch {
      cache = {};
    }
  }
}

function saveCache() {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(cache, null, 2));
}

loadCache();

function keyFor(author, subreddit, url) {
  if (author) return `${subreddit}:${author}`;
  if (url) return `${subreddit}:anon:${url}`;
  return null;
}

export function markAuthorSeen(author, subreddit, url) {
  const key = keyFor(author, subreddit, url);
  if (!key) return;

  if (!cache[key]) {
    cache[key] = {
      sellerCount: 0,
      qualifiedCount: 0,
      totalSeen: 0,
      lastSeen: null,
    };
  }

  cache[key].totalSeen += 1;
  cache[key].lastSeen = new Date().toISOString();
  saveCache();
}

export function updateAuthorReputation(author, subreddit, type, url) {
  const key = keyFor(author, subreddit, url);
  if (!key) return;

  if (!cache[key]) {
    cache[key] = {
      sellerCount: 0,
      qualifiedCount: 0,
      totalSeen: 0,
      lastSeen: null,
    };
  }

  if (type === 'seller') cache[key].sellerCount += 1;
  if (type === 'qualified') cache[key].qualifiedCount += 1;

  cache[key].lastSeen = new Date().toISOString();
  saveCache();
}

export function shouldSkipAuthor(author, subreddit, url) {
  const key = keyFor(author, subreddit, url);
  if (!key || !cache[key]) return false;

  const { sellerCount, qualifiedCount } = cache[key];
  return sellerCount >= 3 && qualifiedCount === 0;
}
