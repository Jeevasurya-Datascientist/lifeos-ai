-- Enable Realtime for wellness_entries AND transactions
-- This must be run in the Supabase SQL Editor
BEGIN;

-- Add tables to the publication
-- Note: It's safe to run this even if they are already added, though it might throw a harmless warning or duplicate.
-- To be safe, we try to create publication if not exists, or alter it.
-- But standard 'alter publication add table' is robust enough for this context.

alter publication supabase_realtime add table wellness_entries;
alter publication supabase_realtime add table transactions;

COMMIT;
