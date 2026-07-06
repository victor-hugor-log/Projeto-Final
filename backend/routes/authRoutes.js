const express = require("express");

const {
  cadastrar,
  login,
  sessao,
  verificarSenhaAtual,
  atualizarPerfil,
  verificarEmail,
  solicitarRecuperacaoSenha,
  redefinirSenha
} = require("../controllers/authController");

const router = express.Router();

router.post("/cadastro", cadastrar);
router.post("/login", login);
router.get("/sessao", sessao);
router.post("/verificar-senha", verificarSenhaAtual);
router.post("/recuperar-senha", solicitarRecuperacaoSenha);
router.post("/redefinir-senha", redefinirSenha);
router.put("/perfil", atualizarPerfil);
router.get("/verificar-email", verificarEmail);

module.exports = router;
