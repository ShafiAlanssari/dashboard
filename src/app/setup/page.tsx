"use client";

import { useSession, signIn } from "next-auth/react";

export default function SetupPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-brand-bg py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-brand mb-2">إعداد لوحة التحكم</h1>
        <p className="text-sm text-gray-600 mb-8">
          أكمل الخطوات التالية لتشغيل اللوحة. كل الإعدادات تُحفظ في ملف <code className="bg-brand-bg px-1 rounded">.env.local</code> داخل المشروع.
        </p>

        <Step number={1} title="Asana Personal Access Token">
          <ol className="text-sm text-gray-700 list-decimal mr-5 space-y-1.5">
            <li>
              ادخل على{" "}
              <a
                href="https://app.asana.com/0/my-apps"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                Asana → Developer Console
              </a>
            </li>
            <li>اضغط Create new token وأعطه اسم "Dashboard"</li>
            <li>انسخ الـ token وضعه في <code className="bg-brand-bg px-1 rounded">ASANA_ACCESS_TOKEN</code> داخل <code className="bg-brand-bg px-1 rounded">.env.local</code></li>
          </ol>
        </Step>

        <Step number={2} title="Google OAuth (لـ Gmail)">
          <ol className="text-sm text-gray-700 list-decimal mr-5 space-y-1.5">
            <li>
              ادخل على{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                Google Cloud Console → Credentials
              </a>
            </li>
            <li>أنشئ OAuth Client ID جديد من نوع Web Application</li>
            <li>
              أضف <code className="bg-brand-bg px-1 rounded">http://localhost:3000/api/auth/callback/google</code> كـ Authorized redirect URI
            </li>
            <li>
              فعّل Gmail API من{" "}
              <a
                href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                هنا
              </a>
            </li>
            <li>انسخ Client ID و Client Secret إلى <code className="bg-brand-bg px-1 rounded">.env.local</code></li>
          </ol>
        </Step>

        <Step number={3} title="ربط حساب Gmail">
          {status === "authenticated" ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
              ✓ تم ربط الحساب: {session?.user?.email}
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm hover:bg-brand-light"
            >
              تسجيل الدخول عبر Google
            </button>
          )}
        </Step>

        <Step number={4} title="جاهز">
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-brand text-white text-sm hover:bg-brand-light"
          >
            افتح لوحة التحكم →
          </a>
        </Step>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
          {number}
        </div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="mr-11">{children}</div>
    </div>
  );
}
