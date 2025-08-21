-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_markups_lookup
  ON markups(module_id, supplier_id, season, route_bucket, date_bucket);

CREATE INDEX IF NOT EXISTS idx_supplier_nets_lookup
  ON supplier_nets(module_id, supplier_id, product_ref, search_hash DESC, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_negotiation_profiles_lookup
  ON negotiation_profiles(module_id, supplier_id, route_bucket, time_to_departure_bucket);

CREATE INDEX IF NOT EXISTS idx_bargain_sessions_lookup
  ON bargain_sessions(module_id, product_ref);

CREATE INDEX IF NOT EXISTS idx_behavior_analytics
  ON user_behavior_signals(module_id, created_at DESC, accepted);

-- Initial seeds for modules
INSERT INTO modules(name) VALUES ('flights'), ('hotels'), ('sightseeing'), ('transfers')
ON CONFLICT (name) DO NOTHING;

-- Default markup/guardrails (override per supplier in Admin)
INSERT INTO markups(module_id, supplier_id, season, route_bucket, markup_pct, min_margin_pct, max_concession_pct)
SELECT m.id, NULL, 'default', 'any', 
  CASE 
    WHEN m.name = 'flights' THEN 0.08     -- 8% markup for flights
    WHEN m.name = 'hotels' THEN 0.12      -- 12% markup for hotels  
    WHEN m.name = 'sightseeing' THEN 0.15 -- 15% markup for sightseeing
    WHEN m.name = 'transfers' THEN 0.10   -- 10% markup for transfers
  END,
  0.040, -- 4% minimum margin (never-loss)
  0.050  -- 5% max concession from base
FROM modules m
WHERE m.name IN ('flights','hotels','sightseeing','transfers')
ON CONFLICT DO NOTHING;

-- Feature flags for AI behavior control
INSERT INTO features(key, enabled, payload) VALUES
  ('ai_bargain_enabled', true, '{"global": true}'),
  ('emotional_intelligence', true, '{"personality_types": ["standard", "aggressive", "gentle"]}'),
  ('visible_rounds_mode', true, '{"max_attempts": 3, "show_progress": true}'),
  ('hidden_rounds_mode', false, '{"max_attempts": 5, "continuous": true}'),
  ('competitor_panel', false, '{"tos_compliant_only": true}'),
  ('ai_admin_analytics', true, '{"real_time": true, "behavior_tracking": true}'),
  ('copy_pack_rotation', true, '{"avoid_repetition": true, "variants": 3}'),
  ('urgency_messaging', true, '{"early_nudges": true, "fomo_enabled": true}')
ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload;

-- Default copy packs for emotional messaging
INSERT INTO copy_packs(module_id, pack_name, version, beat_type, copy_variants, emotional_tone) 
SELECT m.id, 'standard_v1', '1.0.0', 'agent_offer', 
  CASE m.name
    WHEN 'flights' THEN 
      '["We have ₹{offer} for {airline} {flight_no}. Can you approve?", 
        "Customer is ready at ₹{offer} for {airline} {flight_no}. Please review.", 
        "Requesting approval at ₹{offer} for {airline} {flight_no}."]'::jsonb
    WHEN 'hotels' THEN 
      '["We have ₹{offer} for {hotel_name} in {city}. Can you approve?", 
        "Requesting ₹{offer} for {hotel_name} ({city}). Please review."]'::jsonb
    WHEN 'sightseeing' THEN 
      '["We have ₹{offer} for {tour_name} in {city}. Can you approve?"]'::jsonb
    WHEN 'transfers' THEN 
      '["We have ₹{offer} for a transfer from {pickup} to {dropoff}. Can you approve?"]'::jsonb
  END, 'standard'
FROM modules m
ON CONFLICT DO NOTHING;

INSERT INTO copy_packs(module_id, pack_name, version, beat_type, copy_variants, emotional_tone) 
SELECT m.id, 'standard_v1', '1.0.0', 'supplier_check', 
  CASE m.name
    WHEN 'flights' THEN 
      '["Listed at ₹{base}. Checking inventory…", 
        "Current published is ₹{base}. Reviewing now…", 
        "₹{base} is the listed fare. Verifying availability…"]'::jsonb
    WHEN 'hotels' THEN 
      '["Listed at ₹{base}. Checking room availability…", 
        "Published is ₹{base}. Reviewing inventory…"]'::jsonb
    WHEN 'sightseeing' THEN 
      '["Listed at ₹{base}. Checking seats…"]'::jsonb
    WHEN 'transfers' THEN 
      '["Listed at ₹{base}. Checking vehicle availability…"]'::jsonb
  END, 'standard'
FROM modules m
ON CONFLICT DO NOTHING;

INSERT INTO copy_packs(module_id, pack_name, version, beat_type, copy_variants, emotional_tone) 
SELECT m.id, 'standard_v1', '1.0.0', 'supplier_counter', 
  '["I can do ₹{counter}.", "Best I can return now is ₹{counter}.", "Approved at ₹{counter}."]'::jsonb, 
  'standard'
FROM modules m
ON CONFLICT DO NOTHING;

INSERT INTO copy_packs(module_id, pack_name, version, beat_type, copy_variants, emotional_tone) 
SELECT m.id, 'standard_v1', '1.0.0', 'agent_user_confirm', 
  CASE m.name
    WHEN 'flights' THEN 
      '["Let me check with you if you want it.", 
        "I can lock this in now if you'\''d like.", 
        "Shall I secure this price for you?"]'::jsonb
    WHEN 'hotels' THEN 
      '["Want me to lock this now?", "I can secure this rate immediately."]'::jsonb
    WHEN 'sightseeing' THEN 
      '["Shall I lock this for you?"]'::jsonb
    WHEN 'transfers' THEN 
      '["Do you want me to secure this ride now?"]'::jsonb
  END, 'standard'
FROM modules m
ON CONFLICT DO NOTHING;

-- Sample negotiation profiles (will be updated by AI learning)
INSERT INTO negotiation_profiles(module_id, supplier_id, route_bucket, time_to_departure_bucket, accept_band_low, accept_band_high, discount_factor, emotional_factor)
SELECT m.id, NULL, 'domestic', 'D1_3', 0.040, 0.080, 0.995, 1.0
FROM modules m
ON CONFLICT DO NOTHING;

INSERT INTO negotiation_profiles(module_id, supplier_id, route_bucket, time_to_departure_bucket, accept_band_low, accept_band_high, discount_factor, emotional_factor)
SELECT m.id, NULL, 'international', 'GT_14', 0.050, 0.120, 0.990, 1.1
FROM modules m
ON CONFLICT DO NOTHING;
