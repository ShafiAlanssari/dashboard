import { google } from "googleapis";

export type EmailItem = {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  internalDate: number;
  hoursAgo: number;
  priority: "urgent" | "normal";
  permalink: string;
};

const EXCLUDE_FROM = [
  "no-reply",
  "noreply",
  "mailer-daemon",
  "asana.com",
  "notifications@",
  "donotreply",
];

function parseFrom(raw: string): { email: string; name: string } {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  }
  return { name: raw, email: raw };
}

export async function getEmailsNeedingReply(accessToken: string): Promise<EmailItem[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox -from:me newer_than:7d",
    maxResults: 50,
  });

  const messages = list.data.messages ?? [];
  const items: EmailItem[] = [];
  const seenThreads = new Set<string>();

  for (const m of messages) {
    if (!m.id || !m.threadId) continue;
    if (seenThreads.has(m.threadId)) continue;
    seenThreads.add(m.threadId);

    const thread = await gmail.users.threads.get({
      userId: "me",
      id: m.threadId,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date", "To"],
    });

    const msgs = thread.data.messages ?? [];
    const last = msgs[msgs.length - 1];
    if (!last?.id) continue;

    const headers = last.payload?.headers ?? [];
    const fromHeader = headers.find((h) => h.name === "From")?.value ?? "";
    const subjectHeader = headers.find((h) => h.name === "Subject")?.value ?? "(بدون موضوع)";
    const labels = last.labelIds ?? [];

    if (labels.includes("SENT")) continue;
    if (EXCLUDE_FROM.some((ex) => fromHeader.toLowerCase().includes(ex))) continue;

    const { email, name } = parseFrom(fromHeader);
    const internalDate = Number(last.internalDate ?? "0");
    const hoursAgo = Math.floor((Date.now() - internalDate) / (1000 * 60 * 60));

    items.push({
      id: last.id,
      threadId: m.threadId,
      from: email,
      fromName: name || email,
      subject: subjectHeader,
      snippet: (last.snippet ?? "").slice(0, 140),
      internalDate,
      hoursAgo,
      priority: hoursAgo >= 24 ? "urgent" : "normal",
      permalink: `https://mail.google.com/mail/u/0/#inbox/${m.threadId}`,
    });
  }

  return items.sort((a, b) => b.internalDate - a.internalDate);
}
