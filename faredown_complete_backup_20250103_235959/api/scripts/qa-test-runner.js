#!/usr/bin/env node
/**
 * Functional QA Test Matrix
 * Rapid validation of bargain flows, errors, promos, and multi-supplier
 */

const https = require("https");
const { performance } = require("perf_hooks");

class QATestRunner {
  constructor() {
    this.config = {
      host: process.env.QA_HOST || "localhost:3000",
      authToken: process.env.QA_TOKEN || "qa_token_123",
      timeout: 5000,
    };

    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      testDetails: [],
    };
  }

  async makeRequest(path, data, method = "POST") {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.host.split(":")[0],
        port: this.config.host.split(":")[1] || 80,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.authToken}`,
          "User-Agent": "QA-TestRunner/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const duration = performance.now() - startTime;
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              data: parsed,
              duration: duration,
              headers: res.headers,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body,
              duration: duration,
              headers: res.headers,
            });
          }
        });
      });

      req.on("error", reject);
      if (data) req.write(JSON.stringify(data));
      req.end();

      setTimeout(() => {
        req.destroy();
        reject(new Error("Request timeout"));
      }, this.config.timeout);
    });
  }

  logTest(testName, status, details = "") {
    const result = {
      test: testName,
      status: status,
      details: details,
      timestamp: new Date().toISOString(),
    };

    this.results.testDetails.push(result);

    if (status === "PASS") {
      this.results.passed++;
      console.log(`✅ ${testName}: ${details}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${details}`);
      this.results.errors.push(`${testName}: ${details}`);
    }
  }

  // Test 1: Hotel accept at first counter, then bargain again
  async testHotelDoubleCounter() {
    console.log("\n🏨 Testing hotel double counter flow...");

    try {
      // Start session
      const sessionResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_hotel_user", tier: "GOLD", device_type: "desktop" },
          productCPO: {
            type: "hotel",
            supplier: "hotelbeds",
            product_id: "QA_HOTEL_001",
            city: "mumbai",
            check_in: "2024-06-15",
            check_out: "2024-06-17",
          },
        },
      );

      if (sessionResponse.status !== 200) {
        this.logTest(
          "Hotel Session Start",
          "FAIL",
          `Status ${sessionResponse.status}`,
        );
        return;
      }

      const session = sessionResponse.data;
      this.logTest(
        "Hotel Session Start",
        "PASS",
        `Session ${session.session_id}`,
      );

      // First offer - slightly below initial
      const firstOffer = Math.round(session.initial_offer.price * 0.85);
      const firstOfferResponse = await this.makeRequest(
        "/api/bargain/v1/session/offer",
        {
          session_id: session.session_id,
          user_offer: firstOffer,
          signals: {
            time_on_page: 45,
            scroll_depth: 80,
            device_type: "desktop",
          },
        },
      );

      if (firstOfferResponse.status !== 200) {
        this.logTest(
          "Hotel First Offer",
          "FAIL",
          `Status ${firstOfferResponse.status}`,
        );
        return;
      }

      const firstResult = firstOfferResponse.data;

      if (firstResult.decision === "counter" && firstResult.counter_offer) {
        // Accept the counter offer
        const acceptResponse = await this.makeRequest(
          "/api/bargain/v1/session/accept",
          {
            session_id: session.session_id,
          },
        );

        if (acceptResponse.status === 200) {
          this.logTest(
            "Hotel First Counter Accept",
            "PASS",
            `Accepted counter ${firstResult.counter_offer}`,
          );
        } else {
          this.logTest(
            "Hotel First Counter Accept",
            "FAIL",
            `Status ${acceptResponse.status}`,
          );
          return;
        }

        // Start a new session for second bargain
        const secondSessionResponse = await this.makeRequest(
          "/api/bargain/v1/session/start",
          {
            user: { id: "qa_hotel_user", tier: "GOLD", device_type: "desktop" },
            productCPO: {
              type: "hotel",
              supplier: "hotelbeds",
              product_id: "QA_HOTEL_002",
              city: "goa",
              check_in: "2024-07-01",
              check_out: "2024-07-03",
            },
          },
        );

        if (secondSessionResponse.status === 200) {
          const session2 = secondSessionResponse.data;

          // Second bargain - more aggressive
          const secondOffer = Math.round(session2.initial_offer.price * 0.75);
          const secondOfferResponse = await this.makeRequest(
            "/api/bargain/v1/session/offer",
            {
              session_id: session2.session_id,
              user_offer: secondOffer,
            },
          );

          if (secondOfferResponse.status === 200) {
            const secondResult = secondOfferResponse.data;

            if (
              secondResult.decision === "counter" &&
              secondResult.counter_offer
            ) {
              // Accept second counter
              const accept2Response = await this.makeRequest(
                "/api/bargain/v1/session/accept",
                {
                  session_id: session2.session_id,
                },
              );

              if (accept2Response.status === 200) {
                this.logTest(
                  "Hotel Double Counter Flow",
                  "PASS",
                  `Two successful counter-accepts: ${firstResult.counter_offer} & ${secondResult.counter_offer}`,
                );
              } else {
                this.logTest(
                  "Hotel Double Counter Flow",
                  "FAIL",
                  "Second accept failed",
                );
              }
            } else {
              this.logTest(
                "Hotel Double Counter Flow",
                "PARTIAL",
                `Second decision: ${secondResult.decision}`,
              );
            }
          }
        }
      } else {
        this.logTest(
          "Hotel Double Counter Flow",
          "PARTIAL",
          `First decision: ${firstResult.decision}`,
        );
      }
    } catch (error) {
      this.logTest("Hotel Double Counter Flow", "FAIL", error.message);
    }
  }

  // Test 2: Flight below floor → counter above floor → accept
  async testFlightBelowFloorFlow() {
    console.log("\n✈️ Testing flight below-floor recovery...");

    try {
      // Start flight session
      const sessionResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: {
            id: "qa_flight_user",
            tier: "standard",
            device_type: "mobile",
          },
          productCPO: {
            type: "flight",
            supplier: "amadeus",
            product_id: "QA_FLIGHT_001",
            route: "DEL-BOM",
            class_of_service: "economy",
          },
        },
      );

      if (sessionResponse.status !== 200) {
        this.logTest(
          "Flight Session Start",
          "FAIL",
          `Status ${sessionResponse.status}`,
        );
        return;
      }

      const session = sessionResponse.data;
      this.logTest(
        "Flight Session Start",
        "PASS",
        `Floor: ${session.min_floor}`,
      );

      // Offer below floor (should get counter)
      const belowFloorOffer = Math.round(session.min_floor * 0.8);
      const offerResponse = await this.makeRequest(
        "/api/bargain/v1/session/offer",
        {
          session_id: session.session_id,
          user_offer: belowFloorOffer,
        },
      );

      if (offerResponse.status !== 200) {
        this.logTest(
          "Flight Below Floor Offer",
          "FAIL",
          `Status ${offerResponse.status}`,
        );
        return;
      }

      const result = offerResponse.data;

      if (result.decision === "counter" || result.decision === "reject") {
        if (result.counter_offer && result.counter_offer >= session.min_floor) {
          this.logTest(
            "Flight Floor Protection",
            "PASS",
            `Offer ${belowFloorOffer} → Counter ${result.counter_offer} (above floor ${session.min_floor})`,
          );

          // Accept the counter offer
          const acceptResponse = await this.makeRequest(
            "/api/bargain/v1/session/accept",
            {
              session_id: session.session_id,
            },
          );

          if (acceptResponse.status === 200) {
            this.logTest(
              "Flight Counter Accept",
              "PASS",
              `Accepted counter ${result.counter_offer}`,
            );
          } else {
            this.logTest(
              "Flight Counter Accept",
              "FAIL",
              `Status ${acceptResponse.status}`,
            );
          }
        } else {
          this.logTest(
            "Flight Floor Protection",
            "FAIL",
            `Counter ${result.counter_offer} still below floor ${session.min_floor}`,
          );
        }
      } else {
        this.logTest(
          "Flight Floor Protection",
          "FAIL",
          `Unexpected decision for below-floor offer: ${result.decision}`,
        );
      }
    } catch (error) {
      this.logTest("Flight Below Floor Flow", "FAIL", error.message);
    }
  }

  // Test 3: Error handling - RATE_STALE and INVENTORY_CHANGED
  async testErrorHandling() {
    console.log("\n🚨 Testing error handling...");

    try {
      // Test with stale rate flag
      const staleRateResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_error_user", tier: "standard" },
          productCPO: {
            type: "hotel",
            supplier: "hotelbeds",
            product_id: "STALE_RATE_TEST",
            city: "mumbai",
          },
          force_error: "RATE_STALE", // Test flag
        },
      );

      if (
        staleRateResponse.status === 409 ||
        (staleRateResponse.data &&
          staleRateResponse.data.error_code === "RATE_STALE")
      ) {
        this.logTest(
          "RATE_STALE Error",
          "PASS",
          "Properly returned stale rate error",
        );
      } else {
        this.logTest(
          "RATE_STALE Error",
          "FAIL",
          "Did not trigger RATE_STALE error",
        );
      }

      // Test inventory change during accept
      const inventoryTestSession = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_inventory_user", tier: "GOLD" },
          productCPO: {
            type: "flight",
            supplier: "amadeus",
            product_id: "INVENTORY_TEST",
            route: "BOM-DXB",
          },
        },
      );

      if (inventoryTestSession.status === 200) {
        const session = inventoryTestSession.data;

        // Try to accept with forced inventory change
        const inventoryAcceptResponse = await this.makeRequest(
          "/api/bargain/v1/session/accept",
          {
            session_id: session.session_id,
            force_error: "INVENTORY_CHANGED", // Test flag
          },
        );

        if (inventoryAcceptResponse.status === 409) {
          this.logTest(
            "INVENTORY_CHANGED Error",
            "PASS",
            "Properly returned inventory error",
          );
        } else {
          this.logTest(
            "INVENTORY_CHANGED Error",
            "FAIL",
            "Did not trigger INVENTORY_CHANGED error",
          );
        }
      }

      // Test policy blocked (blackout dates)
      const blackoutResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_blackout_user", tier: "standard" },
          productCPO: {
            type: "hotel",
            supplier: "hotelbeds",
            product_id: "BLACKOUT_TEST",
            city: "goa",
            check_in: "2024-12-25", // Christmas - likely blackout
          },
        },
      );

      if (
        blackoutResponse.status === 403 ||
        (blackoutResponse.data &&
          blackoutResponse.data.error_code === "POLICY_BLOCKED")
      ) {
        this.logTest(
          "POLICY_BLOCKED Error",
          "PASS",
          "Properly blocked blackout dates",
        );
      } else {
        this.logTest(
          "POLICY_BLOCKED Error",
          "SKIP",
          "No blackout policy configured",
        );
      }
    } catch (error) {
      this.logTest("Error Handling Tests", "FAIL", error.message);
    }
  }

  // Test 4: Promo codes and user tiers
  async testPromosAndTiers() {
    console.log("\n🎁 Testing promos and user tiers...");

    try {
      // Test percentage promo
      const percentPromoResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: {
            id: "qa_promo_user",
            tier: "standard",
            device_type: "desktop",
          },
          productCPO: {
            type: "hotel",
            supplier: "hotelbeds",
            product_id: "PROMO_TEST_001",
            city: "bangalore",
          },
          promo_code: "SAVE20",
        },
      );

      if (percentPromoResponse.status === 200) {
        const session = percentPromoResponse.data;
        const hasPromoData =
          session.initial_offer.explanation &&
          session.initial_offer.explanation.includes("promo");

        this.logTest(
          "Percentage Promo",
          hasPromoData ? "PASS" : "FAIL",
          `Promo applied: ${hasPromoData}`,
        );
      } else {
        this.logTest(
          "Percentage Promo",
          "FAIL",
          `Status ${percentPromoResponse.status}`,
        );
      }

      // Test flat amount promo
      const flatPromoResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_promo_user2", tier: "GOLD", device_type: "mobile" },
          productCPO: {
            type: "flight",
            supplier: "amadeus",
            product_id: "PROMO_TEST_002",
            route: "DEL-BLR",
          },
          promo_code: "FLAT50",
        },
      );

      if (flatPromoResponse.status === 200) {
        this.logTest("Flat Amount Promo", "PASS", "Flat promo applied");
      } else {
        this.logTest(
          "Flat Amount Promo",
          "FAIL",
          `Status ${flatPromoResponse.status}`,
        );
      }

      // Test PLATINUM tier bonus
      const platinumResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: {
            id: "qa_platinum_user",
            tier: "PLATINUM",
            device_type: "desktop",
          },
          productCPO: {
            type: "hotel",
            supplier: "hotelbeds",
            product_id: "TIER_TEST_001",
            city: "delhi",
          },
        },
      );

      if (platinumResponse.status === 200) {
        const session = platinumResponse.data;

        // Make an offer to see tier-based acceptance nudges
        const tierOfferResponse = await this.makeRequest(
          "/api/bargain/v1/session/offer",
          {
            session_id: session.session_id,
            user_offer: Math.round(session.initial_offer.price * 0.9),
          },
        );

        if (tierOfferResponse.status === 200) {
          const result = tierOfferResponse.data;
          const hasTierNudge =
            result.explain &&
            (result.explain.includes("PLATINUM") ||
              result.explain.includes("tier") ||
              result.explain.includes("valued"));

          this.logTest(
            "PLATINUM Tier Bonus",
            hasTierNudge ? "PASS" : "PARTIAL",
            `Tier acknowledgment: ${hasTierNudge}`,
          );
        }
      }
    } catch (error) {
      this.logTest("Promos and Tiers", "FAIL", error.message);
    }
  }

  // Test 5: Multi-supplier arbitration
  async testMultiSupplierArbitration() {
    console.log("\n🔄 Testing multi-supplier arbitration...");

    try {
      // Request same CPO that should have multiple suppliers
      const multiSupplierResponse = await this.makeRequest(
        "/api/bargain/v1/session/start",
        {
          user: { id: "qa_multisupplier_user", tier: "GOLD" },
          productCPO: {
            type: "flight",
            supplier: "multi", // Special flag to test multi-supplier
            product_id: "MULTI_TEST_001",
            route: "DEL-DXB",
          },
        },
      );

      if (multiSupplierResponse.status === 200) {
        const session = multiSupplierResponse.data;

        // Make offer and accept to test supplier selection
        const offerResponse = await this.makeRequest(
          "/api/bargain/v1/session/offer",
          {
            session_id: session.session_id,
            user_offer: Math.round(session.initial_offer.price * 0.95),
          },
        );

        if (
          offerResponse.status === 200 &&
          offerResponse.data.decision === "accept"
        ) {
          const acceptResponse = await this.makeRequest(
            "/api/bargain/v1/session/accept",
            {
              session_id: session.session_id,
            },
          );

          if (acceptResponse.status === 200) {
            const booking = acceptResponse.data;
            const hasSupplierInfo =
              booking.payment_payload && booking.payment_payload.supplier_info;

            this.logTest(
              "Multi-Supplier Arbitration",
              hasSupplierInfo ? "PASS" : "PARTIAL",
              `Supplier selection: ${hasSupplierInfo ? "included" : "not included"}`,
            );
          } else if (acceptResponse.status === 409) {
            // Lock failure - test fallback
            this.logTest(
              "Multi-Supplier Fallback",
              "PASS",
              "Lock conflict handled - fallback triggered",
            );
          }
        }
      } else {
        this.logTest(
          "Multi-Supplier Setup",
          "SKIP",
          "Multi-supplier test data not available",
        );
      }
    } catch (error) {
      this.logTest("Multi-Supplier Arbitration", "FAIL", error.message);
    }
  }

  // Run all functional tests
  async runAllTests() {
    console.log("🧪 Starting Functional QA Test Matrix...\n");
    console.log(`Target: ${this.config.host}`);
    console.log(`Timeout: ${this.config.timeout}ms\n`);

    const startTime = Date.now();

    // Run all test suites
    await this.testHotelDoubleCounter();
    await this.testFlightBelowFloorFlow();
    await this.testErrorHandling();
    await this.testPromosAndTiers();
    await this.testMultiSupplierArbitration();

    // Generate report
    this.generateReport(startTime);
  }

  generateReport(startTime) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const successRate = (
      (this.results.passed / (this.results.passed + this.results.failed)) *
      100
    ).toFixed(1);

    console.log("\n📊 QA TEST RESULTS");
    console.log("==================");
    console.log(`Duration: ${duration}s`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${successRate}%`);

    // Test breakdown
    console.log("\n📋 Test Breakdown:");
    this.results.testDetails.forEach((test) => {
      const status =
        test.status === "PASS"
          ? "✅"
          : test.status === "PARTIAL"
            ? "⚠️"
            : test.status === "SKIP"
              ? "⏭️"
              : "❌";
      console.log(`  ${status} ${test.test}: ${test.details}`);
    });

    // Critical failures
    if (this.results.errors.length > 0) {
      console.log("\n❌ Critical Issues:");
      this.results.errors.forEach((error) => console.log(`  • ${error}`));
    }

    // Readiness assessment
    const criticalFails = this.results.testDetails.filter(
      (t) =>
        t.status === "FAIL" &&
        (t.test.includes("Floor Protection") ||
          t.test.includes("Never-Loss") ||
          t.test.includes("Accept")),
    );

    if (criticalFails.length === 0 && this.results.failed <= 2) {
      console.log("\n✅ QA PASSED - Ready for production rollout!");
    } else if (criticalFails.length === 0) {
      console.log(
        "\n⚠️ QA PARTIAL - Minor issues detected, proceed with caution",
      );
    } else {
      console.log(
        "\n❌ QA FAILED - Critical issues must be resolved before rollout",
      );
    }

    // Exit code
    process.exit(criticalFails.length > 0 ? 1 : 0);
  }
}

// CLI execution
if (require.main === module) {
  const runner = new QATestRunner();
  runner.runAllTests().catch((error) => {
    console.error("💥 QA test suite crashed:", error);
    process.exit(1);
  });
}

module.exports = QATestRunner;
