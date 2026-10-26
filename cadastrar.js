
const signupForm = document.getElementById("form_cadastro");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => { //roda quando o usuario clica no botao de cadastro
  event.preventDefault();

  message.textContent = "";

  try {
    const nome = document.getElementById("nome").value.trim(); //.value pega o valor do input, .trim() remove espaços em branco no inicio e no final
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    //impede o envio quando a confirmação da senha não confere.
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (senha !== confirmarSenha) {
      throw new Error("As senhas não coincidem.");
    }

    //fetch envia uma requisição para o servidor, nesse caso para a rota /api/signup, com o metodo POST e o corpo da requisição contendo os dados do usuario em formato JSON
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome: nome, email, senha: senha }) //converte o objeto em string JSON
    });

    const data = await response.json(); //lê a resposta do servidor e converte em objeto JSON

    if (!response.ok) {
      throw new Error(data.error || "cadastro falhou.");
    }

    message.textContent = data.message;
    signupForm.reset();
  } catch (error) {
    console.error("cadastro pelo frontend falhou:", error);
    message.textContent =
      error.message || "Não foi possível conectar-se ao servidor.";
  }
});
