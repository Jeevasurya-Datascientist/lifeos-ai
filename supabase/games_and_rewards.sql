-- 1. Create brain_training_scores table
create table if not exists public.brain_training_scores (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    game_type text not null, -- e.g., 'snake', '2048'
    score integer not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for scores
alter table public.brain_training_scores enable row level security;

drop policy if exists "Users can view their own scores" on public.brain_training_scores;
create policy "Users can view their own scores"
    on public.brain_training_scores for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert their own scores" on public.brain_training_scores;
create policy "Users can insert their own scores"
    on public.brain_training_scores for insert
    with check (auth.uid() = user_id);

-- 2. Create user_rewards table
create table if not exists public.user_rewards (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    amount integer not null,
    source text not null, -- e.g., 'game_snake', 'daily_login'
    description text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for rewards
alter table public.user_rewards enable row level security;

drop policy if exists "Users can view their own rewards" on public.user_rewards;
create policy "Users can view their own rewards"
    on public.user_rewards for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert their own rewards" on public.user_rewards;
create policy "Users can insert their own rewards"
    on public.user_rewards for insert
    with check (auth.uid() = user_id);

-- 3. Add total_points to profiles if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'total_points') then
        alter table public.profiles add column total_points integer default 0;
    end if;
end $$;

-- 4. Trigger to update total_points in profiles
create or replace function public.handle_new_reward()
returns trigger as $$
begin
  update public.profiles
  set total_points = coalesce(total_points, 0) + new.amount
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid conflicts
drop trigger if exists on_reward_added on public.user_rewards;

create trigger on_reward_added
  after insert on public.user_rewards
  for each row execute procedure public.handle_new_reward();

