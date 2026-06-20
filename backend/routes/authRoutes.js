const express = require("express");

const { cadastrar, login, atualizarPerfil } = require("../controllers/authController");

const router = express.Router();

router.post("/cadastro", cadastrar);
router.post("/login", login);
router.put("/perfil", atualizarPerfil);

module.exports = router;
