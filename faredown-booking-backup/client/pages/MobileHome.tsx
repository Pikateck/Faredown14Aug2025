import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  MapPin,
  Calendar,
  Users,
  Search,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Gift,
  Globe,
  Hotel,
  Car,
  Camera,
} from "lucide-react";

const MobileHome: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Mumbai (BOM)");
  const [to, setTo] = useState("Dubai (DXB)");
  const [departure, setDeparture] = useState("2024-08-16");
  const [passengers, setPassengers] = useState(1);

  const quickActions = [
    {
      icon: Plane,
      label: "Flights",
      color: "bg-blue-500",
      path: "/mobile-search",
    },
    {
      icon: Hotel,
      label: "Hotels",
      color: "bg-green-500",
      path: "/hotels",
    },
    {
      icon: Car,
      label: "Cars",
      color: "bg-purple-500",
      path: "/cars",
    },
    {
      icon: Camera,
      label: "Tours",
      color: "bg-orange-500",
      path: "/sightseeing",
    },
  ];

  const trendingDestinations = [
    {
      city: "Dubai",
      country: "UAE",
      price: "₹18,500",
      image: "🏙️",
      discount: "30% OFF",
    },
    {
      city: "Bangkok",
      country: "Thailand",
      price: "₹22,000",
      image: "🏛️",
      discount: "25% OFF",
    },
    {
      city: "Singapore",
      country: "Singapore",
      price: "₹19,800",
      image: "🌃",
      discount: "35% OFF",
    },
    {
      city: "London",
      country: "UK",
      price: "₹45,000",
      image: "🏰",
      discount: "20% OFF",
    },
  ];

  const recentSearches = [
    { from: "Mumbai", to: "Dubai", date: "Aug 16" },
    { from: "Delhi", to: "Bangkok", date: "Aug 20" },
    { from: "Mumbai", to: "Singapore", date: "Aug 25" },
  ];

  const handleSearch = () => {
    navigate(
      `/mobile-search?from=${from}&to=${to}&date=${departure}&passengers=${passengers}`,
    );
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-b-3xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Don't Just Book It. Bargain It!™
            </h1>
            <p className="text-blue-100">
              Use AI to negotiate better flight prices
            </p>
          </div>

          {/* Quick Search Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 space-y-4">
              {/* From/To Inputs */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <Input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500"
                    placeholder="From"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <Input
                    type="date"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="bg-white/90 border-white/30 text-gray-900 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-white" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="bg-white/90 border-white/30 rounded-md p-2 text-gray-900 text-sm flex-1"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                Search & Bargain Flights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center space-y-2 h-auto py-4 hover:bg-gray-100"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Searches
              </h2>
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Plane className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {search.from} → {search.to}
                          </div>
                          <div className="text-xs text-gray-500">
                            {search.date}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trending Destinations */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Trending Destinations
            </h2>
            <Button variant="ghost" size="sm" className="text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingDestinations.map((destination, index) => (
              <Card
                key={index}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl">
                      {destination.image}
                    </div>
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                      {destination.discount}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm">
                      {destination.city}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {destination.country}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-600">
                        {destination.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">4.8</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Features */}
        <div className="px-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Faredown Features
          </h2>
          <div className="space-y-3">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-orange-800">
                    AI Bargaining
                  </div>
                  <div className="text-sm text-orange-600">
                    Let AI negotiate better prices for you
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800">
                    Instant Deals
                  </div>
                  <div className="text-sm text-green-600">
                    Get notified of flash sales and discounts
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-green-600" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-800">
                    Global Coverage
                  </div>
                  <div className="text-sm text-blue-600">
                    Book flights to 1000+ destinations worldwide
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileHome;
