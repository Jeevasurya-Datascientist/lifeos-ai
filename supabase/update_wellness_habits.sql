-- Update Wellness Schema to support Habits
-- Run this in Supabase SQL Editor

-- 1. Drop existing check constraint if it exists (to allow new types)
ALTER TABLE wellness_entries DROP CONSTRAINT IF EXISTS wellness_entries_type_check;

-- 2. Add new check constraint including 'habit'
ALTER TABLE wellness_entries ADD CONSTRAINT wellness_entries_type_check 
CHECK (type IN ('sleep', 'water', 'habit'));

-- 3. (Optional) If you haven't created the table yet, this script ensures it exists with the correct types effectively.
-- But assuming previous script ran, the above ALTER commands are what's needed.
