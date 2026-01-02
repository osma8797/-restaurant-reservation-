# Backend + Dashboard (الحجوزات/الطلبات)

هذا المجلد يضيف **باك‑إند** بسيط (Node.js + Express + SQLite) لاستقبال نموذج الحجز من `menu.html` وتخزينه في قاعدة بيانات، مع **لوحة تحكم** لإدارة الطلبات.

## المتطلبات
- Node.js (يفضل 18+)

## التشغيل على macOS (محلي)
من داخل مجلد المشروع:

```zsh
cd "/Users/jfnsjfg/Desktop/osama wep 2/backend"
npm install
npm start
```

بعد التشغيل محليًا:
- Dashboard: `http://localhost:3001/admin/`

---

# ✅ تشغيله “في الواقع” برابط حقيقي (Online)

عشان تقدر ترسل رابط للعميل/المطعم لازم جزئين:

1) **الموقع (HTML/CSS)** استضافة Static = رابط عام.
2) **الباك‑إند + الداشبورد** استضافة Backend = رابط عام.

ثم نغيّر `API_BASE` في `menu.html` من `http://localhost:3001` إلى رابط الباك‑إند الحقيقي.

## الخيار الأسهل المقترح
- **الموقع (Static):** Netlify أو Vercel
- **الباك‑إند (API + Dashboard):** Render.com

### A) نشر الموقع (Static)
1) ارفع ملفات المشروع (كل ملفات `.html` + مجلد `image/`) إلى GitHub (مستودع).
2) افتح Netlify (أو Vercel) واختر **New site from Git**.
3) اختر المستودع.
4) لأنها صفحات عادية: ما تحتاج Build.
5) بيطلع لك رابط مثل:
   - `https://your-site.netlify.app`

### B) نشر الباك‑إند + الداش (Render)
1) افتح Render.com → **New** → **Web Service**.
2) اختر نفس مستودع GitHub.
3) مهم: في Render لازم تحدد إن التشغيل داخل مجلد `backend`.
   - Root Directory: `backend`
4) Build Command:
   - `npm install`
5) Start Command:
   - `npm start`
6) Render بيعطيك رابط مثل:
   - `https://your-backend.onrender.com`
7) الداشبورد بيكون على:
   - `https://your-backend.onrender.com/admin/`

### C) تعديل `menu.html` عشان يرسل للرابط الحقيقي
في `menu.html` ابحث عن:

- `const API_BASE = 'http://localhost:3001';`

وغيّره إلى رابط Render الحقيقي مثلًا:

- `const API_BASE = 'https://your-backend.onrender.com';`

وبكذا أي عميل يفتح موقعك (رابط Netlify) ويضغط إرسال، الطلب بيروح للباك‑إند الحقيقي وتقدر تشوفه في الداشبورد.

## ملاحظة مهمة جدًا
- لو الباك‑إند على Render المجاني ممكن “ينام” ويصحى أول طلب (تأخير بسيط أول مرة).
- الداشبورد الآن بدون كلمة مرور. قبل ما ترسله لأحد عام، الأفضل نحميه (Password).

إذا تبغاني أضبط لك حماية للداشبورد بكلمة مرور (سريع جدًا) قلّي.
