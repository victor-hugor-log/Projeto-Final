const formCurriculo = document.getElementById("form-curriculo");
const progressoValor = document.getElementById("progresso-valor");
const progressoBarra = document.getElementById("progresso-barra");
const progressoStatus = document.getElementById("progresso-status");
const resumoProfissional = document.getElementById("resumo-profissional");
const contadorResumo = document.getElementById("contador-resumo");
const previewCurriculo = document.getElementById("curriculo-preview");
const limparCurriculo = document.getElementById("limpar-curriculo");
const usuarioCurriculo = JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");

function preencherUsuarioLogado() {
  if (!usuarioCurriculo) return;

  const nome = document.getElementById("curriculo-nome");
  const email = document.getElementById("curriculo-email");

  nome.value = usuarioCurriculo.nome || "";
  email.value = usuarioCurriculo.email || "";
}

function redirecionarParaLogin() {
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Entre na sua conta para cadastrar o currículo.",
    titulo: "Acesso necessário",
    tipo: "aviso"
  }));
  window.location.replace("login.html");
}

function preencherFormulario(curriculo) {
  Object.entries(curriculo).forEach(([campo, valor]) => {
    const controle = formCurriculo.elements.namedItem(campo);
    if (controle) controle.value = valor || "";
  });
}

async function acessarCurriculo(metodo, dados) {
  let resposta;

  try {
    resposta = await fetch(`/api/curriculos/${usuarioCurriculo.id}`, {
      method: metodo,
      headers: metodo === "PUT" ? { "Content-Type": "application/json" } : undefined,
      body: metodo === "PUT" ? JSON.stringify(dados) : undefined
    });
  } catch {
    throw new Error("Servidor indisponível. Inicie o backend e o MySQL.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Não foi possível acessar o currículo.");
  }

  return resultado.curriculo;
}

function atualizarProgresso() {
  const obrigatorios = [...formCurriculo.querySelectorAll("[required]")];
  const preenchidos = obrigatorios.filter((campo) => campo.value.trim()).length;
  const percentual = Math.round((preenchidos / obrigatorios.length) * 100);

  progressoValor.textContent = `${percentual}%`;
  progressoBarra.style.width = `${percentual}%`;

  if (percentual === 100) {
    progressoStatus.textContent = "Tudo pronto para visualizar seu currículo.";
  } else if (percentual >= 50) {
    progressoStatus.textContent = "Boa! Falta pouco para concluir.";
  } else {
    progressoStatus.textContent = "Preencha os campos obrigatórios para avançar.";
  }
}

function atualizarContadorResumo() {
  contadorResumo.textContent = `${resumoProfissional.value.length}/400 caracteres`;
}

function definirTexto(id, valor, textoPadrao) {
  document.getElementById(id).textContent = valor || textoPadrao;
}

function montarPreview(dados) {
  definirTexto("preview-nome", dados.get("nome"), "Nome completo");
  definirTexto("preview-cargo", dados.get("cargo"), "Cargo desejado");
  definirTexto("preview-email", dados.get("email"), "E-mail");
  definirTexto("preview-telefone", dados.get("telefone"), "Telefone");
  definirTexto("preview-cidade", dados.get("cidade"), "Cidade");
  definirTexto("preview-resumo", dados.get("resumo"), "Resumo profissional.");

  const formacao = [dados.get("escolaridade"), dados.get("curso"), dados.get("instituicao")]
    .filter(Boolean)
    .join(" - ");
  definirTexto("preview-formacao", formacao, "Formação não informada.");

  const experiencia = [dados.get("funcao"), dados.get("empresa"), dados.get("atividades")]
    .filter(Boolean)
    .join(" - ");
  definirTexto("preview-experiencia", experiencia, "Experiência não informada.");
  definirTexto("preview-habilidades", dados.get("habilidades"), "Habilidades não informadas.");
}

formCurriculo.addEventListener("input", () => {
  atualizarProgresso();
  atualizarContadorResumo();
});

formCurriculo.addEventListener("change", atualizarProgresso);

formCurriculo.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!formCurriculo.reportValidity()) return;

  const botaoSalvar = formCurriculo.querySelector('button[type="submit"]');
  const textoOriginal = botaoSalvar.textContent;
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";

  try {
    const dados = Object.fromEntries(new FormData(formCurriculo));
    const curriculo = await acessarCurriculo("PUT", dados);
    preencherFormulario(curriculo);
    montarPreview(new FormData(formCurriculo));
    previewCurriculo.hidden = false;
    previewCurriculo.scrollIntoView({ behavior: "smooth", block: "start" });
    window.mostrarNotificacao("Seu currículo foi salvo no MySQL.", {
      titulo: "Currículo atualizado",
      tipo: "sucesso"
    });
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível salvar",
      tipo: "erro"
    });
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = textoOriginal;
  }
});

limparCurriculo.addEventListener("click", () => {
  formCurriculo.reset();
  previewCurriculo.hidden = true;
  preencherUsuarioLogado();
  atualizarProgresso();
  atualizarContadorResumo();
});

async function iniciarCurriculo() {
  if (!usuarioCurriculo?.id) {
    redirecionarParaLogin();
    return;
  }

  preencherUsuarioLogado();
  atualizarProgresso();
  atualizarContadorResumo();

  try {
    const curriculo = await acessarCurriculo("GET");
    if (!curriculo) return;

    preencherFormulario(curriculo);
    montarPreview(new FormData(formCurriculo));
    previewCurriculo.hidden = false;
    atualizarProgresso();
    atualizarContadorResumo();
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível carregar",
      tipo: "erro"
    });
  }
}

iniciarCurriculo();
