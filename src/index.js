import 'dotenv/config';
import feeds from '../feeds.intent.json' assert { type: 'json' };
import keywords from '../keywords.json' assert { type: 'json' };
import verticals from '../verticals.json' assert { type: 'json' };

import fetchRedditRss from './redditRss.js';
import normalize from './normalize.js';

import scoreIntent from './leadSignals/detector/keywordScore.js';
import tagVerticals from './leadSignals/detector/tagVerticals.js';
import isSellerPost from './leadSignals/detector/isSellerPost.js';
import isSellerIntent from './leadSignals/detector/isSellerIntent.js';

import {
  updateAuthorReputation,
  shouldSkipAuthor,
} from './leadSignals/detector/authorReputation.js';

import { hasSeenUrl, markSeenUrl } from './leadSignals/detector/urlDedupe.js';
import { AI_LIMITS, CONFIDENCE_THRESHOLDS } from './config/config.js';

import {
  canUseAiToday,
  getDailyAiCount,
  incrementDailyAiCount,
} from './leadSignals/detector/aiUsage.js';

const isDryRun = process.argv.includes('--dry-run');
let aiCallsThisRun = 0;

if (!process.env.QB_REALM || !process.env.QB_USER_TOKEN) {
  throw new Error('Quickbase environment variables are missing');
}

if (!Array.isArray(feeds) || feeds.length === 0) {
  process.exit(0);
}

for (const feed of feeds) {
  const items = await fetchRedditRss(feed);

  for (const raw of items) {
    const record = normalize(raw);
    if (!record?.url) continue;

    if (!isDryRun) {
      if (hasSeenUrl(record.url)) continue;
      markSeenUrl(record.url);
    }

    if (isSellerPost(record) || isSellerIntent(record)) {
      if (record.author) {
        updateAuthorReputation(
          record.author,
          record.subreddit,
          'seller',
          record.url
        );
      }
      continue;
    }

    const score = scoreIntent(record, keywords);
    if (!score.qualifies) continue;

    const subredditKey = record.subreddit.toLowerCase();
    const threshold =
      CONFIDENCE_THRESHOLDS[subredditKey] ?? CONFIDENCE_THRESHOLDS.default;

    if (score.confidence < threshold) {
      console.log('[NEAR MISS]', {
        subreddit: record.subreddit,
        title: record.title,
        confidence: score.confidence,
        threshold,
        phrases: score.matchedPhrases,
      });
      continue;
    }

    if (
      record.author &&
      shouldSkipAuthor(record.author, record.subreddit, record.url)
    ) {
      continue;
    }

    let ai = { qualified: true, reason: 'dry-run bypass' };

    if (!isDryRun) {
      if (!canUseAiToday(AI_LIMITS.MAX_CALLS_PER_DAY)) break;
      if (aiCallsThisRun >= AI_LIMITS.MAX_CALLS_PER_RUN) break;

      const { default: aiGate } = await import('./aiGate.js');

      aiCallsThisRun += 1;
      incrementDailyAiCount(1);

      ai = await aiGate(record);
      if (!ai.qualified) continue;
    }

    if (record.author) {
      updateAuthorReputation(
        record.author,
        record.subreddit,
        'qualified',
        record.url
      );
    }

    const verticalsMatched = tagVerticals(record, verticals);

    const payload = {
      ...record,
      intentScore: score,
      aiQualified: true,
      aiReason: ai.reason,
      verticals: verticalsMatched,
    };

    if (isDryRun) {
      console.log('--- INBOUND LEAD SIGNAL ---');
      console.log({
        title: payload.title,
        subreddit: payload.subreddit,
        author: payload.author,
        confidence: score.confidence,
        phrases: score.matchedPhrases,
        verticals: payload.verticals,
        url: payload.url,
      });
    } else {
      const { default: upsert } = await import('./upsert.js');
      await upsert(payload);
    }
  }
}

if (!isDryRun) {
  const usedToday = getDailyAiCount();
  console.log(
    `[AI USAGE] run=${aiCallsThisRun}/${AI_LIMITS.MAX_CALLS_PER_RUN} today=${usedToday}/${AI_LIMITS.MAX_CALLS_PER_DAY}`
  );
}

process.exit(0);
