const express = require("express");

const {
  obterCurriculo,
  salvarCurriculo
} = require("../controllers/curriculoController");

const router = express.Router();

router.get("/:usuarioId", obterCurriculo);
router.put("/:usuarioId", salvarCurriculo);

module.exports = router;
