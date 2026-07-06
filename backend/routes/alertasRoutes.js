const express = require("express");

const { enviarAlerta } = require("../controllers/alertasController");

const router = express.Router();

router.post("/", enviarAlerta);

module.exports = router;