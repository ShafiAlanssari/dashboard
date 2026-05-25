"use client";

import { useEffect, useState } from "react";

type Email = {
  fromName: string;
  subject: string;
  snippet: string;
  permalink: string;
};

export function ReplyModal({ email, onClose }: { email: Email; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"template" | "ai">("template");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gmail/suggest-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromName: email.fromName,
        subject: email.subject,
        snippet: email.snippet,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setReply(data.reply || "");
        setSource(data.source || "template");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [email.fromName, email.subject, email.snippet]);

  const copy = async () => {
    await navigator.clipboard.writeText(reply);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-brand">رد مقترح</h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-bg text-gray-600">
            {source === "ai" ? "Claude AI" : "قالب جاهز"}
          </span>
        </div>

        <div className="text-xs text-gray-500 mb-3">
          <div className="truncate">إلى: {email.fromName}</div>
          <div className="truncate">الموضوع: {email.subject}</div>
        </div>

        {loading ? (
          <div className="h-40 skeleton rounded-lg" />
        ) : (
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={9}
            className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-light"
            dir="rtl"
          />
        )}

        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-brand-bg"
          >
            إغلاق
          </button>
          <button
            onClick={copy}
            className="px-3 py-1.5 text-sm rounded-lg border border-brand text-brand hover:bg-brand-bg"
          >
            نسخ
          </button>
          <a
            href={email.permalink}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-sm rounded-lg bg-brand text-white hover:bg-brand-light"
          >
            افتح في Gmail
          </a>
        </div>
      </div>
    </div>
  );
}
