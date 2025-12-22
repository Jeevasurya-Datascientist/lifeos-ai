-- Ensure user_settings table exists
create table if not exists user_settings (
  user_id uuid references profiles(id) not null primary key,
  notifications_enabled boolean default true,
  currency text default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add monthly_budget column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'monthly_budget') then
    alter table user_settings add column monthly_budget numeric default 0;
  end if;
end $$;

-- Enable RLS (idempotent)
alter table user_settings enable row level security;

-- Ensure policy exists (drop and recreate to be safe)
drop policy if exists "Users can view own settings" on user_settings;
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on user_settings;
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on user_settings;
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
