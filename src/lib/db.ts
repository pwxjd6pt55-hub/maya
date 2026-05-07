import mysql from "mysql2/promise";

// Logging the connection attempt (excluding password)
console.log('--- Tentative de connexion MySQL ---');
console.log('Host:', process.env.MYSQLHOST || process.env.DB_HOST || "tramway.proxy.rlwy.net");
console.log('Port:', process.env.MYSQLPORT || process.env.DB_PORT || "41725");
console.log('User:', process.env.MYSQLUSER || process.env.DB_USER || "root");
console.log('Database:', process.env.MYSQLDATABASE || process.env.DB_NAME || "railway");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "tramway.proxy.rlwy.net",
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || "41725"),
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "oyCHsEavgHVluryWCFnRZjhqJitaMEUN",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;