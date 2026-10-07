# Setup helper: writes DATABASE_URL in .env (the app's secrets file).
# - Password typing is hidden (SecureString) and never saved to terminal history.
# - Only run on your own device. Never share passwords in chat or email.
# Run: powershell -ExecutionPolicy Bypass -File "scripts\setup-db-url.ps1"
# First: in pgAdmin, make sure role pdc_user exists (Can Login) with a password
# you chose, and database pdc exists (owner pdc_user is simplest for local dev).

$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path -LiteralPath $envPath)) {
    Write-Host "ERROR: .env not found." -ForegroundColor Red
    exit 1
}

$dbUser = Read-Host "DB user [pdc_user]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "pdc_user" }
$dbName = Read-Host "DB name [pdc]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "pdc" }
$secure = Read-Host "Password for role $dbUser (typing is hidden)" -AsSecureString
$pw = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
).Trim()

if ([string]::IsNullOrWhiteSpace($pw)) {
    Write-Host "No password entered - nothing changed." -ForegroundColor Yellow
    exit 0
}

$enc = [Uri]::EscapeDataString($pw)
$newLine = 'DATABASE_URL="postgresql://' + $dbUser + ':' + $enc + '@localhost:5432/' + $dbName + '"'
$lines = Get-Content -LiteralPath $envPath
$found = $false
$lines = $lines | ForEach-Object {
    if ($_ -match '^\s*DATABASE_URL\s*=') { $found = $true; $newLine } else { $_ }
}
if (-not $found) { $lines += $newLine }
Set-Content -LiteralPath $envPath -Value $lines -Encoding Ascii

Write-Host ""
Write-Host "Saved. Tell your assistant 'done' so it can test the connection." -ForegroundColor Green
