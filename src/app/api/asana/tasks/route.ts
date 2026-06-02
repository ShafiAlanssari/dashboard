import { NextResponse } from "next/server";
import { findProject, getTasksInProject, getDefaultWorkspaceGid } from "@/lib/asana";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * يقرأ المهام من مشروع Traffic — الطلبات الواردة الجديدة
 * التي تحتاج توزيع من المدير قبل تحويلها للقسم الفني.
 */
export async function GET() {
  try {
    const workspace = await getDefaultWorkspaceGid();
    if (!workspace) {
      return NextResponse.json({ error: "لا يوجد workspace" }, { status: 500 });
    }

    const project = await findProject(workspace, "Traffic");
    if (!project) {
      return NextResponse.json(
        { error: "لم أجد مشروع باسم Traffic. تحقق من الاسم في Asana." },
        { status: 404 }
      );
    }

    const all = await getTasksInProject(project.gid);
    const active = all.filter((t) => !t.completed);

    return NextResponse.json({ tasks: active, project: project.name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Asana error" }, { status: 500 });
  }
}
