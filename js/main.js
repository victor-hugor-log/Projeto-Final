/*MODAL*/

const modal = document.getElementById("loginModal");
const btn = document.querySelector(".login");
const close = document.querySelector(".close");
const loginBox = document.getElementById("loginBox");
const cadastroBox = document.getElementById("cadastroBox");

// abrir modal
btn.addEventListener("click", (e) => {
  e.preventDefault();

  const modalBox = document.querySelector(".modal-box");
  
  cadastroBox.classList.remove("active");
  loginBox.classList.add("active");

  modalBox.style.height = "200px";

  modal.classList.add("show");
});

// fechar modal
close.addEventListener("click", () => {
  modal.classList.remove("show");
});

// fechar clicando fora
window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.classList.remove("show");
  }
});

// ===== LOGIN =====
const loginBtn = document.querySelector(".login-left button");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const email = document.querySelector(".login-left input[type='email']");
  const senha = document.querySelector(".login-left input[type='password']");

  const emailErro = document.querySelector(".login-left .email-erro");
  const senhaErro = document.querySelector(".login-left .senha-erro");

  // limpar erros
  emailErro.textContent = "";
  senhaErro.textContent = "";

  let erro = false;

  if (email.value === "") {
    emailErro.textContent = "Digite seu email";
    erro = true;
  } else if (!email.value.includes("@")) {
    emailErro.textContent = "Email inválido";
    erro = true;
  }

  if (senha.value === "") {
    senhaErro.textContent = "Digite sua senha";
    erro = true;
  }

  if (!erro) {
    alert("Login enviado!");
  }
});


// ===== CADASTRO =====
const cadastroBtn = document.querySelector(".login-right button");

cadastroBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const nome = document.querySelector(".login-right input[type='text']");
  const email = document.querySelector(".login-right input[type='email']");
  const senha = document.querySelector(".login-right input[type='password']");

const nomeErro = document.querySelector(".login-right .nomeErro");
const emailErro = document.querySelector(".login-right .emailCadastroErro");
const senhaErro = document.querySelector(".login-right .senhaCadastroErro");

  // limpar erros
  nomeErro.textContent = "";
  emailErro.textContent = "";
  senhaErro.textContent = "";

  let erro = false;

  if (nome.value === "") {
    nomeErro.textContent = "Digite seu nome";
    erro = true;
  }

  if (email.value === "") {
    emailErro.textContent = "Digite seu email";
    erro = true;
  } else if (!email.value.includes("@")) {
    emailErro.textContent = "Email inválido";
    erro = true;
  }

  if (senha.value === "") {
    senhaErro.textContent = "Digite sua senha";
    erro = true;
  }

  if (!erro) {
    alert("Cadastro realizado!");
  }
});

/* separando as caixas */

const irCadastro = document.getElementById("irCadastro");
const irLogin = document.getElementById("irLogin");

irCadastro.addEventListener("click", () => {
  loginBox.classList.remove("active");
  cadastroBox.classList.add("active");

  document.querySelector(".modal-box").style.height = "260px";
});

irLogin.addEventListener("click", () => {
  cadastroBox.classList.remove("active");
  loginBox.classList.add("active");

  document.querySelector(".modal-box").style.height = "200px";
});