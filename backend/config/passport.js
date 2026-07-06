const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const bcrypt = require("bcryptjs");

const { pool } = require("./database");

function selecionarCamposUsuario() {
  return `id, nome, email, telefone, tipo, habilidades, cep, endereco, numero,
    complemento, bairro, cidade, estado, foto_perfil, email_verificado, criado_em`;
}

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

async function buscarUsuarioPorId(id) {
  const [usuarios] = await pool.execute(
    `SELECT ${selecionarCamposUsuario()}
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return usuarios[0] || null;
}

async function buscarOuCriarUsuarioGoogle(profile) {
  const email = String(profile.emails?.[0]?.value || "").trim().toLowerCase();
  const nome = String(profile.displayName || profile.name?.givenName || "Usuário Favela Tech").trim();

  if (!email) {
    throw new Error("A conta Google não retornou um e-mail.");
  }

  const [usuarios] = await pool.execute(
    `SELECT ${selecionarCamposUsuario()}
     FROM usuarios
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (usuarios.length > 0) {
    const usuario = usuarios[0];

    if (!usuario.email_verificado) {
      await pool.execute(
        `UPDATE usuarios
         SET email_verificado = 1,
           email_token_hash = NULL,
           email_token_expira_em = NULL
         WHERE id = ?`,
        [usuario.id]
      );
    }

    return normalizarUsuario({ ...usuario, email_verificado: 1 });
  }

  const senhaAleatoria = await bcrypt.hash(`google-${profile.id}-${Date.now()}`, 12);
  const [resultado] = await pool.execute(
    `INSERT INTO usuarios (
      nome, email, senha, tipo, habilidades, email_verificado
    ) VALUES (?, ?, ?, ?, ?, 1)`,
    [nome, email, senhaAleatoria, "jovem", null]
  );

  const usuario = await buscarUsuarioPorId(resultado.insertId);
  return normalizarUsuario(usuario);
}

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await buscarUsuarioPorId(id);
    done(null, usuario ? normalizarUsuario(usuario) : false);
  } catch (erro) {
    done(erro);
  }
});

passport.googleConfigurado = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (passport.googleConfigurado) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const usuario = await buscarOuCriarUsuarioGoogle(profile);
          return done(null, usuario);
        } catch (erro) {
          return done(erro);
        }
      }
    )
  );
} else {
  console.warn("Login com Google desativado: configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.");
}

module.exports = passport;
