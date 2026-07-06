# Pitch - Portal de Oportunidades Favela Tech

## Visão geral do projeto

O **Portal de Oportunidades Favela Tech** é um site interativo e responsivo criado com foco na **ODS 8: trabalho decente e crescimento econômico**.

A ideia principal é aproximar jovens da comunidade de oportunidades profissionais, reunindo em um só lugar cadastro de conta, perfil, currículo, busca de vagas, candidatura, acompanhamento de status, chatbot e canais de contato.

O projeto foi desenvolvido com uma estrutura separada entre **frontend**, **backend** e **banco de dados**, para ficar mais profissional e mais fácil de explicar tecnicamente.

## Objetivo

O objetivo do projeto é criar uma ponte entre jovens capacitados e empresas ou oportunidades reais. Muitos jovens têm cursos, habilidades e vontade de trabalhar, mas enfrentam dificuldade para organizar currículo, encontrar vagas confiáveis e acompanhar candidaturas.

Com o Favela Tech, o usuário consegue:

- criar uma conta;
- fazer login;
- completar o perfil;
- cadastrar endereço com apoio de API de CEP;
- montar e imprimir um currículo;
- buscar vagas;
- se candidatar;
- acompanhar candidaturas;
- tirar dúvidas com o chatbot;
- entrar em contato com o projeto;
- entender como ajudar a causa.

## Tecnologias utilizadas

Usei **HTML5** para estruturar as páginas, **CSS3** para o visual, responsividade, animações e identidade do site, e **JavaScript** para interatividade, manipulação do DOM, busca de vagas, chatbot, notificações e comunicação com o backend.

No backend, usei **Node.js** com **Express** para criar o servidor e as rotas da API. A conexão com o banco foi feita com **MySQL2**, e o banco escolhido foi **MySQL**.

Para segurança, usei **Bcrypt** para criptografar senhas antes de salvar no banco. Assim, a senha real do usuário não fica armazenada em texto puro.

Também usei APIs públicas:

- **ViaCEP**, para preencher automaticamente endereço a partir do CEP;
- **Remotive**, para buscar vagas reais remotas e mostrar oportunidades vindas de uma API externa.

Além disso, implementei um **chatbot em JavaScript**, com respostas por intenção, atalhos de conversa, convite inicial e efeito de digitação.

## O que é processado pelo sistema

O sistema processa dados de cadastro, como nome, e-mail, senha, telefone, tipo de usuário e habilidades adicionadas por tags. Também processa dados de perfil, como foto, endereço, CEP, cidade, bairro e estado.

Na parte de currículo, o sistema processa informações como objetivo profissional, formação, experiências, cursos, habilidades, links e dados complementares. Essas informações ficam salvas no MySQL e podem ser carregadas novamente quando o usuário entra na conta.

Na página de vagas, o sistema processa filtros, palavra-chave de busca, tipo de vaga, área de interesse e dados vindos da API Remotive. Também compara as habilidades do usuário com as vagas disponíveis para montar recomendações automáticas. Quando o usuário se candidata, o backend salva a relação entre usuário e vaga no banco de dados.

Na autenticação, o sistema processa login, cadastro, hash de senha, verificação local de e-mail e recuperação de senha por código temporário.

## Informações apresentadas ao usuário

O usuário vê uma página inicial com a proposta do projeto, a ODS 8, chamadas para cadastrar currículo e visualizar vagas.

Na página Sobre Nós, ele entende a missão, os valores e o propósito do Favela Tech. Na página Como Ajudar, ele encontra ações práticas, como divulgar o portal, apoiar jovens com currículo e conhecer organizações ligadas à empregabilidade.

Na página de Vagas, o usuário vê oportunidades, empresa, área, tipo, localização, origem, resumo, link para a vaga original quando existe e uma área de recomendações por compatibilidade. Também pode se candidatar e receber notificações do próprio site.

No Perfil, o usuário vê seus dados, foto, telefone e e-mail parcialmente mascarados, endereço, habilidades editáveis, link para currículo e área de Minhas candidaturas, com vaga, empresa, data e status.

No Currículo, o usuário vê um formulário completo e um modelo de currículo pronto para impressão.

## Como eu fiz

Primeiro organizei a estrutura do projeto em duas áreas principais: **frontend** e **backend**. No frontend ficam os arquivos HTML, CSS, JavaScript e imagens. No backend ficam o servidor, rotas, controllers, configuração de banco e arquivos SQL.

Depois criei as páginas obrigatórias do desafio: Home, Sobre Nós, Vagas, Login/Cadastro, Como Ajudar e Contato. Em seguida, adicionei páginas e fluxos extras, como Perfil, Currículo e Verificação de E-mail.

Para a autenticação, criei rotas no backend para cadastro, login, recuperação de senha e redefinição de senha. No cadastro, a senha passa pelo Bcrypt antes de ir para o MySQL. No login, o backend compara a senha digitada com o hash salvo no banco.

Para o perfil, criei campos para foto, telefone, e-mail, endereço, habilidades e dados pessoais. Também coloquei telefone e e-mail mascarados, para deixar a interface mais parecida com sistemas reais.

Para o endereço, integrei a API ViaCEP. A pessoa informa o CEP e o site busca automaticamente rua, bairro, cidade e estado.

Para currículo, criei um formulário com dados profissionais e um modelo de impressão estilizado com a identidade do Favela Tech.

Para vagas, criei filtros e busca em tempo real no frontend. No backend, criei um controller que busca vagas na API Remotive, normaliza os dados e salva no MySQL. Se a API falhar, o projeto continua usando vagas locais do banco. Também criei uma lógica de recomendação que cruza habilidades do usuário com título, área, descrição e habilidades das vagas.

Para candidaturas, criei rotas e controller específicos. Quando o usuário clica em Candidatar-se, o backend salva usuário, vaga, data e status. Também criei bloqueio para impedir candidatura duplicada na mesma vaga.

Para o chatbot, substituí uma versão simples por uma conversa mais natural, com respostas por assunto, atalhos, efeito de digitando e convite inicial no botão do assistente.

## Roteiro de apresentação por slide

### Slide 1 - Capa

Eu apresento o projeto como o Portal de Oportunidades Favela Tech, um site responsivo criado para conectar jovens talentos da comunidade a vagas, currículos, empresas e orientação profissional.

Falo que o projeto é ligado à ODS 8 e que usa tecnologias de frontend, backend, banco de dados, APIs e chatbot.

### Slide 2 - Motivação

Aqui eu explico que o problema não é falta de talento. Muitos jovens têm vontade de trabalhar, fazem cursos e desenvolvem habilidades, mas não têm uma ponte clara com oportunidades.

Também explico que vagas ficam espalhadas, currículo pode ser uma barreira e o acompanhamento de candidaturas costuma ser confuso.

### Slide 3 - Solução

Mostro a jornada do usuário:

1. Criar conta.
2. Completar perfil.
3. Montar currículo.
4. Buscar vaga.
5. Candidatar-se.

Esse slide serve para mostrar que o projeto não é só uma página bonita, mas um fluxo completo.

### Slide 4 - Requisitos do desafio

Explico que o projeto cobre os principais itens pedidos: Home, Sobre Nós, Contato, Login/Cadastro, Como Ajudar, área restrita, banco de dados, APIs e chatbot.

Também vale comentar que o projeto tem README, pasta pitch e organização profissional das pastas.

### Slide 5 - Desenvolvimento

Explico a separação técnica:

- Frontend: HTML, CSS e JavaScript.
- Backend: Node.js e Express.
- Banco: MySQL.
- APIs externas: ViaCEP e Remotive.

Falo que essa divisão facilita manutenção, explicação e evolução do projeto.

### Slide 6 - Banco de dados e autenticação

Explico que os dados principais ficam no MySQL. As tabelas principais envolvem usuários, currículos, vagas e candidaturas.

Também falo sobre Bcrypt, senha criptografada, recuperação de senha por código local e verificação local de e-mail.

### Slide 7 - Vagas e candidaturas

Mostro que a página de vagas tem busca em tempo real, filtros e integração com a API Remotive.

Explico que o backend salva vagas externas no banco e mantém vagas locais como fallback. Também explico que a candidatura fica registrada no MySQL e que o sistema impede candidatura duplicada.

### Slide 8 - Perfil e currículo

Explico que o usuário logado tem uma área Minha conta. Nela, ele vê dados, foto, telefone, e-mail, endereço e candidaturas.

Também falo que o currículo é salvo no banco e pode ser impresso em um modelo com visual próprio do Favela Tech.

### Slide 9 - Experiência do usuário

Falo das melhorias de interface: notificações próprias do site no lugar de alerts do navegador, chatbot mais conversável, efeito digitando, convite inicial e imagens mais coerentes com cada página.

Esse slide ajuda a mostrar preocupação com design e usabilidade.

### Slide 10 - Responsabilidade e confiança

Explico que o projeto lida com dados reais, então tratei segurança e privacidade como parte do produto.

Falo sobre aceite de termos/LGPD, senha protegida, dados sensíveis mascarados e ambiente local de apresentação.

### Slide 11 - Resultados

Mostro que o protótipo já funciona como portal completo: possui páginas obrigatórias, APIs, rotas no backend, MySQL, currículo, candidaturas e chatbot.

Também digo que na apresentação posso demonstrar a jornada ao vivo: login, vagas, candidatura e perfil.

### Slide 12 - Considerações finais

Finalizo dizendo que o Favela Tech mostra como uma solução web pode aproximar talento, oportunidade e impacto social.

Como próximos passos, eu evoluiria o envio real de e-mails e integrações com plataformas de vagas como CIEE, LinkedIn Jobs e Indeed, dependendo de acesso ou parceria.

## Demonstração sugerida

Na hora de apresentar, a melhor demonstração é curta e direta:

1. Abrir a Home.
2. Mostrar rapidamente o chatbot.
3. Fazer login.
4. Ir para a página de vagas.
5. Pesquisar uma vaga.
6. Clicar em Candidatar-se.
7. Abrir Minha conta.
8. Mostrar Minhas candidaturas.
9. Abrir currículo e mostrar o modelo de impressão.

## Como rodar na apresentação

Para demonstrar o projeto, eu preciso iniciar o MySQL e o backend Node.js.

No Mac, o MySQL local pode ser acessado pelo comando:

```bash
/usr/local/mysql/bin/mysql -u root -p
```

Para iniciar o backend, entro na pasta:

```bash
cd /Users/victorhugor/Documents/GitHub/Projeto-Final/backend
npm start
```

Depois acesso o site por:

```text
http://localhost:3000
```

Não é ideal abrir o HTML diretamente pelo arquivo, porque login, cadastro, currículo, vagas e candidaturas dependem das rotas do backend.

## Fechamento

O Favela Tech foi pensado para cumprir o desafio técnico e também para parecer um produto real. Ele combina interface responsiva, banco de dados, API, chatbot e uma proposta social clara.

A mensagem principal é: tecnologia simples, bem organizada e conectada a um problema real pode ajudar jovens talentos a chegarem mais perto de oportunidades.
