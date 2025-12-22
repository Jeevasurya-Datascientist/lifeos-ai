alter table user_settings 
add column if not exists monthly_budget numeric default 0;
