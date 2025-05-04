#!/bin/bash

# Run Supabase migrations
# Usage: ./scripts/run-migrations.sh

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Run migrations
echo "Running Supabase migrations..."
supabase db reset

echo "Migrations complete!"
exit 0 