$env:DB_HOST     = "127.0.0.1"
$env:DB_NAME     = "akash_automobile"
$env:DB_USER     = "root"
$env:DB_PASSWORD = "sujeet8185"
$env:DEBUG       = "True"
$env:ALLOWED_HOSTS = "localhost,127.0.0.1"

$python = "$PSScriptRoot\.venv\Scripts\python.exe"

Write-Host "Using Python: $python" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
& $python manage.py runserver
