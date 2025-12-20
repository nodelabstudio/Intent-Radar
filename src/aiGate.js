import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJson(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export default async function aiGate(record) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Return ONLY valid JSON. Do not include markdown, code fences, or explanations.',
      },
      {
        role: 'user',
        content: record.text,
      },
    ],
    temperature: 0,
  });

  const raw = response.choices?.[0]?.message?.content;
  const parsed = extractJson(raw);

  if (!parsed || typeof parsed.qualified !== 'boolean') {
    return {
      qualified: false,
      reason: 'invalid_ai_response',
    };
  }

  return parsed;
}
