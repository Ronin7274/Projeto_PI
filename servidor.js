const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  randomUUID,
  randomBytes,
  scrypt,
  timingSafeEqual
} = require("node:crypto");
const { promisify } = require("node:util");

const app = express();
const PORT = 3000;
const scryptAsync = promisify(scrypt);

const DATA_FILE = path.join(__dirname, "banco.json");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//permite servir as páginas existentes na raiz sem expor banco.json.
const frontendFiles = [
  "/", "/index.html", "/login.html", "/cadastrar.html",
  "/divulgavagas.html", "/painelcursos.html", "/painelvagas.html",
  "/login.js", "/cadastrar.js", "/style.css", "/stylecadastrar.css",
  "/stylelogin.css", "/stylepvagas.css"
];
app.get(frontendFiles, (req, res, next) => {
  const fileName = req.path === "/" ? "index.html" : req.path.slice(1);
  res.sendFile(path.join(__dirname, fileName), error => {
    if (error) next(error);
  });
});
app.use("/img", express.static(path.join(__dirname, "img")));

//lê somente a tabela de candidatos e valida o nome usado pelo banco.
async function readUsers() {
  const content = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(content);

  if (!data || !Array.isArray(data.candidato)) {
    throw new Error("usuario invalido.json structure");
  }

  return data.candidato;
}

//atualiza candidatos sem apagar as demais tabelas do banco.
async function writeUsers(users) {
  const content = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(content);

  if (!data || !Array.isArray(data.candidato)) {
    throw new Error("usuario invalido.json structure");
  }

  data.candidato = users;
  const updatedContent = JSON.stringify(data, null, 2);
  await fs.writeFile(DATA_FILE, updatedContent, "utf8");
}

//encripta a senha antes de salvar
async function encriptarSenha (senha) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(senha, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

//verifica hashes novos e senhas antigas em texto puro do banco inicial.
async function verificaSenha(senha, senhaEncriptada) {
  if (typeof senhaEncriptada !== "string") {
    return false;
  }

  const [salt, keyHex] = senhaEncriptada.split(":");

  if (salt && /^[a-f0-9]{128}$/i.test(keyHex || "")) {
    const expected = Buffer.from(keyHex, "hex");
    const actual = await scryptAsync(senha, salt, 64);
    return timingSafeEqual(actual, expected);
  }

  const expected = Buffer.from(senhaEncriptada, "utf8");
  const actual = Buffer.from(senha, "utf8");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

//cadastro de usuario
app.post("/api/signup", async (req, res) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !nome.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      senha.length < 8 ||
      Buffer.byteLength(senha, "utf8") > 1024
    ) {
      return res.status(400).json({
        error: "coloque um nome, email e senha válidos. A senha deve ter pelo menos 8 caracteres."
      });
    }

    const users = await readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    //compara emails sem falhar em registros incompletos.
    const existingUser = users.find(
      user => typeof user.email === "string" && user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error: "uma conta com esse email já existe."
      });
    }

    //compara emails sem falhar em registros incompletos.
    const newUser = {
      id_candidato: randomUUID(),
      nome: nome.trim(),
      email: normalizedEmail,
      senha: await encriptarSenha(senha),
      tipo_usuario: "cliente"
    };

    users.push(newUser);
    await writeUsers(users);

    return res.status(201).json({
      message: "conta criada com sucesso.",
      candidato: {
        id_candidato: newUser.id_candidato,
        nome: newUser.nome,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      error: "Não foi possível criar sua conta. Por favor, tente novamente."
    });
  }
});

//login, checa o email e senha do usuario
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        error: "email e senha são obrigatórios."
      });
    }

    const users = await readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    //procura somente na tabela candidato e usa os campos do banco.
    const user = users.find(
      item => typeof item.email === "string" && item.email.toLowerCase() === normalizedEmail
    );

    if (
      !user ||
      typeof user.senha !== "string" ||
      !(await verificaSenha(senha, user.senha))
    ) {
      return res.status(401).json({
        error: "email ou senha inválidos."
      });
    }

    //migra a senha de exemplo para hash depois de autenticar com sucesso.
    if (!user.senha.includes(":")) {
      user.senha = await encriptarSenha(senha);
      await writeUsers(users);
    }

    return res.json({
      message: "Login bem sucedido.",
      candidato: {
        id_candidato: user.id_candidato,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Não foi possível fazer o login. Por favor, tente novamente."
    });
  }
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});







// Placeholder: implement using verified server-side authentication.
// Do not allow clients to choose their own req.user.
function requireUser(req, res, next) {
  // Replace with verified session/token authentication.
  return res.status(501).json({
    error: "Authentication middleware is not implemented."
  });
}

// READ: retrieve the currently authenticated user's record.
app.get("/api/users/:id", requireUser, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const users = await readUsers();
    const user = users.find(item => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("Read user error:", error);
    res.status(500).json({ error: "Could not retrieve user." });
  }
});

// UPDATE: change the authenticated user's name.
app.put("/api/users/:id", requireUser, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const { name } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "A valid name is required." });
    }

    const users = await readUsers();
    const index = users.findIndex(
      item => item.id === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    users[index].name = name.trim();
    await writeUsers(users);

    res.json({
      message: "Profile updated.",
      user: {
        id: users[index].id,
        name: users[index].name,
        email: users[index].email
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Could not update user." });
  }
});

// DELETE: delete the authenticated user's account.
app.delete("/api/users/:id", requireUser, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const users = await readUsers();
    const remainingUsers = users.filter(
      item => item.id !== req.user.id
    );

    if (remainingUsers.length === users.length) {
      return res.status(404).json({ error: "User not found." });
    }

    await writeUsers(remainingUsers);

    res.json({ message: "Account deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Could not delete account." });
  }
});