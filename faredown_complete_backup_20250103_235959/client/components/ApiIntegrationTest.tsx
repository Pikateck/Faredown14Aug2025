import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  Hotel,
  Camera,
  Tag,
} from "lucide-react";
import { flightsService } from "@/services/flightsService";
import { hotelsService } from "@/services/hotelsService";
import { sightseeingService } from "@/services/sightseeingService";
import PromoCodeInput from "./PromoCodeInput";
import PricingDisplay from "./PricingDisplay";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  duration?: number;
  data?: any;
  error?: string;
}

export function ApiIntegrationTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Flight Search (Amadeus)", status: "pending" },
    { name: "Hotel Search (Hotelbeds)", status: "pending" },
    { name: "Sightseeing Search (Hotelbeds)", status: "pending" },
    { name: "Promo Code Application", status: "pending" },
    { name: "Markup Calculation", status: "pending" },
    { name: "Database Storage", status: "pending" },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [promoCode, setPromoCode] = useState("WELCOME10");
  const [testResults, setTestResults] = useState<any>({});

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((test) => (test.name === name ? { ...test, ...updates } : test)),
    );
  };

  const runFlightSearchTest = async (): Promise<any> => {
    const startTime = Date.now();
    updateTest("Flight Search (Amadeus)", { status: "running" });

    try {
      const searchParams = {
        departure: "BOM",
        arrival: "DXB",
        departureDate: "2025-03-15",
        adults: 2,
        children: 0,
        cabinClass: "economy" as const,
        tripType: "one_way" as const,
        promoCode: promoCode,
        userId: "test_user_123",
      };

      const flights = await flightsService.searchFlights(searchParams);
      const duration = Date.now() - startTime;

      updateTest("Flight Search (Amadeus)", {
        status: "success",
        duration,
        data: {
          count: flights.length,
          sample: flights[0],
          hasMarkup: flights[0]?.price?.breakdown?.markup > 0,
          hasPromoDiscount: flights[0]?.price?.breakdown?.discount > 0,
        },
      });

      return flights[0];
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Flight Search (Amadeus)", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const runHotelSearchTest = async (): Promise<any> => {
    const startTime = Date.now();
    updateTest("Hotel Search (Hotelbeds)", { status: "running" });

    try {
      const searchParams = {
        destination: "Dubai",
        checkIn: "2025-03-15",
        checkOut: "2025-03-18",
        rooms: 1,
        adults: 2,
        children: 0,
        promoCode: promoCode,
        userId: "test_user_123",
      };

      const hotels = await hotelsService.searchHotels(searchParams);
      const duration = Date.now() - startTime;

      updateTest("Hotel Search (Hotelbeds)", {
        status: "success",
        duration,
        data: {
          count: hotels.length,
          sample: hotels[0],
          hasMarkup: hotels[0]?.pricing?.markupApplied?.markup_percentage > 0,
          hasPromoDiscount: hotels[0]?.pricing?.promoApplied,
        },
      });

      return hotels[0];
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Hotel Search (Hotelbeds)", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const runSightseeingSearchTest = async (): Promise<any> => {
    const startTime = Date.now();
    updateTest("Sightseeing Search (Hotelbeds)", { status: "running" });

    try {
      const searchParams = {
        destination: "Dubai",
        dateFrom: "2025-03-15",
        adults: 2,
        children: 0,
        promoCode: promoCode,
        userId: "test_user_123",
      };

      const activities =
        await sightseeingService.searchActivities(searchParams);
      const duration = Date.now() - startTime;

      updateTest("Sightseeing Search (Hotelbeds)", {
        status: "success",
        duration,
        data: {
          count: activities.length,
          sample: activities[0],
          hasMarkup:
            activities[0]?.pricing?.markupApplied?.markup_percentage > 0,
          hasPromoDiscount: activities[0]?.pricing?.promoApplied,
        },
      });

      return activities[0];
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Sightseeing Search (Hotelbeds)", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const runPromoCodeTest = async (sampleFlight: any): Promise<void> => {
    const startTime = Date.now();
    updateTest("Promo Code Application", { status: "running" });

    try {
      // Check if promo code was applied in the search results
      const hasPromoDiscount = sampleFlight?.price?.breakdown?.discount > 0;
      const promoDetails = sampleFlight?.price?.promoDetails;

      const duration = Date.now() - startTime;

      updateTest("Promo Code Application", {
        status: hasPromoDiscount ? "success" : "error",
        duration,
        data: {
          promoCode: promoCode,
          applied: hasPromoDiscount,
          discount: sampleFlight?.price?.breakdown?.discount || 0,
          details: promoDetails,
        },
        error: hasPromoDiscount
          ? undefined
          : "Promo code not applied or invalid",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Promo Code Application", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const runMarkupTest = async (sampleFlight: any): Promise<void> => {
    const startTime = Date.now();
    updateTest("Markup Calculation", { status: "running" });

    try {
      // Check if markup was applied in the search results
      const hasMarkup = sampleFlight?.price?.breakdown?.markup > 0;
      const markupAmount = sampleFlight?.price?.breakdown?.markup || 0;
      const originalAmount = sampleFlight?.price?.originalAmount || 0;
      const markedUpAmount = sampleFlight?.price?.markedUpAmount || 0;

      const duration = Date.now() - startTime;

      updateTest("Markup Calculation", {
        status: hasMarkup ? "success" : "error",
        duration,
        data: {
          hasMarkup,
          markupAmount,
          originalAmount,
          markedUpAmount,
          markupPercentage:
            originalAmount > 0
              ? ((markupAmount / originalAmount) * 100).toFixed(2)
              : 0,
        },
        error: hasMarkup ? undefined : "No markup calculation found",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Markup Calculation", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const runDatabaseTest = async (): Promise<void> => {
    const startTime = Date.now();
    updateTest("Database Storage", { status: "running" });

    try {
      // Test database connectivity by making an API call that would trigger database operations
      const response = await fetch("/api/health");
      const healthData = await response.json();

      const duration = Date.now() - startTime;

      updateTest("Database Storage", {
        status:
          healthData.services?.database === "connected" ? "success" : "error",
        duration,
        data: {
          dbHealth: healthData.services?.database,
          dbDetails: healthData.database,
        },
        error:
          healthData.services?.database !== "connected"
            ? "Database not connected"
            : undefined,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest("Database Storage", {
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallProgress(0);

    try {
      // Reset all tests
      setTests(
        tests.map((test) => ({
          ...test,
          status: "pending",
          duration: undefined,
          data: undefined,
          error: undefined,
        })),
      );

      let completedTests = 0;
      const totalTests = tests.length;

      // Run Flight Search Test
      const flightResult = await runFlightSearchTest();
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);

      // Run Hotel Search Test
      await runHotelSearchTest();
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);

      // Run Sightseeing Search Test
      await runSightseeingSearchTest();
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);

      // Run Promo Code Test
      await runPromoCodeTest(flightResult);
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);

      // Run Markup Test
      await runMarkupTest(flightResult);
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);

      // Run Database Test
      await runDatabaseTest();
      completedTests++;
      setOverallProgress((completedTests / totalTests) * 100);
    } catch (error) {
      console.error("Test suite failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "running":
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const successCount = tests.filter((test) => test.status === "success").length;
  const errorCount = tests.filter((test) => test.status === "error").length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span>End-to-End API Integration Test</span>
          </CardTitle>
          <div className="text-sm text-gray-600">
            Test the complete integration of Amadeus, Hotelbeds, markup
            management, and promo code systems
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Promo Code Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <PromoCodeInput
              value={promoCode}
              onChange={setPromoCode}
              placeholder="Enter promo code for testing"
              compact={true}
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Summary */}
          <div className="flex space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ✓ {successCount} Passed
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              ✗ {errorCount} Failed
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              {tests.length - successCount - errorCount} Pending
            </Badge>
          </div>

          {/* Run Tests Button */}
          <Button onClick={runAllTests} disabled={isRunning} className="w-full">
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card
            key={index}
            className={`border-l-4 ${
              test.status === "success"
                ? "border-l-green-500"
                : test.status === "error"
                  ? "border-l-red-500"
                  : test.status === "running"
                    ? "border-l-blue-500"
                    : "border-l-gray-300"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    {test.duration && (
                      <p className="text-sm text-gray-500">{test.duration}ms</p>
                    )}
                  </div>
                </div>

                {test.status === "success" && (
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                )}
                {test.status === "error" && (
                  <Badge className="bg-red-100 text-red-800">Failed</Badge>
                )}
                {test.status === "running" && (
                  <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                )}
              </div>

              {test.error && (
                <Alert className="mt-3">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{test.error}</AlertDescription>
                </Alert>
              )}

              {test.data && (
                <div className="mt-3 space-y-2">
                  {test.name.includes("Flight") && test.data.sample && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Flight Result Sample
                        </span>
                      </div>
                      <PricingDisplay
                        originalPrice={test.data.sample.price?.originalAmount}
                        markedUpPrice={test.data.sample.price?.markedUpAmount}
                        finalPrice={test.data.sample.price?.amount}
                        discount={test.data.sample.price?.breakdown?.discount}
                        markupApplied={test.data.sample.price?.markupApplied}
                        promoApplied={test.data.sample.price?.promoApplied}
                        promoDetails={test.data.sample.price?.promoDetails}
                        showBreakdown={true}
                        size="sm"
                      />
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <pre className="bg-gray-100 rounded p-2 overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ApiIntegrationTest;
