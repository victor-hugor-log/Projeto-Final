USE favela_tech;

SET @email_verificado_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "email_verificado"
);

SET @comando = IF(
  @email_verificado_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT false AFTER foto_perfil",
  "SELECT 'A coluna email_verificado ja existe.' AS mensagem"
);
PREPARE atualizar_email_verificado FROM @comando;
EXECUTE atualizar_email_verificado;
DEALLOCATE PREPARE atualizar_email_verificado;

SET @email_token_hash_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "email_token_hash"
);

SET @comando = IF(
  @email_token_hash_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN email_token_hash VARCHAR(255) NULL AFTER email_verificado",
  "SELECT 'A coluna email_token_hash ja existe.' AS mensagem"
);
PREPARE atualizar_email_token_hash FROM @comando;
EXECUTE atualizar_email_token_hash;
DEALLOCATE PREPARE atualizar_email_token_hash;

SET @email_token_expira_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "email_token_expira_em"
);

SET @comando = IF(
  @email_token_expira_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN email_token_expira_em DATETIME NULL AFTER email_token_hash",
  "SELECT 'A coluna email_token_expira_em ja existe.' AS mensagem"
);
PREPARE atualizar_email_token_expira FROM @comando;
EXECUTE atualizar_email_token_expira;
DEALLOCATE PREPARE atualizar_email_token_expira;

UPDATE usuarios
SET email_verificado = 1
WHERE email_verificado = 0
  AND email_token_hash IS NULL
  AND email_token_expira_em IS NULL;
