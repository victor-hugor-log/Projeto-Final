# Portal de Oportunidades Favela Tech

## Descricao do projeto

O **Portal de Oportunidades Favela Tech** e um site interativo e responsivo desenvolvido com foco na **ODS 8: Trabalho decente e crescimento economico**.

O objetivo do projeto e conectar jovens capacitados da comunidade a empresas locais, facilitando o cadastro de curriculos, a busca por vagas, a recomendacao automatica de oportunidades e o contato com iniciativas de empregabilidade.

## Funcionalidades

- Pagina inicial com apresentacao do projeto e chamada para cadastro.
- Pagina Sobre Nos com missao, valores e informacoes do desenvolvedor.
- Pagina de Vagas com filtros por area, tipo de vaga e busca por palavra-chave.
- Recomendacao automatica de vagas com base nas habilidades cadastradas.
- Cadastro de curriculo salvo e carregado pelo MySQL.
- Candidatura em vagas salva no MySQL, com bloqueio de candidatura duplicada.
- Area "Minhas candidaturas" no perfil, com vaga, empresa, data e status.
- Perfil com foto, dados de contato mascarados e endereco com busca automatica por CEP.
- Pagina de Login/Cadastro com aceite de termos/LGPD.
- Area restrita com perfil basico do usuario autenticado.
- Pagina Como Ajudar com acoes praticas, links para organizacoes e compartilhamento.
- Cadastro e login conectados ao MySQL com senhas criptografadas.
- Pagina de Contato com formulario e apoio de envio externo/simulado.
- Chatbot disponivel em todas as paginas.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- MySQL2
- Bcrypt
- API publica ViaCEP para preenchimento automatico de endereco
- LocalStorage apenas para manter os dados publicos do usuario logado
- API simulada de vagas
- Chatbot com regras em JavaScript

## Como executar o projeto

### Banco de dados

1. Inicie o servidor MySQL.
2. Abra o terminal na pasta `backend`.
3. Crie as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

4. Em bancos criados antes da integracao, execute tambem:

```bash
mysql -u root -p < database/migration.sql
```

5. As vagas de exemplo podem ser inseridas com:

```bash
mysql -u root -p < database/seed.sql
```

Ao iniciar, o backend tambem garante automaticamente as tabelas de curriculos, candidaturas e os campos extras do perfil. As migrations manuais estao disponiveis em `database/curriculos_migration.sql`, `database/curriculo_extra_migration.sql`, `database/candidaturas_migration.sql`, `database/perfil_extra_migration.sql` e `database/email_verification_migration.sql`.

### Configuracao

O arquivo `backend/.env` guarda a configuracao local. Preencha `DB_PASSWORD` com a senha do seu MySQL. Esse arquivo esta protegido pelo `.gitignore` e nao deve ser enviado ao GitHub.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=favela_tech
```

### Executando o projeto

1. Abra a pasta `backend` no terminal.
2. Instale as dependencias:

```bash
npm install
```

3. Inicie o servidor:

```bash
npm start
```

4. Acesse o site pelo servidor:

```text
http://localhost:3000
```

Nao abra o HTML diretamente, pois cadastro e login dependem da API. O backend disponibiliza as rotas:

```text
http://localhost:3000/api/vagas
POST http://localhost:3000/api/auth/cadastro
POST http://localhost:3000/api/auth/login
GET http://localhost:3000/api/curriculos/:usuarioId
PUT http://localhost:3000/api/curriculos/:usuarioId
POST http://localhost:3000/api/candidaturas
GET http://localhost:3000/api/candidaturas/usuario/:usuarioId
```

### Consultando as contas

No MySQL, execute:

```sql
USE favela_tech;
SELECT id, nome, email, tipo, habilidades, criado_em FROM usuarios;
```

A coluna `senha` guarda somente o hash gerado pelo Bcrypt, nunca a senha original.

## Estrutura principal

```text
Projeto-Final/
├── frontend/
│   ├── index.html
│   ├── sobre.html
│   ├── vagas.html
│   ├── login.html
│   ├── ajudar.html
│   ├── contato.html
│   ├── assets/
│   ├── css/
│   ├── html/
│   └── js/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── routes/
│   ├── package.json
│   └── package-lock.json
├── pitch/
│   ├── apresentacao.md
│   └── favela-tech-apresentacao.pptx
├── docs/
│   └── pitch/
├── README.md
└── .gitignore
```

## Integracoes planejadas

O projeto simula vagas de plataformas externas. Em uma versao futura, poderia ser integrado com:

- LinkedIn Jobs
- CIEE
- Indeed

## Contribuidor

Victor Hugor de Souza Lopes

## Licenca

Projeto desenvolvido para fins educacionais.
