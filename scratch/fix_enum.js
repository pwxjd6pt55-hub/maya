const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Parse .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
} catch (e) {}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Updating panier_items.item_type ENUM...');
    await connection.query(`
      ALTER TABLE panier_items 
      MODIFY COLUMN item_type ENUM('catalogue', 'melange', 'melange_essences', 'melange_parfums') NOT NULL;
    `);
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

run();
