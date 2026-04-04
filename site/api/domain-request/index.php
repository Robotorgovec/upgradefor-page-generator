<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['status' => 'error']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['status' => 'error']);
  exit;
}

$name = trim((string)($data['name'] ?? ''));
$lastName = trim((string)($data['lastName'] ?? ''));
$middleName = trim((string)($data['middleName'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$domain = trim((string)($data['domain'] ?? ''));
$token = trim((string)($data['token'] ?? ''));
$expiresAt = trim((string)($data['expiresAt'] ?? ''));
$source = trim((string)($data['source'] ?? 'domain-rus-landing'));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['status' => 'error']);
  exit;
}

if ($domain === '') {
  http_response_code(400);
  echo json_encode(['status' => 'error']);
  exit;
}

$now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
if ($expiresAt !== '') {
  try {
    $expiresDate = new DateTimeImmutable($expiresAt);
    if ($expiresDate <= $now) {
      log_request('expired', $email, $domain, $token);
      http_response_code(410);
      echo json_encode(['status' => 'error', 'message' => 'Link expired']);
      exit;
    }
  } catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error']);
    exit;
  }
}

$storageDir = __DIR__;
$requestsFile = $storageDir . '/requests.json';
$tokensFile = $storageDir . '/used_tokens.json';

$usedTokens = read_json_array($tokensFile);
if ($token !== '' && in_array($token, $usedTokens, true)) {
  log_request('duplicate', $email, $domain, $token);
  http_response_code(409);
  echo json_encode(['status' => 'error', 'message' => 'Request already submitted']);
  exit;
}

$request = [
  'name' => $name,
  'lastName' => $lastName,
  'middleName' => $middleName,
  'email' => $email,
  'domain' => $domain,
  'token' => $token,
  'expiresAt' => $expiresAt,
  'source' => $source,
  'receivedAt' => $now->format(DateTimeInterface::ATOM)
];

$requests = read_json_array($requestsFile);
$requests[] = $request;
write_json_array($requestsFile, $requests);

if ($token !== '') {
  $usedTokens[] = $token;
  write_json_array($tokensFile, $usedTokens);
}

log_request('ok', $email, $domain, $token);

http_response_code(200);
echo json_encode(['status' => 'ok']);

function read_json_array(string $path): array {
  if (!file_exists($path)) {
    return [];
  }
  $contents = file_get_contents($path);
  $data = json_decode($contents, true);
  return is_array($data) ? $data : [];
}

function write_json_array(string $path, array $data): void {
  file_put_contents(
    $path,
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
  );
}

function log_request(string $result, string $email, string $domain, string $token): void {
  $line = sprintf(
    "%s\t%s\t%s\t%s\t%s\n",
    gmdate('c'),
    $email,
    $domain,
    $token,
    $result
  );
  file_put_contents(__DIR__ . '/requests.log', $line, FILE_APPEND | LOCK_EX);
}
