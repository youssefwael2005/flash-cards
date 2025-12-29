<?php
header('Content-Type: application/json'); // Default to JSON

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "flashlearn_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}



$action = $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        $user = $_POST['username'] ?? '';
        $pass = $_POST['password'] ?? '';

        $hashedPass = password_hash($pass, PASSWORD_DEFAULT); // for security
        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $user, $hashedPass);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Registration successful! Now log in.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        }
        $stmt->close();
        break;

    case 'login':
        $user = $_POST['username'] ?? '';
        $pass = $_POST['password'] ?? '';



        $stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $stmt->bind_result($hashedPass);
        if ($stmt->fetch() && password_verify($pass, $hashedPass)) {
            echo json_encode(['success' => true, 'message' => 'Login successful.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
        $stmt->close();
        break;

    case 'add_flashcard':
        $user = $_POST['username'] ?? '';
        $question = $_POST['question'] ?? '';
        $answer = $_POST['answer'] ?? '';

        if (empty($question) || empty($answer)) {
            echo json_encode(['success' => false, 'message' => 'Question and answer required.']);
            break;
        }

        $stmt = $conn->prepare("INSERT INTO flashcards (username, question, answer) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $user, $question, $answer);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        $stmt->close();
        break;

    case 'get_flashcards':
        $user = $_POST['username'] ?? '';
        $stmt = $conn->prepare("SELECT question, answer FROM flashcards WHERE username = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $result = $stmt->get_result();
        $cards = [];
        while ($row = $result->fetch_assoc()) {
            $cards[] = $row;
        }
        echo json_encode($cards);
        $stmt->close();
        break;

    case 'delete_flashcard':
        $user = $_POST['username'] ?? '';
        $question = $_POST['question'] ?? '';
        $stmt = $conn->prepare("DELETE FROM flashcards WHERE username = ? AND question = ?");
        $stmt->bind_param("ss", $user, $question);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        $stmt->close();
        break;

    case 'get_user_xml':
        header('Content-Type: application/xml'); // Switch to XML
        $user = $_POST['username'] ?? '';
        $stmt = $conn->prepare("SELECT username FROM users WHERE username = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        $xml = new SimpleXMLElement('<user/>');
        $xml->addChild('username', $row['username'] ?? 'Unknown');  // Fixed: Pass string value, not array
        echo $xml->asXML();
        $stmt->close();
        break;

    };