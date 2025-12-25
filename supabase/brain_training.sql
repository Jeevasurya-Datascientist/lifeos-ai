-- Create table for Brain Training Scores
create table if not exists brain_training_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  game_type text not null, -- 'speed_math', 'number_slide'
  score integer not null, -- higher is better for math, undefined for slide? Or maybe time taken?
  metadata jsonb default '{}'::jsonb, -- Store extra info like { time_taken: 30, difficulty: 'hard' }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table brain_training_scores enable row level security;

-- Safe Policy Creation
do $$ 
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'brain_training_scores' and policyname = 'Users can view their own scores') then
    create policy "Users can view their own scores" on brain_training_scores for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'brain_training_scores' and policyname = 'Users can insert their own scores') then
    create policy "Users can insert their own scores" on brain_training_scores for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'brain_training_scores' and policyname = 'Users can delete their own scores') then
    create policy "Users can delete their own scores" on brain_training_scores for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Safe Realtime Publication Add
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'brain_training_scores'
  ) then
    alter publication supabase_realtime add table brain_training_scores;
  end if;
end $$;
