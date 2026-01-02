import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const app = express();

app.use(helmet({
  // Keep things simple for a local demo dashboard.
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '100kb' }));

// ---- Helpers
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizePhone(phone) {
  return String(phone || '').trim();
}

// ---- API
app.post('/api/reservations', (req, res) => {
  const { customerName, orderType, phoneNumber, items } = req.body || {};

  if (!isNonEmptyString(customerName) || !isNonEmptyString(orderType) || !isNonEmptyString(phoneNumber)) {
    return res.status(400).json({
      ok: false,
      error: 'الرجاء إدخال: اسم العميل، نوع الطلب، رقم الهاتف.'
    });
  }

  // items: optional array of {name, price}
  let itemsJson = null;
  if (Array.isArray(items)) {
    const safeItems = items
      .filter((it) => it && typeof it === 'object')
      .map((it) => ({
        name: String(it.name ?? '').trim(),
        price: Number(it.price ?? 0)
      }))
      .filter((it) => it.name.length > 0);

    if (safeItems.length) itemsJson = JSON.stringify(safeItems);
  }

  const phone = normalizePhone(phoneNumber);

  const stmt = db.prepare(
    `INSERT INTO reservations (customerName, orderType, phoneNumber, itemsJson)
     VALUES (?, ?, ?, ?)`
  );

  const info = stmt.run(customerName.trim(), orderType.trim(), phone, itemsJson);
  const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(info.lastInsertRowid);

  return res.status(201).json({ ok: true, reservation: row });
});

app.get('/api/reservations', (req, res) => {
  const { status, q, limit = '200' } = req.query;
  const lim = Math.max(1, Math.min(500, Number(limit) || 200));

  let where = '1=1';
  const params = [];

  if (isNonEmptyString(status)) {
    where += ' AND status = ?';
    params.push(String(status).trim());
  }

  if (isNonEmptyString(q)) {
    where += ' AND (customerName LIKE ? OR phoneNumber LIKE ? OR orderType LIKE ?)';
    const like = `%${String(q).trim()}%`;
    params.push(like, like, like);
  }

  const rows = db
    .prepare(`SELECT * FROM reservations WHERE ${where} ORDER BY datetime(createdAt) DESC LIMIT ${lim}`)
    .all(...params);

  res.json({ ok: true, reservations: rows });
});

app.patch('/api/reservations/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};

  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'id غير صالح' });
  if (!isNonEmptyString(status)) return res.status(400).json({ ok: false, error: 'status مطلوب' });

  const allowed = new Set(['new', 'confirmed', 'done', 'canceled']);
  const st = String(status).trim();
  if (!allowed.has(st)) {
    return res.status(400).json({ ok: false, error: 'status غير مسموح (new/confirmed/done/canceled)' });
  }

  const info = db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(st, id);
  if (info.changes === 0) return res.status(404).json({ ok: false, error: 'غير موجود' });

  const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
  return res.json({ ok: true, reservation: row });
});

app.delete('/api/reservations/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'id غير صالح' });

  const info = db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ ok: false, error: 'غير موجود' });

  res.json({ ok: true });
});

// ---- Dashboard (simple, no login by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ---- CORS for local static files
app.use((req, res, next) => {
  // Minimal CORS so you can open menu.html from file:// during development.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}/admin/`);
});

