const loginCard = document.getElementById("login-card");
const cadastroCard = document.getElementById("cadastro-card");
const abrirCadastro = document.getElementById("abrir-cadastro");
const abrirLogin = document.getElementById("abrir-login");
const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const perfilRestrito = document.getElementById("perfil-restrito");
const perfilDados = document.getElementById("perfil-dados");
const sairConta = document.getElementById("sair-conta");
const recuperarSenha = document.getElementById("recuperar-senha");
const abrirTermos = document.getElementById("abrir-termos");
const termosModal = document.getElementById("termos-modal");
const fecharTermos = document.getElementById("fechar-termos");
const cancelarTermos = document.getElementById("cancelar-termos");
const aceitarTermos = document.getElementById("aceitar-termos");
const verificacaoLocalModal = document.getElementById("verificacao-local-modal");
const fecharVerificacaoLocal = document.getElementById("fechar-verificacao-local");
const verificacaoLocalLink = document.getElementById("verificacao-local-link");
const copiarVerificacaoLocal = document.getElementById("copiar-verificacao-local");

function trocarBalao(tipo) {
  const mostrarCadastro = tipo === "cadastro";
  loginCard.classList.toggle("active", !mostrarCadastro);
  cadastroCard.classList.toggle("active", mostrarCadastro);
  loginCard.setAttribute("aria-hidden", String(mostrarCadastro));
  cadastroCard.setAttribute("aria-hidden", String(!mostrarCadastro));
}

function salvarUsuarioLogado(usuario) {
  localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuario));
  mostrarPerfil();
}

async function enviarAutenticacao(endpoint, dados) {
  let resposta;

  try {
    resposta = await fetch(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });
  } catch {
    throw new Error("Serviço temporariamente indisponível. Tente novamente em instantes.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Nao foi possivel acessar o servidor.");
  }

  return resultado;
}

function definirFormularioCarregando(formulario, carregando) {
  const botao = formulario.querySelector('button[type="submit"]');
  botao.disabled = carregando;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mascararEmail(email) {
  if (!email || !email.includes("@")) return "Nao informado";

  const [nome, dominio] = email.split("@");
  const nomeVisivel = nome.length <= 2 ? nome[0] || "*" : nome.slice(0, 2);
  const dominioVisivel = dominio.length <= 6
    ? dominio[0] || "*"
    : `${dominio.slice(0, 2)}...${dominio.slice(-4)}`;

  return `${nomeVisivel}***@${dominioVisivel}`;
}

function mascararTelefone(telefone) {
  const digitos = String(telefone || "").replace(/\D/g, "");
  if (!digitos) return "Nao informado";
  if (digitos.length <= 4) return "****";

  return `(**) *****-${digitos.slice(-4)}`;
}

function campo(id) {
  return document.getElementById(id);
}

function limparErro(input) {
  const grupo = input.closest(".input-group");
  const erro = grupo?.querySelector(".erro");

  grupo?.classList.remove("invalid");
  grupo?.classList.remove("valid");
  if (erro) erro.textContent = "";
}

function mostrarErro(input, mensagem) {
  const grupo = input.closest(".input-group");
  const erro = grupo?.querySelector(".erro");

  grupo?.classList.add("invalid");
  grupo?.classList.remove("valid");
  if (erro) erro.textContent = mensagem;
}

function mostrarValido(input) {
  const grupo = input.closest(".input-group");
  grupo?.classList.add("valid");
  grupo?.classList.remove("invalid");
}

function validarObrigatorio(input, nomeCampo) {
  if (!input.value.trim()) {
    mostrarErro(input, `${nomeCampo}: campo vazio.`);
    return false;
  }

  mostrarValido(input);
  return true;
}

function validarEmail(input) {
  if (!input.value.trim()) {
    mostrarErro(input, "E-mail: campo vazio.");
    return false;
  }

  if (!emailValido(input.value.trim())) {
    mostrarErro(input, "E-mail invalido.");
    return false;
  }

  mostrarValido(input);
  return true;
}

function validarSenha(input) {
  if (!input.value.trim()) {
    mostrarErro(input, "Senha: campo vazio.");
    return false;
  }

  if (input.value.trim().length < 6) {
    mostrarErro(input, "A senha precisa ter pelo menos 6 caracteres.");
    return false;
  }

  mostrarValido(input);
  return true;
}

function mostrarPerfil() {
  const usuario = JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");

  if (!perfilRestrito || !perfilDados) return;

  if (!usuario) {
    perfilRestrito.hidden = true;
    return;
  }

  perfilRestrito.hidden = false;
  perfilDados.innerHTML = `
    <p><strong>Nome:</strong> ${usuario.nome}</p>
    <p><strong>E-mail:</strong> ${mascararEmail(usuario.email)}</p>
    <p><strong>Telefone:</strong> ${mascararTelefone(usuario.telefone)}</p>
    <p><strong>Perfil:</strong> ${usuario.tipo === "empresa" ? "Empresa" : "Jovem"}</p>
    <p><strong>Habilidades/interesses:</strong> ${usuario.habilidades || "Nao informado"}</p>
    <p><strong>Status:</strong> ${usuario.emailVerificado ? "E-mail confirmado" : "E-mail pendente de confirmacao"}</p>
  `;
}

function abrirModalTermos() {
  if (!termosModal) return;

  termosModal.hidden = false;
  aceitarTermos?.focus();
}

function fecharModalTermos() {
  if (!termosModal) return;

  termosModal.hidden = true;
  abrirTermos?.focus();
}

function abrirModalVerificacao(link) {
  if (!verificacaoLocalModal || !verificacaoLocalLink || !link) return;

  verificacaoLocalLink.href = link;
  verificacaoLocalLink.textContent = link;
  verificacaoLocalModal.hidden = false;
  verificacaoLocalLink.focus();
}

function fecharModalVerificacao() {
  if (!verificacaoLocalModal) return;

  verificacaoLocalModal.hidden = true;
}

function validarLogin() {
  const email = campo("email-login");
  const senha = campo("senha-login");
  let valido = true;

  valido = validarEmail(email) && valido;
  valido = validarSenha(senha) && valido;

  return valido;
}

function validarCadastro() {
  const nome = campo("nome-cad");
  const email = campo("email-cad");
  const senha = campo("senha-cad");
  const tipo = campo("tipo-cad");
  const habilidades = campo("habilidades-cad");
  const lgpd = campo("lgpd-cad");
  const erroLgpd = campo("erro-lgpd-cad");
  let valido = true;

  valido = validarObrigatorio(nome, "Nome") && valido;
  valido = validarEmail(email) && valido;
  valido = validarSenha(senha) && valido;
  valido = validarObrigatorio(tipo, "Perfil") && valido;
  valido = validarObrigatorio(habilidades, "Habilidades") && valido;

  if (!lgpd.checked) {
    erroLgpd.textContent = "Voce precisa aceitar os termos/LGPD.";
    valido = false;
  } else {
    erroLgpd.textContent = "";
  }

  return valido;
}

abrirCadastro?.addEventListener("click", () => {
  trocarBalao("cadastro");
});

abrirLogin?.addEventListener("click", () => {
  trocarBalao("login");
});

abrirTermos?.addEventListener("click", abrirModalTermos);
fecharTermos?.addEventListener("click", fecharModalTermos);
cancelarTermos?.addEventListener("click", fecharModalTermos);

termosModal?.addEventListener("click", (event) => {
  if (event.target === termosModal) {
    fecharModalTermos();
  }
});

fecharVerificacaoLocal?.addEventListener("click", fecharModalVerificacao);

verificacaoLocalModal?.addEventListener("click", (event) => {
  if (event.target === verificacaoLocalModal) {
    fecharModalVerificacao();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && termosModal && !termosModal.hidden) {
    fecharModalTermos();
  }

  if (event.key === "Escape" && verificacaoLocalModal && !verificacaoLocalModal.hidden) {
    fecharModalVerificacao();
  }
});

aceitarTermos?.addEventListener("click", () => {
  const lgpd = campo("lgpd-cad");
  const erroLgpd = campo("erro-lgpd-cad");

  lgpd.checked = true;
  erroLgpd.textContent = "";
  fecharModalTermos();
});

copiarVerificacaoLocal?.addEventListener("click", async () => {
  const link = verificacaoLocalLink?.href;
  if (!link) return;

  await navigator.clipboard.writeText(link);
  window.mostrarNotificacao("Link de verificação copiado.", {
    titulo: "Verificação",
    tipo: "sucesso"
  });
});

document.querySelectorAll(".input-group input, .input-group select").forEach((input) => {
  input.addEventListener("input", () => limparErro(input));
  input.addEventListener("change", () => limparErro(input));
});

formLogin?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validarLogin()) return;

  const email = campo("email-login").value.trim().toLowerCase();
  const senha = campo("senha-login").value.trim();
  definirFormularioCarregando(formLogin, true);

  try {
    const { usuario } = await enviarAutenticacao("login", { email, senha });
    salvarUsuarioLogado(usuario);
    sessionStorage.setItem("favelaTechExibirBoasVindas", "true");
    window.location.replace("index.html");
  } catch (erro) {
    mostrarErro(campo("email-login"), erro.message);
    mostrarErro(campo("senha-login"), "Confira sua senha.");
  } finally {
    definirFormularioCarregando(formLogin, false);
  }
});

formCadastro?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validarCadastro()) return;

  const nome = campo("nome-cad").value.trim();
  const email = campo("email-cad").value.trim().toLowerCase();
  const senha = campo("senha-cad").value.trim();
  const tipo = campo("tipo-cad").value;
  const habilidades = campo("habilidades-cad").value.trim();
  definirFormularioCarregando(formCadastro, true);

  try {
    const { usuario, verificacao } = await enviarAutenticacao("cadastro", {
      nome,
      email,
      senha,
      tipo,
      habilidades
    });

    salvarUsuarioLogado(usuario);
    window.mostrarNotificacao("Sua conta foi criada. Confirme seu e-mail para concluir o cadastro.", {
      titulo: "Cadastro criado",
      tipo: "sucesso"
    });
    abrirModalVerificacao(verificacao?.link);
    formCadastro.reset();
    document.querySelectorAll(".input-group").forEach((grupo) => grupo.classList.remove("valid", "invalid"));
    trocarBalao("login");
  } catch (erro) {
    mostrarErro(campo("email-cad"), erro.message);
  } finally {
    definirFormularioCarregando(formCadastro, false);
  }
});

sairConta?.addEventListener("click", () => {
  localStorage.removeItem("favelaTechUsuarioLogado");
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Voce saiu da sua conta com seguranca.",
    titulo: "Sessao encerrada",
    tipo: "info"
  }));
  window.location.reload();
});

recuperarSenha?.addEventListener("click", (event) => {
  event.preventDefault();
  const email = campo("email-login");

  if (!validarEmail(email)) return;

  window.mostrarNotificacao("Um e-mail seria enviado para redefinir sua senha.", {
    titulo: "Recuperacao de senha",
    tipo: "info"
  });
});

mostrarPerfil();
