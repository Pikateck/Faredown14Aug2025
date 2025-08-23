const express = require("express");
const router = express.Router();

// Mock data for development - replace with real database queries later
const mockLiveData = {
  sessions: [
    {
      session_id: "sess_001",
      product_type: "flight",
      canonical_key: "FL:AI:DEL-BOM:2025-02-15",
      round_count: 2,
      latest_offer: 145.5,
      latest_accept_prob: 0.73,
      is_accepted: false,
      time_active_minutes: 3.2,
    },
    {
      session_id: "sess_002",
      product_type: "hotel",
      canonical_key: "HT:12345:DXB:DELUXE",
      round_count: 1,
      latest_offer: 89.0,
      latest_accept_prob: 0.45,
      is_accepted: false,
      time_active_minutes: 1.8,
    },
  ],
  performance: {
    active_sessions: 12,
    acceptance_rate: 0.68,
    avg_revenue_per_session: 142.33,
    hourly_profit: 1250.45,
  },
  timestamp: new Date().toISOString(),
};

const mockAirlineData = [
  {
    airline: "Air India",
    route: "DEL-BOM",
    sessions: 45,
    accepted: 31,
    avg_price: 156.78,
    avg_profit: 23.45,
  },
  {
    airline: "IndiGo",
    route: "BLR-DEL",
    sessions: 38,
    accepted: 24,
    avg_price: 134.5,
    avg_profit: 19.8,
  },
  {
    airline: "SpiceJet",
    route: "CCU-BOM",
    sessions: 22,
    accepted: 15,
    avg_price: 98.45,
    avg_profit: 14.2,
  },
];

const mockHotelData = [
  {
    city: "Dubai",
    hotel_name: "Burj Al Arab",
    sessions: 28,
    accepted: 19,
    avg_price: 450.0,
    avg_profit: 67.5,
  },
  {
    city: "Mumbai",
    hotel_name: "Taj Mahal Palace",
    sessions: 35,
    accepted: 22,
    avg_price: 380.25,
    avg_profit: 57.04,
  },
  {
    city: "Delhi",
    hotel_name: "The Imperial",
    sessions: 31,
    accepted: 18,
    avg_price: 320.75,
    avg_profit: 48.11,
  },
];

const mockElasticityData = [
  { bucket: "0-5%", accept_rate: 0.12 },
  { bucket: "5-10%", accept_rate: 0.28 },
  { bucket: "10-15%", accept_rate: 0.45 },
  { bucket: "15-20%", accept_rate: 0.68 },
  { bucket: "20-25%", accept_rate: 0.82 },
  { bucket: "25-30%", accept_rate: 0.91 },
];

const mockPromoData = [
  {
    used_promo: "SAVE10",
    avg_profit_usd: 23.45,
    total_redemptions: 156,
    acceptance_rate: 0.72,
  },
  {
    used_promo: "SAVE20",
    avg_profit_usd: 18.9,
    total_redemptions: 89,
    acceptance_rate: 0.68,
  },
  {
    used_promo: "FLAT50",
    avg_profit_usd: 31.2,
    total_redemptions: 45,
    acceptance_rate: 0.81,
  },
];

// Live monitoring endpoint
router.get("/live", async (req, res) => {
  try {
    // In production, query real data from AI tables:
    // const sessions = await pool.query(`
    //   SELECT * FROM ai.bargain_sessions
    //   WHERE status = 'active'
    //   ORDER BY created_at DESC LIMIT 10
    // `);

    res.json({
      success: true,
      data: mockLiveData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching live AI data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch live data",
    });
  }
});

// Airline route reports
router.get("/reports/airline-route", async (req, res) => {
  try {
    // In production, query materialized view:
    // const data = await pool.query(`SELECT * FROM ai.mv_airline_route_daily ORDER BY sessions DESC`);

    res.json({
      success: true,
      data: mockAirlineData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching airline route data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch airline route data",
    });
  }
});

// Hotel city reports
router.get("/reports/hotel-city", async (req, res) => {
  try {
    // In production, query materialized view:
    // const data = await pool.query(`SELECT * FROM ai.mv_hotel_city_daily ORDER BY sessions DESC`);

    res.json({
      success: true,
      data: mockHotelData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching hotel city data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hotel city data",
    });
  }
});

// Price elasticity analysis
router.get("/elasticity", async (req, res) => {
  try {
    const { product_type = "flight" } = req.query;

    // In production, calculate real elasticity curves from bargain_events data

    res.json({
      success: true,
      product_type,
      elasticity_data: mockElasticityData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching elasticity data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch elasticity data",
    });
  }
});

// Promo effectiveness reports
router.get("/reports/promo-effectiveness", async (req, res) => {
  try {
    // In production, query materialized view:
    // const data = await pool.query(`SELECT * FROM ai.mv_promo_effectiveness ORDER BY total_redemptions DESC`);

    res.json({
      success: true,
      promo_effectiveness: mockPromoData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching promo effectiveness data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch promo effectiveness data",
    });
  }
});

// Get current policies
router.get("/policies", async (req, res) => {
  try {
    // In production, query from ai.policies table:
    // const policies = await pool.query(`SELECT * FROM ai.policies WHERE active = true ORDER BY created_at DESC`);

    const mockPolicies = [
      {
        id: 1,
        version: "v1.0.0",
        dsl_yaml: `version: v1.0.0
global:
  currency_base: USD
  exploration_pct: 0.08
  max_rounds: 3
  response_budget_ms: 300
  never_loss: true
price_rules:
  flight:
    min_margin_usd: 6.0
    max_discount_pct: 0.15
    hold_minutes: 10
  hotel:
    min_margin_usd: 4.0
    max_discount_pct: 0.20
    hold_minutes: 15`,
        active: true,
        created_at: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      policies: mockPolicies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch policies",
    });
  }
});

// Update/publish policy
router.put("/policies", async (req, res) => {
  try {
    const { version, dsl_yaml } = req.body;

    // In production, insert into ai.policies table:
    // const result = await pool.query(`
    //   INSERT INTO ai.policies (version, dsl_yaml, checksum, active)
    //   VALUES ($1, $2, $3, true)
    // `, [version, dsl_yaml, generateChecksum(dsl_yaml)]);

    res.json({
      success: true,
      message: `Policy ${version} published successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error publishing policy:", error);
    res.status(500).json({
      success: false,
      error: "Failed to publish policy",
    });
  }
});

// Policy validation endpoint
router.post("/policies/validate", async (req, res) => {
  try {
    const { dsl_yaml } = req.body;

    // Basic YAML validation (in production, use proper YAML parser)
    const isValid = dsl_yaml && dsl_yaml.includes("version:");

    if (isValid) {
      res.json({
        success: true,
        valid: true,
        preview: {
          min_price: 50.0,
          max_price: 500.0,
          discount_limit: 0.25,
        },
      });
    } else {
      res.json({
        success: false,
        valid: false,
        errors: ["Invalid YAML format", "Missing version field"],
      });
    }
  } catch (error) {
    console.error("Error validating policy:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate policy",
    });
  }
});

// Model deployment endpoint
router.post("/models/deploy", async (req, res) => {
  try {
    const { model_name, model_version } = req.body;

    // In production, update ai.model_registry table

    res.json({
      success: true,
      message: `Model ${model_name} v${model_version} deployed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deploying model:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deploy model",
    });
  }
});

module.exports = router;
