const { pool } = require("../config/database");

const REMOTIVE_ENDPOINT = "https://remotive.com/api/remote-jobs";
const CACHE_TTL_MS = Number(process.env.VAGAS_API_TTL_MINUTOS || 360) * 60 * 1000;
const LIMITE_API = Math.min(Number(process.env.VAGAS_API_LIMITE || 30), 50);

let cacheApi = {
  expiraEm: 0,
  vagas: []
};

function texto(valor, limite = 255) {
  return String(valor || "").trim().slice(0, limite);
}

function limparHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function classificarArea(vaga) {
  const textoPrincipal = `${vaga.title || ""} ${vaga.category || ""}`.toLowerCase();
  const textoCompleto = `${textoPrincipal} ${vaga.description || ""}`.toLowerCase();

  if (/software|developer|engineer|frontend|backend|qa|quality|data|analytics|artificial intelligence|\bai\b|tech|it|product/.test(textoPrincipal)) {
    return "Tecnologia";
  }

  if (/marketing|growth|social|content|seo|brand|copy/.test(textoPrincipal)) {
    return "Marketing";
  }

  if (/support|customer|client success|sales|success|atendimento|suporte/.test(textoPrincipal)) {
    return "Atendimento";
  }

  if (/business|admin|operations|finance|people|hr|recruit|assistant|office/.test(textoPrincipal)) {
    return "Administracao";
  }

  if (/software|developer|engineer|frontend|backend|qa|quality|data|analytics|artificial intelligence|\bai\b|devops|tech|it|product/.test(textoCompleto)) {
    return "Tecnologia";
  }

  if (/support|customer|sales|marketing|business|admin|operations|finance|assistant|office/.test(textoCompleto)) {
    return "Administracao";
  }

  return "Outras";
}

function classificarTipo(jobType) {
  const tipo = String(jobType || "").toLowerCase();

  if (/intern|estagio|internship/.test(tipo)) return "Estagio";
  if (/freelance|contract/.test(tipo)) return "Freelancer";

  return "CLT";
}

function normalizarVagaRemotive(vaga) {
  const descricaoLimpa = limparHtml(vaga.description);
  const localizacao = texto(vaga.candidate_required_location || "Remoto", 100);
  const categoria = texto(vaga.category || "", 80);
  const dataPublicacao = vaga.publication_date ? new Date(vaga.publication_date) : null;
  const habilidades = [
    vaga.title,
    vaga.company_name,
    categoria,
    localizacao,
    descricaoLimpa.slice(0, 500)
  ].filter(Boolean).join(", ");

  return {
    externalId: `remotive-${vaga.id}`,
    titulo: texto(vaga.title, 120),
    empresa: texto(vaga.company_name || "Empresa parceira", 100),
    localizacao: localizacao.toLowerCase() === "worldwide" ? "Remoto internacional" : localizacao,
    area: classificarArea(vaga),
    tipo: classificarTipo(vaga.job_type),
    habilidades: texto(habilidades, 900),
    origem: "Remotive",
    url: texto(vaga.url, 500),
    salario: texto(vaga.salary, 120),
    descricaoResumo: texto(descricaoLimpa, 500),
    publicadoEm: dataPublicacao && !Number.isNaN(dataPublicacao.getTime()) ? dataPublicacao : null
  };
}

async function buscarVagasRemotive() {
  if (process.env.VAGAS_API_ATIVA === "false") {
    return [];
  }

  if (Date.now() < cacheApi.expiraEm) {
    return cacheApi.vagas;
  }

  const url = new URL(REMOTIVE_ENDPOINT);
  url.searchParams.set("limit", String(LIMITE_API));

  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 8000);

  try {
    const resposta = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FavelaTech/1.0"
      },
      signal: controlador.signal
    });

    if (!resposta.ok) {
      throw new Error(`Remotive respondeu com status ${resposta.status}.`);
    }

    const dados = await resposta.json();
    const vagas = Array.isArray(dados.jobs)
      ? dados.jobs.map(normalizarVagaRemotive).filter((vaga) => vaga.titulo && vaga.url)
      : [];

    cacheApi = {
      expiraEm: Date.now() + CACHE_TTL_MS,
      vagas
    };

    return vagas;
  } finally {
    clearTimeout(timeout);
  }
}

async function salvarVagasExternas(vagasExternas) {
  for (const vaga of vagasExternas) {
    await pool.execute(
      `INSERT INTO vagas (
        external_id, titulo, empresa, localizacao, area, tipo, habilidades,
        origem, url, salario, descricao_resumo, publicado_em, atualizado_api_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        empresa = VALUES(empresa),
        localizacao = VALUES(localizacao),
        area = VALUES(area),
        tipo = VALUES(tipo),
        habilidades = VALUES(habilidades),
        origem = VALUES(origem),
        url = VALUES(url),
        salario = VALUES(salario),
        descricao_resumo = VALUES(descricao_resumo),
        publicado_em = VALUES(publicado_em),
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
        vaga.url,
        vaga.salario,
        vaga.descricaoResumo,
        vaga.publicadoEm
      ]
    );
  }
}

async function listarVagasBanco() {
  const [vagas] = await pool.execute(
    `SELECT
      id,
      external_id AS externalId,
      titulo,
      empresa,
      localizacao,
      area,
      tipo,
      habilidades,
      origem,
      url,
      salario,
      descricao_resumo AS descricaoResumo,
      publicado_em AS publicadoEm,
      criado_em
     FROM vagas
     ORDER BY COALESCE(publicado_em, criado_em) DESC, id DESC
     LIMIT 80`
  );

  return vagas;
}

async function listarVagas(req, res) {
  try {
    try {
      const vagasExternas = await buscarVagasRemotive();

      if (vagasExternas.length > 0) {
        await salvarVagasExternas(vagasExternas);
      }
    } catch (erroApi) {
      console.warn("Não foi possível atualizar vagas da API:", erroApi.message);
    }

    const vagas = await listarVagasBanco();

    return res.json(vagas);
  } catch (erro) {
    console.error("Erro ao listar vagas:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível carregar as vagas." });
  }
}

module.exports = {
  listarVagas
};
