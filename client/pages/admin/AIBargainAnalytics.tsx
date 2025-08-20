import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface BargainMetrics {
  totalSessions: number;
  conversionRate: number;
  avgFinalMargin: number;
  avgNegotiationTime: number;
  totalRevenue: number;
  topPerformingModule: string;
}

interface ModulePerformance {
  module: string;
  sessions: number;
  conversions: number;
  avgMargin: number;
  revenue: number;
}

interface EmotionalResponse {
  emotion: string;
  count: number;
  conversionRate: number;
  avgFinalPrice: number;
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  description: string;
}

export function AIBargainAnalytics() {
  const [metrics, setMetrics] = useState<BargainMetrics | null>(null);
  const [modulePerformance, setModulePerformance] = useState<
    ModulePerformance[]
  >([]);
  const [emotionalResponses, setEmotionalResponses] = useState<
    EmotionalResponse[]
  >([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [aiSettings, setAiSettings] = useState({
    minMargin: 4.0,
    maxConcession: 5.0,
    maxAttempts: 3,
    holdSeconds: 30,
    emotionalIntelligence: true,
    adaptivePricing: true,
  });

  useEffect(() => {
    fetchAnalytics();
    fetchFeatureFlags();
    fetchAISettings();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulated data - in production, fetch from API
      const mockMetrics: BargainMetrics = {
        totalSessions: 1247,
        conversionRate: 73.2,
        avgFinalMargin: 6.8,
        avgNegotiationTime: 8.4,
        totalRevenue: 2847500,
        topPerformingModule: "flights",
      };

      const mockModulePerformance: ModulePerformance[] = [
        {
          module: "flights",
          sessions: 523,
          conversions: 398,
          avgMargin: 7.2,
          revenue: 1247500,
        },
        {
          module: "hotels",
          sessions: 387,
          conversions: 289,
          avgMargin: 8.1,
          revenue: 987600,
        },
        {
          module: "sightseeing",
          sessions: 201,
          conversions: 142,
          avgMargin: 12.5,
          revenue: 423800,
        },
        {
          module: "transfers",
          sessions: 136,
          conversions: 84,
          avgMargin: 5.9,
          revenue: 188600,
        },
      ];

      const mockEmotionalResponses: EmotionalResponse[] = [
        {
          emotion: "pleased",
          count: 412,
          conversionRate: 89.3,
          avgFinalPrice: 18500,
        },
        {
          emotion: "negotiating",
          count: 387,
          conversionRate: 71.2,
          avgFinalPrice: 16800,
        },
        {
          emotion: "firm",
          count: 234,
          conversionRate: 58.7,
          avgFinalPrice: 19200,
        },
        {
          emotion: "flexible",
          count: 214,
          conversionRate: 82.1,
          avgFinalPrice: 17200,
        },
      ];

      const mockBehaviorPatterns: BehaviorPattern[] = [
        {
          pattern: "Early Acceptor",
          frequency: 34.2,
          successRate: 91.5,
          description: "Users who accept within first 2 rounds",
        },
        {
          pattern: "Persistent Negotiator",
          frequency: 28.7,
          successRate: 68.3,
          description: "Users who use all 3 rounds",
        },
        {
          pattern: "Quick Decision",
          frequency: 22.1,
          successRate: 85.7,
          description: "Decisions made under 10 seconds",
        },
        {
          pattern: "Price Sensitive",
          frequency: 15.0,
          successRate: 52.4,
          description: "Offers significantly below base price",
        },
      ];

      setMetrics(mockMetrics);
      setModulePerformance(mockModulePerformance);
      setEmotionalResponses(mockEmotionalResponses);
      setBehaviorPatterns(mockBehaviorPatterns);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      // Simulated feature flags
      setFeatureFlags({
        ai_bargain_enabled: true,
        emotional_intelligence: true,
        visible_rounds_mode: true,
        hidden_rounds_mode: false,
        competitor_panel: false,
        ai_admin_analytics: true,
        copy_pack_rotation: true,
        urgency_messaging: true,
      });
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
    }
  };

  const fetchAISettings = async () => {
    // Simulated settings - in production, fetch from API
    setAiSettings({
      minMargin: 4.0,
      maxConcession: 5.0,
      maxAttempts: 3,
      holdSeconds: 30,
      emotionalIntelligence: true,
      adaptivePricing: true,
    });
  };

  const updateFeatureFlag = async (key: string, value: boolean) => {
    try {
      setFeatureFlags((prev) => ({ ...prev, [key]: value }));
      // In production: await fetch('/api/admin/feature-flags', { ... })
      console.log(`Feature flag ${key} updated to ${value}`);
    } catch (error) {
      console.error("Failed to update feature flag:", error);
    }
  };

  const updateAISetting = async (key: string, value: any) => {
    try {
      setAiSettings((prev) => ({ ...prev, [key]: value }));
      // In production: await fetch('/api/admin/ai-settings', { ... })
      console.log(`AI setting ${key} updated to ${value}`);
    } catch (error) {
      console.error("Failed to update AI setting:", error);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-500" />
            AI Bargain Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Emotional intelligence insights and behavioral optimization
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold">
                    {metrics.totalSessions.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {metrics.conversionRate}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Final Margin</p>
                  <p className="text-2xl font-bold">
                    {metrics.avgFinalMargin}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold">
                    {metrics.avgNegotiationTime}s
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{(metrics.totalRevenue / 100000).toFixed(1)}L
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Module</p>
                  <p className="text-2xl font-bold capitalize">
                    {metrics.topPerformingModule}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="emotions">AI Emotions</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        {/* Performance Analytics */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Performance</CardTitle>
                <CardDescription>
                  Revenue and conversion by product type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modulePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates by Module</CardTitle>
                <CardDescription>Success rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modulePerformance.map((item, index) => ({
                        ...item,
                        conversionRate: (
                          (item.conversions / item.sessions) *
                          100
                        ).toFixed(1),
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="conversions"
                      label={(entry) =>
                        `${entry.module}: ${entry.conversionRate}%`
                      }
                    >
                      {modulePerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Emotions */}
        <TabsContent value="emotions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Emotional Responses</CardTitle>
                <CardDescription>
                  How AI emotions correlate with success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emotionalResponses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversionRate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emotion Impact on Final Price</CardTitle>
                <CardDescription>
                  Average final price by AI emotional state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emotionalResponses.map((emotion, index) => (
                    <div
                      key={emotion.emotion}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <p className="font-medium capitalize">
                            {emotion.emotion}
                          </p>
                          <p className="text-sm text-gray-600">
                            {emotion.count} occurrences
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{emotion.avgFinalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {emotion.conversionRate}% conversion
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Behavior */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Patterns</CardTitle>
              <CardDescription>
                Identified patterns and their success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {behaviorPatterns.map((pattern, index) => (
                  <div key={pattern.pattern} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            pattern.successRate > 80
                              ? "default"
                              : pattern.successRate > 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {pattern.successRate}% Success
                        </Badge>
                        <h3 className="font-semibold">{pattern.pattern}</h3>
                      </div>
                      <span className="text-sm text-gray-600">
                        {pattern.frequency}% of users
                      </span>
                    </div>
                    <p className="text-gray-600">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Control AI behavior and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(featureFlags).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {key === "ai_bargain_enabled" &&
                          "Enable/disable AI bargaining globally"}
                        {key === "emotional_intelligence" &&
                          "Use emotional intelligence in responses"}
                        {key === "visible_rounds_mode" &&
                          "Show users their bargain attempt count"}
                        {key === "urgency_messaging" &&
                          "Use time pressure and scarcity messaging"}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={enabled}
                      onCheckedChange={(value) => updateFeatureFlag(key, value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Core AI bargaining parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minMargin">Minimum Margin (%)</Label>
                  <Input
                    id="minMargin"
                    type="number"
                    value={aiSettings.minMargin}
                    onChange={(e) =>
                      updateAISetting("minMargin", parseFloat(e.target.value))
                    }
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Never-loss guardrail percentage
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxConcession">Max Concession (%)</Label>
                  <Input
                    id="maxConcession"
                    type="number"
                    value={aiSettings.maxConcession}
                    onChange={(e) =>
                      updateAISetting(
                        "maxConcession",
                        parseFloat(e.target.value),
                      )
                    }
                    min="0"
                    max="25"
                    step="0.1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Maximum discount from base price
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={aiSettings.maxAttempts}
                    onChange={(e) =>
                      updateAISetting("maxAttempts", parseInt(e.target.value))
                    }
                    min="1"
                    max="10"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Maximum bargaining rounds per session
                  </p>
                </div>

                <div>
                  <Label htmlFor="holdSeconds">Hold Duration (seconds)</Label>
                  <Input
                    id="holdSeconds"
                    type="number"
                    value={aiSettings.holdSeconds}
                    onChange={(e) =>
                      updateAISetting("holdSeconds", parseInt(e.target.value))
                    }
                    min="10"
                    max="300"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Time to hold accepted offers
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emotionalIntelligence">
                      Emotional Intelligence
                    </Label>
                    <Switch
                      id="emotionalIntelligence"
                      checked={aiSettings.emotionalIntelligence}
                      onCheckedChange={(value) =>
                        updateAISetting("emotionalIntelligence", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="adaptivePricing">Adaptive Pricing</Label>
                    <Switch
                      id="adaptivePricing"
                      checked={aiSettings.adaptivePricing}
                      onCheckedChange={(value) =>
                        updateAISetting("adaptivePricing", value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
