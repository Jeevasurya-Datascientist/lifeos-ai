-- Create Daily Routines Table
create table if not exists daily_routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text default 'Morning Routine',
  steps jsonb default '[
    {"id": "1", "title": "Drink Water", "duration": 2, "is_completed": false}, 
    {"id": "2", "title": "Stretch / Exercise", "duration": 15, "is_completed": false},
    {"id": "3", "title": "Meditation", "duration": 10, "is_completed": false},
    {"id": "4", "title": "Plan the Day", "duration": 5, "is_completed": false}
  ]'::jsonb,
  alarm_time time,
  is_enabled boolean default false,
  streak_count integer default 0,
  last_completed_at date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table daily_routines enable row level security;

-- Policies
create policy "Users can view own routines" on daily_routines for select using (auth.uid() = user_id);
create policy "Users can insert own routines" on daily_routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines" on daily_routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines" on daily_routines for delete using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table daily_routines;
