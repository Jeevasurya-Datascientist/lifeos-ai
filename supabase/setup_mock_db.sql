-- IMPORTANT: RUN THIS SCRIPT IN SUPABASE SQL EDITOR
-- This fixes the "foreign key violation" by creating the missing Mock Profile checks.

BEGIN;

-- 1. Allow Profiles to exist without a real Auth User (Remove FK constraint)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Create the Mock Profile (Matching our ID in AuthContext)
INSERT INTO profiles (id, phone, role, created_at, updated_at)
VALUES (
    '11111111-1111-4111-8111-111111111111', 
    '+919999999999', 
    'authenticated',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create a Default Wallet for this user to prevent 404s
INSERT INTO wallets (user_id, balance)
VALUES ('11111111-1111-4111-8111-111111111111', 5000.00)
ON CONFLICT (user_id) DO UPDATE SET balance = 5000.00;

COMMIT;
