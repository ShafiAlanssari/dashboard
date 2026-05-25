import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEmailsNeedingReply } from "@/lib/gmail";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  try {
    const emails = await getEmailsNeedingReply(session.accessToken);
    return NextResponse.json({ emails });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gmail error" }, { status: 500 });
  }
}
