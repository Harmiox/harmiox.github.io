<?php

session_start();

require_once 'lib/phpmailer/PHPMailerAutoLoad.php';

$errors = [];

if(isset($_POST['name'], $_POST['email'], $_POST['message'])) {
    
    $fields = [
        'name' => $_POST['name'],
        'email' => $_POST['email'],
        'message' => $_POST['message']
    ];
    
    foreach($fields as $field => $data) {
        if(empty($data)) {
            $errors[] = 'The ' . $field . ' field is required.';
        }
    }
        
} else {
    $errors[] = 'Something went wrong.';
}

$_SESSION['errors'] = $errors;
$_SESSION['fields'] = $fields;


header('Location: index.php');