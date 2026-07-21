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
  if (await colunaExiste(tabela, coluna)) return false;

  await pool.query(`ALTER TABLE ${tabela} ADD COLUMN ${definicao}`);
  return true;
}

async function garantirMigracaoUnica(chave, executar) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migracoes_sistema (
      chave VARCHAR(120) PRIMARY KEY,
      executada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [migracoes] = await pool.execute(
    "SELECT chave FROM migracoes_sistema WHERE chave = ? LIMIT 1",
    [chave]
  );

  if (migracoes.length > 0) return;

  await executar();
  await pool.execute(
    "INSERT INTO migracoes_sistema (chave) VALUES (?)",
    [chave]
  );
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
  const criouEmailVerificado = await garantirColuna("usuarios", "email_verificado", "email_verificado BOOLEAN NOT NULL DEFAULT false AFTER foto_perfil");
  await garantirColuna("usuarios", "email_token_hash", "email_token_hash VARCHAR(255) NULL AFTER email_verificado");
  await garantirColuna("usuarios", "email_token_expira_em", "email_token_expira_em DATETIME NULL AFTER email_token_hash");
  await garantirColuna("usuarios", "senha_reset_codigo_hash", "senha_reset_codigo_hash VARCHAR(255) NULL AFTER email_token_expira_em");
  await garantirColuna("usuarios", "senha_reset_expira_em", "senha_reset_expira_em DATETIME NULL AFTER senha_reset_codigo_hash");

  if (criouEmailVerificado) {
    await pool.query(`
      UPDATE usuarios
      SET email_verificado = 1
      WHERE email_verificado = 0
        AND email_token_hash IS NULL
        AND email_token_expira_em IS NULL
    `);
  }
}

async function garantirVagas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vagas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(120) NOT NULL,
      empresa VARCHAR(100) NOT NULL,
      localizacao VARCHAR(100) NOT NULL,
      area VARCHAR(80),
      tipo VARCHAR(50) NOT NULL,
      habilidades TEXT,
      origem VARCHAR(100),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await garantirColuna("vagas", "external_id", "external_id VARCHAR(120) NULL AFTER id");
  await garantirColuna("vagas", "url", "url VARCHAR(500) NULL AFTER origem");
  await garantirColuna("vagas", "salario", "salario VARCHAR(120) NULL AFTER url");
  await garantirColuna("vagas", "descricao_resumo", "descricao_resumo TEXT NULL AFTER salario");
  await garantirColuna("vagas", "publicado_em", "publicado_em DATETIME NULL AFTER descricao_resumo");
  await garantirColuna("vagas", "atualizado_api_em", "atualizado_api_em DATETIME NULL AFTER publicado_em");

  if (!(await indiceExiste("vagas", "vaga_external_id_unica"))) {
    await pool.query(`
      ALTER TABLE vagas
      ADD UNIQUE KEY vaga_external_id_unica (external_id)
    `);
  }
}

async function garantirVagasBase() {
  const vagasBase = [
    {
      externalId: "local-estagio-suporte-ti-bh",
      titulo: "Estágio em Suporte de TI",
      empresa: "Exemplo Tech",
      localizacao: "Belo Horizonte - MG",
      area: "Tecnologia",
      tipo: "Estagio",
      habilidades: "tecnologia, suporte técnico, informática, atendimento",
      origem: "Parceiros locais",
      salario: "Bolsa compatível",
      descricaoResumo: "Apoio ao time de suporte, atendimento de chamados e manutenção básica de equipamentos."
    },
    {
      externalId: "local-assistente-front-end-remoto",
      titulo: "Assistente de Front-end Júnior",
      empresa: "Studio Digital Favela",
      localizacao: "Remoto",
      area: "Tecnologia",
      tipo: "Freelancer",
      habilidades: "html, css, javascript, responsividade, landing pages, web",
      origem: "Parceiros locais",
      salario: "Por projeto",
      descricaoResumo: "Apoio na criação de páginas responsivas, ajustes visuais com CSS e pequenas interações em JavaScript."
    },
    {
      externalId: "local-jovem-aprendiz-administrativo-bh",
      titulo: "Jovem Aprendiz Administrativo",
      empresa: "Comércio Local BH",
      localizacao: "Belo Horizonte - MG",
      area: "Administracao",
      tipo: "Jovem Aprendiz",
      habilidades: "excel, organização, administração, atendimento",
      origem: "Parceiros locais",
      salario: "Bolsa aprendiz",
      descricaoResumo: "Rotina administrativa, organização de documentos, apoio em planilhas e atendimento interno."
    },
    {
      externalId: "local-atendente-loja-contagem",
      titulo: "Atendente de Loja",
      empresa: "Rede Parceira",
      localizacao: "Contagem - MG",
      area: "Atendimento",
      tipo: "CLT",
      habilidades: "comunicação, atendimento, vendas, organização",
      origem: "Parceiros locais",
      salario: "A combinar",
      descricaoResumo: "Atendimento ao cliente, organização de produtos e apoio nas vendas da unidade."
    },
    {
      externalId: "local-assistente-marketing-remoto",
      titulo: "Assistente de Marketing Digital",
      empresa: "Agência Criativa",
      localizacao: "Remoto",
      area: "Marketing",
      tipo: "Freelancer",
      habilidades: "redes sociais, canva, marketing, criatividade",
      origem: "Parceiros locais",
      salario: "Por projeto",
      descricaoResumo: "Apoio na criação de posts, organização de calendário editorial e acompanhamento de redes sociais."
    },
    {
      externalId: "local-auxiliar-administrativo-contagem",
      titulo: "Auxiliar Administrativo",
      empresa: "Centro Empresarial Contagem",
      localizacao: "Contagem - MG",
      area: "Administracao",
      tipo: "CLT",
      habilidades: "administração, excel, atendimento, organização",
      origem: "Parceiros locais",
      salario: "A combinar",
      descricaoResumo: "Apoio a rotinas administrativas, conferência de documentos e contato com clientes."
    },
    {
      externalId: "local-aprendiz-atendimento-betim",
      titulo: "Jovem Aprendiz em Atendimento",
      empresa: "Serviços Betim",
      localizacao: "Betim - MG",
      area: "Atendimento",
      tipo: "Jovem Aprendiz",
      habilidades: "comunicação, atendimento, organização, vendas",
      origem: "Parceiros locais",
      salario: "Bolsa aprendiz",
      descricaoResumo: "Primeira oportunidade para atuar com atendimento, organização de informações e suporte à equipe."
    }
  ];

  for (const vaga of vagasBase) {
    await pool.execute(
      `INSERT INTO vagas (
        external_id, titulo, empresa, localizacao, area, tipo, habilidades,
        origem, salario, descricao_resumo, atualizado_api_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        empresa = VALUES(empresa),
        localizacao = VALUES(localizacao),
        area = VALUES(area),
        tipo = VALUES(tipo),
        habilidades = VALUES(habilidades),
        origem = VALUES(origem),
        salario = VALUES(salario),
        descricao_resumo = VALUES(descricao_resumo),
        atualizado_api_em = NOW()`,
      [
        vaga.externalId,
        vaga.titulo,
        vaga.empresa,
        vaga.localizacao,
        vaga.area,
        vaga.tipo,
        vaga.habilidades,
        vaga.origem,
        vaga.salario,
        vaga.descricaoResumo
      ]
    );
  }
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
  await garantirMigracaoUnica("limpar_habilidades_usuarios_tags_v1", async () => {
    await pool.query("UPDATE usuarios SET habilidades = NULL");
  });
  await garantirVagas();
  await garantirVagasBase();
  await garantirMigracaoUnica("limpar_html_vagas_exemplo_v1", async () => {
    await pool.query(`
      UPDATE vagas
      SET habilidades = REPLACE(REPLACE(habilidades, 'html, ', ''), ', html', '')
      WHERE LOWER(habilidades) LIKE '%html%'
        AND origem IN ('LinkedIn Jobs', 'CIEE', 'Indeed')
    `);
  });
  await garantirCurriculos();
  await garantirCandidaturas();
}

module.exports = {
  garantirEstrutura,
  garantirVagasBase
};
