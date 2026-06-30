USE favela_tech;

SET @cep_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "cep"
);

SET @comando = IF(
  @cep_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN cep VARCHAR(9) NULL AFTER habilidades",
  "SELECT 'A coluna cep ja existe.' AS mensagem"
);

PREPARE atualizar_cep FROM @comando;
EXECUTE atualizar_cep;
DEALLOCATE PREPARE atualizar_cep;

SET @endereco_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "endereco"
);

SET @comando = IF(
  @endereco_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN endereco VARCHAR(150) NULL AFTER cep",
  "SELECT 'A coluna endereco ja existe.' AS mensagem"
);

PREPARE atualizar_endereco FROM @comando;
EXECUTE atualizar_endereco;
DEALLOCATE PREPARE atualizar_endereco;

SET @numero_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "numero"
);

SET @comando = IF(
  @numero_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN numero VARCHAR(20) NULL AFTER endereco",
  "SELECT 'A coluna numero ja existe.' AS mensagem"
);

PREPARE atualizar_numero FROM @comando;
EXECUTE atualizar_numero;
DEALLOCATE PREPARE atualizar_numero;

SET @complemento_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "complemento"
);

SET @comando = IF(
  @complemento_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN complemento VARCHAR(100) NULL AFTER numero",
  "SELECT 'A coluna complemento ja existe.' AS mensagem"
);

PREPARE atualizar_complemento FROM @comando;
EXECUTE atualizar_complemento;
DEALLOCATE PREPARE atualizar_complemento;

SET @bairro_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "bairro"
);

SET @comando = IF(
  @bairro_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN bairro VARCHAR(100) NULL AFTER complemento",
  "SELECT 'A coluna bairro ja existe.' AS mensagem"
);

PREPARE atualizar_bairro FROM @comando;
EXECUTE atualizar_bairro;
DEALLOCATE PREPARE atualizar_bairro;

SET @cidade_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "cidade"
);

SET @comando = IF(
  @cidade_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN cidade VARCHAR(100) NULL AFTER bairro",
  "SELECT 'A coluna cidade ja existe.' AS mensagem"
);

PREPARE atualizar_cidade FROM @comando;
EXECUTE atualizar_cidade;
DEALLOCATE PREPARE atualizar_cidade;

SET @estado_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "estado"
);

SET @comando = IF(
  @estado_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN estado VARCHAR(2) NULL AFTER cidade",
  "SELECT 'A coluna estado ja existe.' AS mensagem"
);

PREPARE atualizar_estado FROM @comando;
EXECUTE atualizar_estado;
DEALLOCATE PREPARE atualizar_estado;

SET @foto_existe = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = "favela_tech"
    AND TABLE_NAME = "usuarios"
    AND COLUMN_NAME = "foto_perfil"
);

SET @comando = IF(
  @foto_existe = 0,
  "ALTER TABLE usuarios ADD COLUMN foto_perfil LONGTEXT NULL AFTER estado",
  "SELECT 'A coluna foto_perfil ja existe.' AS mensagem"
);

PREPARE atualizar_foto FROM @comando;
EXECUTE atualizar_foto;
DEALLOCATE PREPARE atualizar_foto;
