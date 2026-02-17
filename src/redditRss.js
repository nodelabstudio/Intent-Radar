import Parser from 'rss-parser';
const parser = new Parser();

function buildRedditRssUrl(feed) {
  const sort = feed.sort || 'new';
  return `https://www.reddit.com/r/${feed.subreddit}/${sort}/.rss`;
}

export default async function fetchRedditRss(feed) {
  if (feed.type !== 'reddit') {
    throw new Error(`Unsupported feed type: ${feed.type}`);
  }

  if (!feed.subreddit) {
    throw new Error(`Missing subreddit in feed: ${JSON.stringify(feed)}`);
  }

  const url = buildRedditRssUrl(feed);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Status code ${response.status}`);
  }

  const text = await response.text();
  const rss = await parser.parseString(text);

  return rss.items.map(item => ({
    source: feed.source,
    subreddit: feed.subreddit,
    title: item.title || '',
    body: item.contentSnippet || '',
    url: item.link,
    author: item.creator || '',
    publishedAt: item.pubDate,
  }));
}
