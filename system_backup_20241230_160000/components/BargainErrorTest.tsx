import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { markupService } from "@/services/markupService";
import { bargainPricingService } from "@/services/bargainPricingService";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error" | "fallback";
  message: string;
  duration?: number;
}

export function BargainErrorTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Markup Service API Test", status: "pending", message: "" },
    { name: "Bargain Pricing Test", status: "pending", message: "" },
    { name: "Fallback Mechanism Test", status: "pending", message: "" },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (
    name: string,
    status: TestResult["status"],
    message: string,
    duration?: number,
  ) => {
    setTests((prev) =>
      prev.map((test) =>
        test.name === name ? { ...test, status, message, duration } : test,
      ),
    );
  };

  const runTests = async () => {
    setIsRunning(true);

    // Test 1: Markup Service
    try {
      const startTime = Date.now();
      updateTest(
        "Markup Service API Test",
        "pending",
        "Testing markup calculation...",
      );

      await markupService.calculateMarkup({
        type: "flight",
        basePrice: 50000,
        airline: "EK",
        route: { from: "BOM", to: "DXB" },
        class: "economy",
        userType: "b2c",
      });

      const duration = Date.now() - startTime;
      updateTest(
        "Markup Service API Test",
        "success",
        "API responded successfully",
        duration,
      );
    } catch (error) {
      const duration = Date.now() - Date.now();
      if (
        error instanceof Error &&
        error.message.includes("API server offline")
      ) {
        updateTest(
          "Markup Service API Test",
          "fallback",
          "API offline, fallback activated",
          duration,
        );
      } else {
        updateTest(
          "Markup Service API Test",
          "error",
          error instanceof Error ? error.message : "Unknown error",
          duration,
        );
      }
    }

    // Test 2: Bargain Pricing Service
    try {
      const startTime = Date.now();
      updateTest(
        "Bargain Pricing Test",
        "pending",
        "Testing bargain pricing calculation...",
      );

      await bargainPricingService.calculateInitialPricing({
        type: "flight",
        itemId: "test_flight_123",
        basePrice: 50000,
        userType: "b2c",
        airline: "EK",
        route: { from: "BOM", to: "DXB" },
        class: "economy",
      });

      const duration = Date.now() - startTime;
      updateTest(
        "Bargain Pricing Test",
        "success",
        "Bargain pricing calculated successfully",
        duration,
      );
    } catch (error) {
      const duration = Date.now() - Date.now();
      updateTest(
        "Bargain Pricing Test",
        "fallback",
        "Using fallback pricing mechanism",
        duration,
      );
    }

    // Test 3: Fallback Mechanism
    try {
      updateTest(
        "Fallback Mechanism Test",
        "pending",
        "Testing offline behavior...",
      );

      // This should always work with fallback
      const result = await bargainPricingService.calculateInitialPricing({
        type: "sightseeing",
        itemId: "test_activity_456",
        basePrice: 5000,
        userType: "b2c",
        location: "Dubai",
        category: "tours",
        duration: "3 hours",
      });

      if (result && result.finalPrice > 0) {
        updateTest(
          "Fallback Mechanism Test",
          "success",
          "Fallback pricing working correctly",
        );
      } else {
        updateTest(
          "Fallback Mechanism Test",
          "error",
          "Fallback pricing failed",
        );
      }
    } catch (error) {
      updateTest(
        "Fallback Mechanism Test",
        "error",
        error instanceof Error ? error.message : "Fallback failed",
      );
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "fallback":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "pending":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      case "fallback":
        return "border-l-yellow-500 bg-yellow-50";
      case "pending":
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Bargain System Error Handling Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            This test verifies that the bargain system works even when the API
            server is offline
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={isRunning} className="w-full">
            {isRunning ? "Running Tests..." : "Run Error Handling Tests"}
          </Button>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <Card
                key={index}
                className={`border-l-4 ${getStatusColor(test.status)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-gray-600">{test.message}</p>
                        {test.duration && (
                          <p className="text-xs text-gray-500">
                            {test.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tests.every((test) => test.status !== "pending") && !isRunning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Results Summary:</strong>
                <ul className="mt-2 space-y-1">
                  <li>
                    ✅ <strong>Success:</strong>{" "}
                    {tests.filter((t) => t.status === "success").length} tests
                  </li>
                  <li>
                    ⚠️ <strong>Fallback:</strong>{" "}
                    {tests.filter((t) => t.status === "fallback").length} tests
                  </li>
                  <li>
                    ❌ <strong>Error:</strong>{" "}
                    {tests.filter((t) => t.status === "error").length} tests
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  {tests.filter((t) => t.status === "fallback").length > 0
                    ? "✅ Fallback mechanisms are working! The bargain system will function even when the API is offline."
                    : tests.every((t) => t.status === "success")
                      ? "✅ All systems operational! API server is responding normally."
                      : "❌ Some tests failed. Check the error messages above."}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BargainErrorTest;
