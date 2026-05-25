import { NextResponse } from "next/server";
import { fetchAllNews } from "@/lib/rss";

let cache: { ts: number; data: unknown } | null = null;
const TTL_MS = 60 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return NextResponse.json(cache.data);
  }
  try {
    const items = await fetchAllNews();
    const data = { items };
    cache = { ts: Date.now(), data };
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "News error" }, { status: 500 });
  }
}
