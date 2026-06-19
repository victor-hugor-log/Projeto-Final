require("dotenv").config();

const mysql = require("mysql2/promise");

const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "favela_tech",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
};

const pool = mysql.createPool(databaseConfig);

async function testarConexao() {
  const conexao = await pool.getConnection();

  try {
    await conexao.ping();
  } finally {
    conexao.release();
  }
}

module.exports = {
  pool,
  testarConexao
};
