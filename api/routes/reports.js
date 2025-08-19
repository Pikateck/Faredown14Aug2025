const express = require("express");
const router = express.Router();

// Mock database for reports
let bookingReports = [
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
];

let transactionLogs = [
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
];

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // In production, verify JWT token properly
  req.user = { id: "1", role: "admin" }; // Mock user
  next();
};

// GET /api/reports/bookings - Get booking reports
router.get("/bookings", authenticateToken, (req, res) => {
  try {
    const {
      search,
      serviceType,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    let filteredReports = [...bookingReports];

    // Apply filters
    if (search) {
      filteredReports = filteredReports.filter(
        (report) =>
          report.bookingReference
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          report.customerName.toLowerCase().includes(search.toLowerCase()) ||
          report.customerEmail.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (serviceType && serviceType !== "all") {
      filteredReports = filteredReports.filter(
        (report) => report.serviceType === serviceType,
      );
    }

    if (status && status !== "all") {
      filteredReports = filteredReports.filter(
        (report) => report.status === status,
      );
    }

    if (dateFrom) {
      filteredReports = filteredReports.filter(
        (report) => new Date(report.bookingDate) >= new Date(dateFrom),
      );
    }

    if (dateTo) {
      filteredReports = filteredReports.filter(
        (report) => new Date(report.bookingDate) <= new Date(dateTo),
      );
    }

    // Sort by booking date (most recent first)
    filteredReports.sort(
      (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    res.json({
      reports: paginatedReports,
      total: filteredReports.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredReports.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking reports" });
  }
});

// GET /api/reports/transactions - Get transaction logs
router.get("/transactions", authenticateToken, (req, res) => {
  try {
    const {
      search,
      transactionType,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    let filteredTransactions = [...transactionLogs];

    // Apply filters
    if (search) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          transaction.referenceNumber
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.description.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (transactionType && transactionType !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.transactionType === transactionType,
      );
    }

    if (status && status !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.status === status,
      );
    }

    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          new Date(transaction.transactionDate) >= new Date(dateFrom),
      );
    }

    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          new Date(transaction.transactionDate) <= new Date(dateTo),
      );
    }

    // Sort by transaction date (most recent first)
    filteredTransactions.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      endIndex,
    );

    res.json({
      transactions: paginatedTransactions,
      total: filteredTransactions.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredTransactions.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transaction logs" });
  }
});

// GET /api/reports/analytics - Get analytics data
router.get("/analytics", authenticateToken, (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculate analytics based on booking reports
    const totalBookings = bookingReports.length;
    const totalRevenue = bookingReports.reduce(
      (sum, report) => sum + report.amount,
      0,
    );
    const totalCommission = bookingReports.reduce(
      (sum, report) => sum + report.commission,
      0,
    );
    const flightBookings = bookingReports.filter(
      (r) => r.serviceType === "flight",
    ).length;
    const hotelBookings = bookingReports.filter(
      (r) => r.serviceType === "hotel",
    ).length;
    const averageBookingValue = totalRevenue / totalBookings;

    // Mock additional metrics
    const conversionRate = 3.2;
    const repeatCustomers = 156;
    const monthlyGrowth = 12.5;

    // Generate monthly search hits data
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

    // Generate top destinations data
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

    res.json({
      summary: {
        totalBookings,
        totalRevenue,
        totalCommission,
        flightBookings,
        hotelBookings,
        averageBookingValue,
        conversionRate,
        repeatCustomers,
        monthlyGrowth,
      },
      charts: {
        monthlySearchHits,
        topFlightDestinations,
        topHotelDestinations,
      },
      period,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// GET /api/reports/insights - Get business insights
router.get("/insights", authenticateToken, (req, res) => {
  try {
    // Calculate payment method distribution
    const paymentMethods = bookingReports.reduce((acc, report) => {
      acc[report.paymentMethod] = (acc[report.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const totalPayments = Object.values(paymentMethods).reduce(
      (sum, count) => sum + count,
      0,
    );
    const paymentMethodPercentages = Object.entries(paymentMethods).map(
      ([method, count]) => ({
        method,
        count,
        percentage: ((count / totalPayments) * 100).toFixed(1),
      }),
    );

    // Calculate customer insights
    const uniqueCustomers = new Set(bookingReports.map((r) => r.customerEmail))
      .size;
    const customerRetention = 74.2; // Mock data
    const newCustomers = 892; // Mock data

    // Calculate growth metrics
    const revenueGrowth = 15.3;
    const bookingGrowth = 12.5;
    const customerGrowth = 18.7;
    const marketShare = 4.2;

    // Performance metrics
    const successRate = 94.2;
    const avgResponseTime = 2.3;
    const uptime = 99.8;
    const customerRating = 4.8;

    res.json({
      customerInsights: {
        totalCustomers: uniqueCustomers,
        newCustomers,
        repeatCustomers: bookingReports.length - uniqueCustomers,
        averageBookingValue:
          bookingReports.reduce((sum, r) => sum + r.amount, 0) /
          bookingReports.length,
        customerRetention,
      },
      paymentMethods: paymentMethodPercentages,
      growthMetrics: {
        revenueGrowth,
        bookingGrowth,
        customerGrowth,
        marketShare,
      },
      performance: {
        successRate,
        avgResponseTime,
        uptime,
        customerRating,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch business insights" });
  }
});

// GET /api/reports/export/:type - Export reports
router.get("/export/:type", authenticateToken, (req, res) => {
  try {
    const { type } = req.params;
    const { format = "json", dateFrom, dateTo } = req.query;

    let data = [];
    let filename = "";

    switch (type) {
      case "bookings":
        data = bookingReports;
        filename = `booking_reports_${new Date().toISOString().split("T")[0]}`;
        break;
      case "transactions":
        data = transactionLogs;
        filename = `transaction_logs_${new Date().toISOString().split("T")[0]}`;
        break;
      default:
        return res.status(400).json({ error: "Invalid export type" });
    }

    // Apply date filters if provided
    if (dateFrom || dateTo) {
      data = data.filter((item) => {
        const itemDate = new Date(item.bookingDate || item.transactionDate);
        if (dateFrom && itemDate < new Date(dateFrom)) return false;
        if (dateTo && itemDate > new Date(dateTo)) return false;
        return true;
      });
    }

    if (format === "csv") {
      // Convert to CSV format
      if (data.length === 0) {
        return res.status(404).json({ error: "No data to export" });
      }

      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value,
          )
          .join(","),
      );

      const csv = [headers, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`,
      );
      res.send(csv);
    } else {
      // JSON format
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.json"`,
      );
      res.json({
        exportType: type,
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        data,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to export data" });
  }
});

// GET /api/reports/dashboard - Get dashboard summary
router.get("/dashboard", authenticateToken, (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter recent bookings (last 30 days)
    const recentBookings = bookingReports.filter(
      (report) => new Date(report.bookingDate) >= thirtyDaysAgo,
    );

    const totalBookings = recentBookings.length;
    const totalRevenue = recentBookings.reduce(
      (sum, report) => sum + report.amount,
      0,
    );
    const totalCommission = recentBookings.reduce(
      (sum, report) => sum + report.commission,
      0,
    );
    const successRate =
      (recentBookings.filter((r) => r.status === "confirmed").length /
        totalBookings) *
      100;

    // Calculate trends (mock data for demonstration)
    const bookingTrend = 12.5;
    const revenueTrend = 15.3;
    const commissionTrend = 8.7;

    // Recent activity
    const recentActivity = [
      ...recentBookings.slice(0, 5).map((booking) => ({
        type: "booking",
        description: `${booking.serviceType} booking by ${booking.customerName}`,
        amount: booking.amount,
        date: booking.bookingDate,
      })),
      ...transactionLogs.slice(0, 3).map((transaction) => ({
        type: "transaction",
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.transactionDate,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      summary: {
        totalBookings,
        totalRevenue,
        totalCommission,
        successRate: parseFloat(successRate.toFixed(1)),
      },
      trends: {
        bookingTrend,
        revenueTrend,
        commissionTrend,
      },
      recentActivity,
      period: "30 days",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// POST /api/reports/custom - Generate custom report
router.post("/custom", authenticateToken, (req, res) => {
  try {
    const {
      reportType,
      dateFrom,
      dateTo,
      serviceType,
      status,
      groupBy,
      metrics,
    } = req.body;

    let data = reportType === "transactions" ? transactionLogs : bookingReports;

    // Apply filters
    if (dateFrom || dateTo) {
      data = data.filter((item) => {
        const itemDate = new Date(item.bookingDate || item.transactionDate);
        if (dateFrom && itemDate < new Date(dateFrom)) return false;
        if (dateTo && itemDate > new Date(dateTo)) return false;
        return true;
      });
    }

    if (serviceType && serviceType !== "all") {
      data = data.filter((item) => item.serviceType === serviceType);
    }

    if (status && status !== "all") {
      data = data.filter((item) => item.status === status);
    }

    // Group data if requested
    let groupedData = data;
    if (groupBy) {
      groupedData = data.reduce((acc, item) => {
        const key = item[groupBy] || "Unknown";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});
    }

    // Calculate metrics
    const calculatedMetrics = {};
    if (metrics && metrics.length > 0) {
      metrics.forEach((metric) => {
        switch (metric) {
          case "total_amount":
            calculatedMetrics.totalAmount = data.reduce(
              (sum, item) => sum + (item.amount || 0),
              0,
            );
            break;
          case "average_amount":
            calculatedMetrics.averageAmount =
              data.length > 0
                ? data.reduce((sum, item) => sum + (item.amount || 0), 0) /
                  data.length
                : 0;
            break;
          case "count":
            calculatedMetrics.count = data.length;
            break;
          case "commission":
            calculatedMetrics.totalCommission = data.reduce(
              (sum, item) => sum + (item.commission || 0),
              0,
            );
            break;
        }
      });
    }

    res.json({
      reportType,
      filters: { dateFrom, dateTo, serviceType, status },
      groupBy,
      metrics: calculatedMetrics,
      data: groupedData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate custom report" });
  }
});

module.exports = router;
