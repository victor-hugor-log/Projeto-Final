const { pool } = require("../config/database");

const CAMPOS = [
  "nome",
  "email",
  "telefone",
  "cidade",
  "cargo",
  "area",
  "resumo",
  "escolaridade",
  "curso",
  "instituicao",
  "empresa",
  "funcao",
  "atividades",
  "habilidades",
  "linkedin",
  "portfolio"
];

const CAMPOS_OBRIGATORIOS = [
  "nome",
  "email",
  "telefone",
  "cidade",
  "cargo",
  "area",
  "resumo",
  "escolaridade",
  "habilidades"
];

function obterUsuarioId(req) {
  const usuarioId = Number(req.params.usuarioId);
  return Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : null;
}

function normalizarDados(dados) {
  const origem = dados || {};

  return CAMPOS.reduce((curriculo, campo) => {
    curriculo[campo] = String(origem[campo] || "").trim();
    return curriculo;
  }, {});
}

function normalizarCurriculo(curriculo) {
  const resultado = CAMPOS.reduce((dados, campo) => {
    dados[campo] = curriculo[campo] || "";
    return dados;
  }, {});

  resultado.id = curriculo.id;
  resultado.usuarioId = curriculo.usuario_id;
  resultado.criadoEm = curriculo.criado_em;
  resultado.atualizadoEm = curriculo.atualizado_em;
  return resultado;
}

function urlValida(valor) {
  if (!valor) return true;

  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function obterCurriculo(req, res) {
  const usuarioId = obterUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({ mensagem: "Usuario invalido." });
  }

  try {
    const [curriculos] = await pool.execute(
      "SELECT * FROM curriculos WHERE usuario_id = ? LIMIT 1",
      [usuarioId]
    );

    return res.json({
      curriculo: curriculos.length ? normalizarCurriculo(curriculos[0]) : null
    });
  } catch (erro) {
    console.error("Erro ao buscar curriculo:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel carregar o curriculo." });
  }
}

async function salvarCurriculo(req, res) {
  const usuarioId = obterUsuarioId(req);
  const dados = normalizarDados(req.body);

  if (!usuarioId) {
    return res.status(400).json({ mensagem: "Usuario invalido." });
  }

  if (CAMPOS_OBRIGATORIOS.some((campo) => !dados[campo])) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatorios." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return res.status(400).json({ mensagem: "Informe um e-mail valido." });
  }

  if (!urlValida(dados.linkedin) || !urlValida(dados.portfolio)) {
    return res.status(400).json({ mensagem: "Informe links validos, com http ou https." });
  }

  try {
    const [usuarios] = await pool.execute(
      "SELECT id FROM usuarios WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuario nao encontrado." });
    }

    await pool.execute(
      `INSERT INTO curriculos (
        usuario_id, nome, email, telefone, cidade, cargo, area, resumo,
        escolaridade, curso, instituicao, empresa, funcao, atividades,
        habilidades, linkedin, portfolio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome = VALUES(nome),
        email = VALUES(email),
        telefone = VALUES(telefone),
        cidade = VALUES(cidade),
        cargo = VALUES(cargo),
        area = VALUES(area),
        resumo = VALUES(resumo),
        escolaridade = VALUES(escolaridade),
        curso = VALUES(curso),
        instituicao = VALUES(instituicao),
        empresa = VALUES(empresa),
        funcao = VALUES(funcao),
        atividades = VALUES(atividades),
        habilidades = VALUES(habilidades),
        linkedin = VALUES(linkedin),
        portfolio = VALUES(portfolio)`,
      [
        usuarioId,
        dados.nome,
        dados.email,
        dados.telefone,
        dados.cidade,
        dados.cargo,
        dados.area,
        dados.resumo,
        dados.escolaridade,
        dados.curso || null,
        dados.instituicao || null,
        dados.empresa || null,
        dados.funcao || null,
        dados.atividades || null,
        dados.habilidades,
        dados.linkedin || null,
        dados.portfolio || null
      ]
    );

    const [curriculos] = await pool.execute(
      "SELECT * FROM curriculos WHERE usuario_id = ? LIMIT 1",
      [usuarioId]
    );

    return res.json({ curriculo: normalizarCurriculo(curriculos[0]) });
  } catch (erro) {
    console.error("Erro ao salvar curriculo:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel salvar o curriculo." });
  }
}

module.exports = {
  obterCurriculo,
  salvarCurriculo
};
