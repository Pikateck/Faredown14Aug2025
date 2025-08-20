-- AI Emotional-Intelligence Bargain Functions
-- Core atomic function for never-loss pricing with emotional AI

-- Function to get time-to-departure bucket
CREATE OR REPLACE FUNCTION get_time_bucket(departure_date TIMESTAMPTZ) 
RETURNS TEXT AS $$
BEGIN
  IF departure_date - NOW() < INTERVAL '24 hours' THEN
    RETURN 'LT_24H';
  ELSIF departure_date - NOW() < INTERVAL '3 days' THEN
    RETURN 'D1_3';
  ELSIF departure_date - NOW() < INTERVAL '14 days' THEN
    RETURN 'D4_14';
  ELSE
    RETURN 'GT_14';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get route bucket (simplified)
CREATE OR REPLACE FUNCTION get_route_bucket(module_name TEXT, route_info JSONB) 
RETURNS TEXT AS $$
BEGIN
  -- Simplified route classification
  -- In production, this would analyze route data
  IF (route_info->>'international')::boolean = true THEN
    RETURN 'international';
  ELSE
    RETURN 'domestic';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to select emotional copy variant
CREATE OR REPLACE FUNCTION get_emotional_copy(
  p_module_id INT,
  p_beat_type TEXT,
  p_emotional_tone TEXT DEFAULT 'standard',
  p_template_vars JSONB DEFAULT '{}'::jsonb
) RETURNS TEXT AS $$
DECLARE
  copy_variants JSONB;
  selected_copy TEXT;
  variant_count INT;
  random_index INT;
BEGIN
  -- Get copy variants for the beat type
  SELECT cp.copy_variants INTO copy_variants
  FROM copy_packs cp
  WHERE cp.module_id = p_module_id 
    AND cp.beat_type = p_beat_type
    AND cp.emotional_tone = p_emotional_tone
    AND cp.is_active = true
  LIMIT 1;

  -- If no variants found, return default message
  IF copy_variants IS NULL THEN
    RETURN 'Processing your request...';
  END IF;

  -- Select random variant to avoid repetition
  variant_count := jsonb_array_length(copy_variants);
  random_index := floor(random() * variant_count)::int;
  selected_copy := copy_variants->>random_index;

  -- Replace template variables (basic implementation)
  -- In production, use a proper template engine
  FOREACH key IN ARRAY ARRAY(SELECT jsonb_object_keys(p_template_vars))
  LOOP
    selected_copy := replace(selected_copy, '{' || key || '}', p_template_vars->>key);
  END LOOP;

  RETURN selected_copy;
END;
$$ LANGUAGE plpgsql;

-- Core AI Bargain Quote Function (Never-Loss Atomic)
CREATE OR REPLACE FUNCTION ai_bargain_quote(
  p_session_id UUID,
  p_module TEXT,
  p_product_ref TEXT,
  p_user_offer NUMERIC,
  p_route_info JSONB DEFAULT '{}'::jsonb,
  p_departure_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_module_id INT;
  v_supplier_id INT;
  v_net NUMERIC;
  v_markup_pct NUMERIC;
  v_min_margin_pct NUMERIC;
  v_max_concession_pct NUMERIC;
  v_base NUMERIC;
  v_lowest_accept NUMERIC;
  v_final NUMERIC;
  v_attempt INT;
  v_max_attempts INT;
  v_start TIMESTAMPTZ := clock_timestamp();
  v_latency_ms INT;
  v_route_bucket TEXT;
  v_time_bucket TEXT;
  v_accept_band_low NUMERIC;
  v_accept_band_high NUMERIC;
  v_emotional_factor NUMERIC;
  v_status TEXT;
  v_ai_emotion TEXT;
  v_decision_path JSONB := '[]'::jsonb;
  v_template_vars JSONB;
BEGIN
  -- 1) Resolve module_id
  SELECT id INTO v_module_id FROM modules WHERE name = p_module;
  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'Invalid module: %', p_module;
  END IF;

  -- 2) Get route and time buckets for smart pricing
  v_route_bucket := get_route_bucket(p_module, p_route_info);
  v_time_bucket := get_time_bucket(COALESCE(p_departure_date, NOW() + INTERVAL '7 days'));

  -- 3) Fetch supplier net (simplified - in production, query supplier_nets table)
  -- For demo, we'll simulate with base price calculation
  v_net := p_user_offer * 0.85; -- Assume net is ~85% of user offer as baseline

  -- 4) Get markup and margin rules
  SELECT 
    COALESCE(m1.markup_pct, m2.markup_pct, 0.08) as markup_pct,
    COALESCE(m1.min_margin_pct, m2.min_margin_pct, 0.040) as min_margin_pct,
    COALESCE(m1.max_concession_pct, m2.max_concession_pct, 0.050) as max_concession_pct
  INTO v_markup_pct, v_min_margin_pct, v_max_concession_pct
  FROM modules mod
  LEFT JOIN markups m1 ON m1.module_id = mod.id AND m1.route_bucket = v_route_bucket
  LEFT JOIN markups m2 ON m2.module_id = mod.id AND m2.route_bucket = 'any'
  WHERE mod.id = v_module_id
  LIMIT 1;

  -- 5) Calculate base price and limits
  v_base := ROUND(v_net * (1 + v_markup_pct), 2);
  v_lowest_accept := ROUND(v_net * (1 + v_min_margin_pct), 2);

  -- 6) Get emotional AI parameters
  SELECT 
    COALESCE(np.accept_band_low, 0.040),
    COALESCE(np.accept_band_high, 0.080),
    COALESCE(np.emotional_factor, 1.0)
  INTO v_accept_band_low, v_accept_band_high, v_emotional_factor
  FROM negotiation_profiles np
  WHERE np.module_id = v_module_id 
    AND np.route_bucket = v_route_bucket
    AND np.time_to_departure_bucket = v_time_bucket
  LIMIT 1;

  -- Apply emotional factor to acceptance bands
  v_accept_band_low := v_accept_band_low * v_emotional_factor;
  v_accept_band_high := v_accept_band_high * v_emotional_factor;

  -- 7) Check attempt limits
  SELECT attempt_count, max_attempts INTO v_attempt, v_max_attempts
  FROM bargain_sessions WHERE id = p_session_id FOR UPDATE;

  IF v_attempt >= v_max_attempts THEN
    RETURN jsonb_build_object(
      'status', 'expired',
      'message', 'Maximum attempts reached',
      'attempt', jsonb_build_object('count', v_attempt, 'max', v_max_attempts, 'canRetry', false)
    );
  END IF;

  -- 8) AI Decision Logic with Emotional Intelligence
  v_decision_path := v_decision_path || jsonb_build_array('offer_received');

  IF p_user_offer >= v_lowest_accept THEN
    -- Accept the offer (but cap at base price)
    v_final := LEAST(p_user_offer, v_base);
    v_status := 'accepted';
    v_ai_emotion := 'pleased';
    v_decision_path := v_decision_path || jsonb_build_array('offer_approved', 'price_locked');
  ELSE
    -- Counter offer with emotional strategy
    DECLARE
      counter_min NUMERIC := GREATEST(v_lowest_accept, v_net * (1 + v_accept_band_low));
      counter_max NUMERIC := LEAST(v_base, v_net * (1 + v_accept_band_high));
      offer_ratio NUMERIC := p_user_offer / v_base;
    BEGIN
      -- Emotional AI: adjust counter based on user's offer aggressiveness
      IF offer_ratio < 0.7 THEN
        -- Very low offer - be firm but not insulting
        v_final := counter_max;
        v_ai_emotion := 'firm';
      ELSIF offer_ratio < 0.85 THEN
        -- Reasonable offer - meet in middle
        v_final := ROUND((p_user_offer + counter_max) / 2, 2);
        v_ai_emotion := 'negotiating';
      ELSE
        -- Close offer - small concession
        v_final := ROUND(GREATEST(counter_min, p_user_offer * 1.05), 2);
        v_ai_emotion := 'flexible';
      END IF;

      -- Ensure never-loss constraint
      v_final := GREATEST(v_final, v_lowest_accept);
      v_status := 'counter';
      v_decision_path := v_decision_path || jsonb_build_array('counter_calculated', 'emotional_adjustment');
    END;
  END IF;

  -- 9) Update session and log event
  UPDATE bargain_sessions 
  SET attempt_count = attempt_count + 1,
      emotional_state = jsonb_build_object(
        'ai_emotion', v_ai_emotion,
        'user_offer_ratio', p_user_offer / v_base,
        'strategy', v_status
      )
  WHERE id = p_session_id;

  -- Calculate latency
  v_latency_ms := EXTRACT(MILLISECOND FROM (clock_timestamp() - v_start))::INT
                  + (EXTRACT(SECOND FROM (clock_timestamp() - v_start))::INT * 1000);

  -- Log the event
  INSERT INTO bargain_events(
    session_id, attempt_no, user_offer, base_price, result_price, 
    status, latency_ms, decision_path, ai_emotion, user_behavior
  ) VALUES (
    p_session_id, v_attempt + 1, p_user_offer, v_base, v_final,
    v_status, v_latency_ms, v_decision_path, v_ai_emotion,
    jsonb_build_object('offer_ratio', p_user_offer / v_base, 'time_bucket', v_time_bucket)
  );

  -- 10) Prepare template variables for UI
  v_template_vars := jsonb_build_object(
    'offer', p_user_offer,
    'base', v_base,
    'counter', v_final,
    'airline', COALESCE(p_route_info->>'airline', 'Carrier'),
    'flight_no', COALESCE(p_route_info->>'flight_no', 'XX123')
  );

  -- 11) Return comprehensive response
  RETURN jsonb_build_object(
    'status', v_status,
    'finalPrice', v_final,
    'basePrice', v_base,
    'lowestAcceptable', v_lowest_accept,
    'negotiatedInMs', v_latency_ms,
    'attempt', jsonb_build_object(
      'count', v_attempt + 1, 
      'max', v_max_attempts, 
      'canRetry', (v_attempt + 1) < v_max_attempts
    ),
    'decisionPath', v_decision_path,
    'ai', jsonb_build_object(
      'emotion', v_ai_emotion,
      'strategy', v_status,
      'personality', 'emotional_intelligence'
    ),
    'ui', jsonb_build_object(
      'beats', 4,
      'copyPack', 'standard_v1',
      'badges', jsonb_build_object('negotiatedIn', (v_latency_ms/1000.0) || 's'),
      'templateVars', v_template_vars
    )
  );

EXCEPTION 
  WHEN OTHERS THEN
    -- Log error and return safe response
    INSERT INTO bargain_events(
      session_id, attempt_no, user_offer, base_price, result_price, 
      status, latency_ms, decision_path
    ) VALUES (
      p_session_id, COALESCE(v_attempt, 0) + 1, p_user_offer, COALESCE(v_base, 0), 0,
      'error', EXTRACT(MILLISECOND FROM (clock_timestamp() - v_start))::INT, 
      '["error_occurred"]'::jsonb
    );

    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Pricing temporarily unavailable',
      'attempt', jsonb_build_object('count', COALESCE(v_attempt, 0), 'max', 3, 'canRetry', true)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create/initialize bargain session
CREATE OR REPLACE FUNCTION create_bargain_session(
  p_user_id UUID,
  p_module TEXT,
  p_product_ref TEXT,
  p_max_attempts INT DEFAULT 3
) RETURNS UUID AS $$
DECLARE
  v_module_id INT;
  v_session_id UUID;
BEGIN
  SELECT id INTO v_module_id FROM modules WHERE name = p_module;
  
  INSERT INTO bargain_sessions(user_id, module_id, product_ref, max_attempts, expires_at)
  VALUES (p_user_id, v_module_id, p_product_ref, p_max_attempts, NOW() + INTERVAL '30 minutes')
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create hold after acceptance
CREATE OR REPLACE FUNCTION create_bargain_hold(
  p_session_id UUID,
  p_final_price NUMERIC,
  p_hold_seconds INT DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  v_hold_id UUID;
  v_order_ref TEXT;
BEGIN
  v_order_ref := 'BRG-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || substring(p_session_id::TEXT, 1, 8);
  
  INSERT INTO bargain_holds(session_id, final_price, hold_seconds, order_ref, expires_at)
  VALUES (p_session_id, p_final_price, p_hold_seconds, v_order_ref, NOW() + (p_hold_seconds || ' seconds')::INTERVAL)
  RETURNING id INTO v_hold_id;
  
  RETURN jsonb_build_object(
    'holdId', v_hold_id,
    'orderRef', v_order_ref,
    'holdSeconds', p_hold_seconds,
    'expiresAt', (NOW() + (p_hold_seconds || ' seconds')::INTERVAL)
  );
END;
$$ LANGUAGE plpgsql;
