import { NextResponse } from "next/server";
import { getMyTasks } from "@/lib/asana";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tasks = await getMyTasks();
    const active = tasks.filter((t) => !t.completed);
    return NextResponse.json({ tasks: active });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Asana error" }, { status: 500 });
  }
}
