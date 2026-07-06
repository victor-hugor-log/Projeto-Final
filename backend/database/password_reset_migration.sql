USE favela_tech;

SET @senha_reset_codigo_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "senha_reset_codigo_hash"
);

SET @comando = IF(
  @senha_reset_codigo_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN senha_reset_codigo_hash VARCHAR(255) NULL AFTER email_token_expira_em",
  "SELECT 'A coluna senha_reset_codigo_hash ja existe.' AS mensagem"
);
PREPARE atualizar_senha_reset_codigo FROM @comando;
EXECUTE atualizar_senha_reset_codigo;
DEALLOCATE PREPARE atualizar_senha_reset_codigo;

SET @senha_reset_expira_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "senha_reset_expira_em"
);

SET @comando = IF(
  @senha_reset_expira_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN senha_reset_expira_em DATETIME NULL AFTER senha_reset_codigo_hash",
  "SELECT 'A coluna senha_reset_expira_em ja existe.' AS mensagem"
);
PREPARE atualizar_senha_reset_expira FROM @comando;
EXECUTE atualizar_senha_reset_expira;
DEALLOCATE PREPARE atualizar_senha_reset_expira;
