-- ============================================================
-- HelloBrick Unified Detection Schema
-- Migration: 001_unified_schema.sql
-- Run in Supabase SQL Editor
-- ============================================================

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 1) BRICK CATALOG TABLES                                     │
-- └──────────────────────────────────────────────────────────────┘

-- Canonical LEGO part master
CREATE TABLE IF NOT EXISTS brick_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lego_part_num TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  category TEXT,
  dimensions_x INT,          -- studs wide
  dimensions_y INT,          -- studs long
  dimensions_z NUMERIC,      -- height (optional)
  has_studs BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternate names, dataset class names, historical mappings
CREATE TABLE IF NOT EXISTS brick_part_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brick_part_id UUID NOT NULL REFERENCES brick_parts(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_type TEXT NOT NULL,  -- 'dataset_class', 'legacy_name', 'manual'
  UNIQUE(brick_part_id, alias)
);

-- Canonical color master with LAB values
CREATE TABLE IF NOT EXISTS brick_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lego_color_code TEXT UNIQUE,
  color_name TEXT NOT NULL UNIQUE,
  lab_l NUMERIC,
  lab_a NUMERIC,
  lab_b NUMERIC,
  rgb_hex TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 2) USER COLLECTION DOMAIN                                   │
-- └──────────────────────────────────────────────────────────────┘

-- A logical collection per user
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Collection',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual confirmed bricks (not a JSON blob)
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  brick_part_id UUID NOT NULL REFERENCES brick_parts(id),
  brick_color_id UUID REFERENCES brick_colors(id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  source TEXT NOT NULL DEFAULT 'scan',  -- 'scan', 'manual', 'import'
  confidence NUMERIC,
  first_detected_at TIMESTAMPTZ,
  last_detected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, brick_part_id, brick_color_id, source)
);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 3) SCAN SESSION AND RAW INFERENCE                           │
-- └──────────────────────────────────────────────────────────────┘

-- Every scanning run lives inside a session
CREATE TABLE IF NOT EXISTS scan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  app_version TEXT,
  model_version TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',  -- active, completed, failed
  metadata JSONB DEFAULT '{}'::JSONB
);

-- One record per submitted frame
CREATE TABLE IF NOT EXISTS scan_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_session_id UUID NOT NULL REFERENCES scan_sessions(id) ON DELETE CASCADE,
  frame_index BIGINT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT,
  width_px INT NOT NULL,
  height_px INT NOT NULL,
  camera_rotation_deg INT DEFAULT 0,
  normalization_space TEXT NOT NULL DEFAULT 'pixel',
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scan_session_id, frame_index)
);

-- Raw model output for each object in each frame
CREATE TABLE IF NOT EXISTS frame_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_frame_id UUID NOT NULL REFERENCES scan_frames(id) ON DELETE CASCADE,
  detection_index INT NOT NULL,

  predicted_brick_part_id UUID REFERENCES brick_parts(id),
  predicted_brick_color_id UUID REFERENCES brick_colors(id),

  class_label TEXT,
  confidence NUMERIC NOT NULL,
  color_confidence NUMERIC,
  geometry_type TEXT NOT NULL,  -- 'bbox_xyxy', 'polygon', 'mask'

  -- Canonical pixel-space geometry (xyxy)
  bbox_x_min NUMERIC,
  bbox_y_min NUMERIC,
  bbox_x_max NUMERIC,
  bbox_y_max NUMERIC,

  polygon JSONB,                -- [{x:..., y:...}, ...] pixel space
  segmentation_rle JSONB,       -- optional compressed mask

  pose_angle_deg NUMERIC,
  aspect_ratio NUMERIC,
  stud_count_estimate INT,

  track_id TEXT,                           -- persistent within scan session
  parent_detection_id UUID REFERENCES frame_detections(id),

  review_status TEXT NOT NULL DEFAULT 'unreviewed', -- unreviewed, accepted, corrected, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scan_frame_id, detection_index)
);

-- Top-N class candidates for ambiguity and human review
CREATE TABLE IF NOT EXISTS detection_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_detection_id UUID NOT NULL REFERENCES frame_detections(id) ON DELETE CASCADE,
  candidate_brick_part_id UUID REFERENCES brick_parts(id),
  candidate_brick_color_id UUID REFERENCES brick_colors(id),
  candidate_label TEXT,
  rank INT NOT NULL,
  confidence NUMERIC NOT NULL,
  UNIQUE(frame_detection_id, rank)
);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 4) STABLE OBJECT TRACKING                                   │
-- └──────────────────────────────────────────────────────────────┘

-- One record per temporally stable object during a scan session
CREATE TABLE IF NOT EXISTS tracked_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_session_id UUID NOT NULL REFERENCES scan_sessions(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active, finalized, dropped
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  consensus_brick_part_id UUID REFERENCES brick_parts(id),
  consensus_brick_color_id UUID REFERENCES brick_colors(id),
  consensus_confidence NUMERIC,

  stable_bbox_x_min NUMERIC,
  stable_bbox_y_min NUMERIC,
  stable_bbox_x_max NUMERIC,
  stable_bbox_y_max NUMERIC,
  stable_polygon JSONB,

  total_frames_seen INT DEFAULT 1,
  UNIQUE(scan_session_id, track_id)
);

-- Join each raw detection to a stable track
CREATE TABLE IF NOT EXISTS tracked_object_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_object_id UUID NOT NULL REFERENCES tracked_objects(id) ON DELETE CASCADE,
  frame_detection_id UUID NOT NULL REFERENCES frame_detections(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tracked_object_id, frame_detection_id)
);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 5) USER VERIFICATION & TRAINING LOOP                        │
-- └──────────────────────────────────────────────────────────────┘

-- Human-in-the-loop verification
CREATE TABLE IF NOT EXISTS detection_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_detection_id UUID REFERENCES frame_detections(id) ON DELETE CASCADE,
  tracked_object_id UUID REFERENCES tracked_objects(id) ON DELETE CASCADE,
  reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  decision TEXT NOT NULL,  -- accepted, corrected, rejected
  corrected_brick_part_id UUID REFERENCES brick_parts(id),
  corrected_brick_color_id UUID REFERENCES brick_colors(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (frame_detection_id IS NOT NULL OR tracked_object_id IS NOT NULL)
);

-- Items awaiting relabeling or retraining inclusion
CREATE TABLE IF NOT EXISTS training_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,       -- 'frame_detection', 'tracked_object'
  source_id UUID NOT NULL,
  reason TEXT NOT NULL,            -- 'low_confidence', 'part_conflict', 'user_correction', 'lighting_issue'
  priority INT NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, in_review, approved, discarded, exported
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Exportable dataset rows
CREATE TABLE IF NOT EXISTS training_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_frame_id UUID REFERENCES scan_frames(id) ON DELETE SET NULL,
  frame_detection_id UUID REFERENCES frame_detections(id) ON DELETE SET NULL,
  tracked_object_id UUID REFERENCES tracked_objects(id) ON DELETE SET NULL,

  image_url TEXT NOT NULL,
  crop_url TEXT,
  annotation_type TEXT NOT NULL,  -- bbox, polygon, mask
  annotation JSONB NOT NULL,
  brick_part_id UUID REFERENCES brick_parts(id),
  brick_color_id UUID REFERENCES brick_colors(id),
  label_source TEXT NOT NULL,     -- model, human, consensus
  exported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 6) ROW LEVEL SECURITY                                       │
-- └──────────────────────────────────────────────────────────────┘

ALTER TABLE brick_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brick_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_object_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assets ENABLE ROW LEVEL SECURITY;

-- Global read for catalog tables
CREATE POLICY "brick_parts_read" ON brick_parts FOR SELECT USING (true);
CREATE POLICY "brick_colors_read" ON brick_colors FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "user_collections_own" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "collection_items_own" ON collection_items
  FOR ALL USING (
    collection_id IN (SELECT id FROM user_collections WHERE user_id = auth.uid())
  );

CREATE POLICY "scan_sessions_own" ON scan_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "scan_frames_own" ON scan_frames
  FOR ALL USING (
    scan_session_id IN (SELECT id FROM scan_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "frame_detections_own" ON frame_detections
  FOR ALL USING (
    scan_frame_id IN (
      SELECT sf.id FROM scan_frames sf
      JOIN scan_sessions ss ON sf.scan_session_id = ss.id
      WHERE ss.user_id = auth.uid()
    )
  );

CREATE POLICY "detection_candidates_own" ON detection_candidates
  FOR ALL USING (
    frame_detection_id IN (
      SELECT fd.id FROM frame_detections fd
      JOIN scan_frames sf ON fd.scan_frame_id = sf.id
      JOIN scan_sessions ss ON sf.scan_session_id = ss.id
      WHERE ss.user_id = auth.uid()
    )
  );

CREATE POLICY "tracked_objects_own" ON tracked_objects
  FOR ALL USING (
    scan_session_id IN (SELECT id FROM scan_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "tracked_object_detections_own" ON tracked_object_detections
  FOR ALL USING (
    tracked_object_id IN (
      SELECT to2.id FROM tracked_objects to2
      JOIN scan_sessions ss ON to2.scan_session_id = ss.id
      WHERE ss.user_id = auth.uid()
    )
  );

CREATE POLICY "detection_reviews_own" ON detection_reviews
  FOR ALL USING (auth.uid() = reviewer_user_id);

-- training_queue / training_assets: admin-only or service role access
CREATE POLICY "training_queue_read" ON training_queue FOR SELECT USING (true);
CREATE POLICY "training_assets_read" ON training_assets FOR SELECT USING (true);

-- ┌──────────────────────────────────────────────────────────────┐
-- │ 7) SEED DATA                                                │
-- └──────────────────────────────────────────────────────────────┘

-- Common LEGO brick parts
INSERT INTO brick_parts (lego_part_num, canonical_name, category, dimensions_x, dimensions_y) VALUES
  ('3001', '2x4 Brick', 'Bricks', 2, 4),
  ('3002', '2x3 Brick', 'Bricks', 2, 3),
  ('3003', '2x2 Brick', 'Bricks', 2, 2),
  ('3004', '1x2 Brick', 'Bricks', 1, 2),
  ('3005', '1x1 Brick', 'Bricks', 1, 1),
  ('3006', '2x10 Brick', 'Bricks', 2, 10),
  ('3007', '2x8 Brick', 'Bricks', 2, 8),
  ('3008', '1x8 Brick', 'Bricks', 1, 8),
  ('3009', '1x6 Brick', 'Bricks', 1, 6),
  ('3010', '1x4 Brick', 'Bricks', 1, 4),
  ('3020', '2x4 Plate', 'Plates', 2, 4),
  ('3021', '2x3 Plate', 'Plates', 2, 3),
  ('3022', '2x2 Plate', 'Plates', 2, 2),
  ('3023', '1x2 Plate', 'Plates', 1, 2),
  ('3024', '1x1 Plate', 'Plates', 1, 1),
  ('3032', '4x6 Plate', 'Plates', 4, 6),
  ('3033', '6x10 Plate', 'Plates', 6, 10),
  ('3034', '2x8 Plate', 'Plates', 2, 8),
  ('3035', '4x8 Plate', 'Plates', 4, 8),
  ('3036', '6x8 Plate', 'Plates', 6, 8),
  ('3037', '2x4 Slope 45°', 'Slopes', 2, 4),
  ('3039', '2x2 Slope 45°', 'Slopes', 2, 2),
  ('3040', '1x2 Slope 45°', 'Slopes', 1, 2),
  ('3298', '2x3 Slope 33°', 'Slopes', 2, 3),
  ('3660', '2x2 Slope Inverted', 'Slopes', 2, 2),
  ('3068', '2x2 Tile', 'Tiles', 2, 2),
  ('3069', '1x2 Tile', 'Tiles', 1, 2),
  ('3070', '1x1 Tile', 'Tiles', 1, 1),
  ('2412', '1x2 Tile with Grille', 'Tiles', 1, 2),
  ('3795', '2x6 Plate', 'Plates', 2, 6),
  ('2420', '2x4 Plate with Pins', 'Technic', 2, 4),
  ('3031', '4x4 Plate', 'Plates', 4, 4),
  ('3958', '6x6 Plate', 'Plates', 6, 6),
  ('3028', '6x12 Plate', 'Plates', 6, 12),
  ('3460', '1x8 Plate', 'Plates', 1, 8),
  ('3666', '1x6 Plate', 'Plates', 1, 6),
  ('3710', '1x4 Plate', 'Plates', 1, 4),
  ('3623', '1x3 Plate', 'Plates', 1, 3)
ON CONFLICT (lego_part_num) DO NOTHING;

-- Canonical LEGO colors with LAB approximations
INSERT INTO brick_colors (lego_color_code, color_name, lab_l, lab_a, lab_b, rgb_hex) VALUES
  ('21', 'Red', 53, 60, 40, '#C91A09'),
  ('23', 'Blue', 32, 10, -55, '#0055BF'),
  ('24', 'Yellow', 88, -5, 75, '#F2CD37'),
  ('28', 'Green', 46, -40, 30, '#237841'),
  ('1', 'White', 100, 0, 0, '#FFFFFF'),
  ('26', 'Black', 10, 0, 0, '#05131D'),
  ('106', 'Orange', 65, 45, 60, '#E76318'),
  ('221', 'Pink', 70, 35, 5, '#FC97AC'),
  ('268', 'Purple', 35, 20, -25, '#6B5A97'),
  ('6', 'Brown', 35, 15, 25, '#583927'),
  ('194', 'Gray', 58, 0, 0, '#9BA19D'),
  ('119', 'Lime', 78, -30, 50, '#BBE90B'),
  ('191', 'Bright Light Orange', 75, 20, 60, '#F8BB3D'),
  ('226', 'Bright Light Yellow', 92, -10, 45, '#FFF03A'),
  ('322', 'Dark Azure', 45, -10, -30, '#078BC9'),
  ('326', 'Medium Lavender', 55, 25, -20, '#A06EB9'),
  ('329', 'Coral', 62, 40, 20, '#FF698F'),
  ('330', 'Olive Green', 50, -20, 30, '#9B9A5A')
ON CONFLICT (color_name) DO NOTHING;
