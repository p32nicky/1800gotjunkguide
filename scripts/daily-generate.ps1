$ErrorActionPreference = "Continue"
$logFile = "C:\1800gotjunksite\scripts\generate.log"

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts $msg" | Tee-Object -FilePath $logFile -Append
}

Log "=== Daily generation started ==="

$before = (Get-ChildItem C:\1800gotjunksite\content\articles -Filter "*.json" | Where-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json; -not $j.error
} | Measure-Object).Count
Log "Articles before: $before"

Set-Location C:\1800gotjunksite

# Delete error files to retry
Get-ChildItem C:\1800gotjunksite\content\articles -Filter "*.json" | ForEach-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json
    if ($j.error) { Remove-Item $_.FullName }
}

npm run generate 2>&1 | Tee-Object -FilePath $logFile -Append

$after = (Get-ChildItem C:\1800gotjunksite\content\articles -Filter "*.json" | Where-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json; -not $j.error
} | Measure-Object).Count

$added = $after - $before
Log "Articles after: $after (added $added)"

if ($added -gt 0) {
    git add content/articles
    git commit -m "Daily auto-generate: +$added articles ($after total)"
    git push
    Log "Pushed to GitHub - Vercel redeploying"
} else {
    Log "No new articles"
}

Log "=== Done ==="
