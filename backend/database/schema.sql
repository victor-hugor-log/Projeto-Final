CREATE DATABASE IF NOT EXISTS favela_tech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE favela_tech;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(30) NOT NULL DEFAULT "jovem",
  habilidades TEXT,
  cep VARCHAR(9),
  endereco VARCHAR(150),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  foto_perfil LONGTEXT,
  email_verificado BOOLEAN NOT NULL DEFAULT false,
  email_token_hash VARCHAR(255),
  email_token_expira_em DATETIME,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vagas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  empresa VARCHAR(100) NOT NULL,
  localizacao VARCHAR(100) NOT NULL,
  area VARCHAR(80),
  tipo VARCHAR(50) NOT NULL,
  habilidades TEXT,
  origem VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS curriculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  data_nascimento DATE,
  nacionalidade VARCHAR(60),
  estado_civil VARCHAR(40),
  cidade VARCHAR(100) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  area VARCHAR(80) NOT NULL,
  disponibilidade VARCHAR(80),
  resumo TEXT NOT NULL,
  escolaridade VARCHAR(80) NOT NULL,
  curso VARCHAR(120),
  instituicao VARCHAR(120),
  empresa VARCHAR(100),
  funcao VARCHAR(100),
  atividades TEXT,
  habilidades TEXT NOT NULL,
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS mensagens_contato (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  tipo VARCHAR(60),
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
