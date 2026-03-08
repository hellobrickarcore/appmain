-- ============================================================
-- Multiplayer & Game History
-- Migration: 003_multiplayer_and_game_history.sql
-- ============================================================

-- Game Lobby for Matchmaking
CREATE TABLE IF NOT EXISTS game_lobby (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mode_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, matched, started, completed, cancelled
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure host can only have one active lobby at a time
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_host_lobby ON game_lobby (host_id) WHERE status IN ('waiting', 'matched', 'started');

-- Battle Results for History
CREATE TABLE IF NOT EXISTS battle_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES game_lobby(id) ON DELETE SET NULL,
  mode_id TEXT NOT NULL,
  
  player_a_id UUID NOT NULL REFERENCES auth.users(id),
  player_b_id UUID REFERENCES auth.users(id), -- Null if solo challenge
  
  winner_id UUID, -- Null if draw
  
  score_a INT DEFAULT 0,
  score_b INT DEFAULT 0,
  
  xp_awarded_a INT DEFAULT 0,
  xp_awarded_b INT DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE game_lobby ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;

-- Lobbies: Everyone can see waiting lobbies, but can only edit their own
CREATE POLICY "game_lobby_read_all" ON game_lobby FOR SELECT USING (true);
CREATE POLICY "game_lobby_insert_own" ON game_lobby FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "game_lobby_update_own" ON game_lobby FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = opponent_id);

-- Battle Results: Users can see their own history
CREATE POLICY "battle_results_read_own" ON battle_results 
  FOR SELECT USING (auth.uid() = player_a_id OR auth.uid() = player_b_id);

-- Helpful views
CREATE OR REPLACE VIEW active_lobbies_count AS
  SELECT mode_id, COUNT(*) as count
  FROM game_lobby
  WHERE status = 'waiting'
  GROUP BY mode_id;
