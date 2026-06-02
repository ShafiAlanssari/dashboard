"use client";

import { useQuery } from "@tanstack/react-query";
import { SectionCard, SkeletonList, ErrorBox } from "./Skeleton";
import { timeAgoAr } from "@/lib/team";

type Row = {
  name: string;
  active: number;
  completedThisWeek: number;
  overdue: number;
  lastActivity: number | null;
};

export function DesignersReport() {
  const q = useQuery({
    queryKey: ["designers"],
    queryFn: async () => {
      const r = await fetch("/api/asana/designers");
      if (!r.ok) throw new Error((await r.json()).error || "خطأ");
      return (await r.json()) as { rows: Row[] };
    },
    refetchInterval: 10 * 60 * 1000,
  });

  const rows = q.data?.rows ?? [];
  const mostActive = [...rows].sort(
    (a, b) => b.completedThisWeek + b.active - (a.completedThisWeek + a.active)
  )[0];

  return (
    <SectionCard title="تقرير المصممين — القسم الفني">
      {q.isLoading ? (
        <SkeletonList count={6} />
      ) : q.error ? (
        <ErrorBox message={(q.error as Error).message} />
      ) : (
        <>
          {mostActive && mostActive.completedThisWeek + mostActive.active > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-l from-brand-light/10 to-transparent border border-brand-light/20 text-xs">
              <span className="font-semibold text-brand">الأكثر نشاطاً هذا الأسبوع: </span>
              <span className="text-gray-700">{mostActive.name}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-right py-2 font-medium">المصمم</th>
                  <th className="text-center py-2 font-medium">نشطة</th>
                  <th className="text-center py-2 font-medium">مكتملة (أسبوع)</th>
                  <th className="text-center py-2 font-medium">متأخرة</th>
                  <th className="text-center py-2 font-medium">آخر نشاط</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-gray-50 hover:bg-brand-bg">
                    <td className="py-2.5 font-medium text-gray-900">{r.name}</td>
                    <td className="py-2.5 text-center">{r.active}</td>
                    <td className="py-2.5 text-center text-emerald-700">{r.completedThisWeek}</td>
                    <td
                      className={`py-2.5 text-center font-semibold ${
                        r.overdue > 0 ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      {r.overdue}
                    </td>
                    <td className="py-2.5 text-center text-xs text-gray-500">
                      {r.lastActivity ? timeAgoAr(r.lastActivity) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SectionCard>
  );
}
