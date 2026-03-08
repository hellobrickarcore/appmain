-- ============================================================
-- HelloBrick Semantic Truth Layer
-- Migration: 002_semantic_truth_layer.sql
-- ============================================================

-- 1) REVISED FRAME DETECTIONS
-- We drop and recreate to ensure multi-channel confidence structure
DROP TABLE IF EXISTS public.frame_detections CASCADE;

CREATE TABLE public.frame_detections (
  id uuid primary key default gen_random_uuid(),
  scan_frame_id uuid not null references public.scan_frames(id) on delete cascade,
  detection_index int not null,

  track_id text,

  geometry_type text not null 
    check (geometry_type in ('bbox_xyxy', 'polygon', 'mask')),

  bbox_x_min numeric not null,
  bbox_y_min numeric not null,
  bbox_x_max numeric not null,
  bbox_y_max numeric not null,

  polygon jsonb,
  segmentation_rle jsonb,

  geometry_confidence numeric not null
    check (geometry_confidence >= 0 and geometry_confidence <= 1),

  raw_model_class text,
  raw_model_confidence numeric
    check (raw_model_confidence is null or (raw_model_confidence >= 0 and raw_model_confidence <= 1)),

  predicted_brick_part_id uuid references public.brick_parts(id),
  predicted_brick_color_id uuid references public.brick_colors(id),

  identity_confidence numeric
    check (identity_confidence is null or (identity_confidence >= 0 and identity_confidence <= 1)),

  color_confidence numeric
    check (color_confidence is null or (color_confidence >= 0 and color_confidence <= 1)),

  stud_count_estimate int,
  stud_count_confidence numeric
    check (stud_count_confidence is null or (stud_count_confidence >= 0 and stud_count_confidence <= 1)),

  pose_angle_deg numeric,
  aspect_ratio numeric,

  lighting_score numeric,
  blur_score numeric,
  occlusion_score numeric,

  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'accepted', 'corrected', 'rejected', 'ambiguous')),

  created_at timestamptz not null default now(),

  unique(scan_frame_id, detection_index),

  check (bbox_x_max > bbox_x_min),
  check (bbox_y_max > bbox_y_min)
);

-- 2) REVISED DETECTION CANDIDATES
DROP TABLE IF EXISTS public.detection_candidates CASCADE;

CREATE TABLE public.detection_candidates (
  id uuid primary key default gen_random_uuid(),
  frame_detection_id uuid not null references public.frame_detections(id) on delete cascade,

  candidate_brick_part_id uuid references public.brick_parts(id),
  candidate_brick_color_id uuid references public.brick_colors(id),

  candidate_part_num text,
  candidate_color_name text,

  rank int not null check (rank > 0),
  identity_confidence numeric not null
    check (identity_confidence >= 0 and identity_confidence <= 1),

  color_confidence numeric
    check (color_confidence is null or (color_confidence >= 0 and color_confidence <= 1)),

  reason_codes text[] default '{}',

  unique(frame_detection_id, rank)
);

-- 3) REVISED TRACKED OBJECTS
DROP TABLE IF EXISTS public.tracked_objects CASCADE;

CREATE TABLE public.tracked_objects (
  id uuid primary key default gen_random_uuid(),
  scan_session_id uuid not null references public.scan_sessions(id) on delete cascade,
  track_id text not null,

  status text not null default 'active'
    check (status in ('active', 'stable', 'ambiguous', 'finalized', 'dropped')),

  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  total_frames_seen int not null default 1 check (total_frames_seen > 0),

  stable_bbox_x_min numeric,
  stable_bbox_y_min numeric,
  stable_bbox_x_max numeric,
  stable_bbox_y_max numeric,
  stable_polygon jsonb,

  geometry_confidence numeric
    check (geometry_confidence is null or (geometry_confidence >= 0 and geometry_confidence <= 1)),

  consensus_brick_part_id uuid references public.brick_parts(id),
  consensus_brick_color_id uuid references public.brick_colors(id),

  identity_confidence numeric
    check (identity_confidence is null or (identity_confidence >= 0 and identity_confidence <= 1)),
  color_confidence numeric
    check (color_confidence is null or (color_confidence >= 0 and color_confidence <= 1)),

  stud_count_consensus int,
  stud_count_confidence numeric
    check (stud_count_confidence is null or (stud_count_confidence >= 0 and stud_count_confidence <= 1)),

  label_display_status text not null default 'hidden'
    check (label_display_status in ('hidden', 'tentative', 'confirmed', 'needs_review')),

  promoted_to_collection boolean not null default false,
  promoted_collection_item_id uuid references public.collection_items(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(scan_session_id, track_id)
);

-- 4) BRICK SHAPE SIGNATURES
CREATE TABLE IF NOT EXISTS public.brick_shape_signatures (
  id uuid primary key default gen_random_uuid(),
  brick_part_id uuid not null references public.brick_parts(id) on delete cascade,

  studs_x int,
  studs_y int,
  stud_count int,

  expected_aspect_ratio numeric,
  aspect_ratio_tolerance numeric,

  rectangularity_min numeric,
  contour_vertices_expected int,

  is_plate boolean,
  is_brick boolean,
  is_tile boolean,

  notes text,
  created_at timestamptz not null default now(),

  unique(brick_part_id)
);

-- 5) BRICK COLOR PROFILES
CREATE TABLE IF NOT EXISTS public.brick_color_profiles (
  id uuid primary key default gen_random_uuid(),
  brick_color_id uuid not null references public.brick_colors(id) on delete cascade,

  lab_l numeric not null,
  lab_a numeric not null,
  lab_b numeric not null,

  delta_e_threshold numeric not null default 12.0,
  low_light_l_min numeric,
  highlight_clip_threshold numeric,

  created_at timestamptz not null default now(),

  unique(brick_color_id)
);

-- 6) TRACKED OBJECT VOTES
CREATE TABLE IF NOT EXISTS public.tracked_object_votes (
  id uuid primary key default gen_random_uuid(),
  tracked_object_id uuid not null references public.tracked_objects(id) on delete cascade,
  frame_detection_id uuid not null references public.frame_detections(id) on delete cascade,

  voted_brick_part_id uuid references public.brick_parts(id),
  voted_brick_color_id uuid references public.brick_colors(id),

  identity_confidence numeric,
  color_confidence numeric,

  created_at timestamptz not null default now(),

  unique(tracked_object_id, frame_detection_id)
);

-- 7) LABEL CORRECTIONS
CREATE TABLE IF NOT EXISTS public.label_corrections (
  id uuid primary key default gen_random_uuid(),
  tracked_object_id uuid references public.tracked_objects(id) on delete cascade,
  frame_detection_id uuid references public.frame_detections(id) on delete cascade,

  original_brick_part_id uuid references public.brick_parts(id),
  corrected_brick_part_id uuid references public.brick_parts(id),

  original_brick_color_id uuid references public.brick_colors(id),
  corrected_brick_color_id uuid references public.brick_colors(id),

  correction_source text not null
    check (correction_source in ('user', 'admin', 'reviewer', 'auto_rule')),

  reason text,
  created_at timestamptz not null default now()
);

-- 8) BRICK IDENTITY RULES
CREATE TABLE IF NOT EXISTS public.brick_identity_rules (
  id uuid primary key default gen_random_uuid(),
  brick_part_id uuid not null references public.brick_parts(id) on delete cascade,

  min_stud_count int,
  max_stud_count int,

  min_aspect_ratio numeric,
  max_aspect_ratio numeric,

  allowed_categories text[] default '{}',

  created_at timestamptz not null default now()
);

-- 9) COLLECTION ITEMS ENHANCEMENTS
ALTER TABLE public.collection_items
ADD COLUMN IF NOT EXISTS source_tracked_object_id uuid references public.tracked_objects(id),
ADD COLUMN IF NOT EXISTS identity_confidence numeric,
ADD COLUMN IF NOT EXISTS color_confidence numeric,
ADD COLUMN IF NOT EXISTS geometry_confidence numeric;

-- 10) RLS POLICIES FOR NEW TABLES
ALTER TABLE public.brick_shape_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_color_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_object_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_identity_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brick_shape_signatures_read" ON public.brick_shape_signatures FOR SELECT USING (true);
CREATE POLICY "brick_color_profiles_read" ON public.brick_color_profiles FOR SELECT USING (true);
CREATE POLICY "brick_identity_rules_read" ON public.brick_identity_rules FOR SELECT USING (true);

-- User-scoped policies for votes and corrections
CREATE POLICY "tracked_object_votes_own" ON public.tracked_object_votes
  FOR ALL USING (
    tracked_object_id IN (
      SELECT to2.id FROM public.tracked_objects to2
      JOIN public.scan_sessions ss ON to2.scan_session_id = ss.id
      WHERE ss.user_id = auth.uid()
    )
  );

CREATE POLICY "label_corrections_own" ON public.label_corrections
  FOR ALL USING (
    tracked_object_id IN (
      SELECT to2.id FROM public.tracked_objects to2
      JOIN public.scan_sessions ss ON to2.scan_session_id = ss.id
      WHERE ss.user_id = auth.uid()
    )
  );
