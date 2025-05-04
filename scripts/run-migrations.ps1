# PowerShell script to run Supabase migrations
# Usage: .\scripts\run-migrations.ps1

# Change to the project root directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "Supabase CLI is not installed. Please install it first:"
    Write-Host "npm install -g supabase"
    exit 1
}

# Run migrations
Write-Host "Running Supabase migrations..."
supabase db reset

Write-Host "Migrations complete!"
exit 0 