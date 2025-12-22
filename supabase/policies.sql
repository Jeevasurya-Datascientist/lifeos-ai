-- ALLOW ANONYMOUS ACCESS (For Mock User to work with Real DB)
-- Since we are using a frontend mock user without a real Supabase session, 
-- we need to allow the 'anon' role (used by the anon_key) to access data.

-- Wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
CREATE POLICY "Allow public access to wallets" ON wallets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to wallets auth" ON wallets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Allow public access to transactions" ON transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to transactions auth" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bills
DROP POLICY IF EXISTS "Users can view own bills" ON bills;
DROP POLICY IF EXISTS "Users can update own bills" ON bills;
DROP POLICY IF EXISTS "Users can insert own bills" ON bills;
CREATE POLICY "Allow public access to bills" ON bills FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to bills auth" ON bills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Allow public access to profiles" ON profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to profiles auth" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Allow public access to settings" ON user_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to settings auth" ON user_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
