import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Search,
  Database,
  Refresh,
  Download,
  Globe,
  Calendar,
  Users,
} from "lucide-react";

interface DestinationAnalytic {
  destination_code: string;
  name: string;
  country_name: string;
  total_searches: number;
  total_bookings: number;
  last_searched: string;
}

interface CacheStats {
  cleanedEntries: number;
  timestamp: string;
}

export function DestinationsAnalytics() {
  const [analytics, setAnalytics] = useState<DestinationAnalytic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cleaningCache, setCleaningCache] = useState(false);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Loading destination analytics for ${days} days...`);

      const response = await fetch(
        `/api/admin/destinations/analytics?days=${days}`,
      );

      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data || []);
        console.log("✅ Analytics loaded:", data.data?.length, "destinations");
      } else {
        throw new Error(data.error || "Failed to load analytics");
      }
    } catch (err) {
      console.error("Analytics loading failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Clean cache
  const cleanCache = async () => {
    try {
      setCleaningCache(true);
      console.log("🧹 Cleaning expired cache entries...");

      const response = await fetch("/api/admin/hotels/cache/cleanup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Cache cleanup API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCacheStats(data.data);
        console.log(
          "✅ Cache cleaned:",
          data.data?.cleanedEntries,
          "entries removed",
        );
      } else {
        throw new Error(data.error || "Failed to clean cache");
      }
    } catch (err) {
      console.error("Cache cleanup failed:", err);
      setError(err instanceof Error ? err.message : "Failed to clean cache");
    } finally {
      setCleaningCache(false);
    }
  };

  // Load analytics on component mount and when days change
  useEffect(() => {
    loadAnalytics();
  }, [days]);

  // Calculate summary stats
  const totalSearches = analytics.reduce(
    (sum, item) => sum + item.total_searches,
    0,
  );
  const totalBookings = analytics.reduce(
    (sum, item) => sum + item.total_bookings,
    0,
  );
  const conversionRate =
    totalSearches > 0
      ? ((totalBookings / totalSearches) * 100).toFixed(1)
      : "0.0";
  const uniqueDestinations = analytics.length;

  // Export data as CSV
  const exportAnalytics = () => {
    const csvContent = [
      [
        "Destination Code",
        "Name",
        "Country",
        "Searches",
        "Bookings",
        "Conversion Rate",
        "Last Searched",
      ],
      ...analytics.map((item) => [
        item.destination_code,
        item.name,
        item.country_name,
        item.total_searches,
        item.total_bookings,
        item.total_searches > 0
          ? ((item.total_bookings / item.total_searches) * 100).toFixed(1) + "%"
          : "0%",
        new Date(item.last_searched).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `destinations-analytics-${days}days-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Destinations Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Search patterns and performance insights from destinations database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportAnalytics}
            variant="outline"
            size="sm"
            disabled={analytics.length === 0}
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Refresh className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Analysis Period:
        </label>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSearches.toLocaleString()}
                </p>
              </div>
              <Search className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBookings.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversionRate}%
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
                <p className="text-sm text-gray-600">Active Destinations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueDestinations}
                </p>
              </div>
              <Globe className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Destinations ({days} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading analytics...
                  </span>
                </div>
              ) : analytics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No analytics data available for the selected period</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.slice(0, 20).map((item, index) => {
                    const conversionRate =
                      item.total_searches > 0
                        ? (item.total_bookings / item.total_searches) * 100
                        : 0;

                    return (
                      <div
                        key={item.destination_code}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg">
                            {index === 0
                              ? "🏆"
                              : index === 1
                                ? "🥈"
                                : index === 2
                                  ? "🥉"
                                  : "🌍"}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <span>
                                {item.name}, {item.country_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {item.destination_code}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Last searched:{" "}
                              {new Date(
                                item.last_searched,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {item.total_searches.toLocaleString()} searches
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.total_bookings} bookings (
                            {conversionRate.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {analytics.length > 20 && (
                    <div className="text-center py-4 text-gray-500">
                      ... and {analytics.length - 20} more destinations
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Cache Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Hotel Cache Cleanup
                  </h3>
                  <p className="text-sm text-blue-700">
                    Remove expired hotel data from the cache to free up database
                    space
                  </p>
                </div>
                <Button
                  onClick={cleanCache}
                  disabled={cleaningCache}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {cleaningCache ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Refresh className="w-4 h-4 mr-2" />
                      Clean Cache
                    </>
                  )}
                </Button>
              </div>

              {cacheStats && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">
                    ✅ Cache Cleanup Complete
                  </h3>
                  <div className="text-sm text-green-700">
                    <p>Cleaned {cacheStats.cleanedEntries} expired entries</p>
                    <p>
                      Completed at:{" "}
                      {new Date(cacheStats.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Cache Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    • Hotel data is automatically cached for 24 hours to improve
                    performance
                  </p>
                  <p>• Search results are cached for 12 hours by default</p>
                  <p>
                    • Popular destinations are cached indefinitely with manual
                    refresh
                  </p>
                  <p>
                    • Cache cleanup removes entries older than their expiry time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DestinationsAnalytics;
