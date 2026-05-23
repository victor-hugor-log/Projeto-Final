const vagas = [
  {
    titulo: "Estagio em Suporte de TI",
    empresa: "Exemplo Tech",
    local: "Belo Horizonte - MG",
    area: "Tecnologia",
    tipo: "Estagio",
    habilidades: ["tecnologia", "suporte", "html", "informatica"],
    origem: "API  LinkedIn Jobs"
  },
  {
    titulo: "Jovem Aprendiz Administrativo",
    empresa: "Comercio Local BH",
    local: "Belo Horizonte - MG",
    area: "Administracao",
    tipo: "Jovem Aprendiz",
    habilidades: ["excel", "organizacao", "administracao"],
    origem: "API - CIEE"
  },
  {
    titulo: "Atendente de Loja",
    empresa: "Rede Parceira",
    local: "Contagem - MG",
    area: "Atendimento",
    tipo: "CLT",
    habilidades: ["comunicacao", "atendimento", "vendas"],
    origem: "API - Indeed"
  },
  {
    titulo: "Assistente de Marketing Digital",
    empresa: "Agencia Criativa",
    local: "Remoto",
    area: "Marketing",
    tipo: "Freelancer",
    habilidades: ["redes sociais", "canva", "marketing", "criatividade"],
    origem: "API - LinkedIn Jobs"
  }
];

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");
}

function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
      return "Para criar sua conta, acesse Login | Cadastro e preencha seus dados. O cadastro fica salvo no navegador como banco de dados simulado.";
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
}

function renderizarVagas(lista) {
  const container = document.getElementById("vagas-lista");
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p class="sem-vagas">Nenhuma vaga encontrada com esses filtros.</p>';
    return;
  }

  container.innerHTML = lista.map((vaga) => `
    <article class="vaga-card">
      <h2>${vaga.titulo}</h2>
      <p><strong>Empresa:</strong> ${vaga.empresa}</p>
      <p><strong>Local:</strong> ${vaga.local}</p>
      <p><strong>Area:</strong> ${vaga.area}</p>
      <p><strong>Tipo:</strong> ${vaga.tipo}</p>
      <p><strong>Origem:</strong> ${vaga.origem}</p>
      <button type="button" class="candidatar-btn">Candidatar-se</button>
    </article>
  `).join("");

  document.querySelectorAll(".candidatar-btn").forEach((botao) => {
    botao.addEventListener("click", () => {
      const usuario = getUsuarioLogado();
      if (!usuario) {
        alert("Cadastre-se ou faca login para se candidatar.");
        window.location.href = "login.html";
        return;
      }

      alert("Candidatura enviada com sucesso!");
    });
  });
}

function iniciarVagas() {
  const form = document.getElementById("form-vagas");
  const textoRecomendacao = document.getElementById("texto-recomendacao");
  const usuario = getUsuarioLogado();

  if (!form) return;

  renderizarVagas(vagas);

  if (textoRecomendacao && usuario?.habilidades) {
    const habilidadesUsuario = normalizar(usuario.habilidades);
    const recomendadas = vagas.filter((vaga) =>
      vaga.habilidades.some((habilidade) => habilidadesUsuario.includes(normalizar(habilidade)))
    );

    textoRecomendacao.textContent = recomendadas.length
      ? `Encontramos ${recomendadas.length} vaga(s) com boa combinacao para suas habilidades: ${usuario.habilidades}.`
      : "Ainda nao encontramos uma combinacao exata, mas voce pode explorar todas as vagas disponiveis.";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const busca = normalizar(document.getElementById("busca-vaga").value);
    const area = document.getElementById("area-vaga").value;
    const tipo = document.getElementById("tipo-vaga").value;

    const filtradas = vagas.filter((vaga) => {
      const correspondeBusca = !busca || normalizar(`${vaga.titulo} ${vaga.empresa} ${vaga.area} ${vaga.tipo}`).includes(busca);
      const correspondeArea = !area || vaga.area === area;
      const correspondeTipo = !tipo || vaga.tipo === tipo;
      return correspondeBusca && correspondeArea && correspondeTipo;
    });

    renderizarVagas(filtradas);
  });
}

function iniciarContato() {
  const form = document.getElementById("form-contato");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
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
    alert("Mensagem enviada e salva no banco de dados simulado.");
    form.reset();
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
    alert("Link copiado para compartilhar.");
  });
}

iniciarChatbot();
iniciarVagas();
iniciarContato();
iniciarCompartilhamento();

function iniciarDOMGlobal() {
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  const linksMenu = document.querySelectorAll("nav a");
  const usuario = getUsuarioLogado();

  linksMenu.forEach((link) => {
    const destino = link.getAttribute("href");

    if (destino === paginaAtual) {
      link.classList.add("nav-ativo");
    }

    if (link.classList.contains("login") && usuario) {
      link.textContent = `Ola, ${usuario.nome.split(" ")[0]}`;
      link.setAttribute("title", "Usuario logado");
    }
  });

  criarSaudacao(usuario);
  animarSecoes();
  iniciarContadorContato();
}

function criarSaudacao(usuario) {
  const main = document.querySelector("main");
  if (!main || !usuario) return;

  const saudacao = document.createElement("div");
  saudacao.className = "dom-saudacao";
  saudacao.textContent = `Bem-vindo(a), ${usuario.nome}! Seu perfil esta ativo no Favela Tech.`;
  main.prepend(saudacao);
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

// ===== CARREGAR VAGAS DA API =====
const listaVagas = document.getElementById("vagas-lista");

if (listaVagas) {
  fetch("http://localhost:3000/api/vagas")
    .then((res) => res.json())
    .then((vagas) => {
      listaVagas.innerHTML = "";

      vagas.forEach((vaga) => {
        listaVagas.innerHTML += `
          <article class="vaga-card">
            <span class="vaga-origem">${vaga.origem}</span>
            <h3>${vaga.titulo}</h3>
            <p><strong>Empresa:</strong> ${vaga.empresa}</p>
            <p><strong>Local:</strong> ${vaga.local}</p>
            <p><strong>Tipo:</strong> ${vaga.tipo}</p>
          </article>
        `;
      });
    })
    .catch((erro) => {
      console.error("Erro ao buscar vagas:", erro);
      listaVagas.innerHTML = "<p>Não foi possível carregar as vagas no momento.</p>";
    });
}
