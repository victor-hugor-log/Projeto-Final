USE favela_tech;

SET @habilidades_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "vagas"
    AND COLUMN_NAME = "habilidades"
);

SET @comando = IF(
  @habilidades_existe = 0,
  "ALTER TABLE vagas ADD COLUMN habilidades TEXT NULL AFTER tipo",
  "SELECT 'A coluna habilidades ja existe.' AS mensagem"
);

PREPARE atualizar_vagas FROM @comando;
EXECUTE atualizar_vagas;
DEALLOCATE PREPARE atualizar_vagas;
