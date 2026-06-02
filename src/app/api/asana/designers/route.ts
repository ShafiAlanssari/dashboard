import { NextResponse } from "next/server";
import { findProject, getTasksInProject, getDefaultWorkspaceGid } from "@/lib/asana";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  name: string;
  active: number;
  completedThisWeek: number;
  overdue: number;
  lastActivity: number | null;
};

/**
 * يقرأ مهام مشروع "القسم الفني" ويجمّعها حسب المصمم المسند له.
 */
export async function GET() {
  try {
    const workspace = await getDefaultWorkspaceGid();
    if (!workspace) {
      return NextResponse.json({ error: "لا يوجد workspace" }, { status: 500 });
    }

    const project = await findProject(workspace, "القسم الفني");
    if (!project) {
      return NextResponse.json(
        { error: "لم أجد مشروع باسم القسم الفني. تحقق من الاسم في Asana." },
        { status: 404 }
      );
    }

    const tasks = await getTasksInProject(project.gid);
    const startOfWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // تجميع المهام حسب المسند إليه
    const grouped = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const name = t.assignee?.name?.trim();
      if (!name) continue; // نتجاهل المهام غير المسندة في التقرير
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name)!.push(t);
    }

    const rows: Row[] = [...grouped.entries()]
      .map(([name, list]) => {
        const active = list.filter((t) => !t.completed).length;
        const completedThisWeek = list.filter(
          (t) => t.completed && new Date(t.modified_at).getTime() >= startOfWeek
        ).length;
        const overdue = list.filter(
          (t) =>
            !t.completed &&
            t.due_on &&
            new Date(t.due_on + "T23:59:59").getTime() < Date.now()
        ).length;
        const lastActivity = list.reduce<number | null>((acc, t) => {
          const ts = new Date(t.modified_at).getTime();
          return acc === null || ts > acc ? ts : acc;
        }, null);

        return { name, active, completedThisWeek, overdue, lastActivity };
      })
      // ترتيب: الأكثر نشاطاً (مهام نشطة + مكتملة) أولاً
      .sort(
        (a, b) =>
          b.active + b.completedThisWeek - (a.active + a.completedThisWeek)
      );

    return NextResponse.json({ rows, project: project.name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Asana error" }, { status: 500 });
  }
}
