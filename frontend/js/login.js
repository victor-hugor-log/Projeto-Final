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
const recuperacaoModal = document.getElementById("recuperacao-modal");
const fecharRecuperacao = document.getElementById("fechar-recuperacao");
const formRecuperacaoEmail = document.getElementById("form-recuperacao-email");
const formRedefinirSenha = document.getElementById("form-redefinir-senha");
const recuperacaoEmail = document.getElementById("recuperacao-email");
const recuperacaoCodigo = document.getElementById("recuperacao-codigo");
const recuperacaoNovaSenha = document.getElementById("recuperacao-nova-senha");
const recuperacaoConfirmarSenha = document.getElementById("recuperacao-confirmar-senha");
const recuperacaoCodigoLocal = document.getElementById("recuperacao-codigo-local");
const recuperacaoCodigoTexto = document.getElementById("recuperacao-codigo-texto");
const copiarCodigoRecuperacao = document.getElementById("copiar-codigo-recuperacao");
const socialLoginModal = document.getElementById("social-login-modal");
const fecharSocialLogin = document.getElementById("fechar-social-login");
const socialLoginProvedor = document.getElementById("social-login-provedor");
const usarEmailSocial = document.getElementById("usar-email-social");
const editorHabilidadesCadastro = window.FavelaTechHabilidades?.criarEditor({
  campoId: "habilidades-cad",
  inputId: "habilidade-cad-input",
  listaId: "habilidades-cad-lista",
  sugestoesId: "habilidades-cad-sugestoes",
  erroId: "erro-habilidades-cad"
});

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
    throw new Error(resultado.mensagem || "Não foi possível acessar o servidor.");
  }

  return resultado;
}

async function buscarSessaoAtual() {
  let resposta;

  try {
    resposta = await fetch("/api/auth/sessao", {
      credentials: "same-origin"
    });
  } catch {
    throw new Error("Não foi possível concluir o login com Google agora.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Sessão do Google não encontrada.");
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
  if (!email || !email.includes("@")) return "Não informado";

  const [nome, dominio] = email.split("@");
  const nomeVisivel = nome.length <= 2 ? nome[0] || "*" : nome.slice(0, 2);
  const dominioVisivel = dominio.length <= 6
    ? dominio[0] || "*"
    : `${dominio.slice(0, 2)}...${dominio.slice(-4)}`;

  return `${nomeVisivel}***@${dominioVisivel}`;
}

function mascararTelefone(telefone) {
  const digitos = String(telefone || "").replace(/\D/g, "");
  if (!digitos) return "Não informado";
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
    mostrarErro(input, "E-mail inválido.");
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
    <p><strong>Habilidades/interesses:</strong> ${usuario.habilidades || "Não informado"}</p>
    <p><strong>Status:</strong> ${usuario.emailVerificado ? "E-mail confirmado" : "E-mail pendente de confirmação"}</p>
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

function abrirModalRecuperacao() {
  if (!recuperacaoModal || !recuperacaoEmail) return;

  const emailLogin = campo("email-login")?.value.trim().toLowerCase();
  recuperacaoEmail.value = emailLogin || recuperacaoEmail.value;

  if (recuperacaoCodigoLocal) recuperacaoCodigoLocal.hidden = true;
  if (formRedefinirSenha) formRedefinirSenha.hidden = true;
  if (recuperacaoCodigo) recuperacaoCodigo.value = "";
  if (recuperacaoNovaSenha) recuperacaoNovaSenha.value = "";
  if (recuperacaoConfirmarSenha) recuperacaoConfirmarSenha.value = "";

  recuperacaoModal.hidden = false;
  recuperacaoEmail.focus();
}

function fecharModalRecuperacao() {
  if (!recuperacaoModal) return;

  recuperacaoModal.hidden = true;
  recuperarSenha?.focus();
}

function abrirModalSocialLogin(provedor) {
  if (!socialLoginModal || !socialLoginProvedor) return;

  socialLoginProvedor.textContent = provedor === "facebook" ? "Facebook" : "Google";
  socialLoginModal.hidden = false;
  usarEmailSocial?.focus();
}

function fecharModalSocialLogin() {
  if (!socialLoginModal) return;

  socialLoginModal.hidden = true;
}

async function concluirLoginGoogle() {
  const parametros = new URLSearchParams(window.location.search);
  const statusGoogle = parametros.get("google");

  if (!statusGoogle) return;

  window.history.replaceState({}, document.title, window.location.pathname);

  if (statusGoogle === "config") {
    window.mostrarNotificacao("O login com Google ainda precisa das credenciais no backend.", {
      titulo: "Google não configurado",
      tipo: "aviso"
    });
    return;
  }

  if (statusGoogle !== "sucesso") {
    window.mostrarNotificacao("Não foi possível concluir o login com Google. Tente novamente.", {
      titulo: "Login com Google",
      tipo: "erro"
    });
    return;
  }

  try {
    const { usuario } = await buscarSessaoAtual();
    salvarUsuarioLogado(usuario);
    sessionStorage.setItem("favelaTechExibirBoasVindas", "true");
    window.location.replace("index.html");
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Login com Google",
      tipo: "erro"
    });
  }
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
  if (!editorHabilidadesCadastro?.validarMinimo(1, "Adicione pelo menos uma habilidade ou interesse.")) {
    mostrarErro(habilidades, "Adicione pelo menos uma habilidade ou interesse.");
    valido = false;
  } else {
    mostrarValido(habilidades);
  }

  if (!lgpd.checked) {
    erroLgpd.textContent = "Você precisa aceitar os termos/LGPD.";
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

fecharRecuperacao?.addEventListener("click", fecharModalRecuperacao);

recuperacaoModal?.addEventListener("click", (event) => {
  if (event.target === recuperacaoModal) {
    fecharModalRecuperacao();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && termosModal && !termosModal.hidden) {
    fecharModalTermos();
  }

  if (event.key === "Escape" && verificacaoLocalModal && !verificacaoLocalModal.hidden) {
    fecharModalVerificacao();
  }

  if (event.key === "Escape" && recuperacaoModal && !recuperacaoModal.hidden) {
    fecharModalRecuperacao();
  }

  if (event.key === "Escape" && socialLoginModal && !socialLoginModal.hidden) {
    fecharModalSocialLogin();
  }
});

document.querySelectorAll(".auth-social-btn").forEach((botao) => {
  botao.addEventListener("click", () => {
    const provedor = botao.dataset.provedor || "google";

    if (provedor === "google") {
      window.location.href = "/auth/google";
      return;
    }

    abrirModalSocialLogin(provedor);
  });
});

fecharSocialLogin?.addEventListener("click", fecharModalSocialLogin);

socialLoginModal?.addEventListener("click", (event) => {
  if (event.target === socialLoginModal) {
    fecharModalSocialLogin();
  }
});

usarEmailSocial?.addEventListener("click", () => {
  fecharModalSocialLogin();
  campo("email-login")?.focus();
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

copiarCodigoRecuperacao?.addEventListener("click", async () => {
  const codigo = recuperacaoCodigoTexto?.textContent.trim();
  if (!codigo) return;

  await navigator.clipboard.writeText(codigo);
  window.mostrarNotificacao("Código de recuperação copiado.", {
    titulo: "Recuperação de senha",
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
  const habilidades = editorHabilidadesCadastro?.serializar() || campo("habilidades-cad").value.trim();
  definirFormularioCarregando(formCadastro, true);

  try {
    const { verificacao } = await enviarAutenticacao("cadastro", {
      nome,
      email,
      senha,
      tipo,
      habilidades
    });

    window.mostrarNotificacao("Sua conta foi criada. Confirme seu e-mail antes de entrar.", {
      titulo: "Cadastro criado",
      tipo: "sucesso"
    });
    abrirModalVerificacao(verificacao?.link);
    formCadastro.reset();
    editorHabilidadesCadastro?.limpar();
    campo("email-login").value = email;
    campo("senha-login").value = "";
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
    mensagem: "Você saiu da sua conta com segurança.",
    titulo: "Sessão encerrada",
    tipo: "info"
  }));
  window.location.reload();
});

formRecuperacaoEmail?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = recuperacaoEmail.value.trim().toLowerCase();

  if (!emailValido(email)) {
    window.mostrarNotificacao("Informe um e-mail válido para gerar o código.", {
      titulo: "Recuperação de senha",
      tipo: "aviso"
    });
    recuperacaoEmail.focus();
    return;
  }

  definirFormularioCarregando(formRecuperacaoEmail, true);

  try {
    const resultado = await enviarAutenticacao("recuperar-senha", { email });
    formRedefinirSenha.dataset.email = email;
    formRedefinirSenha.hidden = false;

    if (resultado.recuperacao?.codigo && recuperacaoCodigoTexto && recuperacaoCodigoLocal) {
      recuperacaoCodigoTexto.textContent = resultado.recuperacao.codigo;
      recuperacaoCodigoLocal.hidden = false;
    }

    window.mostrarNotificacao(resultado.mensagem, {
      titulo: "Código gerado",
      tipo: "sucesso"
    });
    recuperacaoCodigo?.focus();
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível gerar",
      tipo: "erro"
    });
  } finally {
    definirFormularioCarregando(formRecuperacaoEmail, false);
  }
});

formRedefinirSenha?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = formRedefinirSenha.dataset.email || recuperacaoEmail.value.trim().toLowerCase();
  const codigo = recuperacaoCodigo.value.trim();
  const novaSenha = recuperacaoNovaSenha.value;
  const confirmarSenha = recuperacaoConfirmarSenha.value;

  if (!/^\d{6}$/.test(codigo)) {
    window.mostrarNotificacao("Informe o código de 6 dígitos.", {
      titulo: "Código inválido",
      tipo: "aviso"
    });
    recuperacaoCodigo.focus();
    return;
  }

  if (novaSenha.length < 6) {
    window.mostrarNotificacao("A nova senha precisa ter pelo menos 6 caracteres.", {
      titulo: "Senha curta",
      tipo: "aviso"
    });
    recuperacaoNovaSenha.focus();
    return;
  }

  if (novaSenha !== confirmarSenha) {
    window.mostrarNotificacao("A confirmação precisa ser igual à nova senha.", {
      titulo: "Confira as senhas",
      tipo: "aviso"
    });
    recuperacaoConfirmarSenha.focus();
    return;
  }

  definirFormularioCarregando(formRedefinirSenha, true);

  try {
    const resultado = await enviarAutenticacao("redefinir-senha", {
      email,
      codigo,
      novaSenha
    });

    campo("email-login").value = email;
    campo("senha-login").value = "";
    fecharModalRecuperacao();
    trocarBalao("login");
    window.mostrarNotificacao(resultado.mensagem, {
      titulo: "Senha redefinida",
      tipo: "sucesso"
    });
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível redefinir",
      tipo: "erro"
    });
  } finally {
    definirFormularioCarregando(formRedefinirSenha, false);
  }
});

recuperarSenha?.addEventListener("click", (event) => {
  event.preventDefault();
  abrirModalRecuperacao();
});

concluirLoginGoogle();
mostrarPerfil();
