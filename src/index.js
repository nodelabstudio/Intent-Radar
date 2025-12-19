import feeds from '../feeds.intent.json' assert { type: 'json' };
import keywords from '../keywords.json' assert { type: 'json' };
import verticals from '../verticals.json' assert { type: 'json' };

import fetchRedditRss from './redditRss.js';
import normalize from './normalize.js';
import scoreIntent from './keywordScore.js';
import aiGate from './aiGate.js';
import tagVertical from './tagVertical.js';
import upsert from './upsert.js';

const isDryRun = process.argv.includes('--dry-run');

if (!Array.isArray(feeds) || feeds.length === 0) {
  console.warn('[WARN] No feeds found in feeds.intent.json');
  process.exit(0);
}

for (const feed of feeds) {
  const items = await fetchRedditRss(feed);

  for (const raw of items) {
    const record = normalize(raw);

    const score = scoreIntent(record, keywords);
    if (!score.qualifies) continue;

    const ai = await aiGate(record);
    if (!ai.qualified) continue;

    const vertical = tagVertical(record, verticals);

    const payload = {
      ...record,
      intentScore: score,
      aiQualified: true,
      aiReason: ai.reason,
      vertical,
    };

    if (isDryRun) {
      console.log('--- INBOUND LEAD SIGNAL ---');
      console.log({
        title: payload.title,
        subreddit: payload.subreddit,
        author: payload.author,
        intentScore: payload.intentScore,
        vertical: payload.vertical,
        aiReason: payload.aiReason,
        url: payload.url,
      });
    } else {
      await upsert(payload);
    }
  }
}

console.log('Done.');
process.exit(0);
