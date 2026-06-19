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
    throw new Error("Servidor indisponivel. Inicie o backend e o MySQL.");
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
    const { usuario } = await enviarAutenticacao("cadastro", {
      nome,
      email,
      senha,
      tipo,
      habilidades
    });

    salvarUsuarioLogado(usuario);
    alert("Cadastro realizado com sucesso!");
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
