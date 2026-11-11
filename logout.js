const logoutButton = document.querySelector("[data-logout]");

if (logoutButton) {
  const message = document.getElementById("logout-message");

  logoutButton.addEventListener("click", async () => {
    const { tokenKey, profileKey, endpoint, redirect } = logoutButton.dataset;
    const token =
      sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);

    if (!token) {
      sessionStorage.removeItem(profileKey);
      localStorage.removeItem(profileKey);
      window.location.href = redirect;
      return;
    }

    logoutButton.disabled = true;
    if (message) message.textContent = "";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok && response.status !== 401) {
        throw new Error(`O servidor respondeu com erro ${response.status}.`);
      }

      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(profileKey);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(profileKey);
      window.location.href = redirect;
    } catch (error) {
      console.error("Não foi possível encerrar a sessão:", error);
      if (message) {
        message.textContent =
          error instanceof TypeError
            ? "Não foi possível conectar ao servidor. Tente sair novamente."
            : error.message || "Não foi possível encerrar a sessão.";
      }
      logoutButton.disabled = false;
    }
  });
}
