/**
 * Bargain API Test Script
 * Tests the complete /api/bargain/v1/* endpoints
 */

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Test configuration
const BASE_URL = "http://localhost:3001";
const API_BASE = `${BASE_URL}/api/bargain/v1`;

class BargainAPITester {
  constructor() {
    this.sessionId = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  async runAllTests() {
    console.log("🚀 Starting Bargain API Tests...\n");

    try {
      // Test 1: Health check
      await this.testHealthCheck();

      // Test 2: Session start (flight)
      await this.testSessionStartFlight();

      // Test 3: Session offer
      await this.testSessionOffer();

      // Test 4: Session accept
      await this.testSessionAccept();

      // Test 5: Event logging
      await this.testEventLogging();

      // Test 6: Session start (hotel)
      await this.testSessionStartHotel();

      // Test 7: Performance test
      await this.testPerformance();

      // Test 8: Error handling
      await this.testErrorHandling();

      // Results summary
      this.printResults();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      process.exit(1);
    }
  }

  async testHealthCheck() {
    console.log("🏥 Test 1: Health Check");

    try {
      const response = await axios.get(`${API_BASE}/health`);

      this.assert(response.status === 200, "Health check returns 200");
      this.assert(
        response.data.status === "healthy",
        "Health status is healthy",
      );
      this.assert(response.data.version === "v1", "Version is v1");

      console.log(
        `✓ Health check passed (${response.headers["x-response-time"]})`,
      );
      console.log(`✓ Uptime: ${response.data.uptime.toFixed(2)}s\n`);
    } catch (error) {
      this.recordError("Health check failed", error);
    }
  }

  async testSessionStartFlight() {
    console.log("✈️  Test 2: Session Start (Flight)");

    const requestBody = {
      user: {
        id: "test-user-123",
        tier: "GOLD",
      },
      productCPO: {
        type: "flight",
        canonical_key: "FL:AI-BOM-DXB-2025-10-01-Y",
        attrs: {
          airline: "AI",
          origin: "BOM",
          dest: "DXB",
          dep_date: "2025-10-01",
          fare_basis: "Y",
        },
        displayed_price: 312.0,
        currency: "USD",
      },
      supplierSnapshots: [
        {
          supplier_id: 1,
          currency: "USD",
          net: 285.0,
          taxes: 45.5,
          fees: 12.0,
          inventory_state: "AVAILABLE",
          snapshot_at: new Date().toISOString(),
        },
      ],
      promo_code: null,
    };

    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${API_BASE}/session/start`,
        requestBody,
      );
      const responseTime = Date.now() - startTime;

      this.assert(response.status === 200, "Session start returns 200");
      this.assert(response.data.session_id, "Session ID is returned");
      this.assert(response.data.initial_offer, "Initial offer is returned");
      this.assert(
        response.data.initial_offer.price > 0,
        "Initial offer price is positive",
      );
      this.assert(response.data.min_floor > 0, "Min floor is positive");
      this.assert(response.data.explain, "Explanation is provided");
      this.assert(response.data.safety_capsule, "Safety capsule is provided");
      this.assert(
        responseTime < 300,
        `Response time ${responseTime}ms < 300ms`,
      );

      this.sessionId = response.data.session_id;

      console.log(`✓ Session started: ${this.sessionId}`);
      console.log(`✓ Initial offer: $${response.data.initial_offer.price}`);
      console.log(`✓ Min floor: $${response.data.min_floor}`);
      console.log(`✓ Response time: ${responseTime}ms`);
      console.log(`✓ Explanation: ${response.data.explain}\n`);
    } catch (error) {
      this.recordError("Session start failed", error);
    }
  }

  async testSessionOffer() {
    console.log("💰 Test 3: Session Offer");

    if (!this.sessionId) {
      this.recordError(
        "Session offer test",
        new Error("No session ID from previous test"),
      );
      return;
    }

    const requestBody = {
      session_id: this.sessionId,
      user_offer: 295.0,
      signals: {
        interaction_time_ms: 15000,
        price_viewed_count: 3,
      },
    };

    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${API_BASE}/session/offer`,
        requestBody,
      );
      const responseTime = Date.now() - startTime;

      this.assert(response.status === 200, "Session offer returns 200");
      this.assert(response.data.decision, "Decision is returned");
      this.assert(
        response.data.accept_prob >= 0 && response.data.accept_prob <= 1,
        "Accept probability is valid",
      );
      this.assert(response.data.min_floor > 0, "Min floor is positive");
      this.assert(response.data.explain, "Explanation is provided");
      this.assert(
        responseTime < 300,
        `Response time ${responseTime}ms < 300ms`,
      );

      console.log(`✓ User offer: $${requestBody.user_offer}`);
      console.log(`✓ Decision: ${JSON.stringify(response.data.decision)}`);
      console.log(
        `✓ Accept probability: ${(response.data.accept_prob * 100).toFixed(1)}%`,
      );
      console.log(`✓ Response time: ${responseTime}ms`);
      console.log(`✓ Explanation: ${response.data.explain}\n`);
    } catch (error) {
      this.recordError("Session offer failed", error);
    }
  }

  async testSessionAccept() {
    console.log("✅ Test 4: Session Accept");

    if (!this.sessionId) {
      this.recordError(
        "Session accept test",
        new Error("No session ID from previous test"),
      );
      return;
    }

    const requestBody = {
      session_id: this.sessionId,
    };

    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${API_BASE}/session/accept`,
        requestBody,
      );
      const responseTime = Date.now() - startTime;

      this.assert(response.status === 200, "Session accept returns 200");
      this.assert(
        response.data.supplier_lock_id,
        "Supplier lock ID is returned",
      );
      this.assert(response.data.payment_payload, "Payment payload is returned");
      this.assert(response.data.final_capsule, "Final capsule is returned");
      this.assert(
        responseTime < 300,
        `Response time ${responseTime}ms < 300ms`,
      );

      console.log(`✓ Supplier lock ID: ${response.data.supplier_lock_id}`);
      console.log(`✓ Payment amount: $${response.data.payment_payload.amount}`);
      console.log(`✓ Response time: ${responseTime}ms\n`);
    } catch (error) {
      this.recordError("Session accept failed", error);
    }
  }

  async testEventLogging() {
    console.log("📊 Test 5: Event Logging");

    const requestBody = {
      session_id: this.sessionId || uuidv4(),
      name: "price_viewed",
      payload: {
        price: 295.0,
        timestamp: Date.now(),
        user_agent: "test-suite",
      },
    };

    try {
      const response = await axios.post(`${API_BASE}/event/log`, requestBody);

      this.assert(response.status === 204, "Event logging returns 204");

      console.log(`✓ Event logged successfully\n`);
    } catch (error) {
      this.recordError("Event logging failed", error);
    }
  }

  async testSessionStartHotel() {
    console.log("🏨 Test 6: Session Start (Hotel)");

    const requestBody = {
      user: {
        id: "test-user-456",
        tier: "PLATINUM",
      },
      productCPO: {
        type: "hotel",
        canonical_key: "HT:12345:DLX:BRD-BB:CXL-FLEX",
        attrs: {
          hotel_id: "12345",
          city: "DXB",
          room_code: "DLX",
          board: "BB",
          cancel_policy: "FLEX",
        },
        displayed_price: 142.0,
        currency: "USD",
      },
      supplierSnapshots: [
        {
          supplier_id: 2,
          currency: "USD",
          net: 120.0,
          taxes: 18.0,
          fees: 5.0,
          inventory_state: "AVAILABLE",
          snapshot_at: new Date().toISOString(),
        },
      ],
      promo_code: "HOTEL15",
    };

    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${API_BASE}/session/start`,
        requestBody,
      );
      const responseTime = Date.now() - startTime;

      this.assert(response.status === 200, "Hotel session start returns 200");
      this.assert(response.data.session_id, "Hotel session ID is returned");
      this.assert(
        response.data.initial_offer.price > 0,
        "Hotel initial offer price is positive",
      );
      this.assert(
        responseTime < 300,
        `Hotel response time ${responseTime}ms < 300ms`,
      );

      console.log(`✓ Hotel session started: ${response.data.session_id}`);
      console.log(
        `✓ Hotel initial offer: $${response.data.initial_offer.price}`,
      );
      console.log(`✓ Response time: ${responseTime}ms\n`);
    } catch (error) {
      this.recordError("Hotel session start failed", error);
    }
  }

  async testPerformance() {
    console.log("⚡ Test 7: Performance Test (10 concurrent requests)");

    const requestBody = {
      user: {
        id: "perf-test-user",
        tier: "SILVER",
      },
      productCPO: {
        type: "flight",
        canonical_key: "FL:6E-DEL-BLR-2025-10-15-Y",
        attrs: {
          airline: "6E",
          origin: "DEL",
          dest: "BLR",
          dep_date: "2025-10-15",
          fare_basis: "Y",
        },
        displayed_price: 89.0,
        currency: "USD",
      },
      supplierSnapshots: [
        {
          supplier_id: 1,
          currency: "USD",
          net: 75.0,
          taxes: 10.5,
          fees: 4.0,
          inventory_state: "AVAILABLE",
          snapshot_at: new Date().toISOString(),
        },
      ],
    };

    try {
      const startTime = Date.now();

      const promises = Array(10)
        .fill()
        .map(() => axios.post(`${API_BASE}/session/start`, requestBody));

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 10;

      const allSuccessful = responses.every((r) => r.status === 200);
      const responseTimes = responses.map((r) =>
        parseInt(r.headers["x-response-time"]?.replace("ms", "") || "0"),
      );
      const maxTime = Math.max(...responseTimes);
      const p95Time = responseTimes.sort((a, b) => a - b)[
        Math.floor(responseTimes.length * 0.95)
      ];

      this.assert(allSuccessful, "All concurrent requests successful");
      this.assert(avgTime < 500, `Average time ${avgTime}ms < 500ms`);
      this.assert(p95Time < 300, `P95 time ${p95Time}ms < 300ms target`);

      console.log(`✓ 10 concurrent requests completed`);
      console.log(`✓ Total time: ${totalTime}ms`);
      console.log(`✓ Average time: ${avgTime.toFixed(1)}ms`);
      console.log(`✓ Max time: ${maxTime}ms`);
      console.log(`✓ P95 time: ${p95Time}ms`);
      console.log(
        `✓ Performance target: ${p95Time < 300 ? "✅ PASS" : "❌ FAIL"}\n`,
      );
    } catch (error) {
      this.recordError("Performance test failed", error);
    }
  }

  async testErrorHandling() {
    console.log("🚫 Test 8: Error Handling");

    try {
      // Test invalid product type
      try {
        await axios.post(`${API_BASE}/session/start`, {
          user: { id: "test" },
          productCPO: {
            type: "invalid_type",
            canonical_key: "INVALID",
          },
        });
        this.recordError(
          "Error handling",
          new Error("Should have failed with invalid product type"),
        );
      } catch (error) {
        this.assert(
          error.response.status === 400,
          "Invalid product type returns 400",
        );
        console.log(`✓ Invalid product type handled correctly`);
      }

      // Test missing session ID
      try {
        await axios.post(`${API_BASE}/session/offer`, {
          user_offer: 100,
        });
        this.recordError(
          "Error handling",
          new Error("Should have failed with missing session ID"),
        );
      } catch (error) {
        this.assert(
          error.response.status === 400,
          "Missing session ID returns 400",
        );
        console.log(`✓ Missing session ID handled correctly`);
      }

      // Test invalid session ID format
      try {
        await axios.post(`${API_BASE}/session/offer`, {
          session_id: "invalid-uuid",
          user_offer: 100,
        });
        this.recordError(
          "Error handling",
          new Error("Should have failed with invalid UUID"),
        );
      } catch (error) {
        this.assert(error.response.status === 400, "Invalid UUID returns 400");
        console.log(`✓ Invalid session ID format handled correctly`);
      }

      // Test non-existent session
      try {
        await axios.post(`${API_BASE}/session/offer`, {
          session_id: uuidv4(),
          user_offer: 100,
        });
        this.recordError(
          "Error handling",
          new Error("Should have failed with non-existent session"),
        );
      } catch (error) {
        this.assert(
          error.response.status === 404,
          "Non-existent session returns 404",
        );
        console.log(`✓ Non-existent session handled correctly`);
      }

      console.log(`✓ Error handling tests completed\n`);
    } catch (error) {
      this.recordError("Error handling test failed", error);
    }
  }

  assert(condition, message) {
    this.testResults.total++;
    if (condition) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
      this.testResults.errors.push(`Assertion failed: ${message}`);
      console.log(`❌ ${message}`);
    }
  }

  recordError(testName, error) {
    this.testResults.total++;
    this.testResults.failed++;
    this.testResults.errors.push(`${testName}: ${error.message}`);
    console.log(`❌ ${testName}: ${error.message}`);
  }

  printResults() {
    console.log("📋 Test Results Summary:");
    console.log(`Total tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(
      `Success rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`,
    );

    if (this.testResults.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.testResults.errors.forEach((error) => console.log(`  - ${error}`));
    }

    const allPassed = this.testResults.failed === 0;
    console.log(
      `\n🎯 Overall result: ${allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`,
    );

    if (!allPassed) {
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new BargainAPITester();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Tests interrupted");
    process.exit(0);
  });

  tester.runAllTests().catch((error) => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  });
}

module.exports = BargainAPITester;
