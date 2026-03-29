CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bricks_detected_count INTEGER NOT NULL DEFAULT 0,
    detected_types JSONB DEFAULT '[]'::jsonb,
    confidence_avg FLOAT DEFAULT 0.0,
    scan_duration_ms INTEGER DEFAULT 0,
    image_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() -- Alias for legacy/standard compatibility
);

-- 2. IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_type TEXT NOT NULL,
    title TEXT,
    source_scans UUID[] DEFAULT '{}'::uuid[],
    timestamp TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() -- Alias
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

-- 5. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_pro BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON public.scans(timestamp desc);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- RLS (Row Level Security) - Admin only for aggregate viewing
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own data
-- Policy: Service Role / Admin can select all (This is handled by Supabase Service Role usually)
