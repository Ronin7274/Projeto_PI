<?php
// Nunca coloque nada antes de <?php — nem espaço, nem ENTER!

session_start();

// Exibe erros no log, mas NÃO na tela para não quebrar o header.
error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once '../../conexao.php';

// Verificação de qual arquivo está sendo executado
// Útil para ter certeza que está executando o login.php correto.
if (!headers_sent()) {
    // Apenas para depuração inicial: depois pode remover
    // var_dump("Arquivo executado: " . __FILE__);
}

// Obtém o tipo de login enviado
$login = $_POST['tipoLogin'] ?? null;
var_dump($login);


// Checa se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senhaDigitada = $_POST['password'] ?? '';



    if ($login === 'Usuario') {
        // Tenta login como USUÁRIO
        $sqlUsuario = "SELECT * FROM Usuario WHERE Email = ?";
        $stmt = $pdo->prepare($sqlUsuario);
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        echo "<pre>";
        var_dump($email);
        var_dump($usuario);
        var_dump($senhaDigitada);
        var_dump(password_verify($senhaDigitada, $usuario['Senha']));
        echo "</pre>";

        

        if ($usuario && password_verify($senhaDigitada, $usuario['Senha'])) {
            $_SESSION['id'] = $usuario['idUsuario'];
            $_SESSION['nome'] = $usuario['Nome'];
            $_SESSION['tipo'] = 'usuario';



            
            // Redireciona para a criação de peneira
            header("Location: /TCC-SPORTKEDIN/peneira/index_peneira.php");
            exit;
        }
    } elseif ($login === 'Clube') {
        // Tenta login como CLUBE
        $sqlClube = "SELECT * FROM Clube WHERE Email = ?";
        $stmt = $pdo->prepare($sqlClube);
        $stmt->execute([$email]);
        $clube = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($clube && password_verify($senhaDigitada, $clube['Senha'])) {
            $_SESSION['id'] = $clube['idClube'];
            $_SESSION['nome'] = $clube['Nome'];
            $_SESSION['tipo'] = 'clube';

            // Redireciona para a criação de peneira
            header("Location: /TCC-SPORTKEDIN/peneira/index_peneira.php");
            exit;
        }
    }
}

// Se chegou aqui, é porque falhou o login
    if (!headers_sent()) {
        echo "<script>alert('E-mail ou senha inválidos'); window.history.back();</script>";
        exit;
    }
 else {
    // Se não for POST, impede o acesso direto
    if (!headers_sent()) {
        header("Location: /TCC-SPORTKEDIN/cadastro/login/loginusuario.php");
        exit;
    }
}