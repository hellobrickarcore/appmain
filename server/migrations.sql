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

-- 6. BLOG POSTS (SEO Engine)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'LEGO Tips',
    author TEXT DEFAULT 'HelloBrick AI',
    status TEXT DEFAULT 'published',
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON public.scans(timestamp desc);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at desc);

-- RLS (Row Level Security)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);

-- Admin Override Policies (Master Access)
CREATE POLICY "Admins can view all scans" ON public.scans FOR SELECT USING (
  auth.jwt() ->> 'email' = 'hellobrickar@gmail.com'
);
CREATE POLICY "Admins can view all ideas" ON public.ideas FOR SELECT USING (
  auth.jwt() ->> 'email' = 'hellobrickar@gmail.com'
);
CREATE POLICY "Admins can view all sessions" ON public.sessions FOR SELECT USING (
  auth.jwt() ->> 'email' = 'hellobrickar@gmail.com'
);
