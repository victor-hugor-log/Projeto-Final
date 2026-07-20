# Portal de Oportunidades Favela Tech

## Descricao do projeto

O **Portal de Oportunidades Favela Tech** e um site interativo e responsivo desenvolvido com foco na **ODS 8: Trabalho decente e crescimento economico**.

O objetivo do projeto e conectar jovens capacitados da comunidade a empresas locais, facilitando o cadastro de curriculos, a busca por vagas, a recomendacao automatica de oportunidades e o contato com iniciativas de empregabilidade.

## Funcionalidades

- Pagina inicial com apresentacao do projeto e chamada para cadastro.
- Pagina Sobre Nos com missao, valores e informacoes do desenvolvedor.
- Pagina de Vagas com filtros por area, tipo de vaga, busca por palavra-chave e atualizacao por API externa.
- Recomendacao automatica de vagas com base em habilidades adicionadas por tags.
- Alertas por e-mail simulados para vagas compativeis e candidaturas.
- Cadastro de curriculo salvo e carregado pelo MySQL.
- Candidatura em vagas salva no MySQL, com bloqueio de candidatura duplicada.
- Area "Minhas candidaturas" no perfil, com vaga, empresa, data e status.
- Perfil com foto, habilidades editaveis, dados de contato mascarados e endereco com busca automatica por CEP.
- Pagina de Login/Cadastro com aceite de termos/LGPD, verificacao de e-mail e login com Google.
- Area restrita com perfil basico do usuario autenticado.
- Pagina Como Ajudar com acoes praticas, links para organizacoes e compartilhamento.
- Cadastro, login, recuperacao de senha e troca de senha conectados ao MySQL com senhas criptografadas.
- Pagina de Contato com formulario, canais diretos e mapa com localizacao.
- Chatbot disponível em todas as páginas, com respostas por intenção e efeito de digitação.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- MySQL2
- Bcrypt
- Passport Google OAuth
- API publica ViaCEP para preenchimento automatico de endereco
- LocalStorage apenas para manter os dados publicos do usuario logado
- API publica Remotive para exibicao de vagas reais remotas
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

Ao iniciar, o backend tambem garante automaticamente as tabelas de curriculos, candidaturas, vagas externas e os campos extras do perfil. As migrations manuais estao disponiveis em `database/curriculos_migration.sql`, `database/curriculo_extra_migration.sql`, `database/candidaturas_migration.sql`, `database/perfil_extra_migration.sql`, `database/email_verification_migration.sql`, `database/password_reset_migration.sql` e `database/vagas_api_migration.sql`.

### Configuracao

O arquivo `backend/.env` guarda a configuracao local. Preencha `DB_PASSWORD` com a senha do seu MySQL. Esse arquivo esta protegido pelo `.gitignore` e nao deve ser enviado ao GitHub.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=favela_tech
VAGAS_API_ATIVA=true
VAGAS_API_LIMITE=30
VAGAS_API_TTL_MINUTOS=360
EXIBIR_CODIGO_RECUPERACAO=true
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=uma_frase_segura_para_sessao
```

No Google Cloud, configurei o redirect autorizado como:

```text
http://localhost:3000/auth/google/callback
```

### Executando o projeto

1. Abra a pasta `backend` no terminal.
2. Instale as dependencias:

```bash
npm install
```

3. Inicie o servidor dentro de `backend`:

```bash
npm start
```

Tambem e possivel iniciar pela raiz do projeto:

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
GET http://localhost:3000/api/auth/verificar-email
POST http://localhost:3000/api/auth/verificar-senha
POST http://localhost:3000/api/auth/recuperar-senha
POST http://localhost:3000/api/auth/redefinir-senha
GET http://localhost:3000/auth/google
GET http://localhost:3000/auth/google/callback
GET http://localhost:3000/api/curriculos/:usuarioId
PUT http://localhost:3000/api/curriculos/:usuarioId
POST http://localhost:3000/api/candidaturas
GET http://localhost:3000/api/candidaturas/usuario/:usuarioId
POST http://localhost:3000/api/alertas
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

- LinkedIn Jobs
- CIEE
- Indeed

Essas plataformas dependem de acesso especifico ou parceria. Na versao atual, o backend usa a API publica Remotive para trazer vagas reais remotas e mantem as vagas locais no MySQL como fallback.

## Contribuidor

Victor Hugor de Souza Lopes

## Licenca

Projeto desenvolvido para fins educacionais.
