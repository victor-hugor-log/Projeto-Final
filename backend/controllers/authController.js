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
    criadoEm: usuario.criado_em
  };
}

function selecionarCamposUsuario() {
  return `id, nome, email, telefone, tipo, habilidades, cep, endereco, numero,
    complemento, bairro, cidade, estado, foto_perfil, criado_em`;
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

function validarCadastro({ nome, email, senha, tipo, habilidades }) {
  if (!nome || !email || !senha || !tipo || !habilidades) {
    return "Preencha todos os campos obrigatorios.";
  }

  if (senha.length < 6) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (!TIPOS_PERMITIDOS.has(tipo)) {
    return "Selecione um perfil valido.";
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
      return res.status(409).json({ mensagem: "Este e-mail ja esta cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 12);
    const [resultado] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha, tipo, habilidades)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senhaCriptografada, tipo, habilidades]
    );

    const [usuarios] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}
       FROM usuarios
       WHERE id = ?`,
      [resultado.insertId]
    );

    return res.status(201).json({ usuario: normalizarUsuario(usuarios[0]) });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Este e-mail ja esta cadastrado." });
    }

    console.error("Erro ao cadastrar usuario:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel concluir o cadastro." });
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
      return res.status(401).json({ mensagem: "Conta nao encontrada ou senha incorreta." });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Conta nao encontrada ou senha incorreta." });
    }

    return res.json({ usuario: normalizarUsuario(usuario) });
  } catch (erro) {
    console.error("Erro ao realizar login:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel realizar o login." });
  }
}

async function atualizarPerfil(req, res) {
  const id = Number(req.body.id);
  const nome = String(req.body.nome || "").trim();
  const senhaAtual = String(req.body.senhaAtual || "");
  const novaSenha = String(req.body.novaSenha || "");
  const fotoPerfil = String(req.body.fotoPerfil || "").trim();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(401).json({ mensagem: "Sua sessao expirou. Entre novamente para atualizar o perfil." });
  }

  if (!nome) {
    return res.status(400).json({ mensagem: "Informe seu nome completo para salvar o perfil." });
  }

  if (novaSenha && novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "A nova senha precisa ter pelo menos 6 caracteres." });
  }

  if (!fotoPerfilValida(fotoPerfil)) {
    return res.status(400).json({ mensagem: "Envie uma foto PNG, JPG ou WEBP de ate 1 MB." });
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
      return res.status(404).json({ mensagem: "Usuario nao encontrado." });
    }

    const usuario = usuarios[0];
    const telefone = texto(req.body.telefone ?? usuario.telefone, 20);
    const email = String(req.body.email ?? usuario.email).trim().toLowerCase();
    const alterouEmail = email !== usuario.email;
    const alterouTelefone = telefone !== (usuario.telefone || "");
    const alterouSenha = Boolean(novaSenha);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Informe um e-mail valido." });
    }

    if ((alterouEmail || alterouTelefone || alterouSenha) && !senhaAtual) {
      return res.status(400).json({ mensagem: "Confirme sua senha atual para alterar dados sensiveis." });
    }

    if (senhaAtual) {
      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ mensagem: "A senha atual esta incorreta." });
      }
    }

    if (alterouEmail) {
      const [emailEmUso] = await pool.execute(
        "SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1",
        [email, id]
      );

      if (emailEmUso.length > 0) {
        return res.status(409).json({ mensagem: "Este e-mail ja pertence a outra conta." });
      }
    }

    const senhaCriptografada = novaSenha
      ? await bcrypt.hash(novaSenha, 12)
      : usuario.senha;

    await pool.execute(
      `UPDATE usuarios
       SET nome = ?, telefone = ?, email = ?, senha = ?, cep = ?, endereco = ?,
         numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, foto_perfil = ?
       WHERE id = ?`,
      [
        texto(nome, 100),
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
        fotoPerfil || null,
        id
      ]
    );

    const [usuariosAtualizados] = await pool.execute(
      `SELECT ${selecionarCamposUsuario()}
       FROM usuarios
       WHERE id = ?`,
      [id]
    );

    return res.json({ usuario: normalizarUsuario(usuariosAtualizados[0]) });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Este e-mail ja pertence a outra conta." });
    }

    console.error("Erro ao atualizar perfil:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel atualizar o perfil." });
  }
}

module.exports = {
  cadastrar,
  login,
  atualizarPerfil
};
