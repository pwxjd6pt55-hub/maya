import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),  // ← ajouter cette ligne
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "railway",     // ← "railway" au lieu de "mayabar"
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;