# Database Migrations

This directory contains SQL migration files for the Squash Academy booking system.

## Recent Migrations

### 20240930000001_update_payment_system.sql
This migration ensures the database structure properly supports the payment system:
- Adds additional fields to the payments table
- Sets default price for coach sessions
- Creates triggers for handling expired reservations
- Implements Row Level Security policies for payments and bookings

### 20240930000002_update_coach_management.sql
This migration updates database structures for coach approval and schedule management:
- Ensures the approved column exists for coaches
- Creates functions for approving and rejecting coaches
- Adds required fields for tracking coach schedule changes
- Implements Row Level Security policies for coach schedules
- Creates a trigger to regenerate coach sessions when schedules are updated

## How to Apply Migrations

### Using the Supabase CLI
1. Make sure you have the Supabase CLI installed
2. Run the following commands:
   ```
   supabase db push --debug src/utils/supabase/migrations/20240930000001_update_payment_system.sql
   supabase db push --debug src/utils/supabase/migrations/20240930000002_update_coach_management.sql
   ```

### Using the Batch Script (Windows)
Simply run the `apply-migrations.bat` file in the root directory.

## Previous Migrations

The previous migrations include setup for:
- User authentication and profiles
- Coach and schedule management
- Session booking system
- Various fixes and improvements to these systems 