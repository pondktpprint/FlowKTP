import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { authMiddleware } from './auth.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ── Auth ──────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

// ── Sales (public) ────────────────────────────────
app.get('/api/sales', async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM sales ORDER BY id');
  res.json(rows);
});

// ── Jobs (public read) ────────────────────────────
app.get('/api/jobs', async (req, res) => {
  const { sales_id, status } = req.query;
  let sql = `
    SELECT j.*, s.name AS sales_name, s.color AS sales_color
    FROM jobs j
    JOIN sales s ON j.sales_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (sales_id) { sql += ' AND j.sales_id = ?'; params.push(sales_id); }
  if (status)   { sql += ' AND j.status = ?';   params.push(status); }
  sql += ' ORDER BY j.updated_at DESC';
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

app.get('/api/jobs/:id', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT j.*, s.name AS sales_name, s.color AS sales_color FROM jobs j JOIN sales s ON j.sales_id = s.id WHERE j.id = ?',
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  const [history] = await pool.execute('SELECT * FROM job_history WHERE job_id = ? ORDER BY changed_at DESC', [req.params.id]);
  res.json({ ...rows[0], history });
});

// ── Jobs (production only) ────────────────────────
app.post('/api/jobs', authMiddleware, async (req, res) => {
  const { job_no, name, sales_id, due_date, paper, colors, coating, status, note, urgency_color } = req.body;
  if (!job_no || !name || !sales_id) return res.status(400).json({ error: 'job_no, name, sales_id required' });
  const [result] = await pool.execute(
    'INSERT INTO jobs (job_no, name, sales_id, due_date, paper, colors, coating, status, note, urgency_color) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [job_no, name, sales_id, due_date || null, paper || null, colors || null, coating || 'ไม่เคลือบ', status || 'received', note || null, urgency_color || 'orange']
  );
  res.status(201).json({ id: result.insertId });
});

app.put('/api/jobs/:id', authMiddleware, async (req, res) => {
  const [existing] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: 'Not found' });

  const old = existing[0];
  const { job_no, name, sales_id, due_date, paper, colors, coating, status, note, urgency_color } = req.body;

  await pool.execute(
    'UPDATE jobs SET job_no=?, name=?, sales_id=?, due_date=?, paper=?, colors=?, coating=?, status=?, note=?, urgency_color=? WHERE id=?',
    [
      job_no ?? old.job_no,
      name ?? old.name,
      sales_id ?? old.sales_id,
      due_date ?? old.due_date,
      paper ?? old.paper,
      colors ?? old.colors,
      coating ?? old.coating,
      status ?? old.status,
      note ?? old.note,
      urgency_color ?? old.urgency_color,
      req.params.id
    ]
  );

  // Log status change
  if (status && status !== old.status) {
    await pool.execute(
      'INSERT INTO job_history (job_id, old_status, new_status, note) VALUES (?,?,?,?)',
      [req.params.id, old.status, status, req.body.history_note || null]
    );
  }
  res.json({ ok: true });
});

app.delete('/api/jobs/:id', authMiddleware, async (req, res) => {
  await pool.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API running on :${PORT}`));
