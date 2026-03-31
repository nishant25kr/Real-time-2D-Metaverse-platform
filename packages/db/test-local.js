import pg from 'pg';

async function testLocal() {
  const url = "postgresql://postgres:postgres@localhost:5432/metaverse?schema=public";
  console.log('Testing LOCAL connection...');
  const pool = new pg.Pool({
    connectionString: url,
    // Native local postgres usually doesn't need SSL or rejectUnauthorized
  });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ SUCCESS (LOCAL):', res.rows[0]);
  } catch (err) {
    console.error('❌ FAILURE (LOCAL):', err.message);
  } finally {
    await pool.end();
  }
}
testLocal();
