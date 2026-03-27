$task = Get-Content .\task.txt -Raw

Write-Host ">>> Запуск задачи через Codex..."

$output = codex exec `
  --model gpt-5.4 `
  -c 'model_reasoning_effort="medium"' `
  -c 'approval_policy="never"' `
  -c 'sandbox_mode="workspace-write"' `
  $task

Write-Host $output

# ===== Контроль ошибок =====
if ($output -match "error|failed") {
    Write-Host "❌ Ошибка — остановка"
    exit
}

# ===== Git guard =====
$gitStatus = git status --porcelain

if ($gitStatus -ne "") {
    Write-Host "⚠️ Есть изменения в репозитории"
    git status
}