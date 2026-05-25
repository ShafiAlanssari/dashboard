const ASANA_API = "https://app.asana.com/api/1.0";

export type AsanaTask = {
  gid: string;
  name: string;
  completed: boolean;
  due_on: string | null;
  permalink_url: string;
  assignee: { gid: string; name: string } | null;
  projects: { gid: string; name: string }[];
  modified_at: string;
};

export type AsanaUser = {
  gid: string;
  name: string;
  email?: string;
};

async function asanaFetch<T>(path: string): Promise<T> {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) throw new Error("ASANA_ACCESS_TOKEN غير معرف في .env.local");

  const res = await fetch(`${ASANA_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asana API error (${res.status}): ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function getMe(): Promise<AsanaUser & { workspaces: { gid: string; name: string }[] }> {
  return asanaFetch("/users/me?opt_fields=name,email,workspaces.name");
}

export async function getMyTasks(): Promise<AsanaTask[]> {
  const me = await getMe();
  const workspaceGid = me.workspaces[0]?.gid;
  if (!workspaceGid) return [];

  const fields = "name,completed,due_on,permalink_url,assignee.name,projects.name,modified_at";
  const path = `/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now&opt_fields=${fields}&limit=100`;
  return asanaFetch<AsanaTask[]>(path);
}

export async function getWorkspaceTasksForUsers(userNames: string[]): Promise<AsanaTask[]> {
  const me = await getMe();
  const workspaceGid = me.workspaces[0]?.gid;
  if (!workspaceGid) return [];

  const users = await asanaFetch<AsanaUser[]>(
    `/workspaces/${workspaceGid}/users?opt_fields=name,email&limit=100`
  );

  const matches = users.filter((u) =>
    userNames.some((name) => u.name.includes(name) || name.includes(u.name))
  );

  const fields = "name,completed,due_on,permalink_url,assignee.name,projects.name,modified_at";
  const results: AsanaTask[] = [];
  for (const u of matches) {
    try {
      const tasks = await asanaFetch<AsanaTask[]>(
        `/tasks?assignee=${u.gid}&workspace=${workspaceGid}&opt_fields=${fields}&limit=100`
      );
      results.push(...tasks);
    } catch {
      // skip user on error
    }
  }
  return results;
}
