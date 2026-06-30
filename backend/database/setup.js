const { pool } = require("../config/database");

async function colunaExiste(tabela, coluna) {
  const [colunas] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tabela, coluna]
  );

  return colunas[0].total > 0;
}

async function indiceExiste(tabela, indice) {
  const [indices] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [tabela, indice]
  );

  return indices[0].total > 0;
}

async function garantirColuna(tabela, coluna, definicao) {
  if (await colunaExiste(tabela, coluna)) return;

  await pool.query(`ALTER TABLE ${tabela} ADD COLUMN ${definicao}`);
}

async function garantirUsuarios() {
  await garantirColuna("usuarios", "cep", "cep VARCHAR(9) NULL AFTER habilidades");
  await garantirColuna("usuarios", "endereco", "endereco VARCHAR(150) NULL AFTER cep");
  await garantirColuna("usuarios", "numero", "numero VARCHAR(20) NULL AFTER endereco");
  await garantirColuna("usuarios", "complemento", "complemento VARCHAR(100) NULL AFTER numero");
  await garantirColuna("usuarios", "bairro", "bairro VARCHAR(100) NULL AFTER complemento");
  await garantirColuna("usuarios", "cidade", "cidade VARCHAR(100) NULL AFTER bairro");
  await garantirColuna("usuarios", "estado", "estado VARCHAR(2) NULL AFTER cidade");
  await garantirColuna("usuarios", "foto_perfil", "foto_perfil LONGTEXT NULL AFTER estado");
}

async function garantirCurriculos() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS curriculos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL UNIQUE,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      data_nascimento DATE,
      nacionalidade VARCHAR(60),
      estado_civil VARCHAR(40),
      cidade VARCHAR(100) NOT NULL,
      cargo VARCHAR(100) NOT NULL,
      area VARCHAR(80) NOT NULL,
      disponibilidade VARCHAR(80),
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

  await garantirColuna("curriculos", "data_nascimento", "data_nascimento DATE NULL AFTER telefone");
  await garantirColuna("curriculos", "nacionalidade", "nacionalidade VARCHAR(60) NULL AFTER data_nascimento");
  await garantirColuna("curriculos", "estado_civil", "estado_civil VARCHAR(40) NULL AFTER nacionalidade");
  await garantirColuna("curriculos", "disponibilidade", "disponibilidade VARCHAR(80) NULL AFTER area");
}

async function garantirCandidaturas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS candidaturas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      vaga_id INT NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT "Enviada",
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY candidatura_unica (usuario_id, vaga_id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE
    )
  `);

  if (!(await colunaExiste("candidaturas", "status"))) {
    await pool.query(`
      ALTER TABLE candidaturas
      ADD COLUMN status VARCHAR(40) NOT NULL DEFAULT "Enviada" AFTER vaga_id
    `);
  }

  await pool.query(`
    DELETE repetida
    FROM candidaturas repetida
    INNER JOIN candidaturas original
      ON repetida.usuario_id = original.usuario_id
      AND repetida.vaga_id = original.vaga_id
      AND repetida.id > original.id
  `);

  if (!(await indiceExiste("candidaturas", "candidatura_unica"))) {
    await pool.query(`
      ALTER TABLE candidaturas
      ADD UNIQUE KEY candidatura_unica (usuario_id, vaga_id)
    `);
  }
}

async function garantirEstrutura() {
  await garantirUsuarios();
  await garantirCurriculos();
  await garantirCandidaturas();
}

module.exports = {
  garantirEstrutura
};
