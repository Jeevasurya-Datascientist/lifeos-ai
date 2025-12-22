-- Update check constraint for wellness_entries type to include 'mood'
alter table wellness_entries drop constraint if exists wellness_entries_type_check;

alter table wellness_entries 
  add constraint wellness_entries_type_check 
  check (type in ('sleep', 'water', 'habit', 'mood'));
