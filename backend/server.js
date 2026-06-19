const express = require("express");
const cors = require("cors");
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

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

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
