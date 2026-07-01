const express = require("express");

const { cadastrar, login, atualizarPerfil, verificarEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/cadastro", cadastrar);
router.post("/login", login);
router.put("/perfil", atualizarPerfil);
router.get("/verificar-email", verificarEmail);

module.exports = router;
