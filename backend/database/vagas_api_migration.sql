USE favela_tech;

SET @external_id_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "external_id"
);

SET @comando = IF(
  @external_id_existe = 0,
  "ALTER TABLE vagas ADD COLUMN external_id VARCHAR(120) NULL AFTER id",
  "SELECT 'A coluna external_id ja existe.' AS mensagem"
);
PREPARE atualizar_external_id FROM @comando;
EXECUTE atualizar_external_id;
DEALLOCATE PREPARE atualizar_external_id;

SET @url_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "url"
);

SET @comando = IF(
  @url_existe = 0,
  "ALTER TABLE vagas ADD COLUMN url VARCHAR(500) NULL AFTER origem",
  "SELECT 'A coluna url ja existe.' AS mensagem"
);
PREPARE atualizar_url FROM @comando;
EXECUTE atualizar_url;
DEALLOCATE PREPARE atualizar_url;

SET @salario_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "salario"
);

SET @comando = IF(
  @salario_existe = 0,
  "ALTER TABLE vagas ADD COLUMN salario VARCHAR(120) NULL AFTER url",
  "SELECT 'A coluna salario ja existe.' AS mensagem"
);
PREPARE atualizar_salario FROM @comando;
EXECUTE atualizar_salario;
DEALLOCATE PREPARE atualizar_salario;

SET @descricao_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "descricao_resumo"
);

SET @comando = IF(
  @descricao_existe = 0,
  "ALTER TABLE vagas ADD COLUMN descricao_resumo TEXT NULL AFTER salario",
  "SELECT 'A coluna descricao_resumo ja existe.' AS mensagem"
);
PREPARE atualizar_descricao FROM @comando;
EXECUTE atualizar_descricao;
DEALLOCATE PREPARE atualizar_descricao;

SET @publicado_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "publicado_em"
);

SET @comando = IF(
  @publicado_existe = 0,
  "ALTER TABLE vagas ADD COLUMN publicado_em DATETIME NULL AFTER descricao_resumo",
  "SELECT 'A coluna publicado_em ja existe.' AS mensagem"
);
PREPARE atualizar_publicado FROM @comando;
EXECUTE atualizar_publicado;
DEALLOCATE PREPARE atualizar_publicado;

SET @atualizado_api_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "atualizado_api_em"
);

SET @comando = IF(
  @atualizado_api_existe = 0,
  "ALTER TABLE vagas ADD COLUMN atualizado_api_em DATETIME NULL AFTER publicado_em",
  "SELECT 'A coluna atualizado_api_em ja existe.' AS mensagem"
);
PREPARE atualizar_api FROM @comando;
EXECUTE atualizar_api;
DEALLOCATE PREPARE atualizar_api;

SET @indice_existe = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "vagas"
    AND INDEX_NAME = "vaga_external_id_unica"
);

SET @comando = IF(
  @indice_existe = 0,
  "ALTER TABLE vagas ADD UNIQUE KEY vaga_external_id_unica (external_id)",
  "SELECT 'O indice vaga_external_id_unica ja existe.' AS mensagem"
);
PREPARE atualizar_indice FROM @comando;
EXECUTE atualizar_indice;
DEALLOCATE PREPARE atualizar_indice;
