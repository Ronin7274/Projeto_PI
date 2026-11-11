const loginForm = document.getElementById("form_loginEmpresa");
const message = document.getElementById("message");

// Se algum id sumir do HTML, o console diz exatamente o que faltou.
if (!loginForm || !message) {
  console.error(
    "login.js: não encontrei #form_login e/ou #message em login.html. Confira os ids."
  );
} else {
  iniciarLogin();
}

// Busca um elemento pelo id; se não existir, lança um erro com mensagem clara.
function pegar(id) {
  const elemento = document.getElementById(id);
  if (!elemento) {
    throw new Error(`O campo #${id} não existe no HTML.`);
  }
  return elemento;
}

function iniciarLogin() {
  const botao = loginForm.querySelector('input[type="submit"]');

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    if (botao) botao.disabled = true;

    try {
      const email = pegar("email").value.trim();
      const senha = pegar("senha").value;

      const response = await fetch("/api/login/empresa", {
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

      // "Lembrar-me" marcado: token salvo mesmo fechando o navegador.
      // Desmarcado: vale só enquanto a aba estiver aberta.
      //const storage = pegar("lembrar").checked ? localStorage : sessionStorage;

      try {
        storage.setItem("token", data.token);
        storage.setItem("empresa", JSON.stringify(data.empresa));
      } catch (erroStorage) {
        console.warn("Não foi possível guardar a sessão:", erroStorage);
      }

      message.textContent = `Bem-vindo, ${data.empresa.nome}!`;

      // destino que o formulário antigo usava em action="painelvagas.html"
      setTimeout(() => { window.location.href = "painelvagas.html"; }, 800);
    } catch (error) {
      console.error("login pelo frontend falhou:", error);
      message.textContent =
        error instanceof TypeError
          ? "Não foi possível conectar-se ao servidor."
          : error.message || "Não foi possível fazer o login.";
    } finally {
      if (botao) botao.disabled = false;
    }
  });
}