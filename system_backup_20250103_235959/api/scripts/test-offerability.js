/**
 * Offerability Engine Test Script
 * Tests policy parsing and feasible action generation
 */

const offerabilityEngine = require("../services/offerabilityEngine");
const policyParser = require("../services/policyParser");
const redisService = require("../services/redisService");

async function testOfferabilityEngine() {
  console.log("🚀 Testing Offerability Engine...\n");

  try {
    // Initialize Redis
    await redisService.init();
    console.log("✅ Redis connected\n");

    // Test 1: Policy Parsing
    console.log("📋 Test 1: Policy Parsing");
    const startPolicyTime = Date.now();
    const policy = await policyParser.getParsedPolicy();
    const policyTime = Date.now() - startPolicyTime;

    console.log(`✓ Policy parsed in ${policyTime}ms`);
    console.log(`✓ Policy version: ${policy.version}`);
    console.log(`✓ Global max_rounds: ${policy.global.max_rounds}`);
    console.log(
      `✓ Flight min_margin: $${policy.price_rules.flight.min_margin_usd}`,
    );
    console.log(
      `✓ Hotel max_discount: ${policy.price_rules.hotel.max_discount_pct * 100}%\n`,
    );

    // Test 2: Flight Feasible Actions
    console.log("✈️  Test 2: Flight Feasible Actions");
    const flightContext = {
      canonical_key: "FL:AI-BOM-DXB-2025-10-01-Y",
      product_type: "flight",
      supplier_snapshots: [
        {
          supplier_id: 1,
          currency: "USD",
          net: 285.0,
          taxes: 45.5,
          fees: 12.0,
          inventory_state: "AVAILABLE",
          snapshot_at: new Date(),
        },
      ],
      user_profile: {
        tier: "GOLD",
        style: "persistent",
      },
      session_context: {
        round: 1,
        inventory_age_minutes: 2,
        elapsed_ms: 50,
      },
      promo_code: null,
    };

    const startFlightTime = Date.now();
    const flightActions =
      await offerabilityEngine.generateFeasibleActions(flightContext);
    const flightTime = Date.now() - startFlightTime;

    console.log(`✓ Flight actions generated in ${flightTime}ms`);
    console.log(`✓ Cost floor: $${flightActions.cost_floor}`);
    console.log(
      `✓ Price range: $${flightActions.min_price} - $${flightActions.max_price}`,
    );
    console.log(`✓ Actions available: ${flightActions.action_count}`);
    console.log(`✓ Allow perks: ${flightActions.allow_perks}\n`);

    // Test 3: Hotel Feasible Actions with Promo
    console.log("🏨 Test 3: Hotel Feasible Actions (with promo)");
    const hotelContext = {
      canonical_key: "HT:12345:DLX:BRD-BB:CXL-FLEX",
      product_type: "hotel",
      supplier_snapshots: [
        {
          supplier_id: 2,
          currency: "USD",
          net: 120.0,
          taxes: 18.0,
          fees: 5.0,
          inventory_state: "AVAILABLE",
          snapshot_at: new Date(),
        },
      ],
      user_profile: {
        tier: "PLATINUM",
        style: "generous",
      },
      session_context: {
        round: 1,
        inventory_age_minutes: 1,
        elapsed_ms: 30,
      },
      promo_code: "HOTEL15",
    };

    const startHotelTime = Date.now();
    const hotelActions =
      await offerabilityEngine.generateFeasibleActions(hotelContext);
    const hotelTime = Date.now() - startHotelTime;

    console.log(`✓ Hotel actions generated in ${hotelTime}ms`);
    console.log(`✓ Cost floor: $${hotelActions.cost_floor}`);
    console.log(
      `✓ Price range: $${hotelActions.min_price} - $${hotelActions.max_price}`,
    );
    console.log(`✓ Actions available: ${hotelActions.action_count}`);
    console.log(`✓ Allow perks: ${hotelActions.allow_perks}`);
    console.log(
      `✓ Tier boost applied: ${hotelActions.constraints.tier_boost_applied}\n`,
    );

    // Test 4: Performance Test (10 consecutive calls)
    console.log("⚡ Test 4: Performance Test (10 calls)");
    const perfStartTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await offerabilityEngine.generateFeasibleActions(flightContext);
    }

    const totalPerfTime = Date.now() - perfStartTime;
    const avgPerfTime = totalPerfTime / 10;

    console.log(`✓ 10 calls completed in ${totalPerfTime}ms`);
    console.log(`✓ Average time per call: ${avgPerfTime}ms`);
    console.log(
      `✓ Performance target (<50ms): ${avgPerfTime < 50 ? "✅ PASS" : "❌ FAIL"}\n`,
    );

    // Test 5: Guardrails Test
    console.log("🛡️  Test 5: Guardrails Test");
    const guardrailContext = {
      ...flightContext,
      session_context: {
        round: 4, // Exceeds max_rounds
        inventory_age_minutes: 10, // Stale inventory
        elapsed_ms: 300, // Near latency limit
      },
    };

    const startGuardTime = Date.now();
    const guardActions =
      await offerabilityEngine.generateFeasibleActions(guardrailContext);
    const guardTime = Date.now() - startGuardTime;

    console.log(`✓ Guardrail actions generated in ${guardTime}ms`);
    console.log(
      `✓ Actions after guardrails: ${guardActions.filtered_action_count}`,
    );
    console.log(`✓ Guardrails applied: ${guardActions.guardrails_applied}\n`);

    // Test 6: Health Check
    console.log("🏥 Test 6: Health Check");
    const healthCheck = await offerabilityEngine.healthCheck();
    console.log(`✓ Health status: ${healthCheck.status}`);
    console.log(`✓ Policy version: ${healthCheck.policy_version}`);
    console.log(`✓ Total calls: ${healthCheck.performance.calls}`);
    console.log(
      `✓ Average time: ${healthCheck.performance.avgTime.toFixed(2)}ms`,
    );
    console.log(
      `✓ Error rate: ${(healthCheck.performance.error_rate * 100).toFixed(2)}%\n`,
    );

    // Performance Summary
    console.log("📊 Performance Summary:");
    console.log(`Policy parsing: ${policyTime}ms (target: <30ms)`);
    console.log(`Flight actions: ${flightTime}ms (target: <50ms)`);
    console.log(`Hotel actions: ${hotelTime}ms (target: <50ms)`);
    console.log(`Average across 10 calls: ${avgPerfTime}ms (target: <50ms)`);

    const allTargetsMet =
      policyTime < 30 && flightTime < 50 && hotelTime < 50 && avgPerfTime < 50;
    console.log(
      `\n🎯 Performance targets: ${allTargetsMet ? "✅ ALL PASS" : "❌ SOME FAIL"}`,
    );

    console.log("\n✅ Offerability Engine test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await redisService.close();
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Test interrupted");
  await redisService.close();
  process.exit(0);
});

// Run test
if (require.main === module) {
  testOfferabilityEngine().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { testOfferabilityEngine };
