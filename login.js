
const loginForm = document.getElementById("form_login");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";

  try {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "login falhou.");
    }

    // exibe o nome usando o formato de resposta da API de candidatos.
    message.textContent = `Bem-vindo, ${data.candidato.nome}!`;

    // só verifica as credenciais, não faz um login persistente
  } catch (error) {
    console.error("login pelo frontend falhou:", error);
    message.textContent =
      error.message || "Não foi possível conectar-se ao servidor.";
  }
});
