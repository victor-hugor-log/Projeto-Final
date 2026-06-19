const vagas = require("../database/vagas.json");

function listarVagas(req, res) {
  res.json(vagas);
}

module.exports = {
  listarVagas
};
