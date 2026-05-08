const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  // Chargement manuel de .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERREUR : La variable DATABASE_URL est manquante dans .env.local');
    process.exit(1);
  }

  console.log('Connexion à PostgreSQL sur Render...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Nécessaire pour Render
    }
  });

  try {
    await client.connect();
    console.log('Connecté avec succès !');

    const sqlPath = path.join(__dirname, '..', 'database', 'schema_pg.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Exécution du schéma PostgreSQL...');
    await client.query(sql);
    
    console.log('✅ Migration réussie ! Votre base de données sur Render est prête.');
  } catch (err) {
    console.error('❌ Échec de la migration :', err.message);
  } finally {
    await client.end();
  }
}

migrate();
