import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const url = 'mysql://root:ToPPMNRattnZdEXPPzEWawngoMrEoECE@tramway.proxy.rlwy.net:42322/railway';

async function seed() {
  const connection = await mysql.createConnection({
    uri: url,
    multipleStatements: true
  });

  console.log('Connecté à la base Railway...');

  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'database', 'schema_mysql.sql'), 'utf8');
    const updateSql = fs.readFileSync(path.join(process.cwd(), 'database', 'update_v2.sql'), 'utf8');

    console.log('Exécution de schema_mysql.sql...');
    await connection.query(schemaSql);
    console.log('Schema créé avec succès !');

    console.log('Exécution de update_v2.sql...');
    await connection.query(updateSql);
    console.log('Mises à jour appliquées avec succès !');

    console.log('--- BASE DE DONNÉES PRÊTE ---');
  } catch (error) {
    console.error('Erreur lors du remplissage :', error);
  } finally {
    await connection.end();
  }
}

seed();
