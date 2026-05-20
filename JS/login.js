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

function trocarBalao(tipo) {
  const mostrarCadastro = tipo === "cadastro";
  loginCard.classList.toggle("active", !mostrarCadastro);
  cadastroCard.classList.toggle("active", mostrarCadastro);
  loginCard.setAttribute("aria-hidden", String(mostrarCadastro));
  cadastroCard.setAttribute("aria-hidden", String(!mostrarCadastro));
}

function carregarUsuarios() {
  return JSON.parse(localStorage.getItem("favelaTechUsuarios") || "[]");
}

function salvarUsuarios(usuarios) {
  localStorage.setItem("favelaTechUsuarios", JSON.stringify(usuarios));
}

function salvarUsuarioLogado(usuario) {
  localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuario));
  mostrarPerfil();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    <p><strong>E-mail:</strong> ${usuario.email}</p>
    <p><strong>Perfil:</strong> ${usuario.tipo === "empresa" ? "Empresa" : "Jovem"}</p>
    <p><strong>Habilidades/interesses:</strong> ${usuario.habilidades || "Nao informado"}</p>
    <p><strong>Status:</strong> E-mail confirmado na simulacao do projeto.</p>
  `;
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

document.querySelectorAll(".input-group input, .input-group select").forEach((input) => {
  input.addEventListener("input", () => limparErro(input));
  input.addEventListener("change", () => limparErro(input));
});

formLogin?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validarLogin()) return;

  const email = campo("email-login").value.trim().toLowerCase();
  const senha = campo("senha-login").value.trim();
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find((item) => item.email === email && item.senha === senha);

  if (!usuario) {
    mostrarErro(campo("email-login"), "Conta nao encontrada ou senha incorreta.");
    mostrarErro(campo("senha-login"), "Confira sua senha.");
    return;
  }

  salvarUsuarioLogado(usuario);
  alert("Login realizado com sucesso!");
  formLogin.reset();
  document.querySelectorAll(".input-group").forEach((grupo) => grupo.classList.remove("valid", "invalid"));
});

formCadastro?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validarCadastro()) return;

  const nome = campo("nome-cad").value.trim();
  const email = campo("email-cad").value.trim().toLowerCase();
  const senha = campo("senha-cad").value.trim();
  const tipo = campo("tipo-cad").value;
  const habilidades = campo("habilidades-cad").value.trim();
  const usuarios = carregarUsuarios();

  if (usuarios.some((usuario) => usuario.email === email)) {
    mostrarErro(campo("email-cad"), "Este e-mail ja esta cadastrado.");
    return;
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    tipo,
    habilidades,
    criadoEm: new Date().toLocaleString("pt-BR")
  };

  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);
  salvarUsuarioLogado(novoUsuario);
  alert("Cadastro realizado com sucesso!");
  formCadastro.reset();
  document.querySelectorAll(".input-group").forEach((grupo) => grupo.classList.remove("valid", "invalid"));
  trocarBalao("login");
});

sairConta?.addEventListener("click", () => {
  localStorage.removeItem("favelaTechUsuarioLogado");
  mostrarPerfil();
  alert("Voce saiu da conta.");
});

recuperarSenha?.addEventListener("click", (event) => {
  event.preventDefault();
  const email = campo("email-login");

  if (!validarEmail(email)) return;

  alert("Recuperacao simulada: um e-mail seria enviado para redefinir sua senha.");
});

mostrarPerfil();
