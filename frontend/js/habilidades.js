const FavelaTechHabilidades = (() => {
  const sugestoes = [
    "HTML",
    "CSS",
    "JavaScript",
    "Node.js",
    "SQL",
    "Excel",
    "Atendimento",
    "Comunicação",
    "Vendas",
    "Administração",
    "Organização",
    "Marketing digital",
    "Redes sociais",
    "Canva",
    "Design",
    "Figma",
    "Suporte técnico",
    "Informática",
    "Trabalho em equipe",
    "Inglês"
  ];

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9#+.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function listar(valor) {
    const base = Array.isArray(valor)
      ? valor
      : String(valor || "").split(/[,;|]/);
    const vistos = new Set();

    return base
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .filter((item) => {
        const chave = normalizar(item);
        if (!chave || vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      });
  }

  function serializar(lista) {
    return listar(lista).join(", ");
  }

  function criarEditor({ campoId, inputId, listaId, sugestoesId, erroId, valoresIniciais = [] }) {
    const campo = document.getElementById(campoId);
    const input = document.getElementById(inputId);
    const listaElemento = document.getElementById(listaId);
    const sugestoesElemento = document.getElementById(sugestoesId);
    const erro = erroId ? document.getElementById(erroId) : null;
    let selecionadas = listar(valoresIniciais.length ? valoresIniciais : campo?.value);

    function atualizarCampo() {
      if (campo) campo.value = serializar(selecionadas);
      if (erro && selecionadas.length > 0) erro.textContent = "";
    }

    function renderizar() {
      if (listaElemento) {
        if (selecionadas.length === 0) {
          const vazio = document.createElement("span");
          vazio.className = "habilidades-vazio";
          vazio.textContent = "Nenhuma habilidade adicionada.";
          listaElemento.replaceChildren(vazio);
        } else {
          const fragmento = document.createDocumentFragment();

          selecionadas.forEach((habilidade) => {
            const chip = document.createElement("span");
            chip.className = "habilidade-chip";
            chip.textContent = habilidade;

            const remover = document.createElement("button");
            remover.type = "button";
            remover.setAttribute("aria-label", `Remover ${habilidade}`);
            remover.textContent = "X";
            remover.addEventListener("click", () => removerHabilidade(habilidade));

            chip.appendChild(remover);
            fragmento.appendChild(chip);
          });

          listaElemento.replaceChildren(fragmento);
        }
      }

      if (sugestoesElemento) {
        sugestoesElemento.querySelectorAll("button").forEach((botao) => {
          const ativo = selecionadas.some((habilidade) => normalizar(habilidade) === normalizar(botao.dataset.habilidade));
          botao.classList.toggle("ativo", ativo);
        });
      }

      atualizarCampo();
    }

    function adicionarHabilidade(valor) {
      const habilidade = String(valor || "").trim().replace(/\s+/g, " ");
      if (!habilidade) return;

      const existe = selecionadas.some((item) => normalizar(item) === normalizar(habilidade));
      if (!existe) selecionadas.push(habilidade.slice(0, 40));

      if (input) input.value = "";
      renderizar();
    }

    function removerHabilidade(valor) {
      const chave = normalizar(valor);
      selecionadas = selecionadas.filter((habilidade) => normalizar(habilidade) !== chave);
      renderizar();
    }

    function setSelecionadas(valores) {
      selecionadas = listar(valores);
      renderizar();
    }

    function validarMinimo(minimo = 1, mensagem = "Adicione pelo menos uma habilidade.") {
      const valido = selecionadas.length >= minimo;
      if (erro) erro.textContent = valido ? "" : mensagem;
      return valido;
    }

    if (sugestoesElemento) {
      const fragmento = document.createDocumentFragment();
      sugestoes.forEach((habilidade) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "habilidade-sugestao";
        botao.dataset.habilidade = habilidade;
        botao.textContent = habilidade;
        botao.addEventListener("click", () => {
          const ativo = selecionadas.some((item) => normalizar(item) === normalizar(habilidade));
          if (ativo) removerHabilidade(habilidade);
          else adicionarHabilidade(habilidade);
        });
        fragmento.appendChild(botao);
      });
      sugestoesElemento.replaceChildren(fragmento);
    }

    input?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== ",") return;

      event.preventDefault();
      adicionarHabilidade(input.value);
    });

    input?.addEventListener("blur", () => {
      adicionarHabilidade(input.value);
    });

    renderizar();

    return {
      adicionar: adicionarHabilidade,
      remover: removerHabilidade,
      setSelecionadas,
      getSelecionadas: () => [...selecionadas],
      serializar: () => serializar(selecionadas),
      limpar: () => setSelecionadas([]),
      validarMinimo
    };
  }

  return {
    sugestoes,
    normalizar,
    listar,
    serializar,
    criarEditor
  };
})();

window.FavelaTechHabilidades = FavelaTechHabilidades;
