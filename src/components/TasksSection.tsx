"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SectionCard, SkeletonList, ErrorBox } from "./Skeleton";
import { daysUntil } from "@/lib/team";

type Task = {
  gid: string;
  name: string;
  due_on: string | null;
  permalink_url: string;
  assignee: { name: string } | null;
  projects: { name: string }[];
};

type Filter = "all" | "overdue" | "this_week" | "no_due";

export function TasksSection() {
  const [filter, setFilter] = useState<Filter>("all");

  const q = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const r = await fetch("/api/asana/tasks");
      if (!r.ok) throw new Error((await r.json()).error || "خطأ");
      return (await r.json()) as { tasks: Task[] };
    },
    refetchInterval: 10 * 60 * 1000,
  });

  const tasks = q.data?.tasks ?? [];
  const now = Date.now();
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "no_due") return !t.due_on;
    if (!t.due_on) return false;
    const dueMs = new Date(t.due_on + "T23:59:59").getTime();
    if (filter === "overdue") return dueMs < now;
    if (filter === "this_week") return dueMs >= now && dueMs <= weekEnd;
    return true;
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "overdue", label: "متأخرة" },
    { id: "this_week", label: "هذا الأسبوع" },
    { id: "no_due", label: "بدون موعد" },
  ];

  return (
    <SectionCard
      title="طلبات جديدة في Traffic — تحتاج توزيع"
      action={
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition ${
                filter === f.id
                  ? "bg-brand text-white"
                  : "text-gray-500 hover:text-brand"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {q.isLoading ? (
        <SkeletonList />
      ) : q.error ? (
        <ErrorBox message={(q.error as Error).message} />
      ) : !filtered.length ? (
        <div className="text-sm text-gray-500 text-center py-6">لا توجد مهام في هذا الفلتر</div>
      ) : (
        <ul className="space-y-2 max-h-[420px] overflow-y-auto">
          {filtered.map((t) => {
            const due = daysUntil(t.due_on);
            return (
              <li
                key={t.gid}
                className="p-3 border border-gray-100 rounded-lg hover:bg-brand-bg flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {t.projects[0]?.name ?? "بدون مشروع"}
                    {t.assignee && ` · ${t.assignee.name}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      due.isOverdue
                        ? "bg-red-50 text-red-700"
                        : t.due_on
                        ? "bg-brand-bg text-gray-600"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {due.label}
                  </span>
                  <a
                    href={t.permalink_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand hover:text-brand-light"
                  >
                    افتح ↗
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
