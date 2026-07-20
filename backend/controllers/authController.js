const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const { pool } = require("../config/database");

const TIPOS_PERMITIDOS = new Set(["jovem", "empresa"]);

function normalizarUsuario(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone || "",
    tipo: usuario.tipo,
    habilidades: usuario.habilidades,
    cep: usuario.cep || "",
    endereco: usuario.endereco || "",
    numero: usuario.numero || "",
    complemento: usuario.complemento || "",
    bairro: usuario.bairro || "",
    cidade: usuario.cidade || "",
    estado: usuario.estado || "",
    fotoPerfil: usuario.foto_perfil || "",
    emailVerificado: Boolean(usuario.email_verificado),
    criadoEm: usuario.criado_em
  };
}

function selecionarCamposUsuario() {
  return `id, nome, email, telefone, tipo, habilidades, cep, endereco, numero,
    complemento, bairro, cidade, estado, foto_perfil, email_verificado, criado_em`;
}

function texto(valor, limite = 255) {
  return String(valor || "").trim().slice(0, limite);
}

function normalizarCep(valor) {
  const digitos = String(valor || "").replace(/\D/g, "").slice(0, 8);
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

function fotoPerfilValida(fotoPerfil) {
  if (!fotoPerfil) return true;

  return /^data:image\/(png|jpe?g|webp);base64,/i.test(fotoPerfil)
    && fotoPerfil.length <= 1200000;
}

function gerarTokenVerificacao() {
  return crypto.randomBytes(32).toString("hex");
}

function gerarHashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function gerarExpiracaoToken() {
  const data = new Date();
  data.setHours(data.getHours() + 24);
  return data;
}

function gerarCodigoRecuperacao() {
  return String(crypto.randomInt(100000, 1000000));
}

function gerarExpiracaoCodigoRecuperacao() {
  const data = new Date();
  data.setMinutes(data.getMinutes() + 15);
  return data;
}

function deveExibirCodigoLocal() {
  return process.env.NODE_ENV !== "production" && process.env.EXIBIR_CODIGO_RECUPERACAO !== "false";
}

function gerarLinkVerificacao(req, token) {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/verificar-email.html?token=${token}`;
}

function validarCadastro({ nome, email, senha, tipo, habilidades }) {
  if (!nome || !email || !senha || !tipo || !habilidades) {
    return "Preencha todos os campos obrigatórios.";
  }

  if (senha.length < 6) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (!TIPOS_PERMITIDOS.has(tipo)) {
    return "Selecione um perfil válido.";
  }

  return null;
}

async function cadastrar(req, res) {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  const tipo = String(req.body.tipo || "").trim();
  const habilidades = String(req.body.habilidades || "").trim();
  const erroValidacao = validarCadastro({ nome, email, senha, tipo, habilidades });

  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }

  try {
    const [usuariosExistentes] = await pool.execute(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ mensagem: "Este e-mail já está cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 12);
    const tokenVerificacao = gerarTokenVerificacao();
    const tokenHash = gerarHashToken(tokenVerificacao);
    const tokenExpiraEm = gerarExpiracaoToken();
    const [resultado] = await pool.execute(
      `INSERT INTO usuarios (
        nome, email, senha, tipo, habilidades,
        email_verificado, email_token_hash, email_token_expira_em
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [nome, email, senhaCriptografada, tipo, habilidades, tokenHash, tokenExpiraEm]
    );

    const [usuarios] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}
       FROM usuarios
       WHERE id = ?`,
      [resultado.insertId]
    );

    const linkVerificacao = gerarLinkVerificacao(req, tokenVerificacao);
    console.log(`Link de verificação de e-mail (${email}): ${linkVerificacao}`);

    return res.status(201).json({
      usuario: normalizarUsuario(usuarios[0]),
      verificacao: {
        link: linkVerificacao,
        expiraEm: tokenExpiraEm
      }
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Este e-mail já está cadastrado." });
    }

    console.error("Erro ao cadastrar usuário:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível concluir o cadastro." });
  }
}

async function verificarEmail(req, res) {
  const token = String(req.query.token || "").trim();

  if (!token) {
    return res.status(400).json({ mensagem: "Token de verificação ausente." });
  }

  try {
    const tokenHash = gerarHashToken(token);
    const [usuarios] = await pool.execute(
      `SELECT id, email_verificado, email_token_expira_em
       FROM usuarios
       WHERE email_token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Link de verificação inválido." });
    }

    const usuario = usuarios[0];

    if (usuario.email_verificado) {
      return res.json({ mensagem: "E-mail já confirmado." });
    }

    if (usuario.email_token_expira_em && new Date(usuario.email_token_expira_em) < new Date()) {
      return res.status(410).json({ mensagem: "Link de verificação expirado. Solicite um novo link." });
    }

    await pool.execute(
      `UPDATE usuarios
       SET email_verificado = 1,
         email_token_hash = NULL,
         email_token_expira_em = NULL
       WHERE id = ?`,
      [usuario.id]
    );

    return res.json({ mensagem: "E-mail confirmado com sucesso." });
  } catch (erro) {
    console.error("Erro ao verificar e-mail:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível confirmar o e-mail." });
  }
}

async function login(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Informe e-mail e senha." });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}, senha
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: "Conta não encontrada ou senha incorreta." });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Conta não encontrada ou senha incorreta." });
    }

    if (!usuario.email_verificado) {
      return res.status(403).json({
        mensagem: "Confirme seu e-mail antes de entrar. Use o link de verificação para concluir a confirmação."
      });
    }

    return res.json({ usuario: normalizarUsuario(usuario) });
  } catch (erro) {
    console.error("Erro ao realizar login:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível realizar o login." });
  }
}

async function sessao(req, res) {
  if (!req.user) {
    return res.status(401).json({ mensagem: "Nenhuma sessão ativa." });
  }

  return res.json({ usuario: req.user });
}

async function solicitarRecuperacaoSenha(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: "Informe um e-mail válido." });
  }

  try {
    const [usuarios] = await pool.execute(
      "SELECT id, email FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    const respostaPadrao = {
      mensagem: "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
    };

    if (usuarios.length === 0) {
      return res.json(respostaPadrao);
    }

    const codigo = gerarCodigoRecuperacao();
    const codigoHash = gerarHashToken(codigo);
    const codigoExpiraEm = gerarExpiracaoCodigoRecuperacao();

    await pool.execute(
      `UPDATE usuarios
       SET senha_reset_codigo_hash = ?,
         senha_reset_expira_em = ?
       WHERE id = ?`,
      [codigoHash, codigoExpiraEm, usuarios[0].id]
    );

    console.log(`Código de recuperação de senha (${email}): ${codigo}`);

    return res.json({
      ...respostaPadrao,
      recuperacao: deveExibirCodigoLocal()
        ? {
            codigo,
            expiraEm: codigoExpiraEm
          }
        : undefined
    });
  } catch (erro) {
    console.error("Erro ao solicitar recuperação de senha:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível gerar o código de recuperação." });
  }
}

async function redefinirSenha(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const codigo = String(req.body.codigo || "").trim();
  const novaSenha = String(req.body.novaSenha || "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: "Informe um e-mail válido." });
  }

  if (!/^\d{6}$/.test(codigo)) {
    return res.status(400).json({ mensagem: "Informe o código de 6 dígitos." });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "A nova senha precisa ter pelo menos 6 caracteres." });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT id, senha_reset_codigo_hash, senha_reset_expira_em
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ mensagem: "Código inválido ou expirado." });
    }

    const usuario = usuarios[0];
    const codigoHash = gerarHashToken(codigo);
    const codigoExpirado = !usuario.senha_reset_expira_em
      || new Date(usuario.senha_reset_expira_em) < new Date();

    if (!usuario.senha_reset_codigo_hash || usuario.senha_reset_codigo_hash !== codigoHash || codigoExpirado) {
      return res.status(400).json({ mensagem: "Código inválido ou expirado." });
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 12);

    await pool.execute(
      `UPDATE usuarios
       SET senha = ?,
         senha_reset_codigo_hash = NULL,
         senha_reset_expira_em = NULL
       WHERE id = ?`,
      [senhaCriptografada, usuario.id]
    );

    return res.json({ mensagem: "Senha redefinida com sucesso. Você já pode entrar com a nova senha." });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível redefinir a senha." });
  }
}

async function verificarSenhaAtual(req, res) {
  const id = Number(req.body.id);
  const senhaAtual = String(req.body.senhaAtual || "");

  if (!Number.isInteger(id) || id <= 0 || !senhaAtual) {
    return res.status(400).json({ valida: false, mensagem: "Informe sua senha atual." });
  }

  try {
    const [usuarios] = await pool.execute(
      "SELECT senha FROM usuarios WHERE id = ? LIMIT 1",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ valida: false, mensagem: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuarios[0].senha);
    return res.json({
      valida: senhaCorreta,
      mensagem: senhaCorreta ? "Senha confirmada." : "Senha atual incorreta."
    });
  } catch (erro) {
    console.error("Erro ao verificar senha atual:", erro.message);
    return res.status(500).json({ valida: false, mensagem: "Não foi possível validar a senha." });
  }
}

async function atualizarPerfil(req, res) {
  const id = Number(req.body.id);
  const nome = String(req.body.nome || "").trim();
  const senhaAtual = String(req.body.senhaAtual || "");
  const novaSenha = String(req.body.novaSenha || "");
  const fotoPerfil = String(req.body.fotoPerfil || "").trim();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(401).json({ mensagem: "Sua sessão expirou. Entre novamente para atualizar o perfil." });
  }

  if (!nome) {
    return res.status(400).json({ mensagem: "Informe seu nome completo para salvar o perfil." });
  }

  if (novaSenha && novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "A nova senha precisa ter pelo menos 6 caracteres." });
  }

  if (novaSenha && senhaAtual && novaSenha === senhaAtual) {
    return res.status(400).json({ mensagem: "A nova senha precisa ser diferente da senha atual." });
  }

  if (!fotoPerfilValida(fotoPerfil)) {
    return res.status(400).json({ mensagem: "Envie uma foto PNG, JPG ou WEBP de até 1 MB." });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}, senha
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const usuario = usuarios[0];
    const telefone = texto(req.body.telefone ?? usuario.telefone, 20);
    const email = String(req.body.email ?? usuario.email).trim().toLowerCase();
    const habilidades = texto(req.body.habilidades ?? usuario.habilidades, 600);
    const alterouEmail = email !== usuario.email;
    const alterouTelefone = telefone !== (usuario.telefone || "");
    const alterouSenha = Boolean(novaSenha);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Informe um e-mail válido." });
    }

    if ((alterouEmail || alterouTelefone || alterouSenha) && !senhaAtual) {
      return res.status(400).json({ mensagem: "Confirme sua senha atual para alterar dados sensíveis." });
    }

    if (senhaAtual) {
      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ mensagem: "A senha atual está incorreta." });
      }
    }

    if (alterouEmail) {
      const [emailEmUso] = await pool.execute(
        "SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1",
        [email, id]
      );

      if (emailEmUso.length > 0) {
        return res.status(409).json({ mensagem: "Este e-mail já pertence a outra conta." });
      }
    }

    const senhaCriptografada = novaSenha
      ? await bcrypt.hash(novaSenha, 12)
      : usuario.senha;
    const tokenVerificacao = alterouEmail ? gerarTokenVerificacao() : null;
    const tokenHash = tokenVerificacao ? gerarHashToken(tokenVerificacao) : null;
    const tokenExpiraEm = tokenVerificacao ? gerarExpiracaoToken() : null;
    const camposVerificacaoEmail = alterouEmail
      ? `, email_verificado = 0,
         email_token_hash = ?,
         email_token_expira_em = ?`
      : "";
    const parametrosAtualizacao = [
      texto(nome, 100),
      habilidades || null,
      telefone || null,
      email,
      senhaCriptografada,
      normalizarCep(req.body.cep),
      texto(req.body.endereco, 150) || null,
      texto(req.body.numero, 20) || null,
      texto(req.body.complemento, 100) || null,
      texto(req.body.bairro, 100) || null,
      texto(req.body.cidade, 100) || null,
      texto(req.body.estado, 2).toUpperCase() || null,
      fotoPerfil || null
    ];

    if (alterouEmail) {
      parametrosAtualizacao.push(tokenHash, tokenExpiraEm);
    }

    parametrosAtualizacao.push(id);

    await pool.execute(
      `UPDATE usuarios
       SET nome = ?, habilidades = ?, telefone = ?, email = ?, senha = ?, cep = ?, endereco = ?,
         numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, foto_perfil = ?
         ${camposVerificacaoEmail}
       WHERE id = ?`,
      parametrosAtualizacao
    );

    const [usuariosAtualizados] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}
       FROM usuarios
       WHERE id = ?`,
      [id]
    );

    const resposta = { usuario: normalizarUsuario(usuariosAtualizados[0]) };

    if (alterouEmail) {
      const linkVerificacao = gerarLinkVerificacao(req, tokenVerificacao);
      console.log(`Link de verificação de novo e-mail (${email}): ${linkVerificacao}`);
      resposta.verificacao = {
        link: linkVerificacao,
        expiraEm: tokenExpiraEm
      };
    }

    return res.json(resposta);
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Este e-mail já pertence a outra conta." });
    }

    console.error("Erro ao atualizar perfil:", erro.message);
    return res.status(500).json({ mensagem: "Não foi possível atualizar o perfil." });
  }
}

module.exports = {
  cadastrar,
  login,
  sessao,
  verificarSenhaAtual,
  atualizarPerfil,
  verificarEmail,
  solicitarRecuperacaoSenha,
  redefinirSenha
};
