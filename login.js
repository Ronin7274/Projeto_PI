const loginForm = document.getElementById("form_login");
const message = document.getElementById("message");
const botao = loginForm.querySelector('input[type="submit"]');
 
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  botao.disabled = true; // evita cliques repetidos enquanto envia
 
  try {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
 
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
 
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
 
    // "Lembrar-me" marcado: o token fica salvo mesmo fechando o navegador.
    // Desmarcado: vale só enquanto a aba estiver aberta.
    const storage = document.getElementById("lembrar").checked
      ? localStorage
      : sessionStorage;
 
    storage.setItem("token", data.token);
    storage.setItem("candidato", JSON.stringify(data.candidato));
 
    message.textContent = `Bem-vindo, ${data.candidato.nome}!`;
 
    // se não quiser redirecionar, apague a linha abaixo
    setTimeout(() => { window.location.href = "painelvagas.html"; }, 800);
  } catch (error) {
    console.error("login pelo frontend falhou:", error);
    // TypeError = o fetch nem chegou ao servidor (servidor desligado, rede caída)
    message.textContent =
      error instanceof TypeError
        ? "Não foi possível conectar-se ao servidor."
        : error.message || "Não foi possível fazer o login.";
  } finally {
    botao.disabled = false; // roda sempre, com sucesso ou erro
  }
});