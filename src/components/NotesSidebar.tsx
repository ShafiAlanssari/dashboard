"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SectionCard } from "./Skeleton";
import { timeAgoAr } from "@/lib/team";

type Note = { id: string; content: string; createdAt: string };

export function NotesSidebar() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");

  const q = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const r = await fetch("/api/notes");
      return (await r.json()) as { notes: Note[] };
    },
  });

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const r = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!r.ok) throw new Error("فشل الحفظ");
      return r.json();
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  const submit = () => {
    if (draft.trim()) addMutation.mutate(draft.trim());
  };

  return (
    <SectionCard title="ملاحظات سريعة">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={3}
        placeholder="اكتب ملاحظة سريعة..."
        className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-light resize-none"
        dir="rtl"
      />
      <button
        onClick={submit}
        disabled={!draft.trim() || addMutation.isPending}
        className="w-full mt-2 px-3 py-1.5 text-sm rounded-lg bg-brand text-white hover:bg-brand-light disabled:opacity-50"
      >
        {addMutation.isPending ? "جاري الحفظ..." : "حفظ"}
      </button>

      <div className="mt-4 space-y-2">
        {q.data?.notes?.map((n) => (
          <div
            key={n.id}
            className="p-2 border border-gray-100 rounded-lg group hover:bg-brand-bg"
          >
            <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">{n.content}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">
                {timeAgoAr(new Date(n.createdAt).getTime())}
              </span>
              <button
                onClick={() => deleteMutation.mutate(n.id)}
                className="text-[10px] text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {!q.data?.notes?.length && (
          <div className="text-xs text-gray-400 text-center py-3">لا توجد ملاحظات بعد</div>
        )}
      </div>
    </SectionCard>
  );
}
