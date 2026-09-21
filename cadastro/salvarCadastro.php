<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ob_start();

echo "<pre>";
var_dump($_POST);
echo "</pre>";

if (empty($_POST)) {
    die("Erro: Nenhum dado foi enviado via POST.");
}

require_once '../conexao.php';

$tipo = $_POST['tipoConta'] ?? null;

if ($tipo === 'usuario') {

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $nome = $_POST['nameUser'];
        $cpf = $_POST['cpfUser'];
        $telefone = $_POST['telefUser'];
        $endereco = $_POST['enderecoUser'];
        $rg = $_POST['rgUser'];
        $email = $_POST['emailUser'];
        $senha = $_POST['senha'];
        $confirma = $_POST['confirma'];


        if ($senha != $confirma) {
            die("Erro: As senhas não coincidem.");
        }

        // Cria um hash seguro da senha usando o algoritmo padrão (bcrypt atualmente)
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        // Verifica duplicidade de dados únicos
        $verify = "SELECT * FROM usuario WHERE CPF = ? OR Telefone = ? OR RG = ? OR Email = ?" ;
        $stmt = $pdo->prepare($verify);
        $stmt->execute([$cpf, $telefone, $rg, $email]);
        $existe = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existe) {
            echo "<script>alert('CPF, e-mail, telefone ou RG já cadastrados'); window.history.back();</script>";
            exit;
        } else {

            // Inserir no banco
            $sql = "INSERT INTO Usuario (Nome, CPF, Telefone, Endereco, RG, Email, Senha, Tipo) VALUES (?, ?, ?, ?, ?, ?, ?, 'usuario')";

            $stmt = $pdo->prepare($sql);

            $stmt->execute([$nome, $cpf, $telefone, $endereco, $rg, $email, $senhaHash]);

            header("Location: ../index.php");
            exit;
        }
    }
} elseif ($tipo === 'clube') {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $nome = $_POST['nameClube'];
        $cnpj = $_POST['cnpj'];
        $email = $_POST['emailClube'];
        $senha = $_POST['senha'];
        $confirma = $_POST['confirma'];


        if ($senha != $confirma) {
            die("Erro: As senhas não coincidem.");
        }

        $verify = "SELECT * FROM clube WHERE CNPJ = ? OR Email = ?";
        $stmt = $pdo->prepare($verify);
        $stmt->execute([$cnpj, $email]);
        $existe = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existe) {
            echo "<script>alert('CNPJ ou e-mail já cadastrados'); window.history.back();</script>";
            exit;
        } else {

            // Cria um hash seguro da senha usando o algoritmo padrão (bcrypt atualmente)
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

            // Inserir no banco
            $sql = "INSERT INTO Clube (Nome, CNPJ, Email, Senha, Tipo) VALUES (?, ?, ?, ?, 'clube')";

            $stmt = $pdo->prepare($sql);

            $stmt->execute([$nome, $cnpj, $email, $senhaHash]);

            header("Location: ../index.php");
            exit;
        }
    }
}

ob_end_flush();