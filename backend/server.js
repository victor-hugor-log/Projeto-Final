const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const path = require("path");

const { testarConexao } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const vagasRoutes = require("./routes/vagasRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "../frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.use("/api/auth", authRoutes);
app.use("/api/vagas", vagasRoutes);
=======
const vagas = require("./vagas.json");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
>>>>>>> 6b6ab4cf3cf09d876a835cc6f34d832492c1f351

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

<<<<<<< HEAD
async function iniciarServidor() {
  try {
    await testarConexao();
    console.log("Conexao com o MySQL realizada com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error("Nao foi possivel conectar ao MySQL:", erro.message);
    process.exit(1);
  }
}

iniciarServidor();
=======
app.get("/api/vagas", (req, res) => {
  res.json(vagas);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
>>>>>>> 6b6ab4cf3cf09d876a835cc6f34d832492c1f351
