"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { SectionCard, SkeletonList, ErrorBox } from "./Skeleton";
import { ReplyModal } from "./ReplyModal";
import { timeAgoAr } from "@/lib/team";

type Email = {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  internalDate: number;
  hoursAgo: number;
  priority: "urgent" | "normal";
  permalink: string;
};

export function EmailsSection() {
  const { data: session, status } = useSession();
  const [replyTarget, setReplyTarget] = useState<Email | null>(null);
  const lastCountRef = typeof window !== "undefined" ? window : null;

  const q = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const r = await fetch("/api/gmail");
      if (!r.ok) throw new Error((await r.json()).error || "خطأ");
      return (await r.json()) as { emails: Email[] };
    },
    enabled: !!session?.accessToken,
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!q.data?.emails) return;
    const urgent = q.data.emails.filter((e) => e.priority === "urgent").length;
    const prev = Number(sessionStorage.getItem("emailCount") ?? "-1");
    if (prev >= 0 && urgent > prev && "Notification" in window && Notification.permission === "granted") {
      new Notification("إيميل جديد يحتاج رداً", { body: `لديك ${urgent} إيميل عاجل` });
    }
    sessionStorage.setItem("emailCount", String(urgent));
  }, [q.data]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <SectionCard title="إيميلات تحتاج رداً">
      {status !== "authenticated" ? (
        <div className="p-6 text-center bg-brand-bg rounded-lg">
          <p className="text-sm text-gray-600 mb-3">اربط حساب Gmail لعرض الإيميلات التي تحتاج رداً</p>
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm hover:bg-brand-light"
          >
            ربط حساب Google
          </button>
        </div>
      ) : q.isLoading ? (
        <SkeletonList />
      ) : q.error ? (
        <ErrorBox message={(q.error as Error).message} />
      ) : !q.data?.emails?.length ? (
        <div className="text-sm text-gray-500 text-center py-6">لا توجد إيميلات تحتاج رداً 🎉</div>
      ) : (
        <ul className="space-y-3">
          {q.data.emails.slice(0, 8).map((e) => (
            <li
              key={e.id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-brand-bg transition"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{e.fromName}</span>
                    <PriorityBadge priority={e.priority} />
                  </div>
                  <div className="text-sm text-gray-700 truncate">{e.subject}</div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{e.snippet}</p>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {timeAgoAr(e.internalDate)}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={e.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-2.5 py-1 rounded border border-gray-200 hover:border-brand hover:text-brand"
                >
                  افتح في Gmail
                </a>
                <button
                  onClick={() => setReplyTarget(e)}
                  className="text-xs px-2.5 py-1 rounded bg-brand text-white hover:bg-brand-light"
                >
                  اقتراح رد
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {replyTarget && (
        <ReplyModal email={replyTarget} onClose={() => setReplyTarget(null)} />
      )}
    </SectionCard>
  );
}

function PriorityBadge({ priority }: { priority: "urgent" | "normal" }) {
  if (priority === "urgent") {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
        عاجل
      </span>
    );
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
      عادي
    </span>
  );
}
