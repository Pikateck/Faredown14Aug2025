/**
 * Payment and Accounting Dashboard
 * Complete financial overview with INR focus
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Banknote,
  Wallet,
  Building,
  Users,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  Receipt,
  CreditCard as CardIcon,
  Percent,
  Calculator,
  Target,
  Activity,
} from "lucide-react";
import { currencyService } from "@/services/currencyService";

export default function PaymentDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 2456789,
    grossRevenue: 2856789,
    netRevenue: 2456789,
    totalTransactions: 8942,
    successfulPayments: 8854,
    failedPayments: 88,
    averageTransactionValue: 2748,
    conversionRate: 98.9,
  });

  // Mock payment data
  const recentTransactions = [
    {
      id: "TXN-2024-001",
      bookingRef: "BKG-2024-3421",
      user: "John Doe",
      amount: 45000,
      currency: "INR",
      method: "Credit Card",
      gateway: "Razorpay",
      status: "success",
      timestamp: "2024-12-01 14:30:25",
      fees: 900,
      netAmount: 44100,
      cardLast4: "4532",
      cardBrand: "Visa",
      country: "India",
      device: "Mobile",
    },
    {
      id: "TXN-2024-002",
      bookingRef: "BKG-2024-3422",
      user: "Sarah Wilson",
      amount: 89000,
      currency: "INR",
      method: "UPI",
      gateway: "Razorpay",
      status: "success",
      timestamp: "2024-12-01 14:28:15",
      fees: 0,
      netAmount: 89000,
      upiId: "sarah@paytm",
      country: "India",
      device: "Mobile",
    },
    {
      id: "TXN-2024-003",
      bookingRef: "BKG-2024-3423",
      user: "Mike Johnson",
      amount: 75000,
      currency: "INR",
      method: "Debit Card",
      gateway: "Razorpay",
      status: "failed",
      timestamp: "2024-12-01 14:25:42",
      fees: 0,
      netAmount: 0,
      failureReason: "Insufficient funds",
      cardLast4: "8765",
      cardBrand: "MasterCard",
      country: "India",
      device: "Desktop",
    },
  ];

  const paymentMethods = [
    {
      method: "Credit Card",
      count: 4234,
      amount: 1245670,
      percentage: 51.2,
      fees: 24913,
      avgTicket: 2945,
    },
    {
      method: "UPI",
      count: 3421,
      amount: 856430,
      percentage: 35.2,
      fees: 0,
      avgTicket: 2504,
    },
    {
      method: "Debit Card",
      count: 987,
      amount: 234560,
      percentage: 9.6,
      fees: 4691,
      avgTicket: 2377,
    },
    {
      method: "Net Banking",
      count: 345,
      amount: 98670,
      percentage: 4.0,
      fees: 1973,
      avgTicket: 2860,
    },
  ];

  const settlementData = [
    {
      date: "2024-12-01",
      grossAmount: 456789,
      fees: 9136,
      netAmount: 447653,
      transactions: 234,
      status: "settled",
      settlementId: "STL-2024-001",
    },
    {
      date: "2024-11-30",
      grossAmount: 398765,
      fees: 7975,
      netAmount: 390790,
      transactions: 189,
      status: "pending",
      settlementId: "STL-2024-002",
    },
    {
      date: "2024-11-29",
      grossAmount: 512340,
      fees: 10247,
      netAmount: 502093,
      transactions: 267,
      status: "settled",
      settlementId: "STL-2024-003",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "settled":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Building className="w-3 h-3 mr-1" />
            Settled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatINR = (amount: number) => {
    return currencyService.formatCurrency(amount, "INR");
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setPaymentStats((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 10000),
        totalTransactions:
          prev.totalTransactions + Math.floor(Math.random() * 3),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment & Accounting Dashboard
          </h1>
          <p className="text-gray-600">
            Complete financial overview with real-time payment tracking
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue (INR)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatINR(paymentStats.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +15.2% vs yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {paymentStats.totalTransactions.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-blue-600">
                {paymentStats.successfulPayments} successful
              </span>
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
                <p className="text-2xl font-bold text-purple-600">
                  {paymentStats.conversionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Excellent rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Ticket</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatINR(paymentStats.averageTransactionValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-sm text-orange-600">
                +8.1% vs last week
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Transactions</span>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-10 w-64"
                    />
                  </div>
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
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-sm">
                          {txn.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.user}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              {txn.device === "Mobile" ? (
                                <Smartphone className="w-3 h-3 mr-1" />
                              ) : (
                                <Monitor className="w-3 h-3 mr-1" />
                              )}
                              {txn.country}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {formatINR(txn.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {txn.currency}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.method}</p>
                            {txn.cardLast4 && (
                              <p className="text-xs text-gray-500">
                                •••• {txn.cardLast4} {txn.cardBrand}
                              </p>
                            )}
                            {txn.upiId && (
                              <p className="text-xs text-gray-500">
                                {txn.upiId}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{txn.gateway}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {txn.fees > 0 ? formatINR(txn.fees) : "Free"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-green-600">
                            {formatINR(txn.netAmount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{txn.timestamp}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
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

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.method}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{method.method}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {method.percentage}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volume</span>
                      <span className="font-semibold">
                        {formatINR(method.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Transactions
                      </span>
                      <span className="font-semibold">
                        {method.count.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Ticket</span>
                      <span className="font-semibold">
                        {formatINR(method.avgTicket)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fees</span>
                      <span className="font-semibold text-red-600">
                        {method.fees > 0 ? formatINR(method.fees) : "Free"}
                      </span>
                    </div>

                    <Progress value={method.percentage} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settlements Tab */}
        <TabsContent value="settlements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settlement History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Settlement ID</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementData.map((settlement) => (
                      <TableRow key={settlement.settlementId}>
                        <TableCell>{settlement.date}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {settlement.settlementId}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatINR(settlement.grossAmount)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatINR(settlement.fees)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatINR(settlement.netAmount)}
                        </TableCell>
                        <TableCell>{settlement.transactions}</TableCell>
                        <TableCell>
                          {getStatusBadge(settlement.status)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-2" />
                  <p>Revenue trend chart placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="w-12 h-12 mb-2" />
                  <p>Payment method pie chart placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₹2.8M</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">98.9%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">₹45.2K</p>
                  <p className="text-sm text-gray-600">Total Fees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">2.1%</p>
                  <p className="text-sm text-gray-600">Fee Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reconciliation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All reconciled</h3>
                <p className="text-gray-600 mb-4">
                  All transactions for today have been successfully reconciled
                </p>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Reconciliation Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
