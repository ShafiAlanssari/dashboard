import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const { content } = (await req.json()) as { content: string };
  const trimmed = (content ?? "").trim();
  if (!trimmed) return NextResponse.json({ error: "empty" }, { status: 400 });
  const note = await prisma.note.create({ data: { content: trimmed } });
  return NextResponse.json({ note });
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: string };
  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
