import { pool } from './db.js';

async function runMigrations() {
  console.log('Running database migrations...');
  
  const alters = [
    'ALTER TABLE jobs ADD COLUMN company_name VARCHAR(255) AFTER name',
    'ALTER TABLE jobs MODIFY coating VARCHAR(100) DEFAULT "ไม่เคลือบ"',
    'ALTER TABLE jobs ADD COLUMN comments JSON',
    'ALTER TABLE jobs ADD COLUMN needs_attention BOOLEAN DEFAULT FALSE',
    'ALTER TABLE jobs ADD COLUMN is_rush BOOLEAN DEFAULT FALSE'
  ];

  for (const query of alters) {
    try {
      await pool.execute(query);
      console.log('✅ Executed:', query);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        // Column already exists, ignore
        console.log('⏭️ Skipped (already exists):', query);
      } else {
        // Other errors (e.g. for MODIFY coating it won't throw ER_DUP_FIELDNAME but might just succeed)
        if (query.includes('MODIFY') && !e.message.includes('Unknown column')) {
           // Ignored
           console.log('⏭️ Modify might have already been applied or failed:', e.message);
        } else {
           console.log('⚠️ Warning:', e.message);
        }
      }
    }
  }

  console.log('Migrations completed.');
  process.exit(0);
}

runMigrations();
