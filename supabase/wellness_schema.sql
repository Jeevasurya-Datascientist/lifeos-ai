-- Create Wellness Entries Table for Cloud Backup
create table if not exists wellness_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  type text not null check (type in ('sleep', 'water', 'habit', 'mood')),
  value numeric not null, -- Duration in minutes (sleep) or Amount in ml (water)
  metadata jsonb default '{}'::jsonb, -- Stores start/end times for sleep
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table wellness_entries enable row level security;

-- Policies
create policy "Users can view own wellness entries" on wellness_entries for select using (auth.uid() = user_id);
create policy "Users can insert own wellness entries" on wellness_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own wellness entries" on wellness_entries for update using (auth.uid() = user_id);

-- Allow Mock User Access (for development)
create policy "Allow public access to wellness" on wellness_entries for all using (true) with check (true);
