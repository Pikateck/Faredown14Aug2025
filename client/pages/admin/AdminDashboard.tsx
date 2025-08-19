/*
 * Faredown Admin CMS Dashboard
 * Complete administrative interface with role-based access
 * Comprehensive CMS system for Flights, Hotels, Bargains, Rewards, and Payments
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { adminAuthService, PERMISSIONS } from "@/services/adminAuthService";
import { currencyService } from "@/services/currencyService";
import PromoCodeManager from "./PromoCodeManager";
import UserManagement from "./UserManagement";
import MarkupManagementAir from "./MarkupManagementAir";
import MarkupManagementHotel from "./MarkupManagementHotel";
import MarkupManagementSightseeing from "./MarkupManagementSightseeing";
import VATManagement from "./VATManagement";
import CurrencyManagement from "./CurrencyManagement";
import ReportsAnalytics from "./ReportsAnalytics";
import SupplierManagement from "./SupplierManagement";
import LoyaltyManagement from "./LoyaltyManagement";
import AdminAuthHelper from "@/components/AdminAuthHelper";
import AIBargainingDashboard from "./AIBargainingDashboard";
import APITestingDashboard from "./APITestingDashboard";
import { supplierService } from "@/services/supplierService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  Hotel,
  Plane,
  Camera,
  DollarSign,
  Settings,
  Shield,
  Award,
  Ticket,
  Brain,
  Package,
  Search,
  Download,
  TestTube,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  MoreVertical,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Star,
  Activity,
  Zap,
  FileText,
  Database,
  PieChart,
  BarChart,
  LineChart,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  Globe,
  Smartphone,
  Mail,
  Bell,
  Key,
} from "lucide-react";

// Mock data for demonstration
const mockStats = {
  totalBookings: 1247,
  totalRevenue: 2847392,
  successRate: 94.2,
  rewardsIssued: 85420,
  monthlyGrowth: 12.5,
  flightBookings: 728,
  hotelBookings: 519,
  monthlyBookingData: [
    { month: "Jan", bookings: 185, revenue: 425000 },
    { month: "Feb", bookings: 220, revenue: 512000 },
    { month: "Mar", bookings: 195, revenue: 458000 },
    { month: "Apr", bookings: 168, revenue: 398000 },
    { month: "May", bookings: 201, revenue: 475000 },
    { month: "Jun", bookings: 278, revenue: 579000 },
  ],
  topDestinationsMonthly: [
    { city: "Mumbai", bookings: 245, revenue: 580000, growth: "+12%" },
    { city: "Dubai", bookings: 198, revenue: 450000, growth: "+8%" },
    { city: "Delhi", bookings: 176, revenue: 420000, growth: "+15%" },
    { city: "Singapore", bookings: 142, revenue: 385000, growth: "+6%" },
    { city: "London", bookings: 118, revenue: 295000, growth: "+10%" },
  ],
  flightCabinBookings: [
    { cabin: "Economy", bookings: 485, revenue: 1250000, percentage: 66 },
    { cabin: "Business", bookings: 198, revenue: 890000, percentage: 27 },
    { cabin: "First Class", bookings: 45, revenue: 420000, percentage: 7 },
  ],
  hotelCityBookings: [
    { city: "Mumbai", bookings: 125, revenue: 285000, avgRate: 2280 },
    { city: "Dubai", bookings: 98, revenue: 245000, avgRate: 2500 },
    { city: "Delhi", bookings: 89, revenue: 198000, avgRate: 2225 },
    { city: "Goa", bookings: 76, revenue: 165000, avgRate: 2170 },
    { city: "Bangalore", bookings: 68, revenue: 148000, avgRate: 2176 },
    { city: "Singapore", bookings: 63, revenue: 189000, avgRate: 3000 },
  ],
};

const adminModules = [
  { id: "dashboard", name: "Dashboard", icon: BarChart3, color: "bg-blue-500" },
  { id: "users", name: "User Management", icon: Users, color: "bg-green-500" },
  {
    id: "markup-air",
    name: "Markup Management (Air)",
    icon: Plane,
    color: "bg-blue-600",
  },
  {
    id: "markup-hotel",
    name: "Markup Management (Hotels)",
    icon: Hotel,
    color: "bg-green-600",
  },
  {
    id: "markup-sightseeing",
    name: "Markup Management (Sightseeing)",
    icon: Camera,
    color: "bg-purple-600",
  },
  { id: "vat", name: "VAT Management", icon: FileText, color: "bg-purple-600" },
  { id: "promos", name: "Promo Codes", icon: Ticket, color: "bg-cyan-500" },
  {
    id: "currency",
    name: "Currency Conversion",
    icon: DollarSign,
    color: "bg-yellow-600",
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    icon: TrendingUp,
    color: "bg-emerald-500",
  },
  {
    id: "bookings",
    name: "Booking Management",
    icon: BookOpen,
    color: "bg-purple-500",
  },
  {
    id: "payments",
    name: "Payments & Accounting",
    icon: CreditCard,
    color: "bg-yellow-500",
  },
  { id: "bargains", name: "Bargain Engine", icon: Brain, color: "bg-red-500" },
  {
    id: "ai-bargaining",
    name: "AI Bargaining Dashboard",
    icon: Activity,
    color: "bg-purple-500",
  },
  {
    id: "api-testing",
    name: "API Testing Dashboard",
    icon: TestTube,
    color: "bg-cyan-500",
  },
  {
    id: "suppliers",
    name: "Supplier Management",
    icon: Briefcase,
    color: "bg-indigo-500",
  },
  {
    id: "testing",
    name: "API Testing Dashboard",
    icon: TestTube,
    color: "bg-pink-500",
  },
  {
    id: "inventory",
    name: "Inventory/Extranet",
    icon: Package,
    color: "bg-orange-500",
  },
  {
    id: "rewards",
    name: "Rewards Management",
    icon: Award,
    color: "bg-pink-500",
  },
  {
    id: "vouchers",
    name: "Voucher Templates",
    icon: FileText,
    color: "bg-slate-500",
  },
  { id: "audit", name: "Audit Logs", icon: Shield, color: "bg-amber-500" },
  { id: "cms", name: "CMS & Content", icon: Globe, color: "bg-violet-500" },
  { id: "ai", name: "AI Tools", icon: Zap, color: "bg-rose-500" },
  {
    id: "settings",
    name: "System Settings",
    icon: Settings,
    color: "bg-gray-500",
  },
  {
    id: "auth-helper",
    name: "Auth Helper",
    icon: Key,
    color: "bg-blue-500",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
    loadSupplierAnalytics();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = adminAuthService.getCurrentUser();
      if (!currentUser) {
        navigate("/admin/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      navigate("/admin/login");
    }
  };

  const loadSupplierAnalytics = async () => {
    try {
      const analytics = await supplierService.getAnalytics();
      setSupplierAnalytics(analytics);
    } catch (error) {
      console.warn("Using fallback analytics data:", error);
      // The service now returns fallback data instead of throwing
      // This catch block is kept for backwards compatibility
      setSupplierAnalytics({
        totalSuppliers: 4,
        activeSuppliers: 3,
        testingSuppliers: 1,
        inactiveSuppliers: 0,
        averageSuccessRate: 94.5,
        averageResponseTime: 245,
        totalBookings: 1247,
        supplierTypes: {
          hotel: 2,
          flight: 1,
          car: 0,
          package: 1,
        },
        recentSyncs: [],
      });
    }
  };

  const handleLogout = () => {
    adminAuthService.logout();
    navigate("/admin/login");
  };

  const hasPermission = (permission) => {
    return adminAuthService.hasPermission(permission);
  };

  const filteredModules = adminModules.filter((module) =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardContent className="p-4 lg:p-6 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {mockStats.totalBookings.toLocaleString()}
                </p>
              </div>
              <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              ↗ +{mockStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4 lg:p-6 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  ₹{mockStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              ↗ +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4 lg:p-6 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {mockStats.successRate}%
                </p>
              </div>
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">↗ +2.1% improvement</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4 lg:p-6 admin-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Suppliers
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {supplierAnalytics?.activeSuppliers || 0} /{" "}
                  {supplierAnalytics?.totalSuppliers || 0}
                </p>
              </div>
              <Briefcase className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {supplierAnalytics?.testingSuppliers || 0} testing,{" "}
              {supplierAnalytics?.averageSuccessRate?.toFixed(1) || "0.0"}% avg
              success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Booking Distribution and Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Monthly Booking Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.monthlyBookingData.map((data, index) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {data.bookings} bookings
                      </div>
                      <div className="text-xs text-gray-600">
                        ₹{data.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-600 rounded"
                      style={{ width: `${(data.bookings / 300) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Top Destinations (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.topDestinationsMonthly.map((destination, index) => (
                <div
                  key={destination.city}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm ml-2">{destination.city}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {destination.bookings} bookings
                      </Badge>
                      <Badge variant="outline" className="text-green-600">
                        {destination.growth}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      ₹{destination.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Cabin Class Bookings and Hotel City-wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="w-5 h-5 mr-2" />
              Flight Bookings by Cabin Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.flightCabinBookings.map((cabin, index) => (
                <div key={cabin.cabin} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{cabin.cabin}</span>
                      <Badge variant="outline" className="ml-2">
                        {cabin.percentage}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {cabin.bookings} bookings
                      </div>
                      <div className="text-xs text-gray-600">
                        ���{cabin.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded">
                    <div
                      className={`h-3 rounded ${
                        cabin.cabin === "Economy"
                          ? "bg-blue-600"
                          : cabin.cabin === "Business"
                            ? "bg-green-600"
                            : "bg-purple-600"
                      }`}
                      style={{ width: `${cabin.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hotel className="w-5 h-5 mr-2" />
              Hotel Bookings by City
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.hotelCityBookings.map((hotel, index) => (
                <div
                  key={hotel.city}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm ml-2">{hotel.city}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {hotel.bookings} bookings
                      </Badge>
                      <Badge variant="outline" className="text-blue-600">
                        ₹{hotel.avgRate}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Revenue: ₹{hotel.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderModulePlaceholder = (moduleId) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {adminModules.find((m) => m.id === moduleId)?.icon &&
            React.createElement(
              adminModules.find((m) => m.id === moduleId).icon,
              {
                className: "w-5 h-5 mr-2",
              },
            )}
          {adminModules.find((m) => m.id === moduleId)?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {adminModules.find((m) => m.id === moduleId)?.icon &&
              React.createElement(
                adminModules.find((m) => m.id === moduleId).icon,
                {
                  className: "w-8 h-8 text-gray-400",
                },
              )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {adminModules.find((m) => m.id === moduleId)?.name}
          </h3>
          <p className="text-gray-600 mb-4">
            This module is under development and will be available soon.
          </p>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notify When Ready
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Faredown Admin
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:transition-none flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Faredown
                  </h2>
                  <p className="text-sm text-gray-600">Admin CMS</p>
                </div>
              </div>
            </div>
            {/* Back to Main Site */}
            <div className="mt-4">
              <a
                href="/"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Main Site
              </a>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-600">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search modules..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredModules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeModule === module.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <module.icon className="w-4 h-4 mr-3" />
                <span className="truncate">{module.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom section with logout */}
          <div className="mt-auto">
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {adminModules.find((m) => m.id === activeModule)?.name ||
                    "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeModule === "dashboard"
                    ? "Overview of your Faredown platform"
                    : `Manage ${adminModules.find((m) => m.id === activeModule)?.name.toLowerCase()}`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeModule === "dashboard" ? (
              renderDashboardOverview()
            ) : activeModule === "users" ? (
              <UserManagement />
            ) : activeModule === "markup-air" ? (
              <MarkupManagementAir />
            ) : activeModule === "markup-hotel" ? (
              <MarkupManagementHotel />
            ) : activeModule === "markup-sightseeing" ? (
              <MarkupManagementSightseeing />
            ) : activeModule === "vat" ? (
              <VATManagement />
            ) : activeModule === "promos" ? (
              <PromoCodeManager />
            ) : activeModule === "currency" ? (
              <CurrencyManagement />
            ) : activeModule === "reports" ? (
              <ReportsAnalytics />
            ) : activeModule === "suppliers" ? (
              <SupplierManagement />
            ) : activeModule === "rewards" ? (
              <LoyaltyManagement />
            ) : activeModule === "ai-bargaining" ? (
              <AIBargainingDashboard />
            ) : activeModule === "api-testing" ? (
              <APITestingDashboard />
            ) : activeModule === "auth-helper" ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Admin Authentication Helper
                </h2>
                <AdminAuthHelper />
              </div>
            ) : activeModule === "testing" ? (
              <div className="text-center py-8">
                <TestTube className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  API Testing Dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                  Comprehensive testing tools for live API integrations
                </p>
                <Link to="/admin/testing">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 text-lg">
                    Open Testing Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              renderModulePlaceholder(activeModule)
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
