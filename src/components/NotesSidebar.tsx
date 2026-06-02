"use client";

import { useState, useEffect } from "react";
import { SectionCard } from "./Skeleton";
import { timeAgoAr } from "@/lib/team";

type Note = { id: string; content: string; createdAt: number };

const STORAGE_KEY = "dm_notes";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, 5)));
}

export function NotesSidebar() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const updated = [
      { id: Date.now().toString(), content: text, createdAt: Date.now() },
      ...notes,
    ].slice(0, 5);
    setNotes(updated);
    saveNotes(updated);
    setDraft("");
  };

  const remove = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <SectionCard title="ملاحظات سريعة">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
        }}
        rows={3}
        placeholder="اكتب ملاحظة سريعة..."
        className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-light resize-none"
        dir="rtl"
      />
      <button
        onClick={add}
        disabled={!draft.trim()}
        className="w-full mt-2 px-3 py-1.5 text-sm rounded-lg bg-brand text-white hover:bg-brand-light disabled:opacity-50"
      >
        حفظ
      </button>

      <div className="mt-4 space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="p-2 border border-gray-100 rounded-lg group hover:bg-brand-bg">
            <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">{n.content}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">{timeAgoAr(n.createdAt)}</span>
              <button
                onClick={() => remove(n.id)}
                className="text-[10px] text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {!notes.length && (
          <div className="text-xs text-gray-400 text-center py-3">لا توجد ملاحظات بعد</div>
        )}
      </div>
    </SectionCard>
  );
}
