/**
 * Bargain Engine Management Admin Section
 * Real-time bargain monitoring and AI strategy configuration
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Zap,
  Brain,
  Play,
  Pause,
  Stop,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export default function BargainEngine() {
  const [activeSessions, setActiveSessions] = useState(247);
  const [engineStatus, setEngineStatus] = useState("active");
  const [aiAggression, setAiAggression] = useState([65]);
  const [successRate, setSuccessRate] = useState(78.5);

  // Mock bargain sessions data
  const bargainSessions = [
    {
      id: "BRG-2024-001",
      user: "John Doe",
      type: "flight",
      item: "Mumbai → Dubai",
      originalPrice: 45000,
      targetPrice: 38000,
      currentOffer: 41000,
      status: "active",
      strategy: "aggressive",
      duration: "8:45",
      attempts: 3,
      savingsPotential: 15.5,
      aiConfidence: 82,
      userDevice: "mobile",
      location: "Mumbai",
    },
    {
      id: "BRG-2024-002",
      user: "Sarah Wilson",
      type: "hotel",
      item: "Burj Al Arab - Dubai",
      originalPrice: 89000,
      targetPrice: 75000,
      currentOffer: 82000,
      status: "negotiating",
      strategy: "moderate",
      duration: "12:20",
      attempts: 5,
      savingsPotential: 18.2,
      aiConfidence: 94,
      userDevice: "desktop",
      location: "Delhi",
    },
    {
      id: "BRG-2024-003",
      user: "Mike Johnson",
      type: "flight",
      item: "Delhi → London",
      originalPrice: 75000,
      targetPrice: 65000,
      currentOffer: 68000,
      status: "successful",
      strategy: "conservative",
      duration: "15:30",
      attempts: 4,
      savingsPotential: 13.3,
      aiConfidence: 76,
      userDevice: "mobile",
      location: "Bangalore",
    },
  ];

  const aiStrategies = [
    {
      name: "Aggressive",
      description: "High savings potential, higher risk",
      successRate: 65,
      avgSavings: 22.5,
      active: true,
    },
    {
      name: "Moderate",
      description: "Balanced approach, reliable results",
      successRate: 78,
      avgSavings: 18.2,
      active: true,
    },
    {
      name: "Conservative",
      description: "Safe negotiations, lower savings",
      successRate: 89,
      avgSavings: 12.1,
      active: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "negotiating":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <MessageCircle className="w-3 h-3 mr-1" />
            Negotiating
          </Badge>
        );
      case "successful":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Successful
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStrategyBadge = (strategy: string) => {
    switch (strategy) {
      case "aggressive":
        return <Badge className="bg-red-100 text-red-800">Aggressive</Badge>;
      case "moderate":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
        );
      case "conservative":
        return (
          <Badge className="bg-green-100 text-green-800">Conservative</Badge>
        );
      default:
        return <Badge variant="outline">{strategy}</Badge>;
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveSessions((prev) => prev + Math.floor(Math.random() * 5 - 2));
      setSuccessRate((prev) => prev + (Math.random() - 0.5) * 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bargain Engine</h1>
          <p className="text-gray-600">
            Monitor AI-powered bargaining sessions and configure strategies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            className={
              engineStatus === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
            Engine {engineStatus}
          </Badge>
          <Button
            variant={engineStatus === "active" ? "destructive" : "default"}
            size="sm"
            onClick={() =>
              setEngineStatus(engineStatus === "active" ? "paused" : "active")
            }
          >
            {engineStatus === "active" ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Engine
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Engine
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {activeSessions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12 from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {successRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+3.2% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Savings</p>
                <p className="text-2xl font-bold text-purple-600">₹8,940</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-purple-600">
                18.5% avg discount
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  AI Confidence
                </p>
                <p className="text-2xl font-bold text-orange-600">84%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Zap className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-sm text-orange-600">High performance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
          <TabsTrigger value="ai-strategies">AI Strategies</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Live Sessions Tab */}
        <TabsContent value="live-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Bargain Sessions ({bargainSessions.length})</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>AI Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bargainSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-sm">
                          {session.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.user}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              {session.userDevice === "mobile" ? (
                                <Smartphone className="w-3 h-3 mr-1" />
                              ) : (
                                <Monitor className="w-3 h-3 mr-1" />
                              )}
                              {session.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.item}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {session.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-500">Original:</span> ₹
                              {session.originalPrice.toLocaleString()}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Target:</span> ₹
                              {session.targetPrice.toLocaleString()}
                            </div>
                            <div className="text-sm font-semibold text-blue-600">
                              <span className="text-gray-500">Current:</span> ₹
                              {session.currentOffer.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">
                              {session.savingsPotential}% potential savings
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          {getStrategyBadge(session.strategy)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.duration}</p>
                            <p className="text-xs text-gray-500">
                              {session.attempts} attempts
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={session.aiConfidence}
                              className="w-16"
                            />
                            <span className="text-sm font-medium">
                              {session.aiConfidence}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Strategies Tab */}
        <TabsContent value="ai-strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiStrategies.map((strategy) => (
              <Card key={strategy.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{strategy.name}</span>
                    <Switch checked={strategy.active} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {strategy.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {strategy.successRate}%
                        </span>
                      </div>
                      <Progress value={strategy.successRate} className="mt-1" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Savings</span>
                        <span className="font-medium">
                          {strategy.avgSavings}%
                        </span>
                      </div>
                      <Progress value={strategy.avgSavings} className="mt-1" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Strategy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">
                  AI Aggression Level: {aiAggression[0]}%
                </label>
                <Slider
                  value={aiAggression}
                  onValueChange={setAiAggression}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher levels result in more aggressive negotiations but lower
                  success rates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Max Session Duration (minutes)
                  </label>
                  <Input type="number" defaultValue="15" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Max Negotiation Attempts
                  </label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button>Save Configuration</Button>
                <Button variant="outline">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-2" />
                  <p>Chart placeholder - Success rate over time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-2" />
                  <p>Chart placeholder - Savings amount distribution</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                  <p className="text-sm text-gray-600">User Satisfaction</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">4.2s</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">15.7min</p>
                  <p className="text-sm text-gray-600">Avg Session Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">2.8M</p>
                  <p className="text-sm text-gray-600">Total Savings (₹)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engine Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Auto-start sessions
                    </label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Allow manual intervention
                    </label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Send user notifications
                    </label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Enable session recordings
                    </label>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Minimum savings threshold (%)
                    </label>
                    <Input type="number" defaultValue="5" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Maximum discount limit (%)
                    </label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Session timeout (minutes)
                    </label>
                    <Input type="number" defaultValue="10" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Default</Button>
                <Button variant="destructive">Emergency Stop</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
