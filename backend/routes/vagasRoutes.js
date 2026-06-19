const express = require("express");
const { listarVagas } = require("../controllers/vagasController");

const router = express.Router();

router.get("/", listarVagas);

module.exports = router;
