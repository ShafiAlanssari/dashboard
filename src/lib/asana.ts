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

export type AsanaProject = {
  gid: string;
  name: string;
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

/** Cache projects list per workspace for the lifetime of the server process */
const projectsCache = new Map<string, AsanaProject[]>();

async function listProjects(workspaceGid: string): Promise<AsanaProject[]> {
  if (projectsCache.has(workspaceGid)) return projectsCache.get(workspaceGid)!;
  const projects = await asanaFetch<AsanaProject[]>(
    `/projects?workspace=${workspaceGid}&archived=false&opt_fields=name&limit=100`
  );
  projectsCache.set(workspaceGid, projects);
  return projects;
}

/** Find a project by partial name match (case-insensitive). */
export async function findProject(
  workspaceGid: string,
  needle: string
): Promise<AsanaProject | null> {
  const projects = await listProjects(workspaceGid);
  const lc = needle.toLowerCase();
  return (
    projects.find((p) => p.name.toLowerCase() === lc) ??
    projects.find((p) => p.name.toLowerCase().includes(lc) || lc.includes(p.name.toLowerCase())) ??
    null
  );
}

const TASK_FIELDS =
  "name,completed,due_on,permalink_url,assignee.name,projects.name,modified_at";

export async function getTasksInProject(projectGid: string): Promise<AsanaTask[]> {
  return asanaFetch<AsanaTask[]>(
    `/projects/${projectGid}/tasks?opt_fields=${TASK_FIELDS}&limit=100`
  );
}

/** Get the workspace gid of the currently authenticated token. */
export async function getDefaultWorkspaceGid(): Promise<string | null> {
  const me = await getMe();
  return me.workspaces[0]?.gid ?? null;
}
