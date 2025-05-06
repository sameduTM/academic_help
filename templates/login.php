<?php
require_once 'config.php';

header('Content-Type: application/json');

// Handle pre-flight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Get input data
$jsonInput = file_get_contents('php://input');
$data = json_decode($jsonInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON format']);
  exit;
}

// Validate input
if (empty($data['email']) || empty($data['password'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Email and password required']);
  exit;
}

try {
  $conn = getDBConnection();
  if ($conn->connect_error) {
    throw new Exception('Database connection failed', 500);
  }

  // Get user by email
  $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
  if (!$stmt) {
    throw new Exception('Database prepare failed', 500);
  }

  $stmt->bind_param("s", $data['email']);
  if (!$stmt->execute()) {
    throw new Exception('Database query failed', 500);
  }

  $result = $stmt->get_result();
  if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
  }

  $user = $result->fetch_assoc();

  // Verify password
  if (!password_verify($data['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
  }

  // Start session securely
  session_start([
    'cookie_lifetime' => 86400,
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict'
  ]);

  // Regenerate session ID to prevent fixation
  session_regenerate_id(true);

  // Store user information in session
  $_SESSION['user_id'] = $user['id'];
  $_SESSION['user_name'] = $user['name'];
  $_SESSION['user_email'] = $user['email'];
  $_SESSION['last_login'] = time();

  // Return success response
  echo json_encode([
    'message' => 'Login successful',
    'user' => [
      'id' => $user['id'],
      'name' => $user['name'],
      'email' => $user['email']
    ]
  ]);
} catch (Exception $e) {
  http_response_code($e->getCode() ?: 500);
  echo json_encode([
    'error' => $e->getMessage(),
    'code' => $e->getCode()
  ]);
} finally {
  // Cleanup resources
  if (isset($stmt)) $stmt->close();
  if (isset($conn)) $conn->close();
  exit();
}
