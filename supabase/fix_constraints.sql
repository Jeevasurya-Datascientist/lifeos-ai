-- COMPREHENSIVE FIX FOR MOCK USER & CONSTRAINTS
-- Execute this entirely in Supabase SQL Editor

BEGIN;

-- 1. DROP CONSTRAINTS (Allow Tables to accept Mock User ID)
-- We remove the link to auth.users so we can insert our fake '1111...' ID
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey; -- Just in case of different naming

-- 2. INSERT MOCK PROFILE (Critical: Must exist before Wallet)
INSERT INTO profiles (id, phone, language)
VALUES (
    '11111111-1111-4111-8111-111111111111', 
    '+919999999999',
    'en'
)
ON CONFLICT (id) DO UPDATE 
SET phone = '+919999999999';

-- 3. INSERT MOCK WALLET (After Profile exists)
INSERT INTO wallets (user_id, balance)
VALUES ('11111111-1111-4111-8111-111111111111', 5000.00)
ON CONFLICT (user_id) DO UPDATE 
SET balance = 5000.00;

-- 4. INSERT MOCK SETTINGS
INSERT INTO user_settings (user_id, currency, notifications_enabled)
VALUES ('11111111-1111-4111-8111-111111111111', 'INR', true)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- VERIFICATION
SELECT * FROM wallets WHERE user_id = '11111111-1111-4111-8111-111111111111';
