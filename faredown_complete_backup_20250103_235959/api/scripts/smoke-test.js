#!/usr/bin/env node
/**
 * 15-Minute Smoke Test Suite
 * Tests API latency, correctness, and floor enforcement
 */

const https = require("https");
const { performance } = require("perf_hooks");

// Configuration
const CONFIG = {
  host: process.env.API_HOST || "localhost:3000",
  authToken: process.env.API_TOKEN || "test_token_123",
  maxLatency: 300, // 300ms requirement
  testTimeout: 15 * 60 * 1000, // 15 minutes
};

// Test data
const TEST_CASES = {
  hotel: {
    user: { id: "u1", tier: "GOLD", device_type: "desktop" },
    productCPO: {
      type: "hotel",
      supplier: "hotelbeds",
      product_id: "12345",
      city: "mumbai",
      check_in: "2024-06-15",
      check_out: "2024-06-17",
      guest_count: 2,
    },
  },
  flight: {
    user: { id: "u2", tier: "PLATINUM", device_type: "mobile" },
    productCPO: {
      type: "flight",
      supplier: "amadeus",
      product_id: "AI101",
      route: "DEL-BOM",
      class_of_service: "economy",
    },
  },
  flightWithPromo: {
    user: { id: "u3", tier: "standard", device_type: "desktop" },
    productCPO: {
      type: "flight",
      supplier: "amadeus",
      product_id: "EK500",
      route: "BOM-DXB",
      class_of_service: "business",
    },
    promo_code: "SAVE20",
  },
};

class SmokeTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      timings: [],
      startTime: Date.now(),
    };
  }

  async makeRequest(path, data, method = "POST") {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: CONFIG.host.split(":")[0],
        port:
          CONFIG.host.split(":")[1] ||
          (CONFIG.host.includes("https") ? 443 : 80),
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.authToken}`,
          "User-Agent": "SmokeTest/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          try {
            const parsed = JSON.parse(body);
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

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();

      // Timeout after 5 seconds
      setTimeout(() => {
        req.destroy();
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  async testSessionStart(testCase, caseName) {
    console.log(`\n🧪 Testing ${caseName} session start...`);

    try {
      const response = await this.makeRequest(
        "/api/bargain/v1/session/start",
        testCase,
      );

      // Check status code
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`,
        );
      }

      // Check latency
      if (response.duration > CONFIG.maxLatency) {
        this.results.errors.push(
          `❌ ${caseName}: Latency ${response.duration.toFixed(2)}ms > ${CONFIG.maxLatency}ms`,
        );
      } else {
        console.log(`✅ Latency: ${response.duration.toFixed(2)}ms`);
      }

      this.results.timings.push({
        test: caseName,
        duration: response.duration,
        timestamp: Date.now(),
      });

      // Check required fields
      const { data } = response;
      if (!data.session_id) throw new Error("Missing session_id");
      if (!data.initial_offer) throw new Error("Missing initial_offer");
      if (!data.min_floor) throw new Error("Missing min_floor");
      if (!data.safety_capsule) throw new Error("Missing safety_capsule");

      console.log(
        `✅ ${caseName}: Session ${data.session_id}, offer ${data.initial_offer.price}, floor ${data.min_floor}`,
      );

      this.results.passed++;
      return data;
    } catch (error) {
      console.error(`❌ ${caseName} failed:`, error.message);
      this.results.failed++;
      this.results.errors.push(`${caseName}: ${error.message}`);
      return null;
    }
  }

  async testOfferFlow(sessionData, caseName) {
    console.log(`\n🔄 Testing ${caseName} offer flow...`);

    try {
      // Test user offer below floor (should get counter)
      const lowOffer = Math.round(sessionData.min_floor * 0.8);
      const offerResponse = await this.makeRequest(
        "/api/bargain/v1/session/offer",
        {
          session_id: sessionData.session_id,
          user_offer: lowOffer,
          signals: {
            time_on_page: 30,
            scroll_depth: 75,
            device_type: "desktop",
            user_agent: "SmokeTest",
          },
        },
      );

      if (offerResponse.status !== 200) {
        throw new Error(`Offer failed: ${offerResponse.status}`);
      }

      const { data } = offerResponse;
      if (data.decision !== "counter" && data.decision !== "reject") {
        console.log(
          `⚠️ Expected counter/reject for low offer, got: ${data.decision}`,
        );
      } else {
        console.log(`✅ Low offer correctly handled: ${data.decision}`);
      }

      // Check latency
      if (offerResponse.duration > CONFIG.maxLatency) {
        this.results.errors.push(
          `❌ ${caseName} offer: Latency ${offerResponse.duration.toFixed(2)}ms > ${CONFIG.maxLatency}ms`,
        );
      }

      this.results.passed++;
      return data;
    } catch (error) {
      console.error(`❌ ${caseName} offer failed:`, error.message);
      this.results.failed++;
      this.results.errors.push(`${caseName} offer: ${error.message}`);
      return null;
    }
  }

  async testNeverLossValidation() {
    console.log(`\n🛡️ Testing never-loss validation...`);

    try {
      // This would typically be done via SQL query to the database
      // For now, we'll test that low offers are properly rejected
      const testCase = TEST_CASES.hotel;
      const session = await this.testSessionStart(testCase, "never-loss-test");

      if (!session) {
        throw new Error("Failed to create session for never-loss test");
      }

      // Try to offer way below floor
      const veryLowOffer = Math.round(session.min_floor * 0.3);
      const response = await this.makeRequest("/api/bargain/v1/session/offer", {
        session_id: session.session_id,
        user_offer: veryLowOffer,
      });

      if (response.data.decision === "accept") {
        throw new Error(
          `Never-loss violation: System accepted offer ${veryLowOffer} below floor ${session.min_floor}`,
        );
      }

      console.log(
        `✅ Never-loss enforced: offer ${veryLowOffer} correctly rejected/countered`,
      );
      this.results.passed++;
    } catch (error) {
      console.error(`❌ Never-loss test failed:`, error.message);
      this.results.failed++;
      this.results.errors.push(`Never-loss: ${error.message}`);
    }
  }

  async testCapsuleVerification() {
    console.log(`\n🔐 Testing capsule verification...`);

    try {
      const testCase = TEST_CASES.flight;
      const session = await this.testSessionStart(testCase, "capsule-test");

      if (!session || !session.safety_capsule) {
        throw new Error("No safety capsule received");
      }

      // Check capsule structure
      const capsule = session.safety_capsule;
      if (!capsule.signature) throw new Error("Missing signature");
      if (!capsule.timestamp) throw new Error("Missing timestamp");
      if (!capsule.offer_data) throw new Error("Missing offer_data");

      // Check timestamp is recent (within last minute)
      const now = Date.now();
      const capsuleTime = new Date(capsule.timestamp).getTime();
      if (Math.abs(now - capsuleTime) > 60000) {
        throw new Error(`Capsule timestamp too old: ${capsule.timestamp}`);
      }

      console.log(
        `✅ Capsule structure valid, signature: ${capsule.signature.substring(0, 20)}...`,
      );
      this.results.passed++;
    } catch (error) {
      console.error(`❌ Capsule verification failed:`, error.message);
      this.results.failed++;
      this.results.errors.push(`Capsule: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log(`🚀 Starting 15-minute smoke test suite...\n`);
    console.log(`Target: ${CONFIG.host}`);
    console.log(`Max latency: ${CONFIG.maxLatency}ms\n`);

    // Test all session start cases
    const sessions = {};
    for (const [caseName, testCase] of Object.entries(TEST_CASES)) {
      const session = await this.testSessionStart(testCase, caseName);
      if (session) {
        sessions[caseName] = session;
      }
    }

    // Test offer flows
    for (const [caseName, session] of Object.entries(sessions)) {
      await this.testOfferFlow(session, caseName);
    }

    // Test never-loss validation
    await this.testNeverLossValidation();

    // Test capsule verification
    await this.testCapsuleVerification();

    // Generate report
    this.generateReport();
  }

  generateReport() {
    console.log(`\n📊 SMOKE TEST REPORT`);
    console.log(`==================`);
    console.log(
      `Duration: ${((Date.now() - this.results.startTime) / 1000).toFixed(1)}s`,
    );
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(
      `Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`,
    );

    // Latency stats
    if (this.results.timings.length > 0) {
      const timings = this.results.timings.map((t) => t.duration);
      const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
      const p95 = timings.sort((a, b) => a - b)[
        Math.floor(timings.length * 0.95)
      ];

      console.log(`\nLatency Stats:`);
      console.log(`Average: ${avg.toFixed(2)}ms`);
      console.log(`P95: ${p95.toFixed(2)}ms`);
      console.log(`Target: <${CONFIG.maxLatency}ms`);
      console.log(`Status: ${p95 < CONFIG.maxLatency ? "✅ PASS" : "❌ FAIL"}`);
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.results.errors.forEach((error) => console.log(`  • ${error}`));
    }

    console.log(
      `\n${this.results.failed === 0 ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`,
    );

    // Exit with appropriate code
    process.exit(this.results.failed === 0 ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SmokeTestRunner();
  runner.runAllTests().catch((error) => {
    console.error("❌ Smoke test suite crashed:", error);
    process.exit(1);
  });
}

module.exports = SmokeTestRunner;
