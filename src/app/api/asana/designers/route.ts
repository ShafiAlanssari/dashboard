import { NextResponse } from "next/server";
import { getWorkspaceTasksForUsers } from "@/lib/asana";
import { DESIGNERS } from "@/lib/team";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  name: string;
  active: number;
  completedThisWeek: number;
  overdue: number;
  lastActivity: number | null;
};

export async function GET() {
  try {
    const tasks = await getWorkspaceTasksForUsers(DESIGNERS);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const rows: Row[] = DESIGNERS.map((designer) => {
      const mine = tasks.filter((t) =>
        t.assignee?.name && (t.assignee.name.includes(designer) || designer.includes(t.assignee.name))
      );

      const active = mine.filter((t) => !t.completed).length;
      const completedThisWeek = mine.filter(
        (t) => t.completed && new Date(t.modified_at).getTime() >= startOfWeek.getTime()
      ).length;
      const overdue = mine.filter(
        (t) => !t.completed && t.due_on && new Date(t.due_on + "T23:59:59").getTime() < Date.now()
      ).length;
      const lastTs = mine.reduce<number | null>((acc, t) => {
        const ts = new Date(t.modified_at).getTime();
        return acc === null || ts > acc ? ts : acc;
      }, null);

      return { name: designer, active, completedThisWeek, overdue, lastActivity: lastTs };
    });

    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Asana error" }, { status: 500 });
  }
}
