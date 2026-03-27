-- 1. SCANS TABLE (The Data Moat)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bricks_detected_count INTEGER NOT NULL DEFAULT 0,
    detected_types JSONB DEFAULT '[]'::jsonb, -- Store list of part numbers/names
    confidence_avg FLOAT DEFAULT 0.0,
    scan_duration_ms INTEGER DEFAULT 0,
    image_url TEXT, -- Optional: link to the scan evidence
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 2. IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_type TEXT NOT NULL, -- 'MINI', 'MASTER', 'MOC'
    title TEXT,
    source_scans UUID[] DEFAULT '{}'::uuid[], -- References to scan IDs that enabled this idea
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 3. SESSIONS TABLE (Retention Tracking)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    platform TEXT, -- 'ios', 'android'
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    scans_count INTEGER DEFAULT 0
);

-- 4. REVIEW_EVENTS (Feedback Log)
CREATE TABLE IF NOT EXISTS public.review_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    is_positive BOOLEAN GENERATED ALWAYS AS (rating >= 4) STORED,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON public.scans(timestamp desc);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- RLS (Row Level Security) - Admin only for aggregate viewing
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own data
-- Policy: Service Role / Admin can select all (This is handled by Supabase Service Role usually)
