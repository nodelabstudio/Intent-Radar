export default function scoreIntent(record, keywordsConfig) {
  const text = record.text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  const { minimum_trigger_score, keywords } = keywordsConfig;

  let bestScore = Infinity;
  const matchedPhrases = [];
  const categories = new Set();

  for (const { phrase, score, category } of keywords) {
    if (!phrase) continue;

    if (text.includes(phrase.toLowerCase())) {
      matchedPhrases.push({ phrase, score, category });
      categories.add(category);
      bestScore = Math.min(bestScore, score);
    }
  }

  const qualifies = bestScore <= minimum_trigger_score;

  let confidence = 0;

  if (qualifies) {
    const intentStrength = matchedPhrases.some(p => p.score === 1) ? 1 : 0.7;

    const phraseDensity = Math.min(matchedPhrases.length / 4, 1);
    const categoryBreadth = Math.min(categories.size / 3, 1);

    let substance = 0;
    if (wordCount >= 40) substance = 1;
    else if (wordCount >= 20) substance = 0.7;
    else if (wordCount >= 10) substance = 0.4;
    else substance = 0.2;

    confidence =
      intentStrength * 0.4 +
      phraseDensity * 0.25 +
      categoryBreadth * 0.2 +
      substance * 0.15;

    confidence = Math.round(confidence * 100) / 100;
  }

  return {
    qualifies,
    score: bestScore === Infinity ? null : bestScore,
    confidence,
    matchedPhrases: matchedPhrases.map(p => p.phrase),
    categories: Array.from(categories),
    wordCount,
  };
}
