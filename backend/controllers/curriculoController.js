const { pool } = require("../config/database");

const CAMPOS = [
  "nome",
  "email",
  "telefone",
  "data_nascimento",
  "nacionalidade",
  "estado_civil",
  "cidade",
  "cargo",
  "area",
  "disponibilidade",
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

function formatarDataInput(valor) {
  if (!valor) return "";
  if (typeof valor === "string") return valor.slice(0, 10);

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  return data.toISOString().slice(0, 10);
}

function normalizarCurriculo(curriculo) {
  const resultado = CAMPOS.reduce((dados, campo) => {
    dados[campo] = campo === "data_nascimento"
      ? formatarDataInput(curriculo[campo])
      : curriculo[campo] || "";
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

function dataValida(valor) {
  if (!valor) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

  const data = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(data.getTime());
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

  if (!dataValida(dados.data_nascimento)) {
    return res.status(400).json({ mensagem: "Informe uma data de nascimento valida." });
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
        usuario_id, nome, email, telefone, data_nascimento, nacionalidade,
        estado_civil, cidade, cargo, area, disponibilidade, resumo,
        escolaridade, curso, instituicao, empresa, funcao, atividades,
        habilidades, linkedin, portfolio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome = VALUES(nome),
        email = VALUES(email),
        telefone = VALUES(telefone),
        data_nascimento = VALUES(data_nascimento),
        nacionalidade = VALUES(nacionalidade),
        estado_civil = VALUES(estado_civil),
        cidade = VALUES(cidade),
        cargo = VALUES(cargo),
        area = VALUES(area),
        disponibilidade = VALUES(disponibilidade),
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
        dados.data_nascimento || null,
        dados.nacionalidade || null,
        dados.estado_civil || null,
        dados.cidade,
        dados.cargo,
        dados.area,
        dados.disponibilidade || null,
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
