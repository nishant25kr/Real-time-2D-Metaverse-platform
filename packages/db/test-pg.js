import pg from 'pg';
import 'dotenv/config';

async function test() {
  const url = process.env.DATABASE_URL || "postgresql://mete_verse_user:wRBYj71503iwTu2cOVbPVkOYcu6Xyiw6@dpg-d6hgmupaae7s73btmavg-a.oregon-postgres.render.com/mete_verse?sslmode=require";
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Testing connection to:', url.split('@')[1]);
    const res = await pool.query('SELECT NOW()');
    console.log('✅ SUCCESS:', res.rows[0]);
  } catch (err) {
    console.error('❌ FAILURE:', err);
  } finally {
    await pool.end();
  }
}
test();
