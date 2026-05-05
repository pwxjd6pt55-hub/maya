import mysql from 'mysql2/promise';

const url = 'mysql://root:ToPPMNRattnZdEXPPzEWawngoMrEoECE@tramway.proxy.rlwy.net:42322/railway';

async function checkDB() {
  try {
    const connection = await mysql.createConnection(url);
    console.log('Connexion réussie !');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables présentes :', rows.map(r => Object.values(r)[0]));
    
    await connection.end();
  } catch (err) {
    console.error('Erreur de connexion :', err.message);
  }
}

checkDB();
