USE favela_tech;

SET @tipo_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "tipo"
);

SET @comando = IF(
  @tipo_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN tipo VARCHAR(30) NOT NULL DEFAULT 'jovem' AFTER senha",
  "SELECT 'A coluna tipo ja existe.' AS mensagem"
);

PREPARE atualizar_usuarios FROM @comando;
EXECUTE atualizar_usuarios;
DEALLOCATE PREPARE atualizar_usuarios;
