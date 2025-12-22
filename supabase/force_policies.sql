-- FORCE OPEN POLICIES (Development Mode)
-- This script proactively drops existing restrictive policies and creates permissive ones.

BEGIN;

-- 1. WALLETS
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Allow public access to wallets" ON wallets;
CREATE POLICY "Public Access Wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 2. TRANSACTIONS
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Allow public access to transactions" ON transactions;
CREATE POLICY "Public Access Transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. BILLS
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own bills" ON bills;
DROP POLICY IF EXISTS "Allow public access to bills" ON bills;
CREATE POLICY "Public Access Bills" ON bills FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- 4. PROFILES
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public access to profiles" ON profiles;
CREATE POLICY "Public Access Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

COMMIT;
