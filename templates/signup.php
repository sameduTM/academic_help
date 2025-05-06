<?php
require_once 'config.php';

// Initialize error handling
error_reporting(0); // Disable error display
header('Content-Type: application/json');

try {
  // validate request method
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Method not allowed', 405);
  }
  // Get and validate JSON input
  $jsonInput = file_get_contents('php://input');
  $data = json_decode($jsonInput, true);

  if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception('Invalid JSON format', 400);
  }

  // Validate required fields
  $required = ['name', 'email', 'password'];
  foreach ($required as $field) {
    if (empty($data[$field])) {
      throw new Exception("Missing required field: $field", 400);
    }
  }

  // Validate email format
  if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    throw new Exception('Invalid email format', 400);
  }

  // Validate password strength
  if (strlen($data['password']) < 8) {
    throw new Exception('Password must be at least 8 characters', 400);
  }

  // Database connection
  $conn = getDBConnection();
  if ($conn->connect_error) {
    throw new Exception('Db connection failed', 500);
  }

  // check if email exists
  $chckStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
  $chckStmt->bind_param("s", $data['email']);
  if (!$chckStmt->execute()) {
    throw new Exception('Db query failed', 500);
  }

  $chckStmt->store_result();
  if ($chckStmt->num_rows > 0) {
    throw new Exception('Email already exists', 409);
  }
  $chckStmt->close();

  // Insert new user
  $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
  $insertStmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  $insertStmt->bind_param("sss", $data['name'], $data['email'], $hashed_password);

  if (!$insertStmt->execute()) {
    error_log("Registration error: " .$conn->error); // Log detailed error
    throw new Exception('Registration failed', 500);
  }

  http_response_code(201);
  echo json_encode(['message' => 'User registered successfully']);

} catch(Exception $e) {
  http_response_code($e->getCode());
  echo json_encode([
    'error' => $e->getMessage(),
    'code' => $e->getCode()
  ]);
} finally {
  // Cleanup resources
  if (isset($chckStmt)) $chckStmt->close();
  if (isset($insertStmt)) $insertStmt->close();
  if (isset($conn)) $conn->close();
  exit;
}