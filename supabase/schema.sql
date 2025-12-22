-- USERS & PROFILES
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  phone text,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists user_settings (
  user_id uuid references profiles(id) not null primary key,
  notifications_enabled boolean default true,
  currency text default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists onboarding_responses (
  user_id uuid references profiles(id) not null primary key,
  income_range text,
  fixed_expenses text,
  biggest_stress text,
  monthly_goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FINANCIAL CORE
create table if not exists wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  balance numeric default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  description text,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists bills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  amount numeric not null,
  due_date date not null,
  is_paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table user_settings enable row level security;
alter table onboarding_responses enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table bills enable row level security;

-- POLICIES
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);

create policy "Users can view own onboarding" on onboarding_responses for select using (auth.uid() = user_id);
create policy "Users can insert own onboarding" on onboarding_responses for insert with check (auth.uid() = user_id);

create policy "Users can view own wallet" on wallets for select using (auth.uid() = user_id);
create policy "Users can update own wallet" on wallets for update using (auth.uid() = user_id);
create policy "Users can insert own wallet" on wallets for insert with check (auth.uid() = user_id);

create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);

create policy "Users can view own bills" on bills for select using (auth.uid() = user_id);
create policy "Users can update own bills" on bills for update using (auth.uid() = user_id);
create policy "Users can insert own bills" on bills for insert with check (auth.uid() = user_id);

-- TRIGGERS
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
