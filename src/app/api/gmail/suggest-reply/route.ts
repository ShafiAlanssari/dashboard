import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Body = { fromName: string; subject: string; snippet: string };

function templateReply({ fromName, subject }: Body): string {
  const first = fromName.split(" ")[0] || "الزميل";
  return [
    `الزميل/الزميلة ${first}، تحية طيبة،`,
    "",
    `بخصوص "${subject}" — تم الاطلاع، وسيتم الرجوع لكم بالرد قبل نهاية اليوم.`,
    "",
    "مع أطيب التحيات،",
  ].join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ reply: templateReply(body), source: "template" });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system:
        "اكتب رد إيميل قصير ومحترف بأسلوب مدير إدارة التصميم شفيع الأنصاري بالعربية. " +
        "افتتاح: 'الزميل/الزميلة [الاسم]، تحية طيبة،' — جسم مباشر في سطر أو سطرين — ختام: 'مع أطيب التحيات،'. " +
        "لا تستخدم حشواً ولا مقدمات طويلة. لا تخترع تفاصيل لست متأكداً منها — اطلب التوضيح إن لزم.",
      messages: [
        {
          role: "user",
          content: `إيميل وارد:\nمن: ${body.fromName}\nالموضوع: ${body.subject}\nالمحتوى: ${body.snippet}\n\nاكتب الرد المقترح فقط بدون أي شرح.`,
        },
      ],
    });
    const text =
      message.content
        .filter((c) => c.type === "text")
        .map((c) => (c as { text: string }).text)
        .join("\n") || templateReply(body);
    return NextResponse.json({ reply: text, source: "ai" });
  } catch {
    return NextResponse.json({ reply: templateReply(body), source: "template" });
  }
}
