const linksComAutenticacao = document.querySelectorAll("#inicio a[href], #funcionalidades a[href]");

for (const link of linksComAutenticacao) {
  link.addEventListener("click", (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank"
    ) {
      return;
    }

    const tokenCandidato =
  sessionStorage.getItem("tokenCandidato") ||
  localStorage.getItem("tokenCandidato");
    const tokenEmpresa =
  sessionStorage.getItem("tokenEmpresa") ||
  localStorage.getItem("tokenEmpresa");

    if (tokenCandidato) {
  // Mantém o destino definido no href do link clicado.
  return;
  }

event.preventDefault();

  if (tokenEmpresa) {
    window.location.href = "visaoempresa.html";
  } else {
    window.location.href = "login.html";
  }
    });
}
