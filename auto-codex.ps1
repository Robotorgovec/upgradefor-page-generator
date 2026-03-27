# ===== CONFIG =====
$ErrorActionPreference = "Stop"

# Запрещённые пути/файлы (расширяй под UPGR)
$forbidden = @(
  "app\layout.tsx",
  "app\layout.ts",
  "public\layout.css",
  ".env",
  "prisma\schema.prisma"
)

# ===== PRE-CHECKS =====
Write-Host ">>> Pre-checks..."

# 1) Чистота git (никаких незакоммиченных изменений)
$gitStatusRaw = git status --porcelain 2>$null

$gitStatus = ""
if ($null -ne $gitStatusRaw) {
  $gitStatus = ($gitStatusRaw | Out-String).Trim()
}

if (-not [string]::IsNullOrWhiteSpace($gitStatus)) {
  Write-Host "❌ Repo dirty. Сначала закоммить изменения."
  git status
  exit 1
}

# 2) Есть ли задача
if (-not (Test-Path .\task.txt)) {
  Write-Host "❌ Нет task.txt"
  exit 1
}

$task = Get-Content .\task.txt -Raw
if ([string]::IsNullOrWhiteSpace($task)) {
  Write-Host "❌ task.txt пуст"
  exit 1
}

# ===== EXEC =====
Write-Host ">>> Codex exec..."
$output = codex exec `
  --model gpt-5.4 `
  -c 'model_reasoning_effort="medium"' `
  -c 'approval_policy="never"' `
  -c 'sandbox_mode="workspace-write"' `
  $task

Write-Host $output

# ===== POST-CHECKS =====
# 3) Ошибки в выводе
if ($output -match "error|failed") {
  Write-Host "❌ Ошибка в выполнении — остановка"
  exit 1
}

# 4) Проверка запрещённых путей (по изменённым файлам)
$changedRaw = git status --porcelain 2>$null
$changed = @()

if ($null -ne $changedRaw) {
  $changed = $changedRaw | ForEach-Object {
    if ($_.Length -ge 4) { $_.Substring(3) }
  }
}

foreach ($f in $changed) {
  foreach ($rule in $forbidden) {
    if ($f -like "*$rule*") {
      Write-Host "❌ Изменён запрещённый путь: $f"
      exit 1
    }
  }
}

# ===== COMMIT =====
# 5) Авто-коммит (только если есть изменения)
$gitStatusAfterRaw = git status --porcelain 2>$null
$gitStatusAfter = ""

if ($null -ne $gitStatusAfterRaw) {
  $gitStatusAfter = ($gitStatusAfterRaw | Out-String).Trim()
}

if (-not [string]::IsNullOrWhiteSpace($gitStatusAfter)) {
  git add .
  $msg = "codex: " + ($task.Substring(0, [Math]::Min(80, $task.Length)))
  git commit -m $msg
  Write-Host "✅ Commit создан"
} else {
  Write-Host "ℹ️ Нет изменений для коммита"
}

Write-Host ">>> Done"