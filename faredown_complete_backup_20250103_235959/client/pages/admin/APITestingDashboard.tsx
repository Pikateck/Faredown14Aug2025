/**
 * Comprehensive API Testing Dashboard
 * Postman-like interface for testing all system APIs
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Header } from "@/components/Header";
import {
  Play,
  Save,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
  Key,
  Code,
  FileText,
  Activity,
  Zap,
  Database,
  Plane,
  Hotel,
  MapPin,
  Brain,
  CreditCard,
  Users,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface APIEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  description: string;
  category: string;
  auth_required: boolean;
  headers?: { [key: string]: string };
  body_schema?: any;
  response_schema?: any;
  examples?: any[];
}

interface APICategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  endpoints: APIEndpoint[];
}

const API_CATEGORIES: APICategory[] = [
  {
    id: "auth",
    name: "Authentication",
    description: "User authentication and authorization",
    icon: Lock,
    color: "bg-red-500",
    endpoints: [
      {
        id: "auth_login",
        name: "User Login",
        method: "POST",
        url: "/api/auth/login",
        description: "Authenticate user and get access token",
        category: "auth",
        auth_required: false,
        body_schema: {
          email: "string",
          password: "string",
        },
        examples: [
          {
            name: "Standard Login",
            body: {
              email: "user@example.com",
              password: "password123",
            },
          },
        ],
      },
      {
        id: "auth_admin_login",
        name: "Admin Login",
        method: "POST",
        url: "/api/admin/login",
        description: "Admin authentication",
        category: "auth",
        auth_required: false,
        body_schema: {
          username: "string",
          password: "string",
        },
      },
      {
        id: "auth_refresh",
        name: "Refresh Token",
        method: "POST",
        url: "/api/auth/refresh",
        description: "Refresh access token",
        category: "auth",
        auth_required: true,
      },
    ],
  },
  {
    id: "flights",
    name: "Flight APIs",
    description: "Flight search, booking, and management",
    icon: Plane,
    color: "bg-blue-500",
    endpoints: [
      {
        id: "flights_search",
        name: "Search Flights",
        method: "GET",
        url: "/api/flights/search",
        description: "Search for available flights",
        category: "flights",
        auth_required: false,
        examples: [
          {
            name: "Delhi to Mumbai",
            params: {
              origin: "DEL",
              destination: "BOM",
              departure: "2025-02-15",
              adults: 1,
              cabin: "ECONOMY",
            },
          },
        ],
      },
      {
        id: "flights_book",
        name: "Book Flight",
        method: "POST",
        url: "/api/flights/book",
        description: "Book a selected flight",
        category: "flights",
        auth_required: true,
        body_schema: {
          flight_id: "string",
          passengers: "array",
          payment_details: "object",
        },
      },
    ],
  },
  {
    id: "hotels",
    name: "Hotel APIs",
    description: "Hotel search, booking, and management",
    icon: Hotel,
    color: "bg-green-500",
    endpoints: [
      {
        id: "hotels_search",
        name: "Search Hotels",
        method: "GET",
        url: "/api/hotels/search",
        description: "Search for available hotels",
        category: "hotels",
        auth_required: false,
        examples: [
          {
            name: "Dubai Hotels",
            params: {
              destination: "Dubai",
              checkin: "2025-02-15",
              checkout: "2025-02-18",
              adults: 2,
              rooms: 1,
            },
          },
        ],
      },
      {
        id: "hotels_live",
        name: "Live Hotel Rates",
        method: "GET",
        url: "/api/hotels-live",
        description: "Get real-time hotel rates",
        category: "hotels",
        auth_required: false,
      },
    ],
  },
  {
    id: "bargain",
    name: "Bargain Engine",
    description: "AI-powered bargaining system",
    icon: Brain,
    color: "bg-purple-500",
    endpoints: [
      {
        id: "bargain_start",
        name: "Start Bargain Session",
        method: "POST",
        url: "/api/bargain/v1/session/start",
        description: "Initialize a bargaining session",
        category: "bargain",
        auth_required: true,
        body_schema: {
          user: {
            id: "string",
            tier: "string",
          },
          productCPO: {
            type: "string",
            canonical_key: "string",
            displayed_price: "number",
            currency: "string",
          },
        },
        examples: [
          {
            name: "Hotel Bargain",
            body: {
              user: {
                id: "user_123",
                tier: "GOLD",
              },
              productCPO: {
                type: "hotel",
                canonical_key: "HT:12345:DXB:DELUXE",
                displayed_price: 250,
                currency: "USD",
              },
            },
          },
        ],
      },
      {
        id: "bargain_offer",
        name: "Make Offer",
        method: "POST",
        url: "/api/bargain/v1/offer",
        description: "Make a bargaining offer",
        category: "bargain",
        auth_required: true,
        body_schema: {
          session_id: "string",
          user_offer: "number",
        },
      },
    ],
  },
  {
    id: "ai_admin",
    name: "AI Admin APIs",
    description: "AI system management and monitoring",
    icon: Zap,
    color: "bg-yellow-500",
    endpoints: [
      {
        id: "ai_live",
        name: "Live AI Monitoring",
        method: "GET",
        url: "/api/admin/ai/live",
        description: "Get real-time AI system metrics",
        category: "ai_admin",
        auth_required: true,
      },
      {
        id: "ai_policies",
        name: "Get AI Policies",
        method: "GET",
        url: "/api/admin/ai/policies",
        description: "Retrieve AI bargaining policies",
        category: "ai_admin",
        auth_required: true,
      },
      {
        id: "ai_policy_validate",
        name: "Validate Policy",
        method: "POST",
        url: "/api/admin/ai/policies/validate",
        description: "Validate AI policy YAML",
        category: "ai_admin",
        auth_required: true,
        body_schema: {
          dsl_yaml: "string",
        },
      },
    ],
  },
  {
    id: "admin",
    name: "Admin APIs",
    description: "Administrative functions",
    icon: Settings,
    color: "bg-gray-500",
    endpoints: [
      {
        id: "admin_dashboard",
        name: "Dashboard Stats",
        method: "GET",
        url: "/api/admin-dashboard/stats",
        description: "Get admin dashboard statistics",
        category: "admin",
        auth_required: true,
      },
      {
        id: "admin_users",
        name: "Manage Users",
        method: "GET",
        url: "/api/users",
        description: "Get user list",
        category: "admin",
        auth_required: true,
      },
    ],
  },
  {
    id: "payments",
    name: "Payment APIs",
    description: "Payment processing and management",
    icon: CreditCard,
    color: "bg-emerald-500",
    endpoints: [
      {
        id: "payments_create",
        name: "Create Payment",
        method: "POST",
        url: "/api/payments/create",
        description: "Create a new payment",
        category: "payments",
        auth_required: true,
        body_schema: {
          amount: "number",
          currency: "string",
          booking_id: "string",
        },
      },
    ],
  },
  {
    id: "system",
    name: "System APIs",
    description: "System health and utilities",
    icon: Activity,
    color: "bg-indigo-500",
    endpoints: [
      {
        id: "system_health",
        name: "Health Check",
        method: "GET",
        url: "/health",
        description: "System health status",
        category: "system",
        auth_required: false,
      },
      {
        id: "system_metrics",
        name: "System Metrics",
        method: "GET",
        url: "/metrics",
        description: "Prometheus metrics",
        category: "system",
        auth_required: false,
      },
    ],
  },
];

const APITestingDashboard: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState("testing");
  const [selectedCategory, setSelectedCategory] = useState("auth");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(
    null,
  );

  // Debug tab changes
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveMainTab(value);
    // Show visual feedback
    const notification = document.createElement("div");
    notification.innerHTML = `Switched to ${value} tab`;
    notification.style.cssText =
      "position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; z-index: 1000; font-size: 14px;";
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  };
  const [requestUrl, setRequestUrl] = useState("");
  const [requestMethod, setRequestMethod] = useState<string>("GET");
  const [requestHeaders, setRequestHeaders] = useState("{}");
  const [requestBody, setRequestBody] = useState("");
  const [requestParams, setRequestParams] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [savedRequests, setSavedRequests] = useState<any[]>([]);

  useEffect(() => {
    // Load saved auth token
    const savedToken = localStorage.getItem("api_test_token");
    if (savedToken) {
      setAuthToken(savedToken);
    }

    // Load saved requests
    const saved = localStorage.getItem("api_test_requests");
    if (saved) {
      setSavedRequests(JSON.parse(saved));
    }
  }, []);

  const selectEndpoint = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestUrl(endpoint.url);
    setRequestMethod(endpoint.method);

    // Set default headers
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (endpoint.auth_required && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    setRequestHeaders(JSON.stringify(headers, null, 2));

    // Set example body if available
    if (endpoint.examples && endpoint.examples.length > 0) {
      const example = endpoint.examples[0];
      if (example.body) {
        setRequestBody(JSON.stringify(example.body, null, 2));
      }
      if (example.params) {
        setRequestParams(new URLSearchParams(example.params).toString());
      }
    } else {
      setRequestBody(
        endpoint.body_schema
          ? JSON.stringify(endpoint.body_schema, null, 2)
          : "",
      );
    }
  };

  const executeRequest = async () => {
    if (!requestUrl) return;

    setLoading(true);
    setResponse(null);

    try {
      let url = requestUrl;
      if (requestParams && requestMethod === "GET") {
        url += `?${requestParams}`;
      }

      const headers = JSON.parse(requestHeaders || "{}");

      const config: RequestInit = {
        method: requestMethod,
        headers: headers,
      };

      if (requestMethod !== "GET" && requestBody) {
        config.body = requestBody;
      }

      const startTime = Date.now();
      const response = await fetch(url, config);
      const endTime = Date.now();

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: null,
        time: endTime - startTime,
      };

      try {
        responseData.data = await response.json();
      } catch {
        responseData.data = await response.text();
      }

      setResponse(responseData);
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: { error: error.message },
        time: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAuthToken = () => {
    localStorage.setItem("api_test_token", authToken);
  };

  const saveRequest = () => {
    const request = {
      id: Date.now().toString(),
      name: selectedEndpoint?.name || "Custom Request",
      method: requestMethod,
      url: requestUrl,
      headers: requestHeaders,
      body: requestBody,
      params: requestParams,
      timestamp: new Date().toISOString(),
    };

    const updated = [...savedRequests, request];
    setSavedRequests(updated);
    localStorage.setItem("api_test_requests", JSON.stringify(updated));
  };

  const loadSavedRequest = (request: any) => {
    setRequestUrl(request.url);
    setRequestMethod(request.method);
    setRequestHeaders(request.headers);
    setRequestBody(request.body);
    setRequestParams(request.params);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const currentCategory = API_CATEGORIES.find(
    (cat) => cat.id === selectedCategory,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive API testing interface for all system endpoints
            </p>
            <div className="mt-2 space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Current Tab:{" "}
                {activeMainTab === "testing"
                  ? "API Testing"
                  : activeMainTab === "documentation"
                    ? "Documentation"
                    : activeMainTab === "saved"
                      ? "Saved Requests"
                      : "Authentication"}
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                State: {activeMainTab}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50">
              <TestTube className="w-4 h-4 mr-1" />
              {API_CATEGORIES.reduce(
                (sum, cat) => sum + cat.endpoints.length,
                0,
              )}{" "}
              Endpoints
            </Badge>
          </div>
        </div>

        <Tabs
          value={activeMainTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="testing"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              API Testing
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Documentation
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Saved Requests
            </TabsTrigger>
            <TabsTrigger
              value="auth"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Authentication
            </TabsTrigger>
          </TabsList>

          {/* API Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* API Categories Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      API Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {API_CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="w-4 h-4 mr-2" />
                        <span className="flex-1 text-left">
                          {category.name}
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          {category.endpoints.length}
                        </Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Endpoints List */}
                {currentCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <currentCategory.icon className="w-5 h-5 mr-2" />
                        {currentCategory.name}
                      </CardTitle>
                      <CardDescription>
                        {currentCategory.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {currentCategory.endpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                            selectedEndpoint?.id === endpoint.id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                          onClick={() => selectEndpoint(endpoint)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  endpoint.method === "GET"
                                    ? "default"
                                    : endpoint.method === "POST"
                                      ? "destructive"
                                      : endpoint.method === "PUT"
                                        ? "secondary"
                                        : "outline"
                                }
                                className="text-xs"
                              >
                                {endpoint.method}
                              </Badge>
                              {endpoint.auth_required && (
                                <Lock className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="font-medium text-sm">
                              {endpoint.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {endpoint.url}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Request Builder */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Request Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* URL and Method */}
                    <div className="flex space-x-2">
                      <Select
                        value={requestMethod}
                        onValueChange={setRequestMethod}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="https://api.example.com/endpoint"
                        value={requestUrl}
                        onChange={(e) => setRequestUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={executeRequest} disabled={loading}>
                        {loading ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {loading ? "Sending..." : "Send"}
                      </Button>
                    </div>

                    {/* Request Tabs */}
                    <Tabs defaultValue="request-headers" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="request-headers">
                          Headers
                        </TabsTrigger>
                        <TabsTrigger value="request-body">Body</TabsTrigger>
                        <TabsTrigger value="request-params">Params</TabsTrigger>
                      </TabsList>

                      <TabsContent value="request-headers">
                        <div className="space-y-2">
                          <Label>Request Headers (JSON)</Label>
                          <Textarea
                            placeholder='{"Content-Type": "application/json"}'
                            value={requestHeaders}
                            onChange={(e) => setRequestHeaders(e.target.value)}
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="request-body">
                        <div className="space-y-2">
                          <Label>Request Body (JSON)</Label>
                          <Textarea
                            placeholder='{"key": "value"}'
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="request-params">
                        <div className="space-y-2">
                          <Label>Query Parameters</Label>
                          <Input
                            placeholder="param1=value1&param2=value2"
                            value={requestParams}
                            onChange={(e) => setRequestParams(e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={saveRequest}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Response */}
                {response && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Response
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(response.status)}>
                            {response.status} {response.statusText}
                          </Badge>
                          <Badge variant="outline">{response.time}ms</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyResponse}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="response-body">
                        <TabsList>
                          <TabsTrigger value="response-body">
                            Response Body
                          </TabsTrigger>
                          <TabsTrigger value="response-headers">
                            Response Headers
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="response-body">
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(response.data, null, 2)}
                          </pre>
                        </TabsContent>

                        <TabsContent value="response-headers">
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(response.headers, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation">
            <div className="space-y-6">
              {/* API Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Complete API Documentation
                  </CardTitle>
                  <CardDescription>
                    Comprehensive documentation for all Faredown APIs including
                    authentication, endpoints, parameters, and examples.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="font-semibold text-2xl text-blue-600">
                        {API_CATEGORIES.reduce(
                          (sum, cat) => sum + cat.endpoints.length,
                          0,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Endpoints
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="font-semibold text-2xl text-green-600">
                        {API_CATEGORIES.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        API Categories
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded">
                      <div className="font-semibold text-2xl text-purple-600">
                        REST
                      </div>
                      <div className="text-sm text-gray-600">API Type</div>
                    </div>
                  </div>

                  <Alert className="mb-6">
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>
                          <strong>Base URL:</strong>{" "}
                          https://faredown-api.onrender.com
                        </div>
                        <div>
                          <strong>Authentication:</strong> Bearer token required
                          for protected endpoints
                        </div>
                        <div>
                          <strong>Content-Type:</strong> application/json
                        </div>
                        <div>
                          <strong>Rate Limit:</strong> 100 requests per 15
                          minutes
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Detailed API Documentation by Category */}
              {API_CATEGORIES.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <category.icon className="w-5 h-5 mr-2" />
                      {category.name} API Reference
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {category.endpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="border-l-4 border-blue-500 pl-6 py-4"
                        >
                          {/* Endpoint Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <Badge
                              variant={
                                endpoint.method === "GET"
                                  ? "default"
                                  : endpoint.method === "POST"
                                    ? "destructive"
                                    : endpoint.method === "PUT"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-sm px-3 py-1"
                            >
                              {endpoint.method}
                            </Badge>
                            <h3 className="font-bold text-xl">
                              {endpoint.name}
                            </h3>
                            {endpoint.auth_required && (
                              <Badge variant="destructive">
                                <Lock className="w-3 h-3 mr-1" />
                                Auth Required
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-6">
                            {/* Endpoint URL */}
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">
                                Endpoint
                              </h4>
                              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono">
                                {endpoint.method} {endpoint.url}
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">
                                Description
                              </h4>
                              <p className="text-gray-700 text-base">
                                {endpoint.description}
                              </p>
                            </div>

                            {/* Request Schema */}
                            {endpoint.body_schema && (
                              <div>
                                <h4 className="font-semibold mb-2 text-gray-700">
                                  Request Body
                                </h4>
                                <div className="bg-gray-50 border p-4 rounded">
                                  <pre className="text-sm overflow-auto">
                                    {JSON.stringify(
                                      endpoint.body_schema,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Examples */}
                            {endpoint.examples &&
                              endpoint.examples.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-700">
                                    Examples
                                  </h4>
                                  {endpoint.examples.map((example, idx) => (
                                    <div
                                      key={idx}
                                      className="border rounded mb-4"
                                    >
                                      <div className="bg-gray-100 px-4 py-2 border-b">
                                        <span className="font-medium">
                                          {example.name || `Example ${idx + 1}`}
                                        </span>
                                      </div>
                                      <div className="p-4">
                                        <h5 className="font-medium mb-2">
                                          Request:
                                        </h5>
                                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-auto mb-4">
                                          {JSON.stringify(
                                            example.body ||
                                              example.params ||
                                              {},
                                            null,
                                            2,
                                          )}
                                        </pre>
                                        <h5 className="font-medium mb-2">
                                          Response:
                                        </h5>
                                        <pre className="bg-gray-900 text-blue-400 p-3 rounded text-sm overflow-auto">
                                          {JSON.stringify(
                                            example.response || {
                                              success: true,
                                              data: "Response data here",
                                              timestamp: "2025-01-15T10:30:00Z",
                                            },
                                            null,
                                            2,
                                          )}
                                        </pre>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Response Codes */}
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">
                                Response Codes
                              </h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-20">Code</TableHead>
                                    <TableHead>Description</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-mono font-bold text-green-600">
                                      200
                                    </TableCell>
                                    <TableCell>
                                      Success - Request completed successfully
                                    </TableCell>
                                  </TableRow>
                                  {endpoint.method === "POST" && (
                                    <TableRow>
                                      <TableCell className="font-mono font-bold text-green-600">
                                        201
                                      </TableCell>
                                      <TableCell>
                                        Created - Resource created successfully
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell className="font-mono font-bold text-yellow-600">
                                      400
                                    </TableCell>
                                    <TableCell>
                                      Bad Request - Invalid request parameters
                                      or body
                                    </TableCell>
                                  </TableRow>
                                  {endpoint.auth_required && (
                                    <>
                                      <TableRow>
                                        <TableCell className="font-mono font-bold text-red-600">
                                          401
                                        </TableCell>
                                        <TableCell>
                                          Unauthorized - Missing or invalid
                                          authentication token
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-mono font-bold text-red-600">
                                          403
                                        </TableCell>
                                        <TableCell>
                                          Forbidden - Insufficient permissions
                                          for this resource
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                  <TableRow>
                                    <TableCell className="font-mono font-bold text-red-600">
                                      404
                                    </TableCell>
                                    <TableCell>
                                      Not Found - Requested resource does not
                                      exist
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-mono font-bold text-red-600">
                                      429
                                    </TableCell>
                                    <TableCell>
                                      Too Many Requests - Rate limit exceeded
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-mono font-bold text-red-600">
                                      500
                                    </TableCell>
                                    <TableCell>
                                      Internal Server Error - Unexpected server
                                      error
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Test Button */}
                            <div className="pt-4 border-t">
                              <Button
                                variant="default"
                                onClick={() => {
                                  setActiveMainTab("testing");
                                  selectEndpoint(endpoint);
                                }}
                                className="w-full sm:w-auto"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Test This Endpoint
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Authentication Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Authentication Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Getting Started</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>
                        Use the /api/auth/login endpoint to authenticate and
                        receive a JWT token
                      </li>
                      <li>
                        Include the token in the Authorization header for
                        protected endpoints
                      </li>
                      <li>Format: Authorization: Bearer your-jwt-token-here</li>
                      <li>
                        Tokens expire after 24 hours - use the refresh endpoint
                        before expiration
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Authentication Flow</h4>
                    <div className="bg-gray-50 p-4 rounded border">
                      <div className="space-y-4">
                        <div>
                          <strong>Step 1: Login Request</strong>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm">
                            POST /api/auth/login{"\n"}
                            Content-Type: application/json{"\n\n"}
                            {JSON.stringify(
                              {
                                email: "user@example.com",
                                password: "password123",
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                        <div>
                          <strong>Step 2: Login Response</strong>
                          <pre className="bg-gray-900 text-blue-400 p-3 rounded mt-2 text-sm">
                            {JSON.stringify(
                              {
                                success: true,
                                data: {
                                  token:
                                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                  user: {
                                    id: "123",
                                    email: "user@example.com",
                                  },
                                  expires_in: 86400,
                                },
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                        <div>
                          <strong>
                            Step 3: Use Token in Subsequent Requests
                          </strong>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm">
                            GET /api/protected-endpoint{"\n"}
                            Authorization: Bearer
                            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...{"\n"}
                            Content-Type: application/json
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Best Practices:</strong> Store tokens
                      securely, never expose them in client-side code or logs,
                      and implement proper token refresh logic before
                      expiration.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Rate Limiting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Rate Limiting & Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        Rate Limits by Category
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Endpoint Category</TableHead>
                            <TableHead>Rate Limit</TableHead>
                            <TableHead>Time Window</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Authentication</TableCell>
                            <TableCell>5 requests</TableCell>
                            <TableCell>15 minutes</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Search APIs (Flights/Hotels)</TableCell>
                            <TableCell>100 requests</TableCell>
                            <TableCell>15 minutes</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Booking APIs</TableCell>
                            <TableCell>50 requests</TableCell>
                            <TableCell>15 minutes</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>AI/Bargain APIs</TableCell>
                            <TableCell>30 requests</TableCell>
                            <TableCell>15 minutes</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Admin APIs</TableCell>
                            <TableCell>200 requests</TableCell>
                            <TableCell>15 minutes</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">
                        Development Best Practices
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium">Request Guidelines</h5>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Always include proper error handling</li>
                            <li>Use appropriate HTTP methods</li>
                            <li>Set reasonable request timeouts (30s)</li>
                            <li>Implement exponential backoff for retries</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium">Security Guidelines</h5>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Always use HTTPS in production</li>
                            <li>Validate input data before sending</li>
                            <li>Store tokens securely</li>
                            <li>Implement proper CORS policies</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Authentication Management
                </CardTitle>
                <CardDescription>
                  Manage authentication tokens for API testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bearer Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      type={showAuthToken ? "text" : "password"}
                      placeholder="Enter your JWT token here"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowAuthToken(!showAuthToken)}
                    >
                      {showAuthToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button onClick={saveAuthToken}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your token will be automatically included in requests to
                    endpoints that require authentication. To get a token, use
                    the login endpoints in the Authentication category.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        User Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        For customer-facing APIs like bookings and user data.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          selectEndpoint(API_CATEGORIES[0].endpoints[0])
                        }
                      >
                        Try User Login
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Admin Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        For admin APIs like AI management and system controls.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          selectEndpoint(API_CATEGORIES[0].endpoints[1])
                        }
                      >
                        Try Admin Login
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Requests Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Saved Requests
                </CardTitle>
                <CardDescription>
                  Your saved API requests for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No saved requests yet</p>
                    <p className="text-sm">
                      Save requests from the API Testing tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => loadSavedRequest(request)}
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {request.method}
                          </Badge>
                          <div>
                            <div className="font-medium">{request.name}</div>
                            <div className="text-sm text-gray-500 font-mono">
                              {request.url}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APITestingDashboard;
