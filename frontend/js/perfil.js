const formPerfil = document.getElementById("form-perfil");
const sairPerfil = document.getElementById("perfil-sair");
const usuarioPerfil = JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");

function redirecionarParaLogin() {
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Entre na sua conta para acessar o perfil.",
    titulo: "Acesso necessario",
    tipo: "aviso"
  }));
  window.location.replace("login.html");
}

function obterIniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function preencherPerfil(usuario) {
  document.getElementById("perfil-iniciais").textContent = obterIniciais(usuario.nome);
  document.getElementById("perfil-nome-resumo").textContent = usuario.nome;
  document.getElementById("perfil-email-resumo").textContent = usuario.email;
  document.getElementById("perfil-tipo-resumo").textContent = usuario.tipo === "empresa" ? "Empresa" : "Jovem";
  document.getElementById("perfil-telefone-resumo").textContent = usuario.telefone || "Não informado";
  document.getElementById("perfil-habilidades-resumo").textContent = usuario.habilidades || "Não informado";
  document.getElementById("perfil-nome").value = usuario.nome;
  document.getElementById("perfil-telefone").value = usuario.telefone || "";
  document.getElementById("perfil-email").value = usuario.email;
}

async function enviarAtualizacao(dados) {
  let resposta;

  try {
    resposta = await fetch("/api/auth/perfil", {
      method: "PUT",
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
    throw new Error(resultado.mensagem || "Nao foi possivel atualizar o perfil.");
  }

  return resultado.usuario;
}

if (!usuarioPerfil?.id) {
  redirecionarParaLogin();
} else {
  preencherPerfil(usuarioPerfil);
}

formPerfil?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!formPerfil.reportValidity()) return;

  const novaSenha = document.getElementById("perfil-nova-senha").value;
  const confirmarSenha = document.getElementById("perfil-confirmar-senha").value;

  if (novaSenha !== confirmarSenha) {
    window.mostrarNotificacao("A confirmacao precisa ser igual a nova senha.", {
      titulo: "Confira as senhas",
      tipo: "erro"
    });
    return;
  }

  const botaoSalvar = formPerfil.querySelector('button[type="submit"]');
  botaoSalvar.disabled = true;

  try {
    const usuarioAtualizado = await enviarAtualizacao({
      id: usuarioPerfil.id,
      nome: document.getElementById("perfil-nome").value.trim(),
      telefone: document.getElementById("perfil-telefone").value.trim(),
      email: document.getElementById("perfil-email").value.trim().toLowerCase(),
      senhaAtual: document.getElementById("perfil-senha-atual").value,
      novaSenha
    });

    localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuarioAtualizado));
    sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
      mensagem: "Seus dados foram atualizados com sucesso.",
      titulo: "Perfil atualizado",
      tipo: "sucesso"
    }));
    window.location.reload();
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Nao foi possivel salvar",
      tipo: "erro"
    });
    botaoSalvar.disabled = false;
  }
});

sairPerfil?.addEventListener("click", () => {
  localStorage.removeItem("favelaTechUsuarioLogado");
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Voce saiu da sua conta com seguranca.",
    titulo: "Sessao encerrada",
    tipo: "info"
  }));
  window.location.replace("login.html");
});
