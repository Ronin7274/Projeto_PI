const signupForm = document.getElementById("form_cadastroEmpresa");
const message = document.getElementById("message");
const CNPJ_REGEX = /^\d{14}$/;

// Se algum id sumir do HTML, o console diz exatamente o que faltou
// (antes o script quebrava com "Cannot read properties of null").
if (!signupForm || !message) {
  console.error(
    "cadastroempresa.js: não encontrei #form_cadastroEmpresa e/ou #message em cadastroempresa.html. Confira os ids."
  );
} else {
  iniciarCadastro();
}

// Busca um elemento pelo id; se não existir, lança um erro com mensagem clara.
function pegar(id) {
  const elemento = document.getElementById(id);
  if (!elemento) {
    throw new Error(`O campo #${id} não existe no HTML.`);
  }
  return elemento;
}

function iniciarCadastro() {
  const botao = signupForm.querySelector('input[type="submit"]');

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // impede o envio padrão do formulário
    message.textContent = "";
    if (botao) botao.disabled = true; // evita cliques repetidos enquanto envia

    try {
      const nome = pegar("nome").value.trim();
      const email = pegar("email").value.trim();
      const senha = pegar("senha").value;
      const cnpj = pegar("cnpj").value.trim();
      const cidade = pegar("cidade").value.trim();
      const UF = pegar("estado").value.trim();
      const confirmarSenha = pegar("confirmar").value; // id "confirmar" (igual ao HTML)

      if (!CNPJ_REGEX.test(cnpj)) {
        throw new Error("O CNPJ é inválido.");
      }

      if (senha !== confirmarSenha) {
        throw new Error("As senhas não coincidem.");
      }

      message.classList.remove("erro", "sucesso");
      const response = await fetch("/api/signup/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, cnpj, cidade, UF })
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

      // a conta já foi criada; falha ao guardar a sessão não deve parecer falha de cadastro
      try {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("empresa", JSON.stringify(data.empresa));
      } catch (erroStorage) {
        console.warn("Não foi possível guardar a sessão:", erroStorage);
      }

      message.textContent = `${data.message} Redirecionando...`;
      signupForm.reset();

      // destino que o formulário antigo usava em action="painelcursos.html"
      setTimeout(() => { window.location.href = "loginEmpresa.html"; }, 1000);
    } catch (error) {
      console.error("cadastro pelo frontend falhou:", error);
      // TypeError = o fetch nem chegou ao servidor (servidor desligado, rede caída)
      message.textContent =
        error instanceof TypeError
          ? "Não foi possível conectar-se ao servidor."
          : error.message || "Não foi possível concluir o cadastro.";
    } finally {
      if (botao) botao.disabled = false; // roda sempre, com sucesso ou erro
    }
  });
}