const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scratch/make_admin.js votre@email.com');
    process.exit(1);
  }

  // Chargement de DATABASE_URL
  const envPath = path.join(__dirname, '..', '.env.local');
  let connectionString = process.env.DATABASE_URL;
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key?.trim() === 'DATABASE_URL') connectionString = value.trim().replace(/^["']|["']$/g, '');
    });
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('UPDATE users SET role = $1 WHERE email = $2 RETURNING nom', ['admin', email]);
    if (res.rowCount > 0) {
      console.log(`✅ Succès ! ${res.rows[0].nom} (${email}) est maintenant ADMIN.`);
    } else {
      console.log(`❌ Erreur : Aucun utilisateur trouvé avec l'email ${email}.`);
    }
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await client.end();
  }
}

makeAdmin();
