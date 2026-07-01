const cardVerificacao = document.getElementById("verificacao-card");
const tituloVerificacao = document.getElementById("verificacao-titulo");
const textoVerificacao = document.getElementById("verificacao-texto");
const acaoVerificacao = document.getElementById("verificacao-acao");

function atualizarTela(tipo, titulo, texto) {
  cardVerificacao.classList.add(tipo);
  tituloVerificacao.textContent = titulo;
  textoVerificacao.textContent = texto;
  acaoVerificacao.hidden = false;
}

async function verificarEmail() {
  const parametros = new URLSearchParams(window.location.search);
  const token = parametros.get("token");

  if (!token) {
    atualizarTela(
      "erro",
      "Link incompleto",
      "Não encontramos o token de verificação. Volte ao cadastro e gere um novo link."
    );
    return;
  }

  try {
    const resposta = await fetch(`/api/auth/verificar-email?token=${encodeURIComponent(token)}`);
    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || "Não foi possível confirmar o e-mail.");
    }

    const usuario = JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");
    if (usuario) {
      usuario.emailVerificado = true;
      localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuario));
    }

    atualizarTela(
      "sucesso",
      "E-mail confirmado!",
      resultado.mensagem || "Seu cadastro foi confirmado com sucesso. Agora você já pode seguir usando sua conta."
    );
  } catch (erro) {
    atualizarTela(
      "erro",
      "Não foi possível confirmar",
      erro.message
    );
  }
}

verificarEmail();
