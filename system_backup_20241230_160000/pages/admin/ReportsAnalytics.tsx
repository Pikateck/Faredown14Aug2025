import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Plane,
  Hotel,
  Users,
  Receipt,
  FileText,
  MapPin,
  Eye,
  RefreshCw,
  Target,
  Zap,
  Building,
  CreditCard,
  Percent,
  Hash,
} from "lucide-react";

interface BookingReport {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  serviceType: "flight" | "hotel";
  bookingDate: string;
  travelDate: string;
  amount: number;
  commission: number;
  tax: number;
  netAmount: number;
  status: "confirmed" | "cancelled" | "pending" | "refunded";
  paymentMethod: string;
  currency: string;
  origin?: string;
  destination?: string;
  hotelName?: string;
  city?: string;
}

interface TransactionLog {
  id: string;
  transactionDate: string;
  referenceNumber: string;
  transactionType: "booking" | "refund" | "cancellation" | "modification";
  amount: number;
  description: string;
  status: "success" | "failed" | "pending";
}

interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  flightBookings: number;
  hotelBookings: number;
  averageBookingValue: number;
  conversionRate: number;
  repeatCustomers: number;
  monthlyGrowth: number;
}

// Mock data
const mockBookingReports: BookingReport[] = [
  {
    id: "1",
    bookingReference: "FD001234",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    serviceType: "flight",
    bookingDate: "2024-01-20T10:30:00Z",
    travelDate: "2024-02-15T08:00:00Z",
    amount: 25890,
    commission: 1294.5,
    tax: 4660.2,
    netAmount: 19935.3,
    status: "confirmed",
    paymentMethod: "Credit Card",
    currency: "INR",
    origin: "BOM",
    destination: "DXB",
  },
  {
    id: "2",
    bookingReference: "HD002567",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    serviceType: "hotel",
    bookingDate: "2024-01-19T14:45:00Z",
    travelDate: "2024-02-10T15:00:00Z",
    amount: 18500,
    commission: 925.0,
    tax: 3330.0,
    netAmount: 14245.0,
    status: "confirmed",
    paymentMethod: "Debit Card",
    currency: "INR",
    hotelName: "Taj Hotel",
    city: "Mumbai",
  },
  {
    id: "3",
    bookingReference: "FD003891",
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@example.com",
    serviceType: "flight",
    bookingDate: "2024-01-18T09:15:00Z",
    travelDate: "2024-03-05T12:30:00Z",
    amount: 45200,
    commission: 2260.0,
    tax: 8136.0,
    netAmount: 34804.0,
    status: "confirmed",
    paymentMethod: "Credit Card",
    currency: "INR",
    origin: "DEL",
    destination: "LHR",
  },
];

const mockTransactionLogs: TransactionLog[] = [
  {
    id: "1",
    transactionDate: "2024-01-20T10:30:00Z",
    referenceNumber: "TXN-001234",
    transactionType: "booking",
    amount: 25890,
    description: "Flight booking - Mumbai to Dubai",
    status: "success",
  },
  {
    id: "2",
    transactionDate: "2024-01-19T14:45:00Z",
    referenceNumber: "TXN-002567",
    transactionType: "booking",
    amount: 18500,
    description: "Hotel booking - Taj Hotel Mumbai",
    status: "success",
  },
  {
    id: "3",
    transactionDate: "2024-01-18T16:20:00Z",
    referenceNumber: "TXN-003891",
    transactionType: "refund",
    amount: -5200,
    description: "Refund processed for cancelled booking",
    status: "success",
  },
];

const mockAnalytics: Analytics = {
  totalBookings: 1247,
  totalRevenue: 2847392,
  totalCommission: 142369.6,
  flightBookings: 728,
  hotelBookings: 519,
  averageBookingValue: 22845,
  conversionRate: 3.2,
  repeatCustomers: 156,
  monthlyGrowth: 12.5,
};

// Chart data for analytics
const monthlySearchHits = [
  { month: "Jan", hits: 850 },
  { month: "Feb", hits: 920 },
  { month: "Mar", hits: 1100 },
  { month: "Apr", hits: 980 },
  { month: "May", hits: 1250 },
  { month: "Jun", hits: 1180 },
  { month: "Jul", hits: 1350 },
  { month: "Aug", hits: 1200 },
  { month: "Sep", hits: 1400 },
  { month: "Oct", hits: 1320 },
  { month: "Nov", hits: 1450 },
  { month: "Dec", hits: 1380 },
];

const topFlightDestinations = [
  { destination: "Dubai", bookings: 450 },
  { destination: "Singapore", bookings: 380 },
  { destination: "London", bookings: 320 },
  { destination: "Bangkok", bookings: 280 },
  { destination: "New York", bookings: 250 },
  { destination: "Paris", bookings: 220 },
];

const topHotelDestinations = [
  { destination: "Mumbai", bookings: 280 },
  { destination: "Delhi", bookings: 240 },
  { destination: "Goa", bookings: 180 },
  { destination: "Bangalore", bookings: 160 },
  { destination: "Dubai", bookings: 140 },
  { destination: "Singapore", bookings: 120 },
];

export default function ReportsAnalytics() {
  const [bookingReports, setBookingReports] =
    useState<BookingReport[]>(mockBookingReports);
  const [transactionLogs, setTransactionLogs] =
    useState<TransactionLog[]>(mockTransactionLogs);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("audit");
  const [isLoading, setIsLoading] = useState(false);

  // Filter booking reports
  const filteredBookingReports = bookingReports.filter((report) => {
    const matchesSearch =
      report.bookingReference
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServiceType =
      selectedServiceType === "all" ||
      report.serviceType === selectedServiceType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;

    return matchesSearch && matchesServiceType && matchesStatus;
  });

  // Filter transaction logs
  const filteredTransactionLogs = transactionLogs.filter((log) => {
    const matchesSearch =
      log.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportData = (type: string) => {
    // Export functionality
    console.log(`Exporting ${type} data...`);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      cancelled: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      refunded: { color: "bg-blue-100 text-blue-800", icon: RefreshCw },
      success: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = statusConfig[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const AnalyticsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: number;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend >= 0 ? "+" : ""}
                {trend}% from last month
              </p>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({
    data,
    title,
    type = "bar",
  }: {
    data: any[];
    title: string;
    type?: "bar" | "line";
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "bar" ? (
            <BarChart3 className="w-5 h-5" />
          ) : (
            <LineChart className="w-5 h-5" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const maxValue = Math.max(...data.map((d) => d.bookings || d.hits));
            const percentage = ((item.bookings || item.hits) / maxValue) * 100;

            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium w-20">
                  {item.month || item.destination}
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {item.bookings || item.hits}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            B2C Audit Report
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Transaction Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Business Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {/* B2C Audit Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  B2C Audit Report
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData("audit")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Advanced Search Panel */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-4">
                  Make your search easy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" size="sm">
                    Today Searches
                  </Button>
                  <Button variant="outline" size="sm">
                    Last Five Search
                  </Button>
                  <Button variant="outline" size="sm">
                    One Week Search
                  </Button>
                  <Button variant="outline" size="sm">
                    One Month Search
                  </Button>
                </div>
                <Button className="mt-4" size="sm">
                  Clear Filter
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by booking reference, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={selectedServiceType}
                  onValueChange={setSelectedServiceType}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audit Report Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Booking Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Travel Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookingReports.map((report, index) => (
                      <TableRow key={report.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {report.bookingReference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.customerName}</p>
                            <p className="text-sm text-gray-600">
                              {report.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {report.serviceType === "flight" ? (
                              <Plane className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Hotel className="w-4 h-4 text-green-600" />
                            )}
                            <span className="capitalize">
                              {report.serviceType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {report.serviceType === "flight" ? (
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {report.origin} → {report.destination}
                              </div>
                            ) : (
                              <div className="flex items-center text-sm">
                                <Building className="w-3 h-3 mr-1" />
                                {report.hotelName}, {report.city}
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(report.travelDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              ₹{report.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              Tax: ₹{report.tax.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ₹{report.commission.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={report.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Voucher
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Transaction Logs
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData("transactions")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Panel */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Transaction Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="booking">Booking</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="cancellation">
                          Cancellation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reference Number</Label>
                    <Input placeholder="Enter reference number" />
                  </div>
                  <div>
                    <Label>From Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Button size="sm">Search</Button>
                    <Button variant="outline" size="sm">
                      Reset
                    </Button>
                    <Button variant="outline" size="sm">
                      Clear Filter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transaction Logs Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Reference Number</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactionLogs.map((log, index) => (
                      <TableRow key={log.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(log.transactionDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.referenceNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              log.amount < 0 ? "text-red-600" : "text-green-600"
                            }
                          >
                            ₹{Math.abs(log.amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={log.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard
              title="Total Bookings"
              value={analytics.totalBookings.toLocaleString()}
              icon={Receipt}
              trend={analytics.monthlyGrowth}
              color="text-blue-600"
            />
            <AnalyticsCard
              title="Total Revenue"
              value={`₹${analytics.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={15.3}
              color="text-green-600"
            />
            <AnalyticsCard
              title="Commission Earned"
              value={`₹${analytics.totalCommission.toLocaleString()}`}
              icon={Target}
              trend={8.7}
              color="text-purple-600"
            />
            <AnalyticsCard
              title="Conversion Rate"
              value={`${analytics.conversionRate}%`}
              icon={TrendingUp}
              trend={2.1}
              color="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Service Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-600" />
                      <span>Flights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {analytics.flightBookings}
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div className="w-3/5 h-2 bg-blue-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-green-600" />
                      <span>Hotels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {analytics.hotelBookings}
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div className="w-2/5 h-2 bg-green-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SimpleChart
              data={monthlySearchHits}
              title="Monthly Search Hits (2023-2024)"
              type="line"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart
              data={topFlightDestinations}
              title="Top Flight Destinations"
            />
            <SimpleChart
              data={topHotelDestinations}
              title="Top Hotel Destinations"
            />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Business Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>New Customers</span>
                    <span className="font-medium">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repeat Customers</span>
                    <span className="font-medium">
                      {analytics.repeatCustomers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Booking Value</span>
                    <span className="font-medium">
                      ₹{analytics.averageBookingValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Retention</span>
                    <span className="font-medium text-green-600">74.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Credit Card</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Debit Card</span>
                    <span className="font-medium">24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Banking</span>
                    <span className="font-medium">6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPI</span>
                    <span className="font-medium">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Revenue Growth</span>
                    <span className="font-medium text-green-600">+15.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking Growth</span>
                    <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Growth</span>
                    <span className="font-medium text-green-600">+18.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Share</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">2.3s</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    99.8%
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    4.8/5
                  </div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
