const express = require("express");

const {
  criarCandidatura,
  listarCandidaturasDoUsuario
} = require("../controllers/candidaturasController");

const router = express.Router();

router.post("/", criarCandidatura);
router.get("/usuario/:usuarioId", listarCandidaturasDoUsuario);

module.exports = router;
