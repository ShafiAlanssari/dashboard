"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SectionCard, ErrorBox } from "./Skeleton";
import { timeAgoAr } from "@/lib/team";

type Item = {
  title: string;
  link: string;
  source: string;
  category: "ai" | "design";
  pubDate: number;
  image?: string;
};

type Filter = "all" | "ai" | "design";

export function NewsSection() {
  const [filter, setFilter] = useState<Filter>("all");

  const q = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const r = await fetch("/api/news");
      if (!r.ok) throw new Error((await r.json()).error || "خطأ");
      return (await r.json()) as { items: Item[] };
    },
    refetchInterval: 60 * 60 * 1000,
  });

  const items = (q.data?.items ?? []).filter((i) => filter === "all" || i.category === filter);
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "ai", label: "ذكاء اصطناعي" },
    { id: "design", label: "تصميم" },
  ];

  return (
    <SectionCard
      title="أخبار التصميم والذكاء الاصطناعي"
      action={
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition ${
                filter === f.id ? "bg-brand text-white" : "text-gray-500 hover:text-brand"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {q.isLoading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[260px] h-44 skeleton rounded-lg" />
          ))}
        </div>
      ) : q.error ? (
        <ErrorBox message={(q.error as Error).message} />
      ) : !items.length ? (
        <div className="text-sm text-gray-500 text-center py-6">لا توجد أخبار حالياً</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="min-w-[260px] max-w-[260px] bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-card-hover transition group"
            >
              <div className="h-32 bg-brand-bg overflow-hidden relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-brand/30 text-2xl font-bold">
                    {item.source.charAt(0)}
                  </div>
                )}
                {item.pubDate > sixHoursAgo && (
                  <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white">
                    جديد
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span>{item.source}</span>
                  <span>{timeAgoAr(item.pubDate)}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-3 leading-snug">
                  {item.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
