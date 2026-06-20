const { pool } = require("../config/database");

async function garantirEstrutura() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS curriculos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL UNIQUE,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      cidade VARCHAR(100) NOT NULL,
      cargo VARCHAR(100) NOT NULL,
      area VARCHAR(80) NOT NULL,
      resumo TEXT NOT NULL,
      escolaridade VARCHAR(80) NOT NULL,
      curso VARCHAR(120),
      instituicao VARCHAR(120),
      empresa VARCHAR(100),
      funcao VARCHAR(100),
      atividades TEXT,
      habilidades TEXT NOT NULL,
      linkedin VARCHAR(255),
      portfolio VARCHAR(255),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  garantirEstrutura
};
