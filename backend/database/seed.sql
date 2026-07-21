USE favela_tech;

INSERT INTO vagas (external_id, titulo, empresa, localizacao, area, tipo, habilidades, origem, salario, descricao_resumo)
VALUES
  ("local-estagio-suporte-ti-bh", "Estágio em Suporte de TI", "Exemplo Tech", "Belo Horizonte - MG", "Tecnologia", "Estagio", "tecnologia, suporte técnico, informática, atendimento", "Parceiros locais", "Bolsa compatível", "Apoio ao time de suporte, atendimento de chamados e manutenção básica de equipamentos."),
  ("local-assistente-front-end-remoto", "Assistente de Front-end Júnior", "Studio Digital Favela", "Remoto", "Tecnologia", "Freelancer", "html, css, javascript, responsividade, landing pages, web", "Parceiros locais", "Por projeto", "Apoio na criação de páginas responsivas, ajustes visuais com CSS e pequenas interações em JavaScript."),
  ("local-jovem-aprendiz-administrativo-bh", "Jovem Aprendiz Administrativo", "Comércio Local BH", "Belo Horizonte - MG", "Administracao", "Jovem Aprendiz", "excel, organização, administração, atendimento", "Parceiros locais", "Bolsa aprendiz", "Rotina administrativa, organização de documentos, apoio em planilhas e atendimento interno."),
  ("local-atendente-loja-contagem", "Atendente de Loja", "Rede Parceira", "Contagem - MG", "Atendimento", "CLT", "comunicação, atendimento, vendas, organização", "Parceiros locais", "A combinar", "Atendimento ao cliente, organização de produtos e apoio nas vendas da unidade."),
  ("local-assistente-marketing-remoto", "Assistente de Marketing Digital", "Agência Criativa", "Remoto", "Marketing", "Freelancer", "redes sociais, canva, marketing, criatividade", "Parceiros locais", "Por projeto", "Apoio na criação de posts, organização de calendário editorial e acompanhamento de redes sociais."),
  ("local-auxiliar-administrativo-contagem", "Auxiliar Administrativo", "Centro Empresarial Contagem", "Contagem - MG", "Administracao", "CLT", "administração, excel, atendimento, organização", "Parceiros locais", "A combinar", "Apoio a rotinas administrativas, conferência de documentos e contato com clientes."),
  ("local-aprendiz-atendimento-betim", "Jovem Aprendiz em Atendimento", "Serviços Betim", "Betim - MG", "Atendimento", "Jovem Aprendiz", "comunicação, atendimento, organização, vendas", "Parceiros locais", "Bolsa aprendiz", "Primeira oportunidade para atuar com atendimento, organização de informações e suporte à equipe.")
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  empresa = VALUES(empresa),
  localizacao = VALUES(localizacao),
  area = VALUES(area),
  tipo = VALUES(tipo),
  habilidades = VALUES(habilidades),
  origem = VALUES(origem),
  salario = VALUES(salario),
  descricao_resumo = VALUES(descricao_resumo);
