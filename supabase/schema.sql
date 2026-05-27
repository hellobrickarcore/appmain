-- =============================================
-- HelloBrick Supabase Schema
-- Full Phase 1 + Wishlist + Trending support
-- Ready to run in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (Users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- LEGO SETS (Cached + Enriched from Rebrickable)
-- =============================================
CREATE TABLE lego_sets (
  set_num TEXT PRIMARY KEY,                    -- e.g. "10270-1"
  name TEXT NOT NULL,
  year INTEGER,
  theme TEXT,
  subtheme TEXT,
  pieces INTEGER,
  minifigs INTEGER,
  retired BOOLEAN DEFAULT FALSE,
  retirement_date DATE,
  official_image_url TEXT,
  rebrickable_data JSONB,                      -- Full raw data from Rebrickable
  rarity_score INTEGER DEFAULT 50,             -- Our calculated 0-100 score
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lego_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to lego_sets" ON lego_sets
  FOR SELECT USING (true);

-- =============================================
-- PRICE HISTORY (Core valuation data)
-- =============================================
CREATE TABLE price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  set_num TEXT REFERENCES lego_sets(set_num) ON DELETE CASCADE,
  date DATE NOT NULL,
  sealed_value DECIMAL(12,2),
  used_value DECIMAL(12,2),
  average_resale DECIMAL(12,2),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_set_num_date ON price_history(set_num, date DESC);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read price history" ON price_history
  FOR SELECT USING (true);

-- =============================================
-- USER COLLECTIONS
-- =============================================
CREATE TABLE user_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  set_num TEXT REFERENCES lego_sets(set_num) ON DELETE CASCADE,
  condition TEXT CHECK (condition IN ('sealed', 'used', 'opened')),
  quantity INTEGER DEFAULT 1,
  purchase_price DECIMAL(12,2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collection" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- WISHLISTS
-- =============================================
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  set_num TEXT REFERENCES lego_sets(set_num) ON DELETE CASCADE,
  target_price DECIMAL(12,2),
  alert_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_wishlist_user_set ON wishlists(user_id, set_num);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PRICE ALERTS / NOTIFICATIONS
-- =============================================
CREATE TABLE price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  set_num TEXT REFERENCES lego_sets(set_num),
  type TEXT CHECK (type IN ('wishlist', 'collection')),
  threshold_percent DECIMAL(5,2),
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- USER SCANS (History)
-- =============================================
CREATE TABLE user_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  set_num TEXT REFERENCES lego_sets(set_num),
  image_url TEXT,
  gemini_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON user_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON user_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SUBSCRIPTIONS / TRIAL TRACKING (3-day trial)
-- =============================================
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')),
  plan TEXT DEFAULT 'pro' CHECK (plan IN ('free', 'pro')),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Auto-create 3-day trial on signup
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, status, plan, trial_start, trial_end)
  VALUES (NEW.id, 'trialing', 'pro', NOW(), NOW() + INTERVAL '3 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();

-- Timestamp update function + triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lego_sets_updated_at BEFORE UPDATE ON lego_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_lego_sets_retired ON lego_sets(retired);
CREATE INDEX idx_lego_sets_year ON lego_sets(year);
CREATE INDEX idx_lego_sets_theme ON lego_sets(theme);

-- =============================================
-- GLOBAL LEADERBOARDS & GAMIFICATION
-- =============================================

-- New table for leaderboard (anonymized public view)
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,           -- e.g. "BrickBaron87"
  total_value BIGINT NOT NULL,
  growth_percent NUMERIC(5,2),
  rarity_score INT,
  retired_sets_count INT,
  is_public BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  category TEXT DEFAULT 'total_value'   -- biggest_gainer, rarest, etc.
);

-- Materialized view for fast leaderboard queries
CREATE MATERIALIZED VIEW leaderboard_top AS
SELECT 
  rank() OVER (ORDER BY total_value DESC) as rank,
  display_name,
  total_value,
  growth_percent,
  rarity_score,
  retired_sets_count
FROM leaderboard_entries 
WHERE is_public = true
ORDER BY total_value DESC 
LIMIT 50;

-- Trigger to refresh view
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- (Schedule refresh every 5-10 mins in Supabase)

-- Add to user_collections table
ALTER TABLE user_collections 
ADD COLUMN public_on_leaderboard BOOLEAN DEFAULT false,
ADD COLUMN display_name TEXT;

