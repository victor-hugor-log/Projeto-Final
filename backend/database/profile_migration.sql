USE favela_tech;

SET @telefone_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "telefone"
);

SET @comando = IF(
  @telefone_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20) NULL AFTER email",
  "SELECT 'A coluna telefone ja existe.' AS mensagem"
);

PREPARE atualizar_perfil FROM @comando;
EXECUTE atualizar_perfil;
DEALLOCATE PREPARE atualizar_perfil;
