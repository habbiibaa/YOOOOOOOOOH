-- First drop foreign keys that reference users.id
ALTER TABLE IF EXISTS coaches DROP CONSTRAINT IF EXISTS coaches_id_fkey;
ALTER TABLE IF EXISTS player_videos DROP CONSTRAINT IF EXISTS player_videos_user_id_fkey;
ALTER TABLE IF EXISTS players DROP CONSTRAINT IF EXISTS players_id_fkey;
ALTER TABLE IF EXISTS coach_schedules DROP CONSTRAINT IF EXISTS coach_schedules_coach_id_fkey;
ALTER TABLE IF EXISTS coach_sessions DROP CONSTRAINT IF EXISTS coach_sessions_coach_id_fkey;
ALTER TABLE IF EXISTS coach_sessions DROP CONSTRAINT IF EXISTS coach_sessions_player_id_fkey;
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_level_confirmed_by_fkey;

-- Drop the primary key constraint
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_pkey;

-- Re-add the primary key constraint
ALTER TABLE users ADD PRIMARY KEY (id);

-- Recreate foreign key constraints
ALTER TABLE IF EXISTS coaches 
  ADD CONSTRAINT coaches_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS player_videos 
  ADD CONSTRAINT player_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS players 
  ADD CONSTRAINT players_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS coach_schedules 
  ADD CONSTRAINT coach_schedules_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS coach_sessions 
  ADD CONSTRAINT coach_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS coach_sessions 
  ADD CONSTRAINT coach_sessions_player_id_fkey FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS users 
  ADD CONSTRAINT users_level_confirmed_by_fkey FOREIGN KEY (level_confirmed_by) REFERENCES users(id) ON DELETE SET NULL;