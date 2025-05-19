@echo off
echo Running database migrations...

REM Get environment variables from .env.local
for /f "tokens=1,* delims==" %%a in (.env.local) do (
  if not "%%a"=="" if not "%%a:~0,1%"=="#" (
    set "%%a=%%b"
  )
)

REM Check if supabase URL and key are set
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
  echo ERROR: NEXT_PUBLIC_SUPABASE_URL not set in .env.local
  exit /b 1
)

if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
  echo ERROR: SUPABASE_SERVICE_ROLE_KEY not set in .env.local
  exit /b 1
)

echo Running fix coach relationships migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240621000000_fix_coach_relationships.sql"

REM Run SQL migrations in order
echo Running initial schema migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240710000001_initial_schema.sql"

echo Running coach data migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240720000002_add_coach_data.sql"

echo Running branch tables migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240901000001_add_branch_tables.sql"

echo Running coaches and schedules migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240910000001_add_coaches_and_schedules.sql"

echo Running coach management migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240930000002_update_coach_management.sql"

echo Running admin user management migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240930000003_admin_user_management.sql"

echo Running regenerate coach sessions migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240930000004_regenerate_coach_sessions.sql"

echo Running admin impersonation migration...
curl -X POST "%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/pgmigrate_sql" ^
  -H "apikey: %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @"src/utils/supabase/migrations/20240930000005_admin_impersonation.sql"

echo.
echo Migrations complete! 
echo You can now run 'npm run dev' to start the application.
pause 