/**
 * Comprehensive Reporting System for Admin CMS
 * Advanced reporting with filters, charts, and export capabilities
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  BarChart3,
  Download,
  Filter,
  Calendar,
  Plane,
  Hotel,
  CreditCard,
  Tag,
  Award,
  FileText,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Globe,
  Target,
  PieChart,
} from "lucide-react";
import { adminAuthService, PERMISSIONS } from "@/services/adminAuthService";

interface ReportFilter {
  dateRange: { start: string; end: string };
  supplier?: string;
  destination?: string;
  user?: string;
  status?: string;
  paymentGateway?: string;
  department?: string;
}

interface ReportData {
  flights: any[];
  hotels: any[];
  payments: any[];
  promoCodes: any[];
  loyalty: any[];
}

export default function ReportingSystem() {
  const [activeReport, setActiveReport] = useState("flights");
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });
  const [reportData, setReportData] = useState<ReportData>({
    flights: [],
    hotels: [],
    payments: [],
    promoCodes: [],
    loyalty: [],
  });
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockFlightReports = [
    {
      id: "FL001",
      date: "2024-01-15",
      supplier: "Amadeus",
      destination: "Dubai",
      user: "john.doe@email.com",
      route: "DEL-DXB",
      basePrice: 25000,
      markup: 2500,
      finalPrice: 27500,
      commission: 1250,
      status: "Confirmed",
    },
    {
      id: "FL002",
      date: "2024-01-15",
      supplier: "Sabre",
      destination: "London",
      user: "sarah.wilson@email.com",
      route: "BOM-LHR",
      basePrice: 45000,
      markup: 4500,
      finalPrice: 49500,
      commission: 2250,
      status: "Confirmed",
    },
    {
      id: "FL003",
      date: "2024-01-14",
      supplier: "Travelport",
      destination: "Singapore",
      user: "mike.johnson@email.com",
      route: "DEL-SIN",
      basePrice: 35000,
      markup: 3500,
      finalPrice: 38500,
      commission: 1750,
      status: "Cancelled",
    },
  ];

  const mockHotelReports = [
    {
      id: "HT001",
      date: "2024-01-15",
      supplier: "Booking.com",
      destination: "Dubai",
      user: "john.doe@email.com",
      hotel: "Burj Al Arab",
      checkIn: "2024-02-01",
      checkOut: "2024-02-05",
      nights: 4,
      basePrice: 80000,
      markup: 8000,
      finalPrice: 88000,
      commission: 4000,
      occupancy: "2 Adults",
      status: "Confirmed",
    },
    {
      id: "HT002",
      date: "2024-01-14",
      supplier: "Expedia",
      destination: "Goa",
      user: "sarah.wilson@email.com",
      hotel: "Taj Exotica",
      checkIn: "2024-01-20",
      checkOut: "2024-01-25",
      nights: 5,
      basePrice: 35000,
      markup: 3500,
      finalPrice: 38500,
      commission: 1750,
      occupancy: "2 Adults, 1 Child",
      status: "Confirmed",
    },
  ];

  const mockPaymentReports = [
    {
      id: "PAY001",
      date: "2024-01-15",
      gateway: "Razorpay",
      bookingId: "FL001",
      user: "john.doe@email.com",
      amount: 27500,
      fees: 550,
      netAmount: 26950,
      status: "Success",
      currency: "INR",
    },
    {
      id: "PAY002",
      date: "2024-01-15",
      gateway: "PayU",
      bookingId: "HT001",
      user: "john.doe@email.com",
      amount: 88000,
      fees: 1760,
      netAmount: 86240,
      status: "Success",
      currency: "INR",
    },
    {
      id: "PAY003",
      date: "2024-01-14",
      gateway: "Razorpay",
      bookingId: "FL003",
      user: "mike.johnson@email.com",
      amount: 38500,
      fees: 770,
      netAmount: 37730,
      status: "Refunded",
      currency: "INR",
    },
  ];

  const mockPromoReports = [
    {
      id: "PROMO001",
      code: "WELCOME20",
      type: "Percentage",
      discount: 20,
      usageCount: 45,
      totalSavings: 85000,
      revenue: 425000,
      status: "Active",
      validUntil: "2024-02-29",
    },
    {
      id: "PROMO002",
      code: "FLIGHT500",
      type: "Fixed Amount",
      discount: 500,
      usageCount: 123,
      totalSavings: 61500,
      revenue: 1235000,
      status: "Active",
      validUntil: "2024-03-15",
    },
  ];

  const mockLoyaltyReports = [
    {
      id: "LOY001",
      user: "john.doe@email.com",
      tier: "Gold",
      pointsEarned: 2750,
      pointsRedeemed: 1500,
      pointsBalance: 8250,
      totalSpent: 275000,
      lastActivity: "2024-01-15",
    },
    {
      id: "LOY002",
      user: "sarah.wilson@email.com",
      tier: "Silver",
      pointsEarned: 1250,
      pointsRedeemed: 500,
      pointsBalance: 3750,
      totalSpent: 125000,
      lastActivity: "2024-01-14",
    },
  ];

  const suppliers = [
    "All",
    "Amadeus",
    "Sabre",
    "Travelport",
    "Booking.com",
    "Expedia",
    "Agoda",
  ];
  const destinations = [
    "All",
    "Dubai",
    "London",
    "Singapore",
    "Paris",
    "New York",
    "Bangkok",
  ];
  const paymentGateways = ["All", "Razorpay", "PayU", "Paytm", "PhonePe"];

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData({
        flights: mockFlightReports,
        hotels: mockHotelReports,
        payments: mockPaymentReports,
        promoCodes: mockPromoReports,
        loyalty: mockLoyaltyReports,
      });
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: "csv" | "excel") => {
    const data = reportData[activeReport as keyof ReportData];
    const fileName = `${activeReport}_report_${filters.dateRange.start}_to_${filters.dateRange.end}.${format}`;

    if (format === "csv") {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => row[header]).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    console.log(`Exporting ${activeReport} report as ${format}`);
  };

  const renderFlightReports = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Flight Booking Reports</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Markup</TableHead>
            <TableHead>Final Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.flights.map((flight) => (
            <TableRow key={flight.id}>
              <TableCell className="font-medium">{flight.id}</TableCell>
              <TableCell>{flight.date}</TableCell>
              <TableCell>
                <Badge variant="outline">{flight.supplier}</Badge>
              </TableCell>
              <TableCell>{flight.route}</TableCell>
              <TableCell>{flight.user}</TableCell>
              <TableCell>₹{flight.basePrice.toLocaleString()}</TableCell>
              <TableCell className="text-green-600">
                +₹{flight.markup.toLocaleString()}
              </TableCell>
              <TableCell className="font-semibold">
                ₹{flight.finalPrice.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    flight.status === "Confirmed" ? "default" : "destructive"
                  }
                >
                  {flight.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderHotelReports = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hotel Booking Reports</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Nights</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Final Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.hotels.map((hotel) => (
            <TableRow key={hotel.id}>
              <TableCell className="font-medium">{hotel.id}</TableCell>
              <TableCell>{hotel.date}</TableCell>
              <TableCell>
                <Badge variant="outline">{hotel.supplier}</Badge>
              </TableCell>
              <TableCell>{hotel.hotel}</TableCell>
              <TableCell>{hotel.checkIn}</TableCell>
              <TableCell>{hotel.nights}</TableCell>
              <TableCell>{hotel.occupancy}</TableCell>
              <TableCell className="font-semibold">
                ₹{hotel.finalPrice.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    hotel.status === "Confirmed" ? "default" : "destructive"
                  }
                >
                  {hotel.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderPaymentReports = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Gateway Reports</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Booking ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Gateway Fees</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.id}</TableCell>
              <TableCell>{payment.date}</TableCell>
              <TableCell>
                <Badge variant="outline">{payment.gateway}</Badge>
              </TableCell>
              <TableCell>{payment.bookingId}</TableCell>
              <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
              <TableCell className="text-red-600">
                -₹{payment.fees.toLocaleString()}
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                ₹{payment.netAmount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.status === "Success"
                      ? "default"
                      : payment.status === "Refunded"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderPromoReports = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Promo Code Usage Reports</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Promo Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage Count</TableHead>
            <TableHead>Total Savings</TableHead>
            <TableHead>Revenue Generated</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.promoCodes.map((promo) => (
            <TableRow key={promo.id}>
              <TableCell className="font-medium">{promo.code}</TableCell>
              <TableCell>{promo.type}</TableCell>
              <TableCell>
                {promo.type === "Percentage"
                  ? `${promo.discount}%`
                  : `₹${promo.discount}`}
              </TableCell>
              <TableCell>{promo.usageCount}</TableCell>
              <TableCell className="text-red-600">
                ₹{promo.totalSavings.toLocaleString()}
              </TableCell>
              <TableCell className="text-green-600">
                ₹{promo.revenue.toLocaleString()}
              </TableCell>
              <TableCell>{promo.validUntil}</TableCell>
              <TableCell>
                <Badge
                  variant={promo.status === "Active" ? "default" : "secondary"}
                >
                  {promo.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderLoyaltyReports = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reward & Loyalty Reports</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Points Earned</TableHead>
            <TableHead>Points Redeemed</TableHead>
            <TableHead>Current Balance</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.loyalty.map((loyalty) => (
            <TableRow key={loyalty.id}>
              <TableCell className="font-medium">{loyalty.user}</TableCell>
              <TableCell>
                <Badge
                  variant={loyalty.tier === "Gold" ? "default" : "secondary"}
                >
                  {loyalty.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-green-600">
                +{loyalty.pointsEarned}
              </TableCell>
              <TableCell className="text-red-600">
                -{loyalty.pointsRedeemed}
              </TableCell>
              <TableCell className="font-semibold">
                {loyalty.pointsBalance}
              </TableCell>
              <TableCell>₹{loyalty.totalSpent.toLocaleString()}</TableCell>
              <TableCell>{loyalty.lastActivity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value,
                      },
                    })
                  }
                />
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Supplier</label>
              <Select
                value={filters.supplier}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    supplier: value === "All" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Destination
              </label>
              <Select
                value={filters.destination}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    destination: value === "All" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              <Button
                onClick={loadReportData}
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? "Loading..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="flights" className="flex items-center">
            <Plane className="w-4 h-4 mr-2" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center">
            <Hotel className="w-4 h-4 mr-2" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="promoCodes" className="flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Promos
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Loyalty
          </TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="p-6">
            <TabsContent value="flights">{renderFlightReports()}</TabsContent>
            <TabsContent value="hotels">{renderHotelReports()}</TabsContent>
            <TabsContent value="payments">{renderPaymentReports()}</TabsContent>
            <TabsContent value="promoCodes">{renderPromoReports()}</TabsContent>
            <TabsContent value="loyalty">{renderLoyaltyReports()}</TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
