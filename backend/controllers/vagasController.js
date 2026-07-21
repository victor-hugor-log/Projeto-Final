const { pool } = require("../config/database");
const { garantirVagasBase } = require("../database/setup");

const REMOTIVE_ENDPOINT = process.env.VAGAS_API_URL || "https://remotive.com/api/remote-jobs";
const CACHE_TTL_MS = Number(process.env.VAGAS_API_TTL_MINUTOS || 360) * 60 * 1000;
const LIMITE_API = Math.min(Number(process.env.VAGAS_API_LIMITE || 30), 50);
const TEMPO_ESPERA_API_MS = Number(process.env.VAGAS_API_ESPERA_MS || 1400);

const REGIOES = {
  bh: ["belo horizonte", "bh"],
  metropolitana: [
    "belo horizonte",
    "bh",
    "contagem",
    "betim",
    "nova lima",
    "sabara",
    "ribeirao das neves",
    "santa luzia",
    "ibirite",
    "vespasiano"
  ],
  minas: [
    "mg",
    "minas gerais",
    "belo horizonte",
    "contagem",
    "betim",
    "nova lima",
    "uberlandia",
    "juiz de fora"
  ],
  sudeste: [
    "mg",
    "sp",
    "rj",
    "es",
    "minas gerais",
    "sao paulo",
    "rio de janeiro",
    "espirito santo"
  ],
  remoto: ["remoto", "remote", "worldwide", "internacional"]
};

let cacheApi = {
  expiraEm: 0,
  vagas: []
};

function texto(valor, limite = 255) {
  return String(valor || "").trim().slice(0, limite);
}

function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

  if (/software|developer|engineer|frontend|front-end|backend|qa|quality|data|analytics|artificial intelligence|\bai\b|tech|it|product|tecnologia|desenvolvedor|dados|html|css|javascript|react|web/.test(textoPrincipal)) {
    return "Tecnologia";
  }

  if (/marketing|growth|social|content|seo|brand|copy/.test(textoPrincipal)) {
    return "Marketing";
  }

  if (/support|customer|client success|sales|success|atendimento|suporte|vendas/.test(textoPrincipal)) {
    return "Atendimento";
  }

  if (/business|admin|administracao|administrativo|operations|finance|people|hr|recruit|assistant|assistente|office/.test(textoPrincipal)) {
    return "Administracao";
  }

  if (/software|developer|engineer|frontend|front-end|backend|qa|quality|data|analytics|artificial intelligence|\bai\b|devops|tech|it|product|html|css|javascript|react|web/.test(textoCompleto)) {
    return "Tecnologia";
  }

  if (/support|customer|sales|marketing|business|admin|administracao|administrativo|operations|finance|assistant|assistente|office/.test(textoCompleto)) {
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

async function buscarVagasExternas() {
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
      throw new Error(`API de vagas respondeu com status ${resposta.status}.`);
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
     LIMIT 160`
  );

  return vagas;
}

function extrairFiltros(query) {
  return {
    busca: texto(query.busca, 120),
    area: texto(query.area, 80),
    tipo: texto(query.tipo, 50),
    cidade: texto(query.cidade, 100),
    regiao: normalizar(query.regiao),
    limite: Math.min(Math.max(Number(query.limite) || 160, 1), 160)
  };
}

function textoVaga(vaga) {
  return normalizar([
    vaga.titulo,
    vaga.empresa,
    vaga.localizacao,
    vaga.area,
    vaga.tipo,
    vaga.habilidades,
    vaga.origem,
    vaga.descricaoResumo
  ].filter(Boolean).join(" "));
}

function pertenceARegiao(vaga, regiao) {
  if (!regiao) return true;

  const termos = REGIOES[regiao] || [regiao];
  const local = normalizar(vaga.localizacao);

  return termos.some((termo) => local.includes(termo));
}

function aplicarFiltros(vagas, filtros) {
  const busca = normalizar(filtros.busca);
  const cidade = normalizar(filtros.cidade);
  const area = normalizar(filtros.area);
  const tipo = normalizar(filtros.tipo);

  return vagas
    .filter((vaga) => {
      const textoCompleto = textoVaga(vaga);
      const local = normalizar(vaga.localizacao);
      const correspondeBusca = !busca || textoCompleto.includes(busca);
      const correspondeCidade = !cidade || local.includes(cidade);
      const correspondeArea = !area || normalizar(vaga.area) === area;
      const correspondeTipo = !tipo || normalizar(vaga.tipo) === tipo;
      const correspondeRegiao = pertenceARegiao(vaga, filtros.regiao);

      return correspondeBusca
        && correspondeCidade
        && correspondeArea
        && correspondeTipo
        && correspondeRegiao;
    })
    .slice(0, filtros.limite);
}

async function atualizarVagasExternas() {
  const vagasExternas = await buscarVagasExternas();

  if (vagasExternas.length > 0) {
    await salvarVagasExternas(vagasExternas);
  }

  return vagasExternas.length;
}

async function listarVagasComFallbackLocal() {
  let vagas = await listarVagasBanco();

  if (vagas.length === 0) {
    await garantirVagasBase();
    vagas = await listarVagasBanco();
  }

  return vagas;
}

function aguardarComLimite(promessa, tempoMs) {
  return Promise.race([
    promessa.then(() => true).catch((erroApi) => {
      console.warn("Não foi possível atualizar vagas da API:", erroApi.message);
      return false;
    }),
    new Promise((resolve) => setTimeout(() => resolve(false), tempoMs))
  ]);
}

async function listarVagas(req, res) {
  try {
    const filtros = extrairFiltros(req.query);
    const atualizacaoApi = atualizarVagasExternas();
    let vagas = await listarVagasComFallbackLocal();

    const atualizouRapido = await aguardarComLimite(atualizacaoApi, TEMPO_ESPERA_API_MS);

    if (atualizouRapido) {
      vagas = await listarVagasComFallbackLocal();
    }

    return res.json(aplicarFiltros(vagas, filtros));
  } catch (erro) {
    console.error("Erro ao listar vagas:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível carregar as vagas." });
  }
}

module.exports = {
  listarVagas
};
