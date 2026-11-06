const signupForm = document.getElementById("form_cadastro");
const message = document.getElementById("message");
const botao = signupForm.querySelector('input[type="submit"]');
 
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // impede o envio padrão do formulário (recarregar a página)
  message.textContent = "";
  botao.disabled = true; // evita cliques repetidos enquanto envia
 
  try {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;
 
    if (senha !== confirmarSenha) {
      throw new Error("As senhas não coincidem.");
    }
 
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
 
    // Lê como TEXTO primeiro: se o corpo vier vazio ou não for JSON,
    // não estoura o "JSON.parse: unexpected end of data".
    const texto = await response.text();
    let data = {};
    try {
      data = texto ? JSON.parse(texto) : {};
    } catch {
      data = {};
    }
 
    if (!response.ok) {
      throw new Error(
        data.error ||
          `O servidor respondeu com erro ${response.status}. ` +
          "Confirme que está acessando a página por http://localhost:3000"
      );
    }
 
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("candidato", JSON.stringify(data.candidato));
 
    message.textContent = data.message;
    signupForm.reset();
  } catch (error) {
    console.error("cadastro pelo frontend falhou:", error);
    // TypeError = o fetch nem chegou ao servidor (servidor desligado, rede caída)
    message.textContent =
      error instanceof TypeError
        ? "Não foi possível conectar-se ao servidor."
        : error.message || "Não foi possível concluir o cadastro.";
  } finally {
    botao.disabled = false; // roda sempre, com sucesso ou erro
  }
});