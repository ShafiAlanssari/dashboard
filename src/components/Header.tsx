"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession, signIn, signOut } from "next-auth/react";
import { timeAgoAr } from "@/lib/team";

type Email = { priority: "urgent" | "normal" };
type Task = { completed: boolean; due_on: string | null };

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export function Header({ onRefresh }: { onRefresh: () => void }) {
  const { data: session } = useSession();
  const displayName = process.env.NEXT_PUBLIC_DISPLAY_NAME || session?.user?.name || "مدير التصميم";

  const emailsQ = useQuery({
    queryKey: ["emails"],
    queryFn: () => fetchJson<{ emails: Email[] }>("/api/gmail"),
    enabled: !!session?.accessToken,
    refetchInterval: 5 * 60 * 1000,
  });

  const tasksQ = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson<{ tasks: Task[] }>("/api/asana/tasks"),
    refetchInterval: 10 * 60 * 1000,
  });

  const emailsNeedingReply = emailsQ.data?.emails?.length ?? 0;
  const pendingTasks = tasksQ.data?.tasks?.length ?? 0;
  const lastUpdate = emailsQ.dataUpdatedAt || tasksQ.dataUpdatedAt;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-brand text-white grid place-items-center font-bold">
            {displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-brand truncate">{displayName}</div>
            <div className="text-[11px] text-gray-500">
              {lastUpdate ? `آخر تحديث: ${timeAgoAr(lastUpdate)}` : "لم يُحدّث بعد"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mr-auto">
          <Counter
            color="red"
            label="إيميلات تحتاج رد"
            value={emailsNeedingReply}
            loading={emailsQ.isLoading}
          />
          <Counter
            color="yellow"
            label="طلبات Traffic"
            value={pendingTasks}
            loading={tasksQ.isLoading}
          />
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-lg bg-brand text-white text-sm hover:bg-brand-light transition"
        >
          تحديث الكل
        </button>

        {session ? (
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-500 hover:text-brand"
          >
            تسجيل الخروج
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-3 py-1.5 rounded-lg border border-brand text-brand text-sm hover:bg-brand-bg transition"
          >
            ربط Gmail
          </button>
        )}
      </div>
    </header>
  );
}

function Counter({
  color,
  label,
  value,
  loading,
}: {
  color: "red" | "yellow" | "green";
  label: string;
  value: number;
  loading: boolean;
}) {
  const dot = {
    red: "bg-red-500",
    yellow: "bg-amber-500",
    green: "bg-emerald-500",
  }[color];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-bg border border-gray-100">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-bold text-brand min-w-[1.5rem] text-center">
        {loading ? "…" : value}
      </span>
    </div>
  );
}
