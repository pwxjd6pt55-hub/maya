const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Try to parse .env.local if it exists
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim();
    });
  }
} catch (e) {
  console.log('Note: No .env.local found, using system environment variables.');
}

async function migrate() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || "tramway.proxy.rlwy.net";
  const user = process.env.MYSQLUSER || process.env.DB_USER || "root";
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "oyCHsEavgHVluryWCFnRZjhqJitaMEUN";
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";
  const port = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || "41725");

  console.log(`Connecting to ${host}:${port} (${database}) as ${user}...`);

  const pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'update_v3.sql'), 'utf8');
    console.log('Running migration update_v3.sql...');
    await pool.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
