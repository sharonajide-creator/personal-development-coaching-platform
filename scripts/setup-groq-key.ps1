# Setup helper: stores your Groq API key in .env (the app's secrets file).
# - Typing is hidden (SecureString) and never saved to terminal history.
# - Only run on your own device. Never share the key in chat or email.
# Run: powershell -ExecutionPolicy Bypass -File "scripts\setup-groq-key.ps1"

$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path -LiteralPath $envPath)) {
    Write-Host "ERROR: .env not found." -ForegroundColor Red
    exit 1
}

$secure = Read-Host "Paste your Groq API key here (typing is hidden, press Enter when done)" -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
).Trim()

if ([string]::IsNullOrWhiteSpace($key)) {
    Write-Host "No key entered - nothing changed." -ForegroundColor Yellow
    exit 0
}
if (-not $key.StartsWith("gsk_")) {
    Write-Host "That does not look like a Groq key (they start with gsk_). Nothing changed." -ForegroundColor Yellow
    exit 0
}

$newLine = 'GROQ_API_KEY="' + $key + '"'
$lines = Get-Content -LiteralPath $envPath
$found = $false
$lines = $lines | ForEach-Object {
    if ($_ -match '^\s*GROQ_API_KEY\s*=') { $found = $true; $newLine } else { $_ }
}
if (-not $found) { $lines += $newLine }
Set-Content -LiteralPath $envPath -Value $lines -Encoding Ascii

Write-Host ""
Write-Host "Saved. Tell your assistant 'done'." -ForegroundColor Green
