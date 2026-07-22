# Pitch - Portal de Oportunidades Favela Tech

## Roteiro de apresentação - 5 minutos

Este roteiro foi pensado para apresentar sem correr e sem repetir os mesmos pontos em vários slides. A ideia é falar em média **25 a 35 segundos por slide**, deixando um momento próprio para a demonstração ao vivo.

## Resumo do projeto

O **Favela Tech** é um portal responsivo conectado à **ODS 8: trabalho decente e crescimento econômico**. O objetivo é aproximar jovens da comunidade de oportunidades profissionais, reunindo cadastro, login, perfil, currículo, busca de vagas, candidatura, banco de dados, APIs públicas, formulário de contato e chatbot em JavaScript.

O projeto foi organizado em **frontend**, **backend** e **MySQL**. O frontend cuida das páginas e interações; o backend em Node.js/Express cuida das rotas, regras e validações; e o banco salva usuários, currículos, vagas, candidaturas e dados do perfil.

## Roteiro por slide

### Slide 1 - Capa

Eu desenvolvi o Favela Tech como projeto final, conectado à ODS 8, trabalho decente e crescimento econômico.

A ideia é criar um portal que aproxima jovens da comunidade de oportunidades profissionais.

Em vez de ser só uma página informativa, o site tem login, perfil, currículo, busca de vagas, candidatura, banco de dados, APIs e chatbot.

### Slide 2 - Talento sem ponte

A motivação veio de um problema simples: o talento existe, mas nem sempre encontra caminho.

Muitos jovens estudam, fazem cursos e querem trabalhar, porém as vagas ficam espalhadas e o currículo vira uma barreira.

Então o projeto tenta organizar essa jornada em um só lugar.

### Slide 3 - Do cadastro à candidatura

A solução foi desenhar a jornada do usuário.

Ele cria conta, completa perfil, monta currículo, busca vagas e se candidata.

O ponto principal é que tudo conversa: dados do perfil ajudam no currículo, as vagas aparecem em uma área própria e as candidaturas ficam registradas.

### Slide 4 - Requisitos atendidos

Aqui eu conecto o projeto aos requisitos do desafio.

Implementei as páginas obrigatórias: Home, Sobre Nós, Contato, Login/Cadastro e Como Ajudar.

Além disso, adicionei área restrita, banco de dados, APIs públicas e chatbot em JavaScript.

Também organizei README e pasta pitch para entregar o projeto de forma profissional.

### Slide 5 - Frontend, backend e banco

Na parte técnica, separei frontend e backend.

O frontend usa HTML, CSS e JavaScript para telas, formulários, responsividade e interações.

O backend usa Node.js e Express para rotas, validações, login, currículo, vagas e candidaturas.

Os dados ficam no MySQL, e as integrações externas usadas são ViaCEP para endereço, Remotive para vagas reais e Formspree para envio do formulário de contato.

### Slide 6 - Vagas reais e candidaturas

A página de vagas é uma das partes principais.

O usuário pode buscar por palavra-chave, ver vagas do banco e vagas reais vindas da API Remotive.

Quando ele se candidata, o backend salva usuário, vaga, data e status no MySQL.

Também bloqueei candidatura duplicada, para a pessoa não se candidatar duas vezes na mesma vaga.

### Slide 7 - Perfil e currículo

No perfil, o usuário consegue atualizar dados pessoais, foto, telefone, endereço e informações profissionais.

O endereço usa ViaCEP: ao digitar o CEP, o site preenche rua, bairro, cidade e estado.

Também criei um currículo imprimível com layout próprio, usando os dados preenchidos no portal.

### Slide 8 - Resultado atual

Como resultado, o Favela Tech entrega uma jornada completa: cadastro, login, perfil, currículo, vagas, candidatura e acompanhamento.

Ele combina proposta social com tecnologia aplicada: frontend, backend, MySQL, APIs, segurança básica e chatbot.

Como próximos passos, eu evoluiria o envio de e-mails, integrações com mais plataformas de vagas e recomendação automática mais inteligente.

### Slide 9 - Hora da apresentação

Neste momento eu paro a fala dos slides e mostro o site real funcionando no navegador.

Vou passar rapidamente pela Home, chatbot, login, perfil, currículo, vagas, candidatura e acompanhamento no perfil.

### Slide 10 - Aprendizados e fechamento

Com esse projeto, aprendi a organizar melhor um sistema completo, separando frontend, backend e banco de dados.

Também pratiquei rotas, validações, integração com APIs, autenticação, segurança básica e apresentação de um produto funcionando.

Obrigado.

## Demonstração ao vivo

1. Abrir a Home.
2. Mostrar rapidamente o chatbot.
3. Fazer login.
4. Ir para Vagas.
5. Pesquisar uma vaga.
6. Clicar em Candidatar-se.
7. Abrir Minha conta.
8. Mostrar Minhas candidaturas ou o currículo.

## Como rodar na apresentação

Para demonstrar o projeto, preciso iniciar o MySQL e o backend Node.js.

No Mac, o MySQL local pode ser acessado com:

```bash
/usr/local/mysql/bin/mysql -u root -p
```

Para iniciar o backend:

```bash
cd /Users/victorhugor/Documents/GitHub/Projeto-Final/backend
npm start
```

Depois acesso:

```text
http://localhost:3000
```

Não é ideal abrir o HTML diretamente pelo arquivo, porque login, cadastro, currículo, vagas e candidaturas dependem das rotas do backend.
