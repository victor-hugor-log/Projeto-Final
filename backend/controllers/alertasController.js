function texto(valor, limite = 255) {
  return String(valor || "").trim().slice(0, limite);
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function enviarAlerta(req, res) {
  const email = texto(req.body.email, 120).toLowerCase();
  const tipo = texto(req.body.tipo, 60);
  const detalhes = texto(req.body.detalhes, 500);

  if (!emailValido(email)) {
    return res.status(400).json({
      mensagem: "Informe um e-mail válido para o alerta."
    });
  }

  if (!tipo) {
    return res.status(400).json({
      mensagem: "Informe o tipo do alerta."
    });
  }

  console.log(`[ALERTA E-MAIL] ${tipo} -> ${email}${detalhes ? ` | ${detalhes}` : ""}`);

  return res.status(200).json({
    mensagem: "Alerta registrado com sucesso.",
    alerta: {
      email,
      tipo,
      detalhes,
      enviadoEm: new Date().toISOString(),
      modo: "demonstracao"
    }
  });
}

module.exports = {
  enviarAlerta
};