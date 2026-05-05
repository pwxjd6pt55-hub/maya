import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "tramway.proxy.rlwy.net",
  port: parseInt(process.env.DB_PORT || "41725"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "oyCHsEavgHVluryWCFnRZjhqJitaMEUN",
  database: process.env.DB_NAME || "railway",
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;