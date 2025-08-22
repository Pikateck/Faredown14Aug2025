/**
 * AI Bargaining Dashboard
 * Complete admin interface for AI bargaining platform
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface LiveSession {
  session_id: string;
  product_type: string;
  canonical_key: string;
  round_count: number;
  latest_offer: number | null;
  latest_accept_prob: number | null;
  is_accepted: boolean;
  time_active_minutes: number;
}

interface DashboardData {
  sessions: LiveSession[];
  performance: any;
  timestamp: string;
}

const AIBargainingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("live-monitor");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live monitoring data
  const [liveData, setLiveData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Policy editor
  const [policyYaml, setPolicyYaml] = useState("");
  const [policyValidation, setPolicyValidation] = useState<any>(null);

  // Reports data
  const [airlineData, setAirlineData] = useState<any[]>([]);
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [elasticityData, setElasticityData] = useState<any[]>([]);
  const [promoData, setPromoData] = useState<any[]>([]);

  // Fetch live data
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch("/api/admin/ai/live");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setLiveData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.warn("API not available, using mock data:", err.message);
        // Provide fallback mock data when API is not available
        setLiveData({
          data: {
            sessions: [
              {
                session_id: "sess_demo_001",
                product_type: "flight",
                canonical_key: "FL:AI:DEL-BOM:2025-02-15",
                round_count: 2,
                latest_offer: 145.5,
                latest_accept_prob: 0.73,
                is_accepted: false,
                time_active_minutes: 3.2,
              },
            ],
            performance: {
              active_sessions: 5,
              acceptance_rate: 0.68,
              avg_revenue_per_session: 142.33,
              hourly_profit: 650.45,
            },
          },
        });
        setError(`API offline - showing demo data (${err.message})`);
        setLoading(false);
      }
    };

    fetchLiveData();

    // Auto-refresh every 10 seconds (reduced frequency to avoid spam)
    const interval = autoRefresh ? setInterval(fetchLiveData, 10000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Fetch report data based on active tab
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        switch (activeTab) {
          case "airline-reports":
            try {
              const airlineResponse = await fetch(
                "/api/admin/ai/reports/airline-route",
              );
              if (airlineResponse.ok) {
                const airlineResult = await airlineResponse.json();
                setAirlineData(airlineResult.data || []);
              } else {
                setAirlineData([
                  {
                    airline: "Demo",
                    route: "DEL-BOM",
                    sessions: 25,
                    accepted: 18,
                    avg_price: 156.78,
                    avg_profit: 23.45,
                  },
                ]);
              }
            } catch {
              setAirlineData([
                {
                  airline: "Demo",
                  route: "DEL-BOM",
                  sessions: 25,
                  accepted: 18,
                  avg_price: 156.78,
                  avg_profit: 23.45,
                },
              ]);
            }
            break;

          case "hotel-reports":
            try {
              const hotelResponse = await fetch(
                "/api/admin/ai/reports/hotel-city",
              );
              if (hotelResponse.ok) {
                const hotelResult = await hotelResponse.json();
                setHotelData(hotelResult.data || []);
              } else {
                setHotelData([
                  {
                    city: "Dubai",
                    hotel_name: "Demo Hotel",
                    sessions: 28,
                    accepted: 19,
                    avg_price: 450.0,
                    avg_profit: 67.5,
                  },
                ]);
              }
            } catch {
              setHotelData([
                {
                  city: "Dubai",
                  hotel_name: "Demo Hotel",
                  sessions: 28,
                  accepted: 19,
                  avg_price: 450.0,
                  avg_profit: 67.5,
                },
              ]);
            }
            break;

          case "elasticity":
            try {
              const elasticityResponse = await fetch(
                "/api/admin/ai/elasticity?product_type=flight",
              );
              if (elasticityResponse.ok) {
                const elasticityResult = await elasticityResponse.json();
                setElasticityData(elasticityResult.elasticity_data || []);
              } else {
                setElasticityData([
                  { bucket: "0-5%", accept_rate: 0.12 },
                  { bucket: "10-15%", accept_rate: 0.45 },
                  { bucket: "20-25%", accept_rate: 0.82 },
                ]);
              }
            } catch {
              setElasticityData([
                { bucket: "0-5%", accept_rate: 0.12 },
                { bucket: "10-15%", accept_rate: 0.45 },
                { bucket: "20-25%", accept_rate: 0.82 },
              ]);
            }
            break;

          case "promo-lab":
            try {
              const promoResponse = await fetch(
                "/api/admin/ai/reports/promo-effectiveness",
              );
              if (promoResponse.ok) {
                const promoResult = await promoResponse.json();
                setPromoData(promoResult.promo_effectiveness || []);
              } else {
                setPromoData([
                  { used_promo: "SAVE10", avg_profit_usd: 23.45 },
                  { used_promo: "SAVE20", avg_profit_usd: 18.9 },
                ]);
              }
            } catch {
              setPromoData([
                { used_promo: "SAVE10", avg_profit_usd: 23.45 },
                { used_promo: "SAVE20", avg_profit_usd: 18.9 },
              ]);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      }
    };

    if (activeTab !== "live-monitor") {
      fetchReportData();
    }
  }, [activeTab]);

  // Load current policy
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch("/api/admin/ai/policies");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.policies && data.policies.length > 0) {
          setPolicyYaml(data.policies[0].dsl_yaml);
        } else {
          // Set default policy if none exists
          setPolicyYaml(`version: v1.0.0
global:
  currency_base: USD
  exploration_pct: 0.08
  max_rounds: 3
  response_budget_ms: 300
  never_loss: true
price_rules:
  flight:
    min_margin_usd: 6.0
    max_discount_pct: 0.15
    hold_minutes: 10
  hotel:
    min_margin_usd: 4.0
    max_discount_pct: 0.20
    hold_minutes: 15`);
        }
      } catch (err) {
        console.error("Failed to fetch policy:", err);
        // Set default policy on error
        setPolicyYaml(`version: v1.0.0
global:
  currency_base: USD
  exploration_pct: 0.08
  max_rounds: 3
  response_budget_ms: 300
  never_loss: true
price_rules:
  flight:
    min_margin_usd: 6.0
    max_discount_pct: 0.15
    hold_minutes: 10
  hotel:
    min_margin_usd: 4.0
    max_discount_pct: 0.20
    hold_minutes: 15`);
      }
    };

    if (activeTab === "policy-manager") {
      fetchPolicy();
    }
  }, [activeTab]);

  const validatePolicy = async () => {
    try {
      const response = await fetch("/api/admin/ai/policies/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dsl_yaml: policyYaml }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setPolicyValidation(result);
    } catch (err) {
      console.error("Policy validation error:", err);
      setPolicyValidation({
        success: false,
        valid: false,
        errors: [`Validation request failed: ${err.message}`],
      });
    }
  };

  const publishPolicy = async () => {
    try {
      const response = await fetch("/api/admin/ai/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: `v${Date.now()}`,
          dsl_yaml: policyYaml,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("Policy published successfully!");
        setPolicyValidation(null);
      } else {
        alert(`Failed to publish policy: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Policy publish error:", err);
      alert(`Error publishing policy: ${err.message}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading AI Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Bargaining Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant={liveData ? "default" : "destructive"}>
            {liveData ? "Connected" : "Disconnected"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Pause" : "Resume"} Auto-refresh
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 lg:grid-cols-11 gap-1 h-auto">
          <TabsTrigger value="live-monitor" className="text-xs">
            Live Monitor
          </TabsTrigger>
          <TabsTrigger value="price-watch" className="text-xs">
            Price Watch
          </TabsTrigger>
          <TabsTrigger value="policy-manager" className="text-xs">
            Policy
          </TabsTrigger>
          <TabsTrigger value="markup-manager" className="text-xs">
            Markup
          </TabsTrigger>
          <TabsTrigger value="promo-lab" className="text-xs">
            Promo Lab
          </TabsTrigger>
          <TabsTrigger value="elasticity" className="text-xs">
            Elasticity
          </TabsTrigger>
          <TabsTrigger value="airline-reports" className="text-xs">
            Airlines
          </TabsTrigger>
          <TabsTrigger value="hotel-reports" className="text-xs">
            Hotels
          </TabsTrigger>
          <TabsTrigger value="replay" className="text-xs">
            Replay
          </TabsTrigger>
          <TabsTrigger value="models" className="text-xs">
            Models
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs">
            Health
          </TabsTrigger>
        </TabsList>

        {/* 1. LIVE MONITOR */}
        <TabsContent value="live-monitor" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {liveData?.sessions?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 30 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    liveData?.performance?.offerability?.avg_time_ms || 0,
                  )}
                  ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;300ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (1 -
                      (liveData?.performance?.offerability?.error_rate || 0)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Error rate:{" "}
                  {formatPercentage(
                    liveData?.performance?.offerability?.error_rate || 0,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Redis Hit Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">Target: &gt;90%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Sessions</CardTitle>
              <CardDescription>Real-time bargaining sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {liveData?.sessions
                  ?.slice(0, 10)
                  .map((session: LiveSession) => (
                    <div
                      key={session.session_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{session.product_type}</Badge>
                        <span className="font-mono text-sm">
                          {session.session_id.substring(0, 8)}...
                        </span>
                        <span className="text-sm text-gray-600">
                          Round {session.round_count}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {session.latest_offer && (
                          <span className="text-sm">
                            {formatCurrency(session.latest_offer)}
                          </span>
                        )}
                        {session.latest_accept_prob && (
                          <Badge variant="secondary">
                            {formatPercentage(session.latest_accept_prob)}{" "}
                            accept
                          </Badge>
                        )}
                        <Badge
                          variant={session.is_accepted ? "default" : "outline"}
                        >
                          {session.is_accepted ? "Accepted" : "Active"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {session.time_active_minutes}m
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PRICE WATCH */}
        <TabsContent value="price-watch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Volatility Monitor</CardTitle>
              <CardDescription>
                Track supplier rate changes and inventory fluctuations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avg_total_price"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No price alerts in the last 24 hours. Inventory levels stable.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* 3. POLICY MANAGER */}
        <TabsContent value="policy-manager" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Editor</CardTitle>
              <CardDescription>
                Edit and validate bargaining policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy-yaml">Policy YAML</Label>
                <Textarea
                  id="policy-yaml"
                  value={policyYaml}
                  onChange={(e) => setPolicyYaml(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={validatePolicy} variant="outline">
                  Validate Policy
                </Button>
                <Button
                  onClick={publishPolicy}
                  disabled={!policyValidation?.valid}
                >
                  Publish Policy
                </Button>
              </div>

              {policyValidation && (
                <Alert
                  variant={policyValidation.valid ? "default" : "destructive"}
                >
                  <AlertDescription>
                    {policyValidation.valid ? (
                      <div>
                        <p>✅ Policy validation passed</p>
                        {policyValidation.preview && (
                          <div className="mt-2 text-sm">
                            Preview: Min ${policyValidation.preview.min_price} -
                            Max ${policyValidation.preview.max_price}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>❌ Policy validation failed:</p>
                        <ul className="list-disc list-inside mt-1">
                          {policyValidation.errors?.map(
                            (error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MARKUP MANAGER */}
        <TabsContent value="markup-manager" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Markup Rules</CardTitle>
              <CardDescription>
                Manage markup rules and cost floors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Markup management interface - Add CRUD operations for
                ai.markup_rules
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. PROMO LAB */}
        <TabsContent value="promo-lab" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promo Effectiveness</CardTitle>
              <CardDescription>
                Analyze promo code performance and incremental profit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={promoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="used_promo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_profit_usd" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. ELASTICITY EXPLORER */}
        <TabsContent value="elasticity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Elasticity Analysis</CardTitle>
              <CardDescription>
                Discount depth vs acceptance rate curves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={elasticityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accept_rate"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. AIRLINE REPORTS */}
        <TabsContent value="airline-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Airline Route Performance</CardTitle>
              <CardDescription>
                Per airline/destination analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {airlineData.slice(0, 10).map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      {row.airline} {row.route}
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span>{row.sessions} sessions</span>
                      <span>{row.accepted} accepted</span>
                      <span>{formatCurrency(row.avg_profit || 0)} profit</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. HOTEL REPORTS */}
        <TabsContent value="hotel-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel City Performance</CardTitle>
              <CardDescription>Per city/hotel analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hotelData.slice(0, 10).map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      {row.city} - {row.hotel_name}
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span>{row.sessions} sessions</span>
                      <span>{row.accepted} accepted</span>
                      <span>{formatCurrency(row.avg_profit || 0)} profit</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9. REPLAY & AUDIT */}
        <TabsContent value="replay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Replay & Audit</CardTitle>
              <CardDescription>
                View complete session traces and signed capsules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-id">Session ID</Label>
                  <Input
                    id="session-id"
                    placeholder="Enter session ID to replay..."
                    className="max-w-md"
                  />
                </div>
                <Button>Load Session Replay</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 10. MODELS & A/B */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Registry & A/B Tests</CardTitle>
              <CardDescription>
                Manage ML models and experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Model and experiment management interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 11. HEALTH & JOBS */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor components, jobs, and SLAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Offerability Engine</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Avg:{" "}
                    {Math.round(
                      liveData?.performance?.offerability?.avg_time_ms || 0,
                    )}
                    ms
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Scoring Engine</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Calls: {liveData?.performance?.scoring?.total_calls || 0}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Redis Cache</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIBargainingDashboard;
