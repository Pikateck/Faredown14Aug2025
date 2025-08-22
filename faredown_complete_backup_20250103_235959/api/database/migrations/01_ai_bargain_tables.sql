-- AI Emotional-Intelligence Bargain Model Schema
-- Faredown AI Bargaining System with Behavioral Analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Modules (product types)
CREATE TABLE IF NOT EXISTS modules (
  id            SERIAL PRIMARY KEY,
  name          TEXT UNIQUE NOT NULL CHECK (name IN ('flights','hotels','sightseeing','transfers')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Suppliers (Amadeus/airlines, Hotelbeds/hotels, etc.)
CREATE TABLE IF NOT EXISTS suppliers (
  id            SERIAL PRIMARY KEY,
  module_id     INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, code)
);

-- Dynamic markups & guardrails for AI pricing
CREATE TABLE IF NOT EXISTS markups (
  id                 SERIAL PRIMARY KEY,
  module_id          INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  supplier_id        INT REFERENCES suppliers(id) ON DELETE SET NULL,
  season             TEXT DEFAULT 'default',
  route_bucket       TEXT DEFAULT 'any',
  date_bucket        DATERANGE DEFAULT daterange('1900-01-01','2100-01-01','[]'),
  markup_pct         NUMERIC(6,4) NOT NULL DEFAULT 0.08,  -- 8% default
  min_margin_pct     NUMERIC(6,4) NOT NULL DEFAULT 0.040, -- never-loss guardrail (4%)
  max_concession_pct NUMERIC(6,4) NOT NULL DEFAULT 0.050, -- max give from base
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, COALESCE(supplier_id,0), season, route_bucket, date_bucket)
);

-- Cached supplier nets (freshness TTL handled in app/Redis)
CREATE TABLE IF NOT EXISTS supplier_nets (
  id            BIGSERIAL PRIMARY KEY,
  module_id     INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  supplier_id   INT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_ref   TEXT NOT NULL,               -- opaque product key
  search_hash   TEXT NOT NULL,               -- hash of query inputs
  net           NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'INR',
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Precomputed acceptance bands (updated by AI learning worker)
CREATE TABLE IF NOT EXISTS negotiation_profiles (
  id                         BIGSERIAL PRIMARY KEY,
  module_id                  INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  supplier_id                INT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  route_bucket               TEXT NOT NULL,
  time_to_departure_bucket   TEXT NOT NULL,     -- e.g., "LT_24H", "D1_3", "D4_14", "GT_14"
  accept_band_low            NUMERIC(6,4) NOT NULL DEFAULT 0.040, -- % above net
  accept_band_high           NUMERIC(6,4) NOT NULL DEFAULT 0.120,
  discount_factor            NUMERIC(6,4) NOT NULL DEFAULT 0.995, -- impatience proxy
  emotional_factor           NUMERIC(6,4) NOT NULL DEFAULT 1.000, -- emotional response modifier
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, supplier_id, route_bucket, time_to_departure_bucket)
);

-- Bargain sessions (one per user×itinerary with AI state)
CREATE TABLE IF NOT EXISTS bargain_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID,
  module_id      INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  product_ref    TEXT NOT NULL,
  attempt_count  INT NOT NULL DEFAULT 0,
  max_attempts   INT NOT NULL DEFAULT 3,       -- configurable in Admin
  ai_personality TEXT NOT NULL DEFAULT 'standard', -- emotional personality mode
  emotional_state JSONB DEFAULT '{}'::jsonb,   -- AI emotional context
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ,                  -- soft expiry for urgency
  INDEX(module_id, product_ref)
);

-- Event log with emotional decision tracking
CREATE TABLE IF NOT EXISTS bargain_events (
  id             BIGSERIAL PRIMARY KEY,
  session_id     UUID NOT NULL REFERENCES bargain_sessions(id) ON DELETE CASCADE,
  attempt_no     INT NOT NULL,
  user_offer     NUMERIC(12,2) NOT NULL,
  base_price     NUMERIC(12,2) NOT NULL,
  result_price   NUMERIC(12,2),
  status         TEXT NOT NULL CHECK (status IN ('accepted','counter','reprice_needed','expired','error')),
  latency_ms     INT,
  decision_path  JSONB DEFAULT '[]'::jsonb,
  ai_emotion     TEXT,                         -- AI emotional response
  user_behavior  JSONB DEFAULT '{}'::jsonb,    -- detected user behavior patterns
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX(session_id)
);

-- Behavior learning signals for AI optimization
CREATE TABLE IF NOT EXISTS user_behavior_signals (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              UUID,
  module_id            INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  product_context      JSONB NOT NULL DEFAULT '{}'::jsonb,
  offer_rel_to_base    NUMERIC(6,4),   -- (base - offer)/base
  accepted             BOOLEAN,
  accept_latency_ms    INT,
  round_no             INT,
  final_margin_pct     NUMERIC(6,4),
  emotional_response   TEXT,           -- detected user emotional state
  ai_strategy_used     TEXT,           -- which AI approach was used
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX(user_id, created_at DESC),
  INDEX(module_id, created_at DESC)
);

-- Feature flags / experiments for AI behavior control
CREATE TABLE IF NOT EXISTS features (
  key      TEXT PRIMARY KEY,
  enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  payload  JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hold sessions (30s soft holds after acceptance)
CREATE TABLE IF NOT EXISTS bargain_holds (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id     UUID NOT NULL REFERENCES bargain_sessions(id) ON DELETE CASCADE,
  final_price    NUMERIC(12,2) NOT NULL,
  hold_seconds   INT NOT NULL DEFAULT 30,
  order_ref      TEXT,
  status         TEXT NOT NULL DEFAULT 'holding' CHECK (status IN ('holding','expired','booked')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL,
  INDEX(session_id),
  INDEX(expires_at)
);

-- Copy packs for emotional messaging
CREATE TABLE IF NOT EXISTS copy_packs (
  id             SERIAL PRIMARY KEY,
  module_id      INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  pack_name      TEXT NOT NULL,
  version        TEXT NOT NULL DEFAULT '1.0.0',
  beat_type      TEXT NOT NULL, -- 'agent_offer', 'supplier_check', 'supplier_counter', 'agent_user_confirm'
  copy_variants  JSONB NOT NULL, -- array of message templates
  emotional_tone TEXT NOT NULL DEFAULT 'neutral', -- emotional personality
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX(module_id, beat_type, emotional_tone)
);
