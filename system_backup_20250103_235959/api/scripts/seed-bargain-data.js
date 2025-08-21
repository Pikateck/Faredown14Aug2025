/**
 * Fake Data Seeder for AI Bargaining Dashboard
 * Generates synthetic sessions and events so dashboards light up
 */

const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Sample data configurations
const AIRLINES = ["AI", "6E", "SG", "UK", "G8", "I5"];
const ROUTES = [
  { origin: "BOM", dest: "DEL" },
  { origin: "BOM", dest: "DXB" },
  { origin: "DEL", dest: "BLR" },
  { origin: "BLR", dest: "HYD" },
  { origin: "CCU", dest: "DEL" },
  { origin: "MAA", dest: "BOM" },
  { origin: "DEL", dest: "GOI" },
  { origin: "BOM", dest: "JFK" },
  { origin: "DEL", dest: "LHR" },
  { origin: "BLR", dest: "SIN" },
  { origin: "HYD", dest: "DXB" },
  { origin: "CCU", dest: "BKK" },
];

const CITIES = ["BOM", "DEL", "BLR", "DXB", "GOA", "HYD", "JFK", "LHR"];
const USER_TIERS = ["SILVER", "GOLD", "PLATINUM"];
const USER_STYLES = ["cautious", "persistent", "generous"];

class BargainDataSeeder {
  constructor() {
    this.supplierIds = new Map();
  }

  async seed() {
    console.log("🌱 Starting AI Bargaining data seeding...");

    try {
      // Get supplier IDs
      await this.loadSupplierIds();

      // Generate data for last 30 days
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      console.log(
        `📅 Generating data from ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
      );

      let totalSessions = 0;
      let totalEvents = 0;

      // Generate data day by day
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dayResult = await this.generateDayData(new Date(date));
        totalSessions += dayResult.sessions;
        totalEvents += dayResult.events;

        console.log(
          `  ${date.toISOString().split("T")[0]}: ${dayResult.sessions} sessions, ${dayResult.events} events`,
        );
      }

      // Refresh materialized views
      console.log("🔄 Refreshing materialized views...");
      await this.refreshMaterializedViews();

      console.log(
        `✅ Seeding complete: ${totalSessions} sessions, ${totalEvents} events generated`,
      );
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      throw error;
    }
  }

  async loadSupplierIds() {
    const result = await pool.query("SELECT id, code FROM ai.suppliers");
    for (const row of result.rows) {
      this.supplierIds.set(row.code, row.id);
    }
    console.log(`📋 Loaded ${this.supplierIds.size} suppliers`);
  }

  async generateDayData(date) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseSessionsPerDay = isWeekend ? 30 : 80; // Less activity on weekends
    const sessionCount = baseSessionsPerDay + Math.floor(Math.random() * 20);

    let sessionsCreated = 0;
    let eventsCreated = 0;

    for (let i = 0; i < sessionCount; i++) {
      const sessionResult = await this.generateSession(date);
      sessionsCreated++;
      eventsCreated += sessionResult.events;
    }

    return {
      sessions: sessionsCreated,
      events: eventsCreated,
    };
  }

  async generateSession(baseDate) {
    const sessionId = uuidv4();
    const productType =
      Math.random() < 0.7
        ? "flight"
        : Math.random() < 0.8
          ? "hotel"
          : "sightseeing";

    // Generate random time within the day
    const sessionTime = new Date(
      baseDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
    );

    // Create product and session
    const { canonicalKey, supplierCandidates } =
      await this.createProduct(productType);

    await pool.query(
      `
      INSERT INTO ai.bargain_sessions (id, canonical_key, product_type, policy_version, model_version, supplier_candidates, started_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        sessionId,
        canonicalKey,
        productType,
        "v1",
        "propensity_v1",
        JSON.stringify(supplierCandidates),
        sessionTime,
      ],
    );

    // Generate bargaining events
    return await this.generateBargainEvents(
      sessionId,
      sessionTime,
      productType,
    );
  }

  async createProduct(productType) {
    let canonicalKey, supplierCandidates;

    switch (productType) {
      case "flight":
        const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
        const date = this.getRandomFutureDate();
        canonicalKey = `FL:${airline}-${route.origin}-${route.dest}-${date}-Y`;

        supplierCandidates = [
          {
            supplier_id: this.supplierIds.get("AMADEUS") || 1,
            canonical_key: canonicalKey,
          },
        ];
        break;

      case "hotel":
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const hotelId = Math.floor(Math.random() * 99999) + 10000;
        canonicalKey = `HT:${hotelId}:DLX:BRD-BB:CXL-FLEX`;

        supplierCandidates = [
          {
            supplier_id: this.supplierIds.get("HOTELBEDS") || 2,
            canonical_key: canonicalKey,
          },
        ];
        break;

      case "sightseeing":
        const location = CITIES[Math.floor(Math.random() * CITIES.length)];
        const activity = "SIGHTSEEING" + Math.floor(Math.random() * 1000);
        canonicalKey = `ST:${location}-${activity}:cultural:4H`;

        supplierCandidates = [
          {
            supplier_id: this.supplierIds.get("HOTELBEDS") || 2,
            canonical_key: canonicalKey,
          },
        ];
        break;
    }

    // Ensure product exists
    await pool.query(
      `
      INSERT INTO ai.products (canonical_key, product_type, attrs)
      VALUES ($1, $2, $3)
      ON CONFLICT (canonical_key) DO NOTHING
    `,
      [
        canonicalKey,
        productType,
        this.generateProductAttrs(productType, canonicalKey),
      ],
    );

    return { canonicalKey, supplierCandidates };
  }

  generateProductAttrs(productType, canonicalKey) {
    const parts = canonicalKey.split(":");

    switch (productType) {
      case "flight":
        const [, flightInfo] = parts;
        const [airline, origin, dest, date] = flightInfo.split("-");
        return JSON.stringify({
          airline,
          origin,
          dest,
          dep_date: date,
          fare_basis: "Y",
        });

      case "hotel":
        const [, hotelId] = parts;
        return JSON.stringify({
          hotel_id: hotelId,
          city: "UNKNOWN",
          room_code: "DLX",
          board: "BB",
        });

      case "sightseeing":
        const [, locationActivity] = parts;
        const [location] = locationActivity.split("-");
        return JSON.stringify({
          location,
          category: "cultural",
          duration: "4H",
        });

      default:
        return JSON.stringify({});
    }
  }

  async generateBargainEvents(sessionId, sessionTime, productType) {
    const userTier = USER_TIERS[Math.floor(Math.random() * USER_TIERS.length)];
    const userStyle =
      USER_STYLES[Math.floor(Math.random() * USER_STYLES.length)];

    // Generate base pricing
    const basePrices = {
      flight: { min: 150, max: 800 },
      hotel: { min: 80, max: 300 },
      sightseeing: { min: 30, max: 150 },
    };

    const priceRange = basePrices[productType];
    const trueCost =
      priceRange.min + Math.random() * (priceRange.max - priceRange.min);
    const displayPrice = trueCost * (1.15 + Math.random() * 0.15); // 15-30% markup

    let eventCount = 0;
    let currentTime = new Date(sessionTime);
    let accepted = false;

    // Determine if this session will be accepted (based on user style)
    const acceptanceProbability =
      {
        cautious: 0.25,
        persistent: 0.45,
        generous: 0.65,
      }[userStyle] || 0.4;

    const willAccept = Math.random() < acceptanceProbability;
    const rounds = willAccept
      ? Math.floor(Math.random() * 3) + 1
      : Math.floor(Math.random() * 4) + 1;

    for (let round = 1; round <= rounds; round++) {
      currentTime = new Date(
        currentTime.getTime() + (30 + Math.random() * 120) * 1000,
      ); // 30s-2min between rounds

      const isLastRound = round === rounds;
      const shouldAccept = willAccept && isLastRound;

      // Generate counter price with some discount
      const discountDepth = Math.random() * 0.2; // 0-20% discount
      const counterPrice = displayPrice * (1 - discountDepth);

      // Ensure counter price is above true cost
      const finalCounterPrice = Math.max(counterPrice, trueCost * 1.05);

      // Calculate acceptance probability based on discount
      const acceptProb = Math.min(0.95, 0.1 + discountDepth * 4);

      // Revenue calculation
      const revenue = shouldAccept ? finalCounterPrice : null;
      const perkCost = Math.random() < 0.2 ? Math.random() * 15 : 0; // 20% chance of perk

      await pool.query(
        `
        INSERT INTO ai.bargain_events (
          session_id, round, action, user_offer, counter_price, accepted,
          accept_prob, revenue_usd, true_cost_usd, perk_cost_usd,
          context, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
        [
          sessionId,
          round,
          shouldAccept ? "ACCEPT" : "COUNTER_PRICE",
          round > 1 ? displayPrice * (0.9 + Math.random() * 0.1) : null, // User's offer
          finalCounterPrice,
          shouldAccept,
          acceptProb,
          revenue,
          trueCost,
          perkCost,
          JSON.stringify({
            user_tier: userTier,
            user_style: userStyle,
            discount_depth: discountDepth,
            device_type: Math.random() < 0.6 ? "desktop" : "mobile",
          }),
          currentTime,
        ],
      );

      eventCount++;

      if (shouldAccept) {
        accepted = true;
        break;
      }
    }

    // Add promo redemption for some sessions
    if (accepted && Math.random() < 0.15) {
      // 15% use promo
      const promoResult = await pool.query(
        "SELECT id FROM ai.promos WHERE active = true ORDER BY RANDOM() LIMIT 1",
      );
      if (promoResult.rows.length > 0) {
        await pool.query(
          `
          INSERT INTO ai.promo_redemptions (promo_id, session_id, user_id, amount_usd)
          VALUES ($1, $2, $3, $4)
        `,
          [
            promoResult.rows[0].id,
            sessionId,
            "user_" + Math.floor(Math.random() * 1000),
            Math.random() * 50 + 10, // $10-60 discount
          ],
        );
      }
    }

    return { events: eventCount };
  }

  getRandomFutureDate() {
    const today = new Date();
    const futureDate = new Date(
      today.getTime() + (Math.random() * 90 + 7) * 24 * 60 * 60 * 1000,
    ); // 7-97 days ahead
    return futureDate.toISOString().split("T")[0];
  }

  async refreshMaterializedViews() {
    const views = [
      "ai.mv_daily_agg",
      "ai.mv_airline_route_daily",
      "ai.mv_hotel_city_daily",
    ];

    for (const view of views) {
      try {
        await pool.query(`REFRESH MATERIALIZED VIEW ${view}`);
        console.log(`  ✓ Refreshed ${view}`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to refresh ${view}:`, error.message);
      }
    }
  }

  async cleanup() {
    console.log("🧹 Cleaning up old fake data...");

    // Delete sessions older than 30 days
    const result = await pool.query(`
      DELETE FROM ai.bargain_sessions 
      WHERE started_at < NOW() - INTERVAL '31 days'
        AND policy_version = 'v1'
        AND model_version = 'propensity_v1'
    `);

    console.log(`Deleted ${result.rowCount} old sessions`);
  }
}

// Run seeder
async function runSeeder() {
  const seeder = new BargainDataSeeder();

  try {
    // Check if we should cleanup first
    if (process.argv.includes("--cleanup")) {
      await seeder.cleanup();
    }

    await seeder.seed();
    console.log("\n🎉 Data seeding completed successfully!");
    console.log("💡 Tip: You can now view the dashboards with realistic data");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Seeding interrupted");
  await pool.end();
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = BargainDataSeeder;
