-- Create Journal Entries Table
create table if not exists journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  date date not null,
  content text,
  mood text, -- 'happy', 'sad', 'neutral', 'energetic', 'tired'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date) -- One entry per day per user
);

-- Enable RLS
alter table journal_entries enable row level security;

-- Policies
create policy "Users can view own journal entries" on journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries" on journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own journal entries" on journal_entries for update using (auth.uid() = user_id);
create policy "Users can delete own journal entries" on journal_entries for delete using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table journal_entries;
