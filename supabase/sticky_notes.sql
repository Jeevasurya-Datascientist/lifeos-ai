-- Create Sticky Notes Table
create table if not exists sticky_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  content text,
  color text default 'yellow', -- yellow, blue, pink, green, purple
  reminder_at timestamp with time zone,
  is_pinned boolean default false,
  position_x integer default 0, -- For future drag-and-drop
  position_y integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table sticky_notes enable row level security;

-- Policies
create policy "Users can view own notes" on sticky_notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on sticky_notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on sticky_notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on sticky_notes for delete using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table sticky_notes;
