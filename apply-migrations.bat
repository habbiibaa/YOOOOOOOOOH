@echo off
echo Applying latest migrations to Supabase project...

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: Supabase CLI is not installed. Please install it first.
  echo Visit https://supabase.com/docs/guides/cli/getting-started for installation instructions.
  exit /b 1
)

REM Apply migrations
echo Applying payment system migration...
supabase db push --debug src/utils/supabase/migrations/20240930000001_update_payment_system.sql

echo Applying coach management migration...
supabase db push --debug src/utils/supabase/migrations/20240930000002_update_coach_management.sql

echo Migrations completed successfully!
echo Your database schema should now be in sync with your code implementation.
pause 
@echo off
echo Applying latest migrations to Supabase project...

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: Supabase CLI is not installed. Please install it first.
  echo Visit https://supabase.com/docs/guides/cli/getting-started for installation instructions.
  exit /b 1
)

REM Apply migrations
echo Applying payment system migration...
supabase db push --debug src/utils/supabase/migrations/20240930000001_update_payment_system.sql

echo Applying coach management migration...
supabase db push --debug src/utils/supabase/migrations/20240930000002_update_coach_management.sql

echo Migrations completed successfully!
echo Your database schema should now be in sync with your code implementation.
pause 