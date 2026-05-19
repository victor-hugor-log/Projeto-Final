const formLogin = document.querySelector(".login-box form");
const formCadastro = document.querySelector(".cadastro-box form");


// LOGIN BOLADO
formLogin.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email-login").value.trim();
    const senha = document.getElementById("senha-login").value.trim();

    if (email === "" || senha === "") {
        alert("Preencha todos os campos.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Digite um e-mail válido.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    alert("Login realizado com sucesso!");

});



// CADASTRO BOLADO
formCadastro.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome-cad").value.trim();
    const email = document.getElementById("email-cad").value.trim();
    const senha = document.getElementById("senha-cad").value.trim();

    if (nome === "" || email === "" || senha === "") {
        alert("Preencha todos os campos.");
        return;
    }

    if (nome.length < 3) {
        alert("Digite um nome válido.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Digite um e-mail válido.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    alert("Cadastro realizado com sucesso!");
    });