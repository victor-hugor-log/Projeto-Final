USE favela_tech;

SET @data_nascimento_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "curriculos"
    AND COLUMN_NAME = "data_nascimento"
);

SET @comando = IF(
  @data_nascimento_existe = 0,
  "ALTER TABLE curriculos ADD COLUMN data_nascimento DATE NULL AFTER telefone",
  "SELECT 'A coluna data_nascimento ja existe.' AS mensagem"
);
PREPARE atualizar_data_nascimento FROM @comando;
EXECUTE atualizar_data_nascimento;
DEALLOCATE PREPARE atualizar_data_nascimento;

SET @nacionalidade_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "curriculos"
    AND COLUMN_NAME = "nacionalidade"
);

SET @comando = IF(
  @nacionalidade_existe = 0,
  "ALTER TABLE curriculos ADD COLUMN nacionalidade VARCHAR(60) NULL AFTER data_nascimento",
  "SELECT 'A coluna nacionalidade ja existe.' AS mensagem"
);
PREPARE atualizar_nacionalidade FROM @comando;
EXECUTE atualizar_nacionalidade;
DEALLOCATE PREPARE atualizar_nacionalidade;

SET @estado_civil_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "curriculos"
    AND COLUMN_NAME = "estado_civil"
);

SET @comando = IF(
  @estado_civil_existe = 0,
  "ALTER TABLE curriculos ADD COLUMN estado_civil VARCHAR(40) NULL AFTER nacionalidade",
  "SELECT 'A coluna estado_civil ja existe.' AS mensagem"
);
PREPARE atualizar_estado_civil FROM @comando;
EXECUTE atualizar_estado_civil;
DEALLOCATE PREPARE atualizar_estado_civil;

SET @disponibilidade_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "curriculos"
    AND COLUMN_NAME = "disponibilidade"
);

SET @comando = IF(
  @disponibilidade_existe = 0,
  "ALTER TABLE curriculos ADD COLUMN disponibilidade VARCHAR(80) NULL AFTER area",
  "SELECT 'A coluna disponibilidade ja existe.' AS mensagem"
);
PREPARE atualizar_disponibilidade FROM @comando;
EXECUTE atualizar_disponibilidade;
DEALLOCATE PREPARE atualizar_disponibilidade;
