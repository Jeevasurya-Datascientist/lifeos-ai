-- Create a table to track user rewards history
create table public.user_rewards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  amount integer not null,
  source text not null, -- e.g., 'game_win', 'streak_bonus'
  description text,
  metadata jsonb default '{}'::jsonb, -- Store game_id, score, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.user_rewards enable row level security;

create policy "Users can view their own rewards"
  on public.user_rewards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rewards (for now, ideally server-side only but ok for MVP)"
  on public.user_rewards for insert
  with check (auth.uid() = user_id);

-- Add total_points column to profiles if not exists
alter table public.profiles add column if not exists total_points integer default 0;

-- Function to update total_points on new reward
create or replace function public.handle_new_reward()
returns trigger as $$
begin
  update public.profiles
  set total_points = coalesce(total_points, 0) + new.amount
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for updating usage
create or replace trigger on_reward_added
  after insert on public.user_rewards
  for each row execute procedure public.handle_new_reward();
