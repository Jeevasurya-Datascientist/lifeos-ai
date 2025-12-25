-- Add subscription fields to profiles table
-- Assuming profiles table exists and is linked to auth.users

alter table profiles 
add column if not exists subscription_tier text default 'free',
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists subscription_end_date timestamp with time zone;

-- Optional: Create an enum for tiers if preferred, but text is strictly requested in plan
-- create type subscription_tier_type as enum ('free', 'pro', 'lifetime');
-- alter table profiles alter column subscription_tier type subscription_tier_type using subscription_tier::subscription_tier_type;
