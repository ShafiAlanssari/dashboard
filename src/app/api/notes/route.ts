import { NextResponse } from "next/server";

// ملاحظة: في بيئة الإنتاج (Vercel) تُحفظ الملاحظات في المتصفح مباشرة (localStorage).
// هذا الـ endpoint احتياطي للتطوير المحلي فقط.

export const dynamic = "force-dynamic";

let notes: { id: string; content: string; createdAt: string }[] = [];

export async function GET() {
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const { content } = (await req.json()) as { content: string };
  const trimmed = (content ?? "").trim();
  if (!trimmed) return NextResponse.json({ error: "empty" }, { status: 400 });
  const note = { id: Date.now().toString(), content: trimmed, createdAt: new Date().toISOString() };
  notes = [note, ...notes].slice(0, 5);
  return NextResponse.json({ note });
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: string };
  notes = notes.filter((n) => n.id !== id);
  return NextResponse.json({ ok: true });
}
