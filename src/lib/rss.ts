import Parser from "rss-parser";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  category: "ai" | "design";
  pubDate: number;
  image?: string;
};

const FEEDS: { url: string; source: string; category: "ai" | "design" }[] = [
  { url: "https://www.theverge.com/rss/design/index.xml", source: "The Verge Design", category: "design" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", source: "TechCrunch AI", category: "ai" },
  { url: "https://www.creativebloq.com/rss", source: "Creative Bloq", category: "design" },
  { url: "https://www.smashingmagazine.com/feed/", source: "Smashing Magazine", category: "design" },
  { url: "https://www.designernews.co/?format=rss", source: "Designer News", category: "design" },
];

const parser = new Parser({
  customFields: { item: ["media:content", "enclosure"] as any },
  timeout: 8000,
});

function extractImage(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.$?.url) return item["media:content"].$.url;
  const html: string = item["content:encoded"] || item.content || "";
  const m = html.match(/<img[^>]+src="([^">]+)"/);
  return m?.[1];
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source, category }) => {
      const feed = await parser.parseURL(url);
      return (feed.items ?? []).slice(0, 10).map<NewsItem>((item: any) => ({
        title: item.title ?? "بدون عنوان",
        link: item.link ?? "#",
        source,
        category,
        pubDate: item.isoDate ? new Date(item.isoDate).getTime() : Date.now(),
        image: extractImage(item),
      }));
    })
  );

  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }
  return items.sort((a, b) => b.pubDate - a.pubDate).slice(0, 40);
}
