-- Create Bill Reminders Table
create table if not exists public.bill_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null, -- 'Mobile Prepaid', 'Electricity', 'Credit Card', etc.
  biller_name text not null,
  amount numeric,
  due_date date,
  frequency text default 'monthly', -- 'once', 'monthly', 'yearly'
  auto_pay boolean default false,
  identifier text, -- Consumer No, Mobile No
  last_paid_at timestamptz,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.bill_reminders enable row level security;

create policy "Users can view their own bill reminders"
  on public.bill_reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bill reminders"
  on public.bill_reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bill reminders"
  on public.bill_reminders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bill reminders"
  on public.bill_reminders for delete
  using (auth.uid() = user_id);
