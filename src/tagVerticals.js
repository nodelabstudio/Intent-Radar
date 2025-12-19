export default function tagVerticals(record, verticalConfig) {
  const text = `${record.title} ${record.body}`.toLowerCase();

  if (!verticalConfig?.verticals?.length) {
    return [];
  }

  const matched = [];

  for (const vertical of verticalConfig.verticals) {
    const { name, keywords } = vertical;

    if (!Array.isArray(keywords)) continue;

    if (keywords.some(k => text.includes(k.toLowerCase()))) {
      matched.push(name);
    }
  }

  return matched.length ? matched : ['unknown'];
}
