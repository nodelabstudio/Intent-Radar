export default function scoreIntent(record, keywordsConfig) {
  const text = `${record.title} ${record.body}`.toLowerCase();

  let best = Infinity;

  const allKeywords = Object.values(keywordsConfig).flat();

  for (const { phrase, score } of allKeywords) {
    if (!phrase) continue;

    if (text.includes(phrase.toLowerCase())) {
      best = Math.min(best, score);
    }
  }

  return {
    qualifies: best <= 2,
    score: best === Infinity ? null : best,
  };
}
