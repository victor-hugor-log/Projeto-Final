USE favela_tech;

CREATE TABLE IF NOT EXISTS candidaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  vaga_id INT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT "Enviada",
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY candidatura_unica (usuario_id, vaga_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE
);

SET @status_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "candidaturas"
    AND COLUMN_NAME = "status"
);

SET @comando = IF(
  @status_existe = 0,
  "ALTER TABLE candidaturas ADD COLUMN status VARCHAR(40) NOT NULL DEFAULT 'Enviada' AFTER vaga_id",
  "SELECT 'A coluna status ja existe.' AS mensagem"
);

PREPARE atualizar_status_candidaturas FROM @comando;
EXECUTE atualizar_status_candidaturas;
DEALLOCATE PREPARE atualizar_status_candidaturas;

DELETE repetida
FROM candidaturas repetida
INNER JOIN candidaturas original
  ON repetida.usuario_id = original.usuario_id
  AND repetida.vaga_id = original.vaga_id
  AND repetida.id > original.id;

SET @indice_existe = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "candidaturas"
    AND INDEX_NAME = "candidatura_unica"
);

SET @comando = IF(
  @indice_existe = 0,
  "ALTER TABLE candidaturas ADD UNIQUE KEY candidatura_unica (usuario_id, vaga_id)",
  "SELECT 'O indice candidatura_unica ja existe.' AS mensagem"
);

PREPARE atualizar_indice_candidaturas FROM @comando;
EXECUTE atualizar_indice_candidaturas;
DEALLOCATE PREPARE atualizar_indice_candidaturas;
