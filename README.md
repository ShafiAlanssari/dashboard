# لوحة تحكم مدير إدارة التصميم

تطبيق ويب شخصي يجمع متابعة الإيميلات (Gmail) والمهام (Asana) وتقرير المصممين وأخبار التصميم/الذكاء الاصطناعي في مكان واحد.

## التشغيل بالعربي

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد قاعدة البيانات
```bash
npm run db:push
```

### 3. إعداد المتغيرات
انسخ ملف `.env.example` إلى `.env.local` واملأ القيم:
```bash
cp .env.example .env.local
```
ثم افتح `.env.local` وأضف:
- `ASANA_ACCESS_TOKEN` من [Asana Developer Console](https://app.asana.com/0/my-apps)
- `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` من [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- `NEXTAUTH_SECRET` — أي نص عشوائي طويل (مثلاً عبر `openssl rand -base64 32`)
- `ANTHROPIC_API_KEY` (اختياري — لتفعيل اقتراحات الرد بالذكاء الاصطناعي)

### 4. التشغيل
```bash
npm run dev
```
افتح [http://localhost:3000](http://localhost:3000) ثم اربط حساب Gmail من الزر في الأعلى.

> صفحة الإعداد: [http://localhost:3000/setup](http://localhost:3000/setup)

---

## English Setup

### 1. Install
```bash
npm install
```

### 2. Database
```bash
npm run db:push
```

### 3. Environment
```bash
cp .env.example .env.local
```
Fill in: `ASANA_ACCESS_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`. Optional: `ANTHROPIC_API_KEY` for AI reply suggestions.

For Google OAuth, set the redirect URI to:
```
http://localhost:3000/api/auth/callback/google
```
And enable the Gmail API in Google Cloud Console.

### 4. Run
```bash
npm run dev
```

---

## الأقسام

- **الإيميلات (Gmail):** الإيميلات الواردة لـ inbox غير المُجاب عليها، مع تمييز ما تجاوز 24 ساعة بشارة "عاجل". تستبعد إشعارات Asana و no-reply تلقائياً.
- **مهامي في Asana:** المهام المسندة لك وغير المكتملة. فلاتر: الكل / متأخرة / هذا الأسبوع / بدون موعد.
- **تقرير المصممين:** جدول يومي لكل مصمم من فريقك (6 مصممين) — مهام نشطة، مكتملة هذا الأسبوع، متأخرة، آخر نشاط.
- **أخبار AI والتصميم:** بطاقات أفقية من The Verge Design و TechCrunch AI و Smashing Magazine و Creative Bloq و Designer News.
- **ملاحظات سريعة:** تُحفظ في SQLite محلياً.
- **اقتراح رد:** يُولّد رد إيميل بأسلوبك (الزميل/الزميلة، تحية طيبة، مع أطيب التحيات). يستخدم Claude لو وُجد `ANTHROPIC_API_KEY`، وإلا قالب جاهز.

## التحديث التلقائي
- Gmail: كل 5 دقائق
- Asana: كل 10 دقائق
- الأخبار: كل ساعة (مع cache على السيرفر)

## الإشعارات
لو السماح ممنوح، يصلك إشعار من المتصفح عند وصول إيميل جديد عاجل أثناء فتح الصفحة.

## التقنيات
Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth (Google) · Prisma + SQLite · React Query · rss-parser · googleapis
