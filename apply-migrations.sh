#!/bin/bash

# Apply the latest migrations to Supabase project
echo "Applying latest migrations to Supabase project..."

# Check if Supabase CLI is installed
if ! [ -x "$(command -v supabase)" ]; then
  echo "Error: Supabase CLI is not installed. Please install it first."
  echo "Visit https://supabase.com/docs/guides/cli/getting-started for installation instructions."
  exit 1
fi

# Apply migrations
echo "Applying payment system migration..."
supabase db push --debug src/utils/supabase/migrations/20240930000001_update_payment_system.sql

echo "Applying coach management migration..."
supabase db push --debug src/utils/supabase/migrations/20240930000002_update_coach_management.sql

echo "Migrations completed successfully!"
echo "Your database schema should now be in sync with your code implementation." 