const formPerfil = document.getElementById("form-perfil");
const sairPerfil = document.getElementById("perfil-sair");
const listaCandidaturas = document.getElementById("perfil-candidaturas-lista");
const inputFoto = document.getElementById("perfil-foto");
const removerFoto = document.getElementById("perfil-foto-remover");
const fotoPreview = document.getElementById("perfil-foto-preview");
const cepInput = document.getElementById("perfil-cep");
const cepStatus = document.getElementById("perfil-cep-status");
const formEmail = document.getElementById("form-email");
const formTelefone = document.getElementById("form-telefone");
const formSenha = document.getElementById("form-senha");
const modalVerificacaoEmail = document.getElementById("modal-verificacao-email");
const linkVerificacaoEmail = document.getElementById("perfil-verificacao-email-link");
const abrirVerificacaoEmail = document.getElementById("perfil-verificacao-email-abrir");
const copiarVerificacaoEmail = document.getElementById("perfil-verificacao-email-copiar");
const senhaAtualInput = document.getElementById("senha-atual-modal");
const senhaNovaInput = document.getElementById("senha-nova-modal");
const senhaConfirmarInput = document.getElementById("senha-confirmar-modal");
const senhaAtualStatus = document.getElementById("senha-atual-status");
const senhaConfirmarStatus = document.getElementById("senha-confirmar-status");
const editorHabilidadesPerfil = window.FavelaTechHabilidades?.criarEditor({
  campoId: "perfil-habilidades",
  inputId: "perfil-habilidade-input",
  listaId: "perfil-habilidades-lista",
  sugestoesId: "perfil-habilidades-sugestoes"
});
let usuarioPerfil = JSON.parse(localStorage.getItem("favelaTechUsuarioLogado") || "null");
let fotoPerfilAtual = usuarioPerfil?.fotoPerfil || "";
let temporizadorCep;
let temporizadorSenhaAtual;
let requisicaoSenhaAtual = 0;

function redirecionarParaLogin() {
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Entre na sua conta para acessar o perfil.",
    titulo: "Acesso necessário",
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

function montarEnderecoResumo(usuario) {
  const partes = [
    usuario.endereco,
    usuario.numero,
    usuario.bairro,
    usuario.cidade,
    usuario.estado
  ].filter(Boolean);

  return partes.length ? partes.join(", ") : "Não informado";
}

function preencherCampo(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.value = valor || "";
}

function preencherTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor || "";
}

function formatarRotuloVaga(valor) {
  const rotulos = {
    Administracao: "Administração",
    Estagio: "Estágio"
  };

  return rotulos[valor] || valor;
}

function preencherPerfil(usuario) {
  const iniciais = document.getElementById("perfil-iniciais");

  fotoPerfilAtual = usuario.fotoPerfil || "";
  iniciais.textContent = obterIniciais(usuario.nome);
  iniciais.hidden = Boolean(fotoPerfilAtual);
  fotoPreview.hidden = !fotoPerfilAtual;
  removerFoto.hidden = !fotoPerfilAtual;

  if (fotoPerfilAtual) {
    fotoPreview.src = fotoPerfilAtual;
  } else {
    fotoPreview.removeAttribute("src");
  }

  preencherTexto("perfil-nome-resumo", usuario.nome);
  preencherTexto("perfil-email-resumo", mascararEmail(usuario.email));
  preencherTexto("perfil-tipo-resumo", usuario.tipo === "empresa" ? "Empresa" : "Jovem");
  preencherTexto("perfil-telefone-resumo", mascararTelefone(usuario.telefone));
  preencherTexto("perfil-endereco-resumo", montarEnderecoResumo(usuario));
  preencherTexto("perfil-habilidades-resumo", usuario.habilidades || "Não informado");
  preencherTexto("perfil-email-mascarado", mascararEmail(usuario.email));
  preencherTexto("perfil-telefone-mascarado", mascararTelefone(usuario.telefone));

  preencherCampo("perfil-nome", usuario.nome);
  preencherCampo("perfil-cep", usuario.cep);
  preencherCampo("perfil-endereco", usuario.endereco);
  preencherCampo("perfil-numero", usuario.numero);
  preencherCampo("perfil-complemento", usuario.complemento);
  preencherCampo("perfil-bairro", usuario.bairro);
  preencherCampo("perfil-cidade", usuario.cidade);
  preencherCampo("perfil-estado", usuario.estado);
  preencherCampo("perfil-habilidades", usuario.habilidades);
  preencherCampo("email-novo", usuario.email);
  preencherCampo("telefone-novo", usuario.telefone);
  editorHabilidadesPerfil?.setSelecionadas(usuario.habilidades);
}

function dadosPerfilBase() {
  return {
    id: usuarioPerfil.id,
    nome: document.getElementById("perfil-nome").value.trim(),
    email: usuarioPerfil.email,
    telefone: usuarioPerfil.telefone || "",
    cep: document.getElementById("perfil-cep").value.trim(),
    endereco: document.getElementById("perfil-endereco").value.trim(),
    numero: document.getElementById("perfil-numero").value.trim(),
    complemento: document.getElementById("perfil-complemento").value.trim(),
    bairro: document.getElementById("perfil-bairro").value.trim(),
    cidade: document.getElementById("perfil-cidade").value.trim(),
    estado: document.getElementById("perfil-estado").value.trim().toUpperCase(),
    habilidades: editorHabilidadesPerfil?.serializar() || document.getElementById("perfil-habilidades").value.trim(),
    fotoPerfil: fotoPerfilAtual
  };
}

function validarPerfil() {
  const nome = document.getElementById("perfil-nome");
  const cep = document.getElementById("perfil-cep").value.replace(/\D/g, "");
  const estado = document.getElementById("perfil-estado").value.trim();

  if (!nome.value.trim()) {
    nome.focus();
    window.mostrarNotificacao("Informe seu nome completo para salvar o perfil.", {
      titulo: "Confira os dados",
      tipo: "aviso"
    });
    return false;
  }

  if (cep && cep.length !== 8) {
    cepInput.focus();
    window.mostrarNotificacao("Confira o CEP. Ele precisa ter 8 números.", {
      titulo: "CEP incompleto",
      tipo: "aviso"
    });
    return false;
  }

  if (estado && estado.length !== 2) {
    document.getElementById("perfil-estado").focus();
    window.mostrarNotificacao("Use a sigla do estado com 2 letras, por exemplo MG.", {
      titulo: "Estado",
      tipo: "aviso"
    });
    return false;
  }

  return true;
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
    throw new Error("Serviço temporariamente indisponível. Tente novamente em instantes.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Não foi possível atualizar o perfil.");
  }

  return resultado;
}

async function verificarSenhaAtualNoBackend(senhaAtual) {
  let resposta;

  try {
    resposta = await fetch("/api/auth/verificar-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: usuarioPerfil.id,
        senhaAtual
      })
    });
  } catch {
    throw new Error("Não foi possível validar sua senha agora.");
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Não foi possível validar sua senha.");
  }

  return resultado;
}

function salvarUsuarioAtualizado(usuario, mensagem) {
  usuarioPerfil = usuario;
  localStorage.setItem("favelaTechUsuarioLogado", JSON.stringify(usuario));
  preencherPerfil(usuario);
  window.mostrarNotificacao(mensagem, {
    titulo: "Perfil atualizado",
    tipo: "sucesso"
  });
}

function definirEstadoCandidaturas(mensagem) {
  if (!listaCandidaturas) return;

  const estado = document.createElement("p");
  estado.className = "perfil-candidaturas-estado";
  estado.textContent = mensagem;
  listaCandidaturas.replaceChildren(estado);
}

function formatarData(data) {
  const dataCandidatura = new Date(data);

  if (Number.isNaN(dataCandidatura.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(dataCandidatura);
}

function criarMeta(texto) {
  const meta = document.createElement("span");
  meta.textContent = texto;
  return meta;
}

function renderizarCandidaturas(candidaturas) {
  if (!listaCandidaturas) return;

  if (!candidaturas.length) {
    definirEstadoCandidaturas("Você ainda não se candidatou a nenhuma vaga. Abra a aba de vagas e escolha uma oportunidade.");
    return;
  }

  const fragmento = document.createDocumentFragment();

  candidaturas.forEach((candidatura) => {
    const vaga = candidatura.vaga || {};
    const card = document.createElement("article");
    card.className = "perfil-candidatura-card";

    const conteudo = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = vaga.titulo || "Vaga não informada";

    const empresa = document.createElement("p");
    const empresaRotulo = document.createElement("strong");
    empresaRotulo.textContent = "Empresa: ";
    empresa.append(empresaRotulo, document.createTextNode(vaga.empresa || "Não informada"));

    const meta = document.createElement("div");
    meta.className = "perfil-candidatura-meta";
    meta.append(
      criarMeta(`Data: ${formatarData(candidatura.criadoEm)}`),
      criarMeta(`Tipo: ${formatarRotuloVaga(vaga.tipo) || "Não informado"}`)
    );

    if (vaga.localizacao) {
      meta.appendChild(criarMeta(vaga.localizacao));
    }

    const status = document.createElement("span");
    status.className = "perfil-candidatura-status";
    status.textContent = candidatura.status || "Enviada";

    conteudo.append(titulo, empresa, meta);
    card.append(conteudo, status);
    fragmento.appendChild(card);
  });

  listaCandidaturas.replaceChildren(fragmento);
}

async function carregarCandidaturas(usuarioId) {
  definirEstadoCandidaturas("Carregando candidaturas...");

  let resposta;

  try {
    resposta = await fetch(`/api/candidaturas/usuario/${usuarioId}`);
  } catch {
    definirEstadoCandidaturas("Não foi possível carregar suas candidaturas no momento.");
    return;
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    definirEstadoCandidaturas(resultado.mensagem || "Não foi possível carregar suas candidaturas.");
    return;
  }

  renderizarCandidaturas(resultado.candidaturas || []);
}

function abrirModal(nome) {
  const modal = document.getElementById(`modal-${nome}`);
  if (!modal) return;

  modal.hidden = false;
  modal.querySelector("input")?.focus();
}

function abrirModalVerificacaoEmail(link) {
  if (!modalVerificacaoEmail || !linkVerificacaoEmail || !abrirVerificacaoEmail || !link) return;

  linkVerificacaoEmail.href = link;
  linkVerificacaoEmail.textContent = link;
  abrirVerificacaoEmail.href = link;
  modalVerificacaoEmail.hidden = false;
  linkVerificacaoEmail.focus();
}

function atualizarEstadoCampo(input, estado, mensagem = "") {
  const grupo = input?.closest(".perfil-campo");
  const status = grupo?.querySelector("small");

  if (!grupo) return;

  grupo.classList.remove("valido", "invalido");

  if (estado) {
    grupo.classList.add(estado);
  }

  if (status) {
    status.textContent = mensagem;
  }
}

function validarConfirmacaoSenha() {
  if (!senhaNovaInput || !senhaConfirmarInput) return true;

  const senhaAtual = senhaAtualInput?.value || "";
  const novaSenha = senhaNovaInput.value;
  const confirmarSenha = senhaConfirmarInput.value;

  atualizarEstadoCampo(senhaNovaInput, "");
  atualizarEstadoCampo(senhaConfirmarInput, "");

  if (!novaSenha && !confirmarSenha) {
    if (senhaConfirmarStatus) senhaConfirmarStatus.textContent = "";
    return false;
  }

  if (novaSenha && novaSenha.length < 6) {
    atualizarEstadoCampo(senhaNovaInput, "invalido");
    if (senhaConfirmarStatus) senhaConfirmarStatus.textContent = "A nova senha precisa ter pelo menos 6 caracteres.";
    return false;
  }

  if (senhaAtual && novaSenha && senhaAtual === novaSenha) {
    atualizarEstadoCampo(senhaNovaInput, "invalido");
    atualizarEstadoCampo(senhaConfirmarInput, "invalido", "A nova senha precisa ser diferente da atual.");
    return false;
  }

  if (!confirmarSenha) {
    if (senhaConfirmarStatus) senhaConfirmarStatus.textContent = "";
    return false;
  }

  if (novaSenha !== confirmarSenha) {
    atualizarEstadoCampo(senhaConfirmarInput, "invalido", "As senhas ainda não conferem.");
    return false;
  }

  atualizarEstadoCampo(senhaNovaInput, "valido");
  atualizarEstadoCampo(senhaConfirmarInput, "valido", "As senhas conferem.");
  return true;
}

function validarSenhaAtualDigitada() {
  if (!senhaAtualInput) return;

  const senhaAtual = senhaAtualInput.value;
  requisicaoSenhaAtual += 1;
  const requisicaoAtual = requisicaoSenhaAtual;
  clearTimeout(temporizadorSenhaAtual);

  if (!senhaAtual) {
    atualizarEstadoCampo(senhaAtualInput, "");
    validarConfirmacaoSenha();
    return;
  }

  if (senhaAtual.length < 6) {
    atualizarEstadoCampo(senhaAtualInput, "invalido", "Digite pelo menos 6 caracteres.");
    validarConfirmacaoSenha();
    return;
  }

  atualizarEstadoCampo(senhaAtualInput, "", "Conferindo senha...");

  temporizadorSenhaAtual = setTimeout(async () => {
    try {
      const resultado = await verificarSenhaAtualNoBackend(senhaAtual);
      if (requisicaoAtual !== requisicaoSenhaAtual) return;

      atualizarEstadoCampo(
        senhaAtualInput,
        resultado.valida ? "valido" : "invalido",
        resultado.mensagem
      );
    } catch (erro) {
      if (requisicaoAtual !== requisicaoSenhaAtual) return;
      atualizarEstadoCampo(senhaAtualInput, "invalido", erro.message);
    }
  }, 450);

  validarConfirmacaoSenha();
}

function fecharModal(modal) {
  modal.hidden = true;
  modal.querySelector("form")?.reset();
  clearTimeout(temporizadorSenhaAtual);
  requisicaoSenhaAtual += 1;
  preencherCampo("email-novo", usuarioPerfil.email);
  preencherCampo("telefone-novo", usuarioPerfil.telefone);
  atualizarEstadoCampo(senhaAtualInput, "");
  atualizarEstadoCampo(senhaNovaInput, "");
  atualizarEstadoCampo(senhaConfirmarInput, "");
}

document.querySelectorAll("[data-abrir-modal]").forEach((botao) => {
  botao.addEventListener("click", () => abrirModal(botao.dataset.abrirModal));
});

document.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
  botao.addEventListener("click", () => fecharModal(botao.closest(".perfil-modal")));
});

document.querySelectorAll(".perfil-modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) fecharModal(modal);
  });
});

copiarVerificacaoEmail?.addEventListener("click", async () => {
  const link = linkVerificacaoEmail?.href;
  if (!link) return;

  await navigator.clipboard.writeText(link);
  window.mostrarNotificacao("Link de verificação copiado.", {
    titulo: "Verificação de e-mail",
    tipo: "sucesso"
  });
});

senhaAtualInput?.addEventListener("input", validarSenhaAtualDigitada);
senhaNovaInput?.addEventListener("input", validarConfirmacaoSenha);
senhaConfirmarInput?.addEventListener("input", validarConfirmacaoSenha);

inputFoto?.addEventListener("change", () => {
  const arquivo = inputFoto.files?.[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/")) {
    window.mostrarNotificacao("Escolha uma imagem PNG, JPG ou WEBP.", {
      titulo: "Foto inválida",
      tipo: "erro"
    });
    inputFoto.value = "";
    return;
  }

  if (arquivo.size > 900000) {
    window.mostrarNotificacao("Escolha uma imagem de até 900 KB.", {
      titulo: "Foto muito grande",
      tipo: "erro"
    });
    inputFoto.value = "";
    return;
  }

  const leitor = new FileReader();
  leitor.addEventListener("load", () => {
    fotoPerfilAtual = String(leitor.result || "");
    fotoPreview.src = fotoPerfilAtual;
    fotoPreview.hidden = false;
    document.getElementById("perfil-iniciais").hidden = true;
    removerFoto.hidden = false;
  });
  leitor.readAsDataURL(arquivo);
});

removerFoto?.addEventListener("click", async () => {
  if (!fotoPerfilAtual) return;

  const fotoAnterior = fotoPerfilAtual;
  fotoPerfilAtual = "";
  inputFoto.value = "";
  fotoPreview.hidden = true;
  fotoPreview.removeAttribute("src");
  document.getElementById("perfil-iniciais").hidden = false;
  removerFoto.disabled = true;

  try {
    const resultado = await enviarAtualizacao(dadosPerfilBase());
    salvarUsuarioAtualizado(resultado.usuario, "Sua foto foi removida.");
  } catch (erro) {
    fotoPerfilAtual = fotoAnterior;
    fotoPreview.src = fotoPerfilAtual;
    fotoPreview.hidden = false;
    document.getElementById("perfil-iniciais").hidden = true;
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível remover",
      tipo: "erro"
    });
  } finally {
    removerFoto.disabled = false;
  }
});

function formatarCep(valor) {
  const digitos = String(valor || "").replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

async function buscarCep() {
  const cep = cepInput.value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  cepStatus.textContent = "Buscando CEP...";

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const endereco = await resposta.json();

    if (!resposta.ok || endereco.erro) {
      throw new Error("CEP não encontrado.");
    }

    preencherCampo("perfil-endereco", endereco.logradouro);
    preencherCampo("perfil-bairro", endereco.bairro);
    preencherCampo("perfil-cidade", endereco.localidade);
    preencherCampo("perfil-estado", endereco.uf);
    cepStatus.textContent = "CEP preenchido automaticamente.";
  } catch (erro) {
    cepStatus.textContent = "";
    window.mostrarNotificacao(erro.message || "Não foi possível buscar o CEP.", {
      titulo: "CEP",
      tipo: "aviso"
    });
  }
}

cepInput?.addEventListener("input", () => {
  cepInput.value = formatarCep(cepInput.value);
  cepStatus.textContent = "";
  clearTimeout(temporizadorCep);

  if (cepInput.value.replace(/\D/g, "").length === 8) {
    temporizadorCep = setTimeout(buscarCep, 450);
  }
});

if (!usuarioPerfil?.id) {
  redirecionarParaLogin();
} else {
  preencherPerfil(usuarioPerfil);
  carregarCandidaturas(usuarioPerfil.id);
}

formPerfil?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validarPerfil()) return;

  const botaoSalvar = formPerfil.querySelector('button[type="submit"]');
  botaoSalvar.disabled = true;

  try {
    const resultado = await enviarAtualizacao(dadosPerfilBase());
    salvarUsuarioAtualizado(resultado.usuario, "Seus dados foram atualizados com sucesso.");
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível salvar",
      tipo: "erro"
    });
  } finally {
    botaoSalvar.disabled = false;
  }
});

formEmail?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const modal = formEmail.closest(".perfil-modal");
  const novoEmail = document.getElementById("email-novo").value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
    window.mostrarNotificacao("Informe um e-mail válido para continuar.", {
      titulo: "E-mail inválido",
      tipo: "aviso"
    });
    document.getElementById("email-novo").focus();
    return;
  }

  if (novoEmail === usuarioPerfil.email) {
    window.mostrarNotificacao("Digite um e-mail diferente do atual.", {
      titulo: "Nada para alterar",
      tipo: "aviso"
    });
    document.getElementById("email-novo").focus();
    return;
  }

  try {
    const resultado = await enviarAtualizacao({
      ...dadosPerfilBase(),
      email: novoEmail,
      senhaAtual: document.getElementById("email-senha-atual").value
    });
    fecharModal(modal);
    salvarUsuarioAtualizado(resultado.usuario, "Seu e-mail foi atualizado. Confirme o novo endereço antes do próximo login.");
    abrirModalVerificacaoEmail(resultado.verificacao?.link);
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível alterar",
      tipo: "erro"
    });
  }
});

formTelefone?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const modal = formTelefone.closest(".perfil-modal");

  try {
    const resultado = await enviarAtualizacao({
      ...dadosPerfilBase(),
      telefone: document.getElementById("telefone-novo").value.trim(),
      senhaAtual: document.getElementById("telefone-senha-atual").value
    });
    salvarUsuarioAtualizado(resultado.usuario, "Seu telefone foi atualizado.");
    fecharModal(modal);
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível alterar",
      tipo: "erro"
    });
  }
});

formSenha?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const senhaAtual = senhaAtualInput.value;
  const novaSenha = senhaNovaInput.value;
  const confirmarSenha = senhaConfirmarInput.value;
  const modal = formSenha.closest(".perfil-modal");

  if (!senhaAtual) {
    atualizarEstadoCampo(senhaAtualInput, "invalido", "Informe sua senha atual.");
    senhaAtualInput.focus();
    return;
  }

  if (novaSenha === senhaAtual) {
    atualizarEstadoCampo(senhaNovaInput, "invalido");
    atualizarEstadoCampo(senhaConfirmarInput, "invalido", "A nova senha precisa ser diferente da atual.");
    senhaNovaInput.focus();
    return;
  }

  if (novaSenha !== confirmarSenha) {
    atualizarEstadoCampo(senhaConfirmarInput, "invalido", "As senhas ainda não conferem.");
    window.mostrarNotificacao("A confirmação precisa ser igual à nova senha.", {
      titulo: "Confira as senhas",
      tipo: "erro"
    });
    return;
  }

  if (!validarConfirmacaoSenha()) {
    window.mostrarNotificacao("Confira os campos de senha antes de salvar.", {
      titulo: "Senha",
      tipo: "aviso"
    });
    return;
  }

  try {
    const resultado = await enviarAtualizacao({
      ...dadosPerfilBase(),
      senhaAtual,
      novaSenha
    });
    salvarUsuarioAtualizado(resultado.usuario, "Sua senha foi atualizada.");
    fecharModal(modal);
  } catch (erro) {
    window.mostrarNotificacao(erro.message, {
      titulo: "Não foi possível alterar",
      tipo: "erro"
    });
  }
});

sairPerfil?.addEventListener("click", () => {
  localStorage.removeItem("favelaTechUsuarioLogado");
  sessionStorage.setItem("favelaTechNotificacaoPendente", JSON.stringify({
    mensagem: "Você saiu da sua conta com segurança.",
    titulo: "Sessão encerrada",
    tipo: "info"
  }));
  window.location.replace("login.html");
});
