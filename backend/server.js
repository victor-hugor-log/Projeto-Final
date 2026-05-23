const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Backend Favela Tech funcionando!");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

app.get("/api/vagas", (req, res) => {
  res.json([
    {
      origem: "LinkedIn",
      titulo: "Desenvolvedor Front-End",
      empresa: "Tech Solutions",
      local: "Belo Horizonte",
      tipo: "Estágio"
    },
    {
      origem: "Indeed",
      titulo: "Suporte Técnico",
      empresa: "HelpDesk Brasil",
      local: "Remoto",
      tipo: "CLT"
    },
    {
      origem: "CIEE",
      titulo: "Jovem Aprendiz em TI",
      empresa: "Empresa Parceira",
      local: "Belo Horizonte",
      tipo: "Aprendiz"
    }
  ]);
});