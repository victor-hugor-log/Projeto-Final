let vagas = [];

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");
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
  fechar.setAttribute("aria-label", "Fechar notificacao");
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
    mostrarNotificacao("A operacao foi concluida.");
  }
}

function iniciarChatbot() {
  const botao = document.querySelector(".chatbot-button");
  const janela = document.querySelector(".chatbot-window");
  const fechar = document.querySelector(".chatbot-close");
  const mensagens = document.querySelector(".chatbot-messages");
  const form = document.querySelector(".chatbot-form");
  const input = document.querySelector(".chatbot-form input");

  if (!botao || !janela || !fechar || !mensagens || !form || !input) return;

  janela.style.display = "none";

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

  function responder(pergunta) {
    const texto = normalizar(pergunta);

    if (texto.includes("cadastro") || texto.includes("login") || texto.includes("conta")) {
      return "Para criar sua conta, acesse Login | Cadastro e preencha seus dados. O cadastro fica salvo com seguranca no banco de dados.";
    }

    if (texto.includes("vaga") || texto.includes("emprego") || texto.includes("oportunidade")) {
      return "Na pagina Vagas voce pode filtrar oportunidades por area, tipo de contrato e palavra-chave.";
    }

    if (texto.includes("empresa")) {
      return "Empresas podem cadastrar interesse, divulgar vagas e encontrar jovens com habilidades compativeis.";
    }

    if (texto.includes("ods") || texto.includes("8")) {
      return "A ODS 8 busca promover trabalho decente, crescimento economico e inclusao produtiva.";
    }

    if (texto.includes("contato")) {
      return "Voce pode falar pelo formulario da pagina Contato, e-mail ou WhatsApp informado no site.";
    }

    return "Posso ajudar com cadastro, vagas, empresas, ODS 8 e contato. Me diga o que voce quer saber.";
  }

  botao.addEventListener("click", () => {
    const aberto = janela.style.display === "block";
    janela.style.display = aberto ? "none" : "block";
    fecharConvite();

    if (!aberto && mensagens.children.length === 0) {
      adicionarMensagem("Ola! Sou o assistente do Favela Tech. Como posso ajudar?", "bot");
    }
  });

  fechar.addEventListener("click", () => {
    janela.style.display = "none";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const pergunta = input.value.trim();
    if (!pergunta) return;

    adicionarMensagem(pergunta, "user");
    adicionarMensagem(responder(pergunta), "bot");
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
    card.appendChild(titulo);

    [
      ["Empresa", vaga.empresa],
      ["Local", vaga.localizacao],
      ["Area", vaga.area],
      ["Tipo", vaga.tipo],
      ["Origem", vaga.origem]
    ].forEach(([rotulo, valor]) => {
      const linha = document.createElement("p");
      const destaque = document.createElement("strong");
      destaque.textContent = `${rotulo}: `;
      linha.append(destaque, document.createTextNode(valor || "Nao informado"));
      card.appendChild(linha);
    });

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "candidatar-btn";
    botao.textContent = "Candidatar-se";
    botao.addEventListener("click", () => {
      const usuario = getUsuarioLogado();
      if (!usuario) {
        mostrarNotificacao("Cadastre-se ou faca login para se candidatar.", {
          titulo: "Acesso necessario",
          tipo: "aviso"
        });
        setTimeout(() => {
          window.location.href = "login.html";
        }, 900);
        return;
      }

      mostrarNotificacao("Sua candidatura foi enviada com sucesso.", {
        titulo: "Candidatura enviada",
        tipo: "sucesso"
      });
    });

    card.appendChild(botao);
    fragmento.appendChild(card);
  });

  container.replaceChildren(fragmento);
}

async function iniciarVagas() {
  const form = document.getElementById("form-vagas");
  const inputBusca = document.getElementById("busca-vaga");
  const selectArea = document.getElementById("area-vaga");
  const selectTipo = document.getElementById("tipo-vaga");
  const textoRecomendacao = document.getElementById("texto-recomendacao");
  const container = document.getElementById("vagas-lista");
  const usuario = getUsuarioLogado();

  if (!form) return;

  function filtrarVagas() {
    const busca = normalizar(inputBusca.value);
    const area = selectArea.value;
    const tipo = selectTipo.value;

    const filtradas = vagas.filter((vaga) => {
      const correspondeBusca = !busca || normalizar(`${vaga.titulo} ${vaga.empresa} ${vaga.area} ${vaga.tipo}`).includes(busca);
      const correspondeArea = !area || vaga.area === area;
      const correspondeTipo = !tipo || vaga.tipo === tipo;
      return correspondeBusca && correspondeArea && correspondeTipo;
    });

    renderizarVagas(filtradas);
  }

  function atualizarRecomendacoes() {
    if (!textoRecomendacao || !usuario?.habilidades) return;

    const habilidadesUsuario = normalizar(usuario.habilidades)
      .split(/[\s,;]+/)
      .filter((habilidade) => habilidade.length >= 3);
    const recomendadas = vagas.filter((vaga) => {
      const habilidadesVaga = normalizar(vaga.habilidades);
      return habilidadesUsuario.some((habilidade) => habilidadesVaga.includes(habilidade));
    });

    textoRecomendacao.textContent = recomendadas.length
      ? `Encontramos ${recomendadas.length} vaga(s) com boa combinacao para suas habilidades: ${usuario.habilidades}.`
      : "Ainda nao encontramos uma combinacao exata, mas voce pode explorar todas as vagas disponiveis.";
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
      throw new Error("Nao foi possivel carregar as vagas.");
    }

    vagas = resultado;
    renderizarVagas(vagas);
    atualizarRecomendacoes();
  } catch (erro) {
    const mensagem = document.createElement("p");
    mensagem.className = "sem-vagas";
    mensagem.textContent = "Nao foi possivel carregar as vagas agora.";
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
      mostrarNotificacao("Sua mensagem foi enviada e salva.", {
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
      text: "Conheca o Portal de Oportunidades Favela Tech.",
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
  const secoes = document.querySelectorAll("main section, .feature-item, .vaga-card");

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
