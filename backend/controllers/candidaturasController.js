const { pool } = require("../config/database");

function obterId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarCandidatura(candidatura) {
  return {
    id: candidatura.id,
    usuarioId: candidatura.usuario_id,
    vagaId: candidatura.vaga_id,
    status: candidatura.status || "Enviada",
    criadoEm: candidatura.criado_em,
    vaga: {
      titulo: candidatura.titulo,
      empresa: candidatura.empresa,
      localizacao: candidatura.localizacao,
      area: candidatura.area,
      tipo: candidatura.tipo,
      origem: candidatura.origem
    }
  };
}

async function buscarCandidatura(usuarioId, vagaId) {
  const [candidaturas] = await pool.execute(
    `SELECT
       c.id, c.usuario_id, c.vaga_id, c.status, c.criado_em,
       v.titulo, v.empresa, v.localizacao, v.area, v.tipo, v.origem
     FROM candidaturas c
     INNER JOIN vagas v ON v.id = c.vaga_id
     WHERE c.usuario_id = ? AND c.vaga_id = ?
     LIMIT 1`,
    [usuarioId, vagaId]
  );

  return candidaturas[0] ? normalizarCandidatura(candidaturas[0]) : null;
}

async function usuarioTemCurriculo(usuarioId) {
  const [curriculos] = await pool.execute(
    "SELECT id FROM curriculos WHERE usuario_id = ? LIMIT 1",
    [usuarioId]
  );

  return curriculos.length > 0;
}

async function criarCandidatura(req, res) {
  const usuarioId = obterId(req.body.usuarioId);
  const vagaId = obterId(req.body.vagaId);

  if (!usuarioId || !vagaId) {
    return res.status(400).json({ mensagem: "Usuário e vaga são obrigatórios." });
  }

  try {
    const [usuarios] = await pool.execute(
      "SELECT id FROM usuarios WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    if (!(await usuarioTemCurriculo(usuarioId))) {
      return res.status(428).json({
        codigo: "CURRICULO_OBRIGATORIO",
        mensagem: "Crie seu currículo antes de se candidatar."
      });
    }

    const [vagas] = await pool.execute(
      "SELECT id FROM vagas WHERE id = ? LIMIT 1",
      [vagaId]
    );

    if (vagas.length === 0) {
      return res.status(404).json({ mensagem: "Vaga não encontrada." });
    }

    await pool.execute(
      `INSERT INTO candidaturas (usuario_id, vaga_id, status)
       VALUES (?, ?, ?)`,
      [usuarioId, vagaId, "Enviada"]
    );

    const candidatura = await buscarCandidatura(usuarioId, vagaId);
    return res.status(201).json({ candidatura });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      const candidatura = await buscarCandidatura(usuarioId, vagaId);
      return res.status(409).json({
        mensagem: "Você já se candidatou para esta vaga.",
        candidatura
      });
    }

    console.error("Erro ao criar candidatura:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível enviar a candidatura." });
  }
}

async function listarCandidaturasDoUsuario(req, res) {
  const usuarioId = obterId(req.params.usuarioId);

  if (!usuarioId) {
    return res.status(400).json({ mensagem: "Usuário inválido." });
  }

  try {
    const [candidaturas] = await pool.execute(
      `SELECT
         c.id, c.usuario_id, c.vaga_id, c.status, c.criado_em,
         v.titulo, v.empresa, v.localizacao, v.area, v.tipo, v.origem
       FROM candidaturas c
       INNER JOIN vagas v ON v.id = c.vaga_id
       WHERE c.usuario_id = ?
       ORDER BY c.criado_em DESC, c.id DESC`,
      [usuarioId]
    );

    return res.json({
      candidaturas: candidaturas.map(normalizarCandidatura)
    });
  } catch (erro) {
    console.error("Erro ao listar candidaturas:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível carregar as candidaturas." });
  }
}

module.exports = {
  criarCandidatura,
  listarCandidaturasDoUsuario
};
