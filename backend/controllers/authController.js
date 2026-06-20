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
    criadoEm: usuario.criado_em
  };
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
      `SELECT id, nome, email, telefone, tipo, habilidades, criado_em
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
      `SELECT id, nome, email, telefone, senha, tipo, habilidades, criado_em
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
  const telefone = String(req.body.telefone || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senhaAtual = String(req.body.senhaAtual || "");
  const novaSenha = String(req.body.novaSenha || "");

  if (!Number.isInteger(id) || id <= 0 || !nome || !email || !senhaAtual) {
    return res.status(400).json({ mensagem: "Preencha os campos obrigatorios." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: "Informe um e-mail valido." });
  }

  if (novaSenha && novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "A nova senha precisa ter pelo menos 6 caracteres." });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nome, email, telefone, senha, tipo, habilidades, criado_em
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuario nao encontrado." });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "A senha atual esta incorreta." });
    }

    if (email !== usuario.email) {
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
       SET nome = ?, telefone = ?, email = ?, senha = ?
       WHERE id = ?`,
      [nome, telefone || null, email, senhaCriptografada, id]
    );

    const [usuariosAtualizados] = await pool.execute(
      `SELECT id, nome, email, telefone, tipo, habilidades, criado_em
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
