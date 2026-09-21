<?php
$host = 'localhost';
$db = 'insertv';
$user = 'root';
//alterar a senha dependendo do ambiente onde for testar
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo 'Erro na conexão: ' . $e->getMessage();
    exit;
}
date_default_timezone_set('America/Sao_Paulo')
?>