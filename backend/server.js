const express = require("express");
const cors = require("cors");
const vagas = require("./vagas.json");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Favela Tech funcionando!");
});

app.get("/api/vagas", (req, res) => {
  res.json(vagas);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});