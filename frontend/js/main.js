let vagas = [];

const ALERTAS_EMAIL_KEY = "favelaTechAlertasEmail";
const ALERTAS_EMAIL_SESSAO_KEY = "favelaTechAlertasSessao";
const HABILIDADES_TAGS_MIGRATION_KEY = "favelaTechHabilidadesTagsV1";
const habilidadesHelper = window.FavelaTechHabilidades || {
  normalizar,
  listar: (valor) => String(valor || "").split(/[,;|]/).map((item) => item.trim()).filter(Boolean),
  serializar: (lista) => lista.join(", ")
};

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");
}

function getPreferenciaAlertasEmail(usuarioId) {
  const preferencias = JSON.parse(localStorage.getItem(ALERTAS_EMAIL_KEY) || "{}");
  return Boolean(preferencias[usuarioId]);
}

function setPreferenciaAlertasEmail(usuarioId, ativo) {
  const preferencias = JSON.parse(localStorage.getItem(ALERTAS_EMAIL_KEY) || "{}");
  preferencias[usuarioId] = ativo;
  localStorage.setItem(ALERTAS_EMAIL_KEY, JSON.stringify(preferencias));
}

function limparHabilidadesLocaisAntigas() {
  if (localStorage.getItem(HABILIDADES_TAGS_MIGRATION_KEY) === "true") return;

  const usuario = getUsuarioLogado();
  if (usuario?.habilidades) {
    usuario.habilidades = "";
    localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuario));
  }

  localStorage.setItem(HABILIDADES_TAGS_MIGRATION_KEY, "true");
}

function mascararEmailAlerta(email) {
  if (!email || !email.includes("@")) return "seu e-mail";

  const [nome, dominio] = email.split("@");
  const nomeVisivel = nome.length <= 2 ? nome[0] || "*" : nome.slice(0, 2);
  return `${nomeVisivel}***@${dominio}`;
}

async function registrarAlertaEmail({ email, tipo, detalhes }) {
  try {
    const resposta = await fetch("/api/alertas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, tipo, detalhes })
    });

    const resultado = await resposta.json().catch(() => ({}));
    return resposta.ok ? resultado : null;
  } catch {
    return null;
  }
}

async function notificarAlertaEmail(usuario, tipo, detalhes, opcoes = {}) {
  if (!usuario?.email || !getPreferenciaAlertasEmail(usuario.id)) return;

  await registrarAlertaEmail({
    email: usuario.email,
    tipo,
    detalhes
  });

  const emailMascarado = mascararEmailAlerta(usuario.email);
  const mensagens = {
    ativacao: `Alertas ativados. Você receberá novidades em ${emailMascarado}.`,
    recomendacao: `Alerta enviado para ${emailMascarado} com vagas compatíveis com seu perfil.`,
    candidatura: `Você receberá atualizações sobre esta candidatura em ${emailMascarado}.`
  };

  if (opcoes.statusElemento) {
    opcoes.statusElemento.hidden = false;
    opcoes.statusElemento.textContent = mensagens[tipo] || `Alerta registrado para ${emailMascarado}.`;
  }

  mostrarNotificacao(mensagens[tipo] || `Alerta registrado para ${emailMascarado}.`, {
    titulo: "Alerta por e-mail",
    tipo: "sucesso",
    duracao: opcoes.duracao || 4500
  });
}

function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mostrarNotificacao(mensagem, opcoes = {}) {
  const {
    titulo = "Favela Tech",
    tipo = "info",
    duracao = 4000
  } = opcoes;
  let container = document.getElementById("notificacoes-site");

  if (!container) {
    container = document.createElement("div");
    container.id = "notificacoes-site";
    container.className = "notificacoes-site";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const notificacao = document.createElement("aside");
  notificacao.className = `notificacao-site notificacao-${tipo}`;
  notificacao.setAttribute("role", tipo === "erro" ? "alert" : "status");

  const conteudo = document.createElement("div");
  conteudo.className = "notificacao-conteudo";

  const tituloElemento = document.createElement("strong");
  tituloElemento.textContent = titulo;

  const mensagemElemento = document.createElement("p");
  mensagemElemento.textContent = mensagem;

  const fechar = document.createElement("button");
  fechar.className = "notificacao-fechar";
  fechar.type = "button";
  fechar.setAttribute("aria-label", "Fechar notificação");
  fechar.textContent = "X";

  conteudo.append(tituloElemento, mensagemElemento);
  notificacao.append(conteudo, fechar);
  container.appendChild(notificacao);

  let temporizador;

  function remover() {
    if (notificacao.classList.contains("saindo")) return;

    clearTimeout(temporizador);
    notificacao.classList.add("saindo");
    notificacao.addEventListener("animationend", () => {
      notificacao.remove();

      if (container.children.length === 0) {
        container.remove();
      }
    }, { once: true });
  }

  fechar.addEventListener("click", remover);

  if (duracao > 0) {
    temporizador = setTimeout(remover, duracao);
  }
}

window.mostrarNotificacao = mostrarNotificacao;

function mostrarNotificacaoPendente() {
  const dadosSalvos = sessionStorage.getItem("favelaTechNotificacaoPendente");
  if (!dadosSalvos) return;

  sessionStorage.removeItem("favelaTechNotificacaoPendente");

  try {
    const { mensagem, titulo, tipo } = JSON.parse(dadosSalvos);
    mostrarNotificacao(mensagem, { titulo, tipo });
  } catch {
    mostrarNotificacao("A operação foi concluída.");
  }
}

function formatarRotuloVaga(valor) {
  const rotulos = {
    Administracao: "Administração",
    Estagio: "Estágio"
  };

  return rotulos[valor] || valor;
}

function iniciarChatbot() {
  const botao = document.querySelector(".chatbot-button");
  const janela = document.querySelector(".chatbot-window");
  const fechar = document.querySelector(".chatbot-close");
  const mensagens = document.querySelector(".chatbot-messages");
  const form = document.querySelector(".chatbot-form");
  const input = document.querySelector(".chatbot-form input");
  const botaoEnviar = document.querySelector(".chatbot-form button");

  if (!botao || !janela || !fechar || !mensagens || !form || !input) return;

  janela.style.display = "none";
  let ultimaIntencao = "";
  let temporizadorResposta;

  const atalhosIniciais = [
    { rotulo: "Buscar vagas", pergunta: "Quero buscar vagas" },
    { rotulo: "Cadastrar currículo", pergunta: "Como cadastrar meu currículo?" },
    { rotulo: "Minha conta", pergunta: "Como vejo minha conta?" },
    { rotulo: "Como ajudar", pergunta: "Como posso ajudar a causa?" }
  ];

  function temAlguma(texto, palavras) {
    return palavras.some((palavra) => texto.includes(palavra));
  }

  function pontuarIntencao(texto, palavras) {
    return palavras.reduce((total, palavra) => total + (texto.includes(palavra) ? 1 : 0), 0);
  }

  function escolherIntencaoProvavel(texto) {
    const intencoes = [
      {
        nome: "vagas",
        palavras: ["vaga", "emprego", "oportunidade", "estagio", "aprendiz", "clt", "freelancer", "remoto", "filtro", "buscar", "pesquisar", "area", "contrato", "alerta", "alertas", "e-mail", "email"]
      },
      {
        nome: "curriculo",
        palavras: ["curriculo", "cv", "experiencia", "formacao", "habilidade", "portfolio", "linkedin", "curso", "objetivo", "competencia"]
      },
      {
        nome: "conta",
        palavras: ["cadastro", "login", "conta", "perfil", "telefone", "email", "e-mail", "senha", "endereco", "cep", "foto", "alterar", "trocar", "editar"]
      },
      {
        nome: "candidatura",
        palavras: ["candidatar", "candidatura", "candidatei", "status", "enviada", "duplicada", "minhas candidaturas", "aplicar", "inscricao"]
      },
      {
        nome: "contato",
        palavras: ["contato", "whatsapp", "zap", "mensagem", "falar", "empresa", "contratar", "divulgar vaga", "parceria", "talento", "recrutador"]
      },
      {
        nome: "ajudar",
        palavras: ["ajudar", "doar", "voluntario", "voluntariado", "ong", "compartilhar", "causa", "apoio", "comunidade"]
      },
      {
        nome: "projeto",
        palavras: ["ods", "trabalho decente", "crescimento economico", "projeto", "favela tech", "objetivo", "sobre", "missao", "valores"]
      }
    ];

    return intencoes
      .map((intencao) => ({
        nome: intencao.nome,
        pontos: pontuarIntencao(texto, intencao.palavras)
      }))
      .sort((a, b) => b.pontos - a.pontos)[0];
  }

  function fecharConvite() {
    const convite = document.querySelector(".chatbot-convite");
    if (!convite || convite.classList.contains("saindo")) return;

    convite.classList.add("saindo");
    convite.addEventListener("animationend", () => convite.remove(), { once: true });
  }

  function criarConvite() {
    const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
    if (paginaAtual !== "index.html") return;

    const convite = document.createElement("aside");
    convite.className = "chatbot-convite";
    convite.setAttribute("role", "status");
    convite.setAttribute("aria-live", "polite");
    convite.innerHTML = `
      <p>Olá, precisa de ajuda? Estou à disposição!</p>
      <button type="button" class="chatbot-convite-fechar" aria-label="Fechar convite do assistente">X</button>
    `;

    convite.querySelector(".chatbot-convite-fechar").addEventListener("click", fecharConvite);
    document.body.appendChild(convite);
    setTimeout(fecharConvite, 8000);
  }

  function adicionarMensagem(texto, tipo) {
    const msg = document.createElement("p");
    msg.className = `chatbot-msg ${tipo}`;
    msg.textContent = texto;
    mensagens.appendChild(msg);
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  function removerAtalhos() {
    mensagens.querySelectorAll(".chatbot-atalhos").forEach((atalhos) => atalhos.remove());
  }

  function removerDigitando() {
    mensagens.querySelectorAll(".chatbot-digitando").forEach((digitando) => digitando.remove());
  }

  function adicionarAtalhos(atalhos = atalhosIniciais) {
    if (!atalhos.length) return;

    const grupo = document.createElement("div");
    grupo.className = "chatbot-atalhos";

    atalhos.forEach((item) => {
      const atalho = document.createElement("button");
      atalho.type = "button";
      atalho.className = "chatbot-atalho";
      atalho.textContent = item.rotulo;
      atalho.addEventListener("click", () => processarPergunta(item.pergunta, item.rotulo));
      grupo.appendChild(atalho);
    });

    mensagens.appendChild(grupo);
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  function mostrarDigitando() {
    const digitando = document.createElement("p");
    digitando.className = "chatbot-msg bot chatbot-digitando";
    digitando.setAttribute("aria-label", "Assistente digitando");
    digitando.innerHTML = "<span></span><span></span><span></span>";
    mensagens.appendChild(digitando);
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  function definirCarregando(carregando) {
    input.disabled = carregando;

    if (botaoEnviar) {
      botaoEnviar.disabled = carregando;
    }
  }

  function atalhosPorIntencao(intencao) {
    const grupos = {
      vagas: [
        { rotulo: "Usar filtros", pergunta: "Como uso os filtros de vagas?" },
        { rotulo: "Candidatar-se", pergunta: "Como faço para me candidatar?" },
        { rotulo: "Currículo", pergunta: "Preciso de currículo para vagas?" }
      ],
      curriculo: [
        { rotulo: "O que preencher", pergunta: "O que coloco no currículo?" },
        { rotulo: "Salvar currículo", pergunta: "Como salvo meu currículo?" },
        { rotulo: "Ver vagas", pergunta: "Quero ver vagas compatíveis" }
      ],
      conta: [
        { rotulo: "Criar conta", pergunta: "Como criar uma conta?" },
        { rotulo: "Perfil", pergunta: "O que tem no perfil?" },
        { rotulo: "Trocar dados", pergunta: "Como altero telefone, e-mail ou senha?" }
      ],
      candidatura: [
        { rotulo: "Ver candidaturas", pergunta: "Onde vejo minhas candidaturas?" },
        { rotulo: "Duplicada", pergunta: "Posso me candidatar duas vezes?" },
        { rotulo: "Status", pergunta: "O que significa status da candidatura?" }
      ],
      contato: [
        { rotulo: "Enviar mensagem", pergunta: "Como envio uma mensagem?" },
        { rotulo: "Sou empresa", pergunta: "Sou empresa e quero falar com vocês" },
        { rotulo: "WhatsApp", pergunta: "Qual o WhatsApp?" }
      ]
    };

    return grupos[intencao] || atalhosIniciais;
  }

  function respostaContinuidade(usuario) {
    const nome = usuario?.nome?.split(" ")[0] || "você";

    if (ultimaIntencao === "vagas") {
      return {
        texto: "Boa. Na aba Vagas, digite uma palavra-chave ou escolha área/tipo. O resultado muda na hora, e o botão de pesquisa continua ali para reforçar a busca.",
        atalhos: atalhosPorIntencao("vagas")
      };
    }

    if (ultimaIntencao === "curriculo") {
      return {
        texto: `Claro, ${nome}. No currículo, o ideal é preencher contato, objetivo, formação, experiências e habilidades. Quanto mais completo, melhor fica para combinar com as vagas.`,
        atalhos: atalhosPorIntencao("curriculo")
      };
    }

    if (ultimaIntencao === "candidatura") {
      return {
        texto: "Quando você se candidata, o site registra sua candidatura com segurança. Depois ela aparece em Minha conta, na área Minhas candidaturas.",
        atalhos: atalhosPorIntencao("candidatura")
      };
    }

    if (ultimaIntencao === "conta") {
      return {
        texto: "Na sua conta ficam seus dados, foto, telefone, e-mail, endereço, currículo e candidaturas. Dados sensíveis pedem confirmação de senha antes de alterar.",
        atalhos: atalhosPorIntencao("conta")
      };
    }

    return {
      texto: "Fechou. Me fala se você quer ajuda com vagas, currículo, conta, candidatura, contato ou ODS 8.",
      atalhos: atalhosIniciais
    };
  }

  function responderPorIntencao(intencao, texto, usuario, nome) {
    if (intencao === "curriculo") {
      ultimaIntencao = "curriculo";

      if (temAlguma(texto, ["o que", "coloco", "preencher", "informar"])) {
        return {
          texto: "No currículo, coloca o essencial: dados de contato, objetivo profissional, formação, experiências, cursos, habilidades e links como LinkedIn ou portfólio. Se ainda não tiver experiência, vale projeto, voluntariado e atividade autônoma também.",
          atalhos: atalhosPorIntencao("curriculo")
        };
      }

      return {
        texto: "O currículo funciona como seu perfil profissional dentro do Favela Tech. Você preenche seus dados, objetivo, formação, experiências e habilidades, e o sistema salva tudo para reaproveitar depois.",
        atalhos: atalhosPorIntencao("curriculo")
      };
    }

    if (intencao === "conta") {
      ultimaIntencao = "conta";

      if (temAlguma(texto, ["senha", "telefone", "email", "e-mail", "alterar", "trocar", "editar"])) {
        return {
          texto: "Para alterar telefone, e-mail ou senha, entre em Minha conta e use o botão Editar/Alterar do campo. O site pede a senha atual antes de mexer nesses dados, o que deixa a conta mais protegida.",
          atalhos: atalhosPorIntencao("conta")
        };
      }

      return {
        texto: usuario
          ? `Você já está logado, ${nome || "mano"}. No topo do site, clique em Minha conta para ver seus dados, foto, endereço, currículo e candidaturas.`
          : "Para criar sua conta, entre em Login | Cadastro, preencha seus dados e aceite os termos/LGPD. Depois do login, o site libera perfil, currículo e candidaturas.",
        atalhos: atalhosPorIntencao("conta")
      };
    }

    if (intencao === "vagas") {
      ultimaIntencao = "vagas";

      if (temAlguma(texto, ["filtro", "filtrar", "buscar", "pesquisar", "palavra"])) {
        return {
          texto: "Na busca de vagas, digite uma palavra-chave, escolha área e tipo se quiser, e os resultados aparecem enquanto você digita. O botão continua ali para quem prefere confirmar a pesquisa.",
          atalhos: atalhosPorIntencao("vagas")
        };
      }

      if (temAlguma(texto, ["alerta", "alertas", "e-mail", "email"])) {
        return {
          texto: usuario
            ? "Na página Vagas, ative Alertas por e-mail na área de recomendação automática. Quando houver vagas compatíveis ou uma candidatura for enviada, o sistema registra o alerta para o seu e-mail."
            : "Para receber alertas por e-mail, primeiro crie sua conta em Login | Cadastro. Depois, na página Vagas, ative a opção Alertas por e-mail.",
          atalhos: atalhosPorIntencao("vagas")
        };
      }

      return {
        texto: "Na aba Vagas você pode buscar por palavra-chave, área e tipo de contratação. Se estiver logado, o site também consegue recomendar oportunidades próximas das suas habilidades.",
        atalhos: atalhosPorIntencao("vagas")
      };
    }

    if (intencao === "candidatura") {
      ultimaIntencao = "candidatura";

      if (temAlguma(texto, ["duplicada", "duas vezes", "repetir"])) {
        return {
          texto: "Não dá para se candidatar duas vezes na mesma vaga. O sistema bloqueia candidaturas duplicadas para manter seu perfil organizado.",
          atalhos: atalhosPorIntencao("candidatura")
        };
      }

      return {
        texto: "Para se candidatar, escolha uma vaga e clique em Candidatar-se. O site registra sua candidatura e depois mostra tudo em Minha conta, na área Minhas candidaturas.",
        atalhos: atalhosPorIntencao("candidatura")
      };
    }

    if (intencao === "contato") {
      ultimaIntencao = "contato";

      return {
        texto: temAlguma(texto, ["empresa", "contratar", "divulgar vaga", "parceria", "recrutador"])
          ? "Se você representa uma empresa, a melhor rota é usar a página Contato. Dá para mandar uma mensagem explicando a vaga, área, local e perfil que procura."
          : "Você pode falar pela página Contato, pelo e-mail informado no site ou pelo WhatsApp. O formulário é bom para dúvidas, parcerias e sugestões.",
        atalhos: atalhosPorIntencao("contato")
      };
    }

    if (intencao === "ajudar") {
      ultimaIntencao = "ajudar";

      return {
        texto: "Na página Como Ajudar tem ações práticas: divulgar vagas, apoiar jovens com currículo, compartilhar o portal e conhecer organizações ligadas à empregabilidade.",
        atalhos: [
          { rotulo: "Ver ONGs", pergunta: "Quais ONGs aparecem no site?" },
          { rotulo: "Compartilhar", pergunta: "Como compartilho o portal?" },
          { rotulo: "ODS 8", pergunta: "O que é ODS 8?" }
        ]
      };
    }

    if (intencao === "projeto") {
      ultimaIntencao = "projeto";

      return {
        texto: "O Favela Tech é uma iniciativa inspirada na ODS 8. A ideia é aproximar jovens, currículo, vagas e empresas em um fluxo simples de oportunidade.",
        atalhos: [
          { rotulo: "Sobre o projeto", pergunta: "Me explica o projeto" },
          { rotulo: "Vagas", pergunta: "Como as vagas funcionam?" },
          { rotulo: "Como ajudar", pergunta: "Como ajudar a causa?" }
        ]
      };
    }

    return null;
  }

  function responder(pergunta) {
    const texto = normalizar(pergunta);
    const usuario = getUsuarioLogado();
    const nome = usuario?.nome?.split(" ")[0] || "";
    const perguntaCurta = texto.length <= 4;

    if ((perguntaCurta || /^(sim|quero|pode|ok|beleza|claro|explica|como|ajuda|me ajuda)$/.test(texto)) && ultimaIntencao) {
      return respostaContinuidade(usuario);
    }

    if (temAlguma(texto, ["oi", "ola", "opa", "bom dia", "boa tarde", "boa noite", "e ai", "salve"])) {
      ultimaIntencao = "";
      return {
        texto: nome
          ? `Oi, ${nome}! Posso te ajudar com vagas, currículo, candidatura, perfil ou contato.`
          : "Oi! Posso te ajudar com vagas, currículo, cadastro, candidatura ou contato.",
        atalhos: atalhosIniciais
      };
    }

    const intencaoProvavel = escolherIntencaoProvavel(texto);
    if (intencaoProvavel.pontos > 0) {
      const resposta = responderPorIntencao(intencaoProvavel.nome, texto, usuario, nome);
      if (resposta) return resposta;
    }

    if (temAlguma(texto, ["obrigado", "obrigada", "valeu", "vlw"])) {
      ultimaIntencao = "";
      return {
        texto: "Tamo junto! Quando precisar, me chama por aqui.",
        atalhos: atalhosIniciais
      };
    }

    ultimaIntencao = "";
    return {
      texto: "Entendi mais ou menos. Posso te guiar melhor se você escolher um caminho: vagas, currículo, login, perfil, candidaturas, contato ou ODS 8.",
      atalhos: atalhosIniciais
    };
  }

  function responderComPausa(resposta) {
    clearTimeout(temporizadorResposta);
    removerDigitando();
    removerAtalhos();
    definirCarregando(true);
    mostrarDigitando();

    temporizadorResposta = setTimeout(() => {
      removerDigitando();
      adicionarMensagem(resposta.texto, "bot");
      adicionarAtalhos(resposta.atalhos);
      definirCarregando(false);
      input.focus();
    }, 1000);
  }

  function processarPergunta(pergunta, textoExibido = pergunta) {
    const texto = pergunta.trim();
    if (!texto) return;

    adicionarMensagem(textoExibido, "user");
    responderComPausa(responder(texto));
  }

  botao.addEventListener("click", () => {
    const aberto = janela.style.display === "block";
    janela.style.display = aberto ? "none" : "block";
    fecharConvite();

    if (!aberto && mensagens.children.length === 0) {
      const usuario = getUsuarioLogado();
      const nome = usuario?.nome?.split(" ")[0];
      adicionarMensagem(
        nome
          ? `Olá, ${nome}! Sou o assistente do Favela Tech. Quer ajuda com vagas, currículo ou sua conta?`
          : "Olá! Sou o assistente do Favela Tech. Quer ajuda com vagas, currículo ou cadastro?",
        "bot"
      );
      adicionarAtalhos();
    }
  });

  fechar.addEventListener("click", () => {
    janela.style.display = "none";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const pergunta = input.value.trim();
    if (!pergunta) return;

    processarPergunta(pergunta);
    input.value = "";
  });

  criarConvite();
}

function renderizarVagas(lista) {
  const container = document.getElementById("vagas-lista");
  if (!container) return;

  if (lista.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "sem-vagas";
    mensagem.textContent = "Nenhuma vaga encontrada com esses filtros.";
    container.replaceChildren(mensagem);
    return;
  }

  const fragmento = document.createDocumentFragment();

  lista.forEach((vaga) => {
    const card = document.createElement("article");
    card.className = "vaga-card";

    const titulo = document.createElement("h2");
    titulo.textContent = vaga.titulo;
    const empresa = document.createElement("p");
    empresa.className = "vaga-empresa";
    empresa.textContent = vaga.empresa || "Empresa parceira";

    const cabecalho = document.createElement("div");
    cabecalho.className = "vaga-card-cabecalho";
    cabecalho.append(titulo, empresa);
    card.appendChild(cabecalho);

    const detalhes = document.createElement("div");
    detalhes.className = "vaga-detalhes";
    const detalhesVaga = [
      ["Local", vaga.localizacao],
      ["Área", vaga.area],
      ["Tipo", vaga.tipo],
      ["Origem", vaga.origem]
    ];

    if (vaga.salario) {
      detalhesVaga.splice(3, 0, ["Salário", vaga.salario]);
    }

    detalhesVaga.forEach(([rotulo, valor]) => {
      const linha = document.createElement("span");
      const destaque = document.createElement("strong");
      destaque.textContent = `${rotulo}: `;
      linha.append(destaque, document.createTextNode(formatarRotuloVaga(valor) || "Não informado"));
      detalhes.appendChild(linha);
    });
    card.appendChild(detalhes);

    if (vaga.descricaoResumo) {
      const resumo = document.createElement("p");
      resumo.className = "vaga-resumo";
      resumo.textContent = vaga.descricaoResumo;
      card.appendChild(resumo);
    }

    const habilidadesVaga = habilidadesHelper.listar(vaga.habilidades).slice(0, 5);
    if (habilidadesVaga.length > 0) {
      const tags = document.createElement("div");
      tags.className = "vaga-tags";
      habilidadesVaga.forEach((habilidade) => {
        const tag = document.createElement("span");
        tag.textContent = habilidade;
        tags.appendChild(tag);
      });
      card.appendChild(tags);
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "candidatar-btn";
    botao.textContent = "Candidatar-se";
    botao.addEventListener("click", async () => {
      const usuario = getUsuarioLogado();
      if (!usuario) {
        mostrarNotificacao("Cadastre-se ou faça login para se candidatar.", {
          titulo: "Acesso necessário",
          tipo: "aviso"
        });
        setTimeout(() => {
          window.location.href = "login.html";
        }, 900);
        return;
      }

      botao.disabled = true;
      botao.textContent = "Enviando...";

      try {
        await salvarCandidatura(usuario.id, vaga.id);
        botao.textContent = "Candidatura enviada";
        botao.classList.add("candidatar-btn-enviado");
        mostrarNotificacao("Sua candidatura foi enviada com sucesso.", {
          titulo: "Candidatura enviada",
          tipo: "sucesso"
        });
        await notificarAlertaEmail(
          usuario,
          "candidatura",
          `Candidatura enviada para ${vaga.titulo} - ${vaga.empresa}`
        );
      } catch (erro) {
        if (erro.status === 409) {
          botao.textContent = "Já candidatado";
          botao.classList.add("candidatar-btn-enviado");
          mostrarNotificacao("Você já se candidatou para essa vaga.", {
            titulo: "Candidatura duplicada",
            tipo: "aviso"
          });
          return;
        }

        botao.disabled = false;
        botao.textContent = "Candidatar-se";
        mostrarNotificacao(erro.message, {
          titulo: "Erro na candidatura",
          tipo: "erro"
        });
      }
    });

    const acoes = document.createElement("div");
    acoes.className = "vaga-acoes";
    acoes.appendChild(botao);

    if (vaga.url) {
      const linkOriginal = document.createElement("a");
      linkOriginal.className = "vaga-link-original";
      linkOriginal.href = vaga.url;
      linkOriginal.target = "_blank";
      linkOriginal.rel = "noopener";
      linkOriginal.textContent = "Ver vaga original";
      acoes.appendChild(linkOriginal);
    }

    card.appendChild(acoes);
    fragmento.appendChild(card);
  });

  container.replaceChildren(fragmento);
  requestAnimationFrame(animarSecoes);
}

async function salvarCandidatura(usuarioId, vagaId) {
  let resposta;

  try {
    resposta = await fetch("/api/candidaturas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuarioId, vagaId })
    });
  } catch {
    throw new Error("Serviço temporariamente indisponível. Tente novamente em instantes.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(resultado.mensagem || "Não foi possível enviar a candidatura.");
    erro.status = resposta.status;
    throw erro;
  }

  return resultado.candidatura;
}

async function iniciarVagas() {
  const form = document.getElementById("form-vagas");
  const inputBusca = document.getElementById("busca-vaga");
  const selectArea = document.getElementById("area-vaga");
  const selectTipo = document.getElementById("tipo-vaga");
  const textoRecomendacao = document.getElementById("texto-recomendacao");
  const alertasEmailInput = document.getElementById("alertas-email");
  const alertasEmailLabel = document.getElementById("alertas-email-label");
  const alertasEmailStatus = document.getElementById("alertas-email-status");
  const recomendacaoLista = document.getElementById("recomendacao-lista");
  const container = document.getElementById("vagas-lista");
  const usuario = getUsuarioLogado();

  if (!form) return;

  function configurarAlertasEmail() {
    if (!usuario || !alertasEmailInput || !alertasEmailLabel) return;

    alertasEmailLabel.hidden = false;
    alertasEmailInput.checked = getPreferenciaAlertasEmail(usuario.id);

    if (alertasEmailInput.checked && alertasEmailStatus) {
      alertasEmailStatus.hidden = false;
      alertasEmailStatus.textContent = `Alertas ativos para ${mascararEmailAlerta(usuario.email)}.`;
    }

    alertasEmailInput.addEventListener("change", async () => {
      const ativo = alertasEmailInput.checked;
      setPreferenciaAlertasEmail(usuario.id, ativo);

      if (!ativo) {
        if (alertasEmailStatus) {
          alertasEmailStatus.hidden = false;
          alertasEmailStatus.textContent = "Alertas por e-mail desativados.";
        }

        mostrarNotificacao("Você não receberá mais alertas por e-mail.", {
          titulo: "Alertas desativados",
          tipo: "info"
        });
        return;
      }

      await notificarAlertaEmail(
        usuario,
        "ativacao",
        "Usuário ativou alertas por e-mail de vagas compatíveis.",
        { statusElemento: alertasEmailStatus }
      );
    });
  }

  configurarAlertasEmail();

  function calcularCompatibilidade(vaga, habilidadesUsuario) {
    const textoVaga = habilidadesHelper.normalizar([
      vaga.titulo,
      vaga.empresa,
      vaga.area,
      vaga.tipo,
      vaga.localizacao,
      vaga.habilidades,
      vaga.descricaoResumo
    ].filter(Boolean).join(" "));

    const habilidadesEncontradas = habilidadesUsuario.filter((habilidade) => {
      const habilidadeNormalizada = habilidadesHelper.normalizar(habilidade);
      return habilidadeNormalizada && textoVaga.includes(habilidadeNormalizada);
    });

    return {
      vaga,
      habilidadesEncontradas,
      percentual: habilidadesUsuario.length
        ? Math.round((habilidadesEncontradas.length / habilidadesUsuario.length) * 100)
        : 0
    };
  }

  function renderizarRecomendacoes(recomendacoes, habilidadesUsuario) {
    if (!recomendacaoLista) return;

    if (!usuario) {
      const mensagem = document.createElement("p");
      mensagem.className = "recomendacao-vazia";
      mensagem.textContent = "Entre na sua conta para receber indicações por habilidades.";
      recomendacaoLista.replaceChildren(mensagem);
      return;
    }

    if (habilidadesUsuario.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.className = "recomendacao-vazia";
      mensagem.textContent = "Adicione habilidades no seu perfil para ativar as recomendações.";
      recomendacaoLista.replaceChildren(mensagem);
      return;
    }

    if (recomendacoes.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.className = "recomendacao-vazia";
      mensagem.textContent = "Nenhuma vaga bateu diretamente com suas habilidades ainda.";
      recomendacaoLista.replaceChildren(mensagem);
      return;
    }

    const fragmento = document.createDocumentFragment();

    recomendacoes.slice(0, 4).forEach((recomendacao) => {
      const card = document.createElement("article");
      card.className = "recomendacao-card";

      const topo = document.createElement("div");
      topo.className = "recomendacao-card-topo";

      const titulo = document.createElement("h3");
      titulo.textContent = recomendacao.vaga.titulo;

      const percentual = document.createElement("span");
      percentual.textContent = `${recomendacao.percentual}%`;

      topo.append(titulo, percentual);

      const empresa = document.createElement("p");
      empresa.textContent = `${recomendacao.vaga.empresa || "Empresa parceira"} • ${formatarRotuloVaga(recomendacao.vaga.area) || "Área não informada"}`;

      const tags = document.createElement("div");
      tags.className = "recomendacao-tags";
      recomendacao.habilidadesEncontradas.forEach((habilidade) => {
        const tag = document.createElement("span");
        tag.textContent = habilidade;
        tags.appendChild(tag);
      });

      const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = "Ver vaga";
      botao.addEventListener("click", () => {
        inputBusca.value = recomendacao.vaga.titulo;
        renderizarVagas([recomendacao.vaga]);
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      card.append(topo, empresa, tags, botao);
      fragmento.appendChild(card);
    });

    recomendacaoLista.replaceChildren(fragmento);
  }

  function filtrarVagas() {
    const busca = normalizar(inputBusca.value);
    const area = selectArea.value;
    const tipo = selectTipo.value;

    const filtradas = vagas.filter((vaga) => {
      const correspondeBusca = !busca || normalizar(`${vaga.titulo} ${vaga.empresa} ${vaga.area} ${vaga.tipo} ${vaga.localizacao} ${vaga.habilidades} ${vaga.descricaoResumo}`).includes(busca);
      const correspondeArea = !area || vaga.area === area;
      const correspondeTipo = !tipo || vaga.tipo === tipo;
      return correspondeBusca && correspondeArea && correspondeTipo;
    });

    renderizarVagas(filtradas);
  }

  function atualizarRecomendacoes() {
    if (!textoRecomendacao) return;

    if (!usuario) {
      textoRecomendacao.textContent = "Entre na sua conta para ver vagas indicadas automaticamente.";
      renderizarRecomendacoes([], []);
      return;
    }

    const habilidadesUsuario = habilidadesHelper.listar(usuario.habilidades);
    const recomendadas = vagas
      .map((vaga) => calcularCompatibilidade(vaga, habilidadesUsuario))
      .filter((recomendacao) => recomendacao.habilidadesEncontradas.length > 0)
      .sort((a, b) => b.habilidadesEncontradas.length - a.habilidadesEncontradas.length || b.percentual - a.percentual);

    renderizarRecomendacoes(recomendadas, habilidadesUsuario);

    if (habilidadesUsuario.length === 0) {
      textoRecomendacao.textContent = "Adicione habilidades no perfil para receber recomendações automáticas.";
      return;
    }

    textoRecomendacao.textContent = recomendadas.length
      ? `Encontramos ${recomendadas.length} vaga(s) compatíveis com: ${habilidadesHelper.serializar(habilidadesUsuario)}.`
      : "Ainda não encontramos uma combinação exata, mas você pode explorar todas as vagas disponíveis.";

    if (recomendadas.length && getPreferenciaAlertasEmail(usuario.id)) {
      const chaveSessao = `${ALERTAS_EMAIL_SESSAO_KEY}:${usuario.id}:${habilidadesHelper.normalizar(usuario.habilidades)}`;
      if (!sessionStorage.getItem(chaveSessao)) {
        sessionStorage.setItem(chaveSessao, "true");
        notificarAlertaEmail(
          usuario,
          "recomendacao",
          `${recomendadas.length} vaga(s) compatíveis encontradas: ${recomendadas.slice(0, 3).map((item) => item.vaga.titulo).join(", ")}.`,
          { statusElemento: alertasEmailStatus }
        );
      }
    }
  }

  inputBusca.addEventListener("input", filtrarVagas);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    filtrarVagas();
  });

  const carregando = document.createElement("p");
  carregando.className = "sem-vagas";
  carregando.textContent = "Carregando vagas...";
  container.replaceChildren(carregando);

  try {
    const resposta = await fetch("/api/vagas");
    const resultado = await resposta.json().catch(() => []);

    if (!resposta.ok || !Array.isArray(resultado)) {
      throw new Error("Não foi possível carregar as vagas.");
    }

    vagas = resultado;
    renderizarVagas(vagas);
    atualizarRecomendacoes();
  } catch (erro) {
    const mensagem = document.createElement("p");
    mensagem.className = "sem-vagas";
    mensagem.textContent = "Não foi possível carregar as vagas agora.";
    container.replaceChildren(mensagem);
    mostrarNotificacao(erro.message, {
      titulo: "Erro ao carregar vagas",
      tipo: "erro"
    });
  }
}

function iniciarContato() {
  const form = document.getElementById("form-contato");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    const mensagens = JSON.parse(localStorage.getItem("favelaTechMensagens") || "[]");

    const novaMensagem = {
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      tipo: document.getElementById("tipo").value,
      mensagem: document.getElementById("mensagem").value.trim(),
      data: new Date().toLocaleString("pt-BR")
    };

    mensagens.push(novaMensagem);
    localStorage.setItem("favelaTechMensagens", JSON.stringify(mensagens));

    if (!form.action.includes("formspree.io")) {
      event.preventDefault();
      mostrarNotificacao("Sua mensagem foi enviada com sucesso.", {
        titulo: "Mensagem enviada",
        tipo: "sucesso"
      });
      form.reset();
    }
  });
}

function iniciarCompartilhamento() {
  const botao = document.getElementById("compartilhar-site");
  if (!botao) return;

  botao.addEventListener("click", async () => {
    const dados = {
      title: "Favela Tech",
      text: "Conheça o Portal de Oportunidades Favela Tech.",
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(dados);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    mostrarNotificacao("O link do site foi copiado.", {
      titulo: "Link copiado",
      tipo: "sucesso"
    });
  });
}

function iniciarVoltarTopo() {
  const botao = document.createElement("button");
  botao.className = "voltar-topo";
  botao.type = "button";
  botao.setAttribute("aria-label", "Voltar ao topo");
  botao.textContent = "↑";
  document.body.appendChild(botao);

  function atualizarVisibilidade() {
    botao.classList.toggle("visivel", window.scrollY > 520);
  }

  botao.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", atualizarVisibilidade, { passive: true });
  atualizarVisibilidade();
}

function melhorarFooter(usuario) {
  const footer = document.querySelector("footer");
  if (!footer || footer.dataset.enriquecido === "true") return;

  footer.dataset.enriquecido = "true";
  footer.innerHTML = `
    <div class="footer-conteudo">
      <div class="footer-marca">
        <a class="footer-logo" href="index.html">Favela Tech</a>
        <p>Conectando talentos da comunidade a oportunidades reais, com currículo, vagas e acompanhamento em um só lugar.</p>
      </div>

      <nav class="footer-links" aria-label="Links do rodapé">
        <strong>Navegação</strong>
        <a href="index.html">Início</a>
        <a href="vagas.html">Vagas</a>
        <a href="curriculo.html">Currículo</a>
        <a href="${usuario ? "perfil.html" : "login.html"}">${usuario ? "Minha conta" : "Login"}</a>
      </nav>

      <div class="footer-contato">
        <strong>Projeto</strong>
        <span>ODS 8: trabalho decente e crescimento econômico</span>
        <a href="contato.html">Falar com a Favela Tech</a>
      </div>
    </div>

    <div class="footer-base">
      <span>Favela Tech - Portal de Oportunidades</span>
      <span>Desenvolvido por Victor Lopes</span>
    </div>
  `;
}

limparHabilidadesLocaisAntigas();
mostrarNotificacaoPendente();
iniciarChatbot();
iniciarVagas();
iniciarContato();
iniciarCompartilhamento();

function iniciarDOMGlobal() {
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  const linksMenu = document.querySelectorAll("nav a");
  const usuario = getUsuarioLogado();
  const curriculoCta = document.getElementById("curriculo-cta");

  if (curriculoCta) {
    curriculoCta.href = usuario ? "curriculo.html" : "login.html";
  }

  linksMenu.forEach((link) => {
    const destino = link.getAttribute("href");

    if (destino === paginaAtual) {
      link.classList.add("nav-ativo");
    }

    if (link.classList.contains("login") && usuario) {
      const primeiroNome = usuario.nome.trim().split(/\s+/)[0];
      link.textContent = paginaAtual === "perfil.html"
        ? `Bem-vindo, ${primeiroNome}`
        : "Minha conta";
      link.href = "perfil.html";
      link.setAttribute("title", "Abrir minha conta");
    }
  });

  iniciarBoasVindas(usuario, paginaAtual);
  animarSecoes();
  iniciarContadorContato();
  iniciarVoltarTopo();
  melhorarFooter(usuario);
}

function iniciarBoasVindas(usuario, paginaAtual) {
  const deveExibir = sessionStorage.getItem("favelaTechExibirBoasVindas") === "true";
  if (!usuario || paginaAtual !== "index.html" || !deveExibir) return;

  sessionStorage.removeItem("favelaTechExibirBoasVindas");

  const primeiroNome = usuario.nome.trim().split(/\s+/)[0];
  const balao = document.createElement("aside");
  balao.className = "boas-vindas-balao";
  balao.setAttribute("role", "status");
  balao.setAttribute("aria-live", "polite");
  balao.innerHTML = `
    <div class="boas-vindas-conteudo">
      <strong>Olá, ${primeiroNome}!</strong>
      <p>Seja bem-vindo ao Favela Tech. Explore as vagas e encontre oportunidades que combinam com você.</p>
    </div>
    <button class="boas-vindas-fechar" type="button" aria-label="Fechar mensagem de boas-vindas">X</button>
  `;

  balao.querySelector(".boas-vindas-fechar").addEventListener("click", () => {
    balao.classList.add("fechando");
    balao.addEventListener("animationend", () => balao.remove(), { once: true });
  });

  document.body.appendChild(balao);
}

function animarSecoes() {
  const secoes = document.querySelectorAll(`
    main section,
    .feature-item,
    .jornada-lista article,
    .sobre-numeros article,
    .sobre-fluxo-lista article,
    .ajudar-impacto article,
    .ajudar-passos li,
    .ajudar-ongs li,
    .contato-canais article,
    .contato-info-lista p,
    .vagas-painel article,
    .vaga-card
  `);

  secoes.forEach((secao) => {
    secao.classList.add("dom-reveal");
  });

  if (!("IntersectionObserver" in window)) {
    secoes.forEach((secao) => secao.classList.add("apareceu"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("apareceu");
      }
    });
  }, { threshold: 0.12 });

  secoes.forEach((secao) => observador.observe(secao));
}

function iniciarContadorContato() {
  const mensagem = document.getElementById("mensagem");
  if (!mensagem) return;

  const contador = document.createElement("small");
  contador.className = "contador-mensagem";
  mensagem.insertAdjacentElement("afterend", contador);

  function atualizarContador() {
    contador.textContent = `${mensagem.value.length}/300 caracteres`;
    contador.classList.toggle("limite", mensagem.value.length > 300);
  }

  mensagem.addEventListener("input", atualizarContador);
  atualizarContador();
}

iniciarDOMGlobal();
