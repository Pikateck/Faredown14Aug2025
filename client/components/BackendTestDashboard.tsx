/**
 * Backend Testing Dashboard
 * Comprehensive page-by-page testing of backend integration
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Server,
  Database,
  Shield,
  Search,
  Hotel,
  Plane,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { authService } from "@/services/authService";
import { flightsService } from "@/services/flightsService";
import { hotelsService } from "@/services/hotelsService";
import { bargainService } from "@/services/bargainService";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message: string;
  duration?: number;
  data?: any;
}

export function BackendTestDashboard() {
  const [backendStatus, setBackendStatus] = useState<
    "unknown" | "online" | "offline"
  >("unknown");
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {},
  );
  const [isRunning, setIsRunning] = useState(false);

  // Debug logging
  console.log("BackendTestDashboard rendered", {
    backendStatus,
    testResults,
    isRunning,
  });

  // Test credentials
  const [testEmail, setTestEmail] = useState("test@faredown.com");
  const [testPassword, setTestPassword] = useState("password123");

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await apiClient.healthCheck();
      setBackendStatus("online");
    } catch (error) {
      setBackendStatus("offline");
    }
  };

  const runTest = async (
    testName: string,
    testFunction: () => Promise<any>,
  ) => {
    setTestResults((prev) => ({
      ...prev,
      [testName]: { name: testName, status: "running", message: "Testing..." },
    }));

    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          name: testName,
          status: "success",
          message: "✅ Test passed",
          duration,
          data: result,
        },
      }));
    } catch (error: any) {
      const duration = Date.now() - startTime;

      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          name: testName,
          status: "error",
          message: `❌ ${error.message || "Test failed"}`,
          duration,
        },
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Test 1: Basic Connectivity
    await runTest("Backend Health", async () => {
      return await apiClient.healthCheck();
    });

    await runTest("API Root", async () => {
      return await apiClient.get("/");
    });

    // Test 2: Authentication Tests
    await runTest("User Login", async () => {
      return await authService.login({
        email: testEmail,
        password: testPassword,
      });
    });

    await runTest("Get User Profile", async () => {
      return await authService.getCurrentUser();
    });

    // Test 3: Flight Search Tests
    await runTest("Flight Search", async () => {
      return await flightsService.searchFlights({
        departure: "BOM",
        arrival: "DXB",
        departureDate: "2024-12-01",
        adults: 1,
        children: 0,
        cabinClass: "economy",
        tripType: "round_trip",
      });
    });

    await runTest("Airport Search", async () => {
      return await flightsService.searchAirports("Dubai");
    });

    // Test 4: Hotel Search Tests
    await runTest("Hotel Search", async () => {
      return await hotelsService.searchHotels({
        destination: "Dubai",
        checkIn: "2024-12-01",
        checkOut: "2024-12-05",
        rooms: 1,
        adults: 2,
        children: 0,
      });
    });

    await runTest("Hotel Destinations", async () => {
      return await hotelsService.searchDestinations("Dubai");
    });

    // Test 5: Bargain Engine Tests
    await runTest("Bargain Statistics", async () => {
      return await bargainService.getStatistics();
    });

    await runTest("Bargain Tips", async () => {
      return await bargainService.getBargainTips();
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Backend Testing Dashboard
            </div>
            <div className="flex items-center gap-2">
              {backendStatus === "online" ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  Backend Online
                </Badge>
              ) : backendStatus === "offline" ? (
                <Badge variant="destructive">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Backend Offline
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Checking...
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button
              onClick={runAllTests}
              disabled={isRunning || backendStatus === "offline"}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>

            <Button
              variant="outline"
              onClick={checkBackendStatus}
              className="flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              Check Backend Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backend Setup Instructions */}
      {backendStatus === "offline" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Backend Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <div className="space-y-2">
              <p>
                <strong>
                  To start testing, you need to start the backend server:
                </strong>
              </p>
              <div className="bg-yellow-100 p-3 rounded-lg font-mono text-sm">
                <div>1. Open a terminal</div>
                <div>2. cd backend</div>
                <div>3. pip install -r requirements.txt</div>
                <div>4. python main.py</div>
              </div>
              <p>
                The backend will run on <code>http://localhost:8000</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview of all features */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Complete Testing Features Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Search className="w-4 h-4" />
                Page Testing
              </h3>
              <p className="text-sm text-gray-600">Test all frontend pages</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Server className="w-4 h-4" />
                API Testing
              </h3>
              <p className="text-sm text-gray-600">
                Test all backend endpoints
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Auth Testing
              </h3>
              <p className="text-sm text-gray-600">Test authentication flow</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Results
              </h3>
              <p className="text-sm text-gray-600">
                View detailed test results
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="page-tests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="page-tests">Page Testing</TabsTrigger>
          <TabsTrigger value="api-tests">API Testing</TabsTrigger>
          <TabsTrigger value="auth-tests">Auth Testing</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Page-by-Page Testing */}
        <TabsContent value="page-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frontend Pages Integration Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Homepage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Homepage (/)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Tests search functionality and currency conversion
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open("/", "_blank")}
                        className="w-full"
                      >
                        Test Homepage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Flight Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Flight Results (/flights)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Tests flight search and bargain integration
                      </p>
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open("/flights?adults=1&children=0", "_blank")
                        }
                        className="w-full"
                      >
                        Test Flight Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Hotels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hotel className="w-4 h-4" />
                      Hotels (/hotels)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Tests hotel search and booking flow
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open("/hotels", "_blank")}
                        className="w-full"
                      >
                        Test Hotels
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Booking Flow (/booking-flow)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Tests payment and booking completion
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open("/booking-flow", "_blank")}
                        className="w-full"
                      >
                        Test Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Testing */}
        <TabsContent value="api-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div
                    key={testName}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{testName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.duration && `${result.duration}ms`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Testing */}
        <TabsContent value="auth-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentication Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Test Email
                  </label>
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@faredown.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Test Password
                  </label>
                  <Input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="password123"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    runTest("Test Login", async () => {
                      return await authService.login({
                        email: testEmail,
                        password: testPassword,
                      });
                    })
                  }
                  disabled={isRunning}
                >
                  Test Login
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    runTest("Test Profile", async () => {
                      return await authService.getCurrentUser();
                    })
                  }
                  disabled={isRunning}
                >
                  Test Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([testName, result]) => (
                  <Card key={testName}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{testName}</h4>
                            <p className="text-sm text-gray-600">
                              {result.message}
                            </p>
                          </div>
                        </div>
                        {result.duration && (
                          <Badge variant="outline">{result.duration}ms</Badge>
                        )}
                      </div>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600">
                            Show Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BackendTestDashboard;
