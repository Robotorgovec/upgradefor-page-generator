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

$wrappedTask = @"
You are working inside the repository upgradefor-page-generator.

Mandatory rules:
1. Complete only the requested task.
2. Do not modify forbidden/global files.
3. Keep changes minimal and scoped.
4. If the task is already satisfied, do not make unnecessary edits.
5. Stop after completion. Do not continue expanding scope.

Task:
$task
"@

$output = $wrappedTask | codex exec `
  --model gpt-5.4 `
  -c 'model_reasoning_effort="medium"' `
  -c 'approval_policy="never"' `
  -c 'sandbox_mode="workspace-write"'

Write-Host $output

# ===== POST-CHECKS =====
# 3) Ошибки в выводе
if ($output -match "error|failed|unexpected argument") {
  Write-Host "❌ Ошибка в выполнении — остановка"
  exit 1
}

# 4) Проверка запрещённых путей (по изменённым файлам)
$changedRaw = git status --porcelain 2>$null
$changed = @()

if ($null -ne $changedRaw) {
  $changed = $changedRaw | ForEach-Object {
    if ($_.Length -ge 4) { $_.Substring(3).Trim() }
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