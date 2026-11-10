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

const DATA_FILE = path.join(__dirname, "Banco.json");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_REGEX = /^[a-f0-9]{32}:[a-f0-9]{128}$/i; // salt(16 bytes) : chave(64 bytes)

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/estilizacao", express.static(path.join(__dirname, "estilizacao")));
app.use("/img", express.static(path.join(__dirname, "img")));

// serve as páginas da raiz sem expor o banco.json
// arquivos da raiz que NUNCA podem ser entregues ao navegador
const ARQUIVOS_BLOQUEADOS = new Set([
  "servidor.js", "Banco.json", "package.json", "package-lock.json"
]);

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"), error => {
    if (error) next(error);
  });
});

// libera qualquer .html/.css/.js da raiz (login.html, loginEmpresa.html, ...)
// sem precisar editar uma lista a cada página nova.
app.get("/:arquivo", (req, res, next) => {
  const nome = req.params.arquivo;

  // só nomes simples com extensão permitida (impede "../" e outros tipos de arquivo)
  if (!/^[\w-]+\.(html|css|js)$/.test(nome) || ARQUIVOS_BLOQUEADOS.has(nome)) {
    return next();
  }

  res.sendFile(path.join(__dirname, nome), error => {
    if (error) next(error);
  });
});

/* ------------------------------------------------------------------ */
/* Acesso ao "banco" (banco.json)                                      */
/* ------------------------------------------------------------------ */

// Fila: garante que só UMA operação de ler-alterar-gravar rode por vez.
// Sem isso, dois cadastros simultâneos podem sobrescrever um ao outro
// ou deixar o arquivo corrompido/vazio.
let fila = Promise.resolve();
function naFila(tarefa) {
  const resultado = fila.then(tarefa);
  fila = resultado.catch(() => {}); // um erro não pode travar a fila
  return resultado;
}

async function lerBanco() {
  let conteudo;
  try {
    conteudo = await fs.readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("banco.json não foi encontrado na pasta do projeto.");
    }
    throw error;
  }

  let data;
  try {
    data = JSON.parse(conteudo);
  } catch {
    throw new Error("banco.json está vazio ou com JSON inválido.");
  }

  if (!data || !Array.isArray(data.candidato)) {
    throw new Error("estrutura inválida em banco.json (falta a tabela candidato).");
  }
  return data;
}

// Grava num arquivo temporário e renomeia: a troca é "tudo ou nada",
// então o banco.json nunca fica pela metade.
async function salvarBanco(data) {
  const temporario = DATA_FILE + ".tmp";
  try {
    await fs.writeFile(temporario, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temporario, DATA_FILE);
  } catch (error) {
    // limpa o temporário para não deixar lixo e relança o erro
    await fs.rm(temporario, { force: true }).catch(() => {});
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Senhas                                                              */
/* ------------------------------------------------------------------ */

async function encriptarSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const chave = await scryptAsync(senha, salt, 64);
  return `${salt}:${chave.toString("hex")}`;
}

// aceita hashes novos e senhas antigas em texto puro (banco inicial)
async function verificaSenha(senha, armazenada) {
  if (typeof armazenada !== "string") return false;

  if (HASH_REGEX.test(armazenada)) {
    const [salt, chaveHex] = armazenada.split(":");
    const esperado = Buffer.from(chaveHex, "hex");
    const atual = await scryptAsync(senha, salt, 64);
    return timingSafeEqual(atual, esperado);
  }

  const esperado = Buffer.from(armazenada, "utf8");
  const atual = Buffer.from(senha, "utf8");
  return esperado.length === atual.length && timingSafeEqual(atual, esperado);
}

/* ------------------------------------------------------------------ */
/* Sessões (token em memória)                                          */
/* ------------------------------------------------------------------ */

const sessoes = new Map(); // token -> id_candidato

function criarSessao(idCandidato) {
  const token = randomBytes(32).toString("hex");
  sessoes.set(token, idCandidato);
  return token;
}

// O cliente manda "Authorization: Bearer <token>". O servidor descobre
// QUEM é o usuário pelo token; o cliente nunca escolhe o próprio id.
function requireUser(req, res, next) {
  let usuario = null;

  try {
    const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
    const id = match && sessoes.get(match[1]);
    if (id) usuario = { id_candidato: id, token: match[1] };
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return res.status(500).json({ error: "não foi possível verificar sua sessão." });
  }

  if (!usuario) {
    return res.status(401).json({ error: "não autenticado." });
  }

  req.user = usuario;
  next(); // fora do try: erros das rotas seguintes não são tratados aqui
}

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

function erroHttp(status, mensagem) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

function responderErro(res, error, mensagemPadrao) {
  if (error.status && error.status < 500) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: mensagemPadrao });
}

// nunca devolve a senha para o cliente
function usuarioPublico(user) {
  return {
    id_candidato: user.id_candidato,
    nome: user.nome,
    email: user.email
  };
}

/* ------------------------------------------------------------------ */
/* CREATE: cadastro                                                    */
/* ------------------------------------------------------------------ */

app.post("/api/signup", async (req, res) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !nome.trim() ||
      !EMAIL_REGEX.test(email.trim()) ||
      senha.length < 8 ||
      Buffer.byteLength(senha, "utf8") > 1024
    ) {
      throw erroHttp(
        400,
        "coloque um nome, email e senha válidos. A senha deve ter pelo menos 8 caracteres."
      );
    }

    const emailNormalizado = email.trim().toLowerCase();
    const senhaHash = await encriptarSenha(senha); // feito antes da fila (é lento)

    const novoUsuario = await naFila(async () => {
      const data = await lerBanco();

      const existe = data.candidato.some(
        u => typeof u.email === "string" && u.email.toLowerCase() === emailNormalizado
      );
      if (existe) {
        throw erroHttp(409, "uma conta com esse email já existe.");
      }

      const novo = {
        id_candidato: randomUUID(),
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaHash,
        tipo_usuario: "cliente"
      };

      data.candidato.push(novo);
      await salvarBanco(data);
      return novo;
    });

    return res.status(201).json({
      message: "conta criada com sucesso.",
      token: criarSessao(novoUsuario.id_candidato),
      candidato: usuarioPublico(novoUsuario)
    });
  } catch (error) {
    return responderErro(
      res,
      error,
      "Não foi possível criar sua conta. Por favor, tente novamente."
    );
  }
});

/* ------------------------------------------------------------------ */
/* Login / Logout                                                      */
/* ------------------------------------------------------------------ */

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      throw erroHttp(400, "email e senha são obrigatórios.");
    }

    const emailNormalizado = email.trim().toLowerCase();
    const data = await lerBanco();

    const user = data.candidato.find(
      u => typeof u.email === "string" && u.email.toLowerCase() === emailNormalizado
    );

    if (!user || !(await verificaSenha(senha, user.senha))) {
      throw erroHttp(401, "email ou senha inválidos.");
    }

    // migra senha em texto puro para hash depois de autenticar
    if (!HASH_REGEX.test(user.senha)) {
      const novoHash = await encriptarSenha(senha);
      await naFila(async () => {
        const atual = await lerBanco();
        const alvo = atual.candidato.find(u => u.id_candidato === user.id_candidato);
        if (alvo) {
          alvo.senha = novoHash;
          await salvarBanco(atual);
        }
      });
    }

    return res.json({
      message: "Login bem sucedido.",
      token: criarSessao(user.id_candidato),
      candidato: usuarioPublico(user)
    });
  } catch (error) {
    return responderErro(
      res,
      error,
      "Não foi possível fazer o login. Por favor, tente novamente."
    );
  }
});

app.post("/api/logout", requireUser, (req, res) => {
  try {
    sessoes.delete(req.user.token);
    res.json({ message: "Sessão encerrada." });
  } catch (error) {
    responderErro(res, error, "Não foi possível encerrar a sessão.");
  }
});

/* ------------------------------------------------------------------ */
/* READ / UPDATE / DELETE do usuário logado                            */
/* ------------------------------------------------------------------ */

// só o próprio usuário acessa o próprio registro
function somenteODono(req, res, next) {
  let permitido = false;

  try {
    permitido = req.params.id === req.user.id_candidato;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return res.status(500).json({ error: "não foi possível verificar a permissão." });
  }

  if (!permitido) {
    return res.status(403).json({ error: "acesso negado." });
  }
  next();
}

// READ
app.get("/api/users/:id", requireUser, somenteODono, async (req, res) => {
  try {
    const data = await lerBanco();
    const user = data.candidato.find(u => u.id_candidato === req.user.id_candidato);

    if (!user) throw erroHttp(404, "usuário não encontrado.");

    res.json({ candidato: usuarioPublico(user) });
  } catch (error) {
    responderErro(res, error, "Não foi possível buscar o usuário.");
  }
});

// UPDATE (nome)
app.put("/api/users/:id", requireUser, somenteODono, async (req, res) => {
  try {
    const { nome } = req.body || {};

    if (typeof nome !== "string" || !nome.trim()) {
      throw erroHttp(400, "informe um nome válido.");
    }

    const atualizado = await naFila(async () => {
      const data = await lerBanco();
      const user = data.candidato.find(u => u.id_candidato === req.user.id_candidato);

      if (!user) throw erroHttp(404, "usuário não encontrado.");

      user.nome = nome.trim();
      await salvarBanco(data);
      return user;
    });

    res.json({ message: "Perfil atualizado.", candidato: usuarioPublico(atualizado) });
  } catch (error) {
    responderErro(res, error, "Não foi possível atualizar o usuário.");
  }
});

// DELETE
app.delete("/api/users/:id", requireUser, somenteODono, async (req, res) => {
  try {
    await naFila(async () => {
      const data = await lerBanco();
      const restantes = data.candidato.filter(u => u.id_candidato !== req.user.id_candidato);

      if (restantes.length === data.candidato.length) {
        throw erroHttp(404, "usuário não encontrado.");
      }

      data.candidato = restantes;
      await salvarBanco(data);
    });

    sessoes.delete(req.user.token);
    res.json({ message: "Conta excluída." });
  } catch (error) {
    responderErro(res, error, "Não foi possível excluir a conta.");
  }
});

/* ------------------------------------------------------------------ */
/* Respostas de erro SEMPRE em JSON (evita corpo vazio/HTML no fetch)  */
/* ------------------------------------------------------------------ */

app.use("/api", (req, res) => {
  res.status(404).json({ error: "rota da API não encontrada." });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? "erro interno do servidor." : "requisição inválida."
  });
});

const servidor = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// erro ao subir o servidor (ex.: porta 3000 já está em uso)
servidor.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(`A porta ${PORT} já está em uso. Feche o outro servidor e tente de novo.`);
  } else {
    console.error("Erro ao iniciar o servidor:", error);
  }
  process.exit(1);
});

// rede de segurança: registra erros que escaparam de qualquer try/catch
process.on("unhandledRejection", motivo => {
  console.error("Promise rejeitada sem tratamento:", motivo);
});
process.on("uncaughtException", error => {
  console.error("Erro não capturado:", error);
  process.exit(1);
});