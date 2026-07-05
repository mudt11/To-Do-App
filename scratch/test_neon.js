const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

neonConfig.webSocketConstructor = ws;

async function test() {
  require('dotenv').config();
  console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Success:", res.rows[0]);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
