-- HelloBrick: Supabase Database Schema - Insights Tab Overhaul
-- Designed for high-fidelity market intelligence, collector rankings, and real-time ROI tracking.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Catalog (LEGO Items master index)
CREATE TABLE IF NOT EXISTS lego_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE,                 -- Rebrickable / BrickLink ID
    item_type TEXT NOT NULL CHECK (item_type IN ('set', 'minifig', 'moc', 'part')),
    name TEXT NOT NULL,
    theme TEXT,
    subtheme TEXT,
    year_released INTEGER,
    retired BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    bricklink_id TEXT,
    rebrickable_id TEXT
);

-- 2. User Collection (What individual users actually own in their digital vault)
CREATE TABLE IF NOT EXISTS user_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES lego_items(id),
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'new',           -- new, used, sealed, incomplete
    purchase_price DECIMAL(10,2),
    acquired_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Market & Demand Intelligence (Core dataset for HelloBrick portfolio insights)
CREATE TABLE IF NOT EXISTS market_demand (
    item_id UUID PRIMARY KEY REFERENCES lego_items(id),
    
    bricklink_demand_score INT CHECK (bricklink_demand_score BETWEEN 1 AND 100), -- 85+ = very high demand
    bricklink_avg_sold_price DECIMAL(12,2),
    bricklink_monthly_volume INT,
    
    general_demand_score INT CHECK (general_demand_score BETWEEN 1 AND 100),     -- search volume, social sentiment, etc.
    moc_demand_score INT,                                                       -- popular MOC build interest score
    
    price_trend TEXT,                                                           -- 'strongly_rising', 'peaking', 'stable', 'declining'
    price_change_30d DECIMAL(5,2),                                              -- percentage growth/decline
    estimated_markup_potential DECIMAL(5,2),                                    -- profit potential percentage (e.g. 47%)
    
    last_updated TIMESTAMP DEFAULT NOW()
);

-- 4. Personalized Insights (Primary data source for the Insights tab)
CREATE TABLE IF NOT EXISTS user_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES lego_items(id),
    
    insight_type TEXT NOT NULL,              -- 'sell_high', 'high_demand_hold', 'hot_minifig', 'moc_opportunity'
    
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    
    confidence DECIMAL(3,2),                 -- AI prediction confidence score (e.g. 0.92)
    potential_profit DECIMAL(10,2),          -- estimated dollar gain potential
    action_recommended TEXT,                 -- 'Sell Now', 'Hold & Monitor', 'List on BrickLink'
    
    reason TEXT,                             -- "This minifig has 94/100 BrickLink demand + 38% price surge"
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,                    -- Auto-expiration threshold
    is_read BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 1                   -- 1 = urgent (sell now), 2 = important
);

-- 5. Summary Cache (For ultra-fast loading of the Insights dashboard metrics)
CREATE TABLE IF NOT EXISTS user_insight_summary (
    user_id UUID PRIMARY KEY,
    total_collection_value DECIMAL(12,2),
    sell_opportunities INTEGER DEFAULT 0,
    high_demand_items INTEGER DEFAULT 0,
    total_potential_profit DECIMAL(12,2),
    last_analyzed_at TIMESTAMP,
    next_analysis_scheduled TIMESTAMP
);

-- 6. Recommended High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_insights_user ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_type ON user_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_market_demand_score ON market_demand(bricklink_demand_score DESC);
