import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const sessionLatency = new Trend("session_latency");
const offerLatency = new Trend("offer_latency");
const acceptLatency = new Trend("accept_latency");

export let options = {
  vus: 150,
  duration: "3m",
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.005"],
    errors: ["rate<0.005"],
    session_latency: ["p(95)<300"],
    offer_latency: ["p(95)<200"],
    accept_latency: ["p(95)<150"],
  },
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 150 },
    { duration: "1m", target: 150 },
    { duration: "30s", target: 0 },
  ],
};

const BASE_URL = __ENV.API_URL || "https://api.company.com";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "test-token-123";

const testProducts = [
  {
    type: "flight",
    canonical_key: "FL:AI-BOM-DXB-2025-10-01-Y",
    displayed_price: 312,
    currency: "USD",
  },
  {
    type: "hotel",
    canonical_key: "HT:12345:DLX:BRD-BB:CXL-FLEX",
    displayed_price: 142,
    currency: "USD",
  },
  {
    type: "sightseeing",
    canonical_key: "SS:DUBAI-TOUR-PREMIUM",
    displayed_price: 89,
    currency: "USD",
  },
];

const userTiers = ["GOLD", "SILVER", "BRONZE", "PLATINUM"];

function getRandomProduct() {
  return testProducts[Math.floor(Math.random() * testProducts.length)];
}

function getRandomUserTier() {
  return userTiers[Math.floor(Math.random() * userTiers.length)];
}

function getRandomUserId() {
  return `u${Math.floor(Math.random() * 10000)}`;
}

export default function () {
  const userId = getRandomUserId();
  const userTier = getRandomUserTier();
  const product = getRandomProduct();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  // 1. Start Session
  const sessionPayload = JSON.stringify({
    user: {
      id: userId,
      tier: userTier,
    },
    productCPO: product,
  });

  const sessionStart = Date.now();
  const sessionRes = http.post(
    `${BASE_URL}/api/bargain/v1/session/start`,
    sessionPayload,
    { headers },
  );
  const sessionDuration = Date.now() - sessionStart;

  sessionLatency.add(sessionDuration);

  const sessionCheck = check(sessionRes, {
    "session start status 200": (r) => r.status === 200,
    "session start has session_id": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.session_id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!sessionCheck) {
    errorRate.add(1);
    return;
  }

  let sessionId;
  try {
    const sessionBody = JSON.parse(sessionRes.body);
    sessionId = sessionBody.session_id;
  } catch (e) {
    errorRate.add(1);
    return;
  }

  sleep(0.5);

  // 2. Make Offer
  const offerPrice = product.displayed_price * (0.85 + Math.random() * 0.1); // 85-95% of original
  const offerPayload = JSON.stringify({
    session_id: sessionId,
    user_offer: Math.round(offerPrice * 100) / 100,
  });

  const offerStart = Date.now();
  const offerRes = http.post(
    `${BASE_URL}/api/bargain/v1/session/offer`,
    offerPayload,
    { headers },
  );
  const offerDuration = Date.now() - offerStart;

  offerLatency.add(offerDuration);

  const offerCheck = check(offerRes, {
    "offer status 200": (r) => r.status === 200,
    "offer has counter_price": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.counter_price !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!offerCheck) {
    errorRate.add(1);
    return;
  }

  sleep(0.3);

  // 3. Accept (30% of the time)
  if (Math.random() < 0.3) {
    const acceptPayload = JSON.stringify({
      session_id: sessionId,
    });

    const acceptStart = Date.now();
    const acceptRes = http.post(
      `${BASE_URL}/api/bargain/v1/session/accept`,
      acceptPayload,
      { headers },
    );
    const acceptDuration = Date.now() - acceptStart;

    acceptLatency.add(acceptDuration);

    const acceptCheck = check(acceptRes, {
      "accept status 200 or 409": (r) => r.status === 200 || r.status === 409,
      "accept has expected response": (r) => {
        try {
          const body = JSON.parse(r.body);
          return r.status === 409
            ? body.error !== undefined
            : body.final_price !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    if (!acceptCheck) {
      errorRate.add(1);
    }
  }

  sleep(0.2);
}

export function handleSummary(data) {
  const summary = {
    test_duration: data.state.testRunDurationMs,
    iterations: data.metrics.iterations.values.count,
    vus_max: data.metrics.vus_max.values.max,
    http_req_duration_p95: data.metrics.http_req_duration.values["p(95)"],
    http_req_failed_rate: data.metrics.http_req_failed.values.rate,
    error_rate: data.metrics.errors ? data.metrics.errors.values.rate : 0,
    session_latency_p95: data.metrics.session_latency.values["p(95)"],
    offer_latency_p95: data.metrics.offer_latency.values["p(95)"],
    accept_latency_p95: data.metrics.accept_latency.values["p(95)"],
    passed_sla: data.metrics.http_req_duration.values["p(95)"] < 300,
    passed_error_rate: data.metrics.http_req_failed.values.rate < 0.005,
  };

  console.log("\n=== LOAD TEST SUMMARY ===");
  console.log(`Test Duration: ${summary.test_duration}ms`);
  console.log(`Total Iterations: ${summary.iterations}`);
  console.log(`Max VUs: ${summary.vus_max}`);
  console.log(
    `HTTP p95 Latency: ${summary.http_req_duration_p95.toFixed(2)}ms`,
  );
  console.log(
    `HTTP Error Rate: ${(summary.http_req_failed_rate * 100).toFixed(3)}%`,
  );
  console.log(`Session p95: ${summary.session_latency_p95.toFixed(2)}ms`);
  console.log(`Offer p95: ${summary.offer_latency_p95.toFixed(2)}ms`);
  console.log(`Accept p95: ${summary.accept_latency_p95.toFixed(2)}ms`);
  console.log(`SLA PASSED (p95 < 300ms): ${summary.passed_sla ? "✅" : "❌"}`);
  console.log(
    `ERROR RATE PASSED (< 0.5%): ${summary.passed_error_rate ? "✅" : "❌"}`,
  );

  return {
    stdout: JSON.stringify(summary, null, 2),
    "summary.json": JSON.stringify(summary, null, 2),
  };
}
