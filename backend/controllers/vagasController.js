const { pool } = require("../config/database");

async function listarVagas(req, res) {
  try {
    const [vagas] = await pool.execute(
      `SELECT id, titulo, empresa, localizacao, area, tipo, habilidades, origem, criado_em
       FROM vagas
       ORDER BY criado_em DESC, id DESC`
    );

    return res.json(vagas);
  } catch (erro) {
    console.error("Erro ao listar vagas:", erro.message);
    return res.status(500).json({ mensagem: "Nao foi possivel carregar as vagas." });
  }
}

module.exports = {
  listarVagas
};
