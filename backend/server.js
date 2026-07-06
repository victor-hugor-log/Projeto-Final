require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const { testarConexao } = require("./config/database");
const { garantirEstrutura } = require("./database/setup");
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const candidaturasRoutes = require("./routes/candidaturasRoutes");
const curriculoRoutes = require("./routes/curriculoRoutes");
const vagasRoutes = require("./routes/vagasRoutes");
const alertasRoutes = require("./routes/alertasRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "../frontend");

app.use(cors());
app.use(express.json());
app.use(session({
  name: "favela.tech.sid",
  secret: process.env.SESSION_SECRET || "favela-tech-dev-session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax"
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(frontendPath));

app.get("/auth/google", (req, res, next) => {
  if (!passport.googleConfigurado) {
    return res.redirect("/login.html?google=config");
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"]
  })(req, res, next);
});

app.get("/auth/google/callback", (req, res, next) => {
  if (!passport.googleConfigurado) {
    return res.redirect("/login.html?google=config");
  }

  return passport.authenticate("google", {
    failureRedirect: "/login.html?google=erro"
  })(req, res, next);
}, (req, res) => {
  res.redirect("/login.html?google=sucesso");
});

app.use("/api/auth", authRoutes);
app.use("/api/candidaturas", candidaturasRoutes);
app.use("/api/curriculos", curriculoRoutes);
app.use("/api/vagas", vagasRoutes);
app.use("/api/alertas", alertasRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

async function iniciarServidor() {
  try {
    await testarConexao();
    await garantirEstrutura();
    console.log("Conexao com o MySQL realizada com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error("Não foi possível conectar ao MySQL:", erro.message);
    process.exit(1);
  }
}

iniciarServidor();
