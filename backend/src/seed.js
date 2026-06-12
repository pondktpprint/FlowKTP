// Run once: node src/seed.js
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const hash = await bcrypt.hash('491693148qQ', 12);
await pool.execute(
  'INSERT INTO users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
  ['Pond', hash, hash]
);
console.log('✅ User Pond created');
process.exit(0);
