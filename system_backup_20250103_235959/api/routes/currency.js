const express = require("express");
const router = express.Router();
const axios = require("axios");

// Mock database
let currencies = [
  {
    id: "1",
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    country: "India",
    exchangeRate: 1.0,
    baseRate: 1.0,
    markup: 0,
    status: "active",
    isDefault: true,
    lastUpdated: new Date().toISOString(),
    source: "Base Currency",
    precision: 2,
    minAmount: 1,
    maxAmount: 1000000,
    trend: "stable",
    change24h: 0,
  },
  {
    id: "2",
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    country: "United States",
    exchangeRate: 83.25,
    baseRate: 83.12,
    markup: 0.13,
    status: "active",
    isDefault: false,
    lastUpdated: new Date().toISOString(),
    source: "Exchange Rate API",
    precision: 2,
    minAmount: 1,
    maxAmount: 50000,
    trend: "up",
    change24h: 0.15,
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

// GET /api/currency - Get all currencies
router.get("/", (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let filteredCurrencies = [...currencies];

    // Apply filters
    if (search) {
      filteredCurrencies = filteredCurrencies.filter(
        (currency) =>
          currency.code.toLowerCase().includes(search.toLowerCase()) ||
          currency.name.toLowerCase().includes(search.toLowerCase()) ||
          currency.country.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status && status !== "all") {
      filteredCurrencies = filteredCurrencies.filter(
        (currency) => currency.status === status,
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCurrencies = filteredCurrencies.slice(startIndex, endIndex);

    res.json({
      currencies: paginatedCurrencies,
      total: filteredCurrencies.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredCurrencies.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});

// GET /api/currency/active - Get only active currencies
router.get("/active", (req, res) => {
  try {
    const activeCurrencies = currencies.filter(
      (currency) => currency.status === "active",
    );
    res.json(activeCurrencies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active currencies" });
  }
});

// GET /api/currency/rates - Get exchange rates for all currencies
router.get("/rates", (req, res) => {
  try {
    const activeCurrencies = currencies.filter(
      (currency) => currency.status === "active",
    );

    // Return rates data in format expected by CurrencyContext
    const ratesData = activeCurrencies.map((currency) => ({
      to: currency.code,
      rate: currency.exchangeRate,
      name: currency.name,
      symbol: currency.symbol,
      lastUpdated: currency.lastUpdated,
    }));

    res.json({
      success: true,
      data: ratesData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch exchange rates",
    });
  }
});

// GET /api/currency/:id - Get currency by ID
router.get("/:id", (req, res) => {
  try {
    const currency = currencies.find((c) => c.id === req.params.id);
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }

    res.json(currency);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currency" });
  }
});

// POST /api/currency - Create new currency
router.post("/", authenticateToken, (req, res) => {
  try {
    const {
      code,
      name,
      symbol,
      country,
      exchangeRate,
      baseRate,
      markup,
      status,
      isDefault,
      precision,
      minAmount,
      maxAmount,
      source,
    } = req.body;

    // Validate required fields
    if (!code || !name || !symbol || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if currency code already exists
    if (currencies.find((c) => c.code === code)) {
      return res.status(400).json({ error: "Currency code already exists" });
    }

    // If setting as default, remove default flag from other currencies
    if (isDefault) {
      currencies = currencies.map((currency) => ({
        ...currency,
        isDefault: false,
      }));
    }

    const newCurrency = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      name,
      symbol,
      country,
      exchangeRate: exchangeRate || 1,
      baseRate: baseRate || 1,
      markup: markup || 0,
      status: status || "active",
      isDefault: isDefault || false,
      lastUpdated: new Date().toISOString(),
      source: source || "Manual",
      precision: precision || 2,
      minAmount: minAmount || 1,
      maxAmount: maxAmount || 100000,
      trend: "stable",
      change24h: 0,
    };

    currencies.push(newCurrency);
    res.status(201).json(newCurrency);
  } catch (error) {
    res.status(500).json({ error: "Failed to create currency" });
  }
});

// PUT /api/currency/:id - Update currency
router.put("/:id", authenticateToken, (req, res) => {
  try {
    const currencyIndex = currencies.findIndex((c) => c.id === req.params.id);
    if (currencyIndex === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }

    const { isDefault, code } = req.body;

    // Check if currency code already exists (excluding current currency)
    if (
      code &&
      currencies.find((c) => c.code === code && c.id !== req.params.id)
    ) {
      return res.status(400).json({ error: "Currency code already exists" });
    }

    // If setting as default, remove default flag from other currencies
    if (isDefault) {
      currencies = currencies.map((currency, index) => {
        if (index !== currencyIndex) {
          return { ...currency, isDefault: false };
        }
        return currency;
      });
    }

    const updatedCurrency = {
      ...currencies[currencyIndex],
      ...req.body,
      lastUpdated: new Date().toISOString(),
    };

    // Recalculate exchange rate if base rate or markup changed
    if (req.body.baseRate !== undefined || req.body.markup !== undefined) {
      const baseRate =
        req.body.baseRate !== undefined
          ? req.body.baseRate
          : updatedCurrency.baseRate;
      const markup =
        req.body.markup !== undefined
          ? req.body.markup
          : updatedCurrency.markup;
      updatedCurrency.exchangeRate = baseRate + markup;
    }

    currencies[currencyIndex] = updatedCurrency;
    res.json(updatedCurrency);
  } catch (error) {
    res.status(500).json({ error: "Failed to update currency" });
  }
});

// DELETE /api/currency/:id - Delete currency
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const currencyIndex = currencies.findIndex((c) => c.id === req.params.id);
    if (currencyIndex === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }

    // Prevent deletion of default currency
    if (currencies[currencyIndex].isDefault) {
      return res.status(400).json({ error: "Cannot delete default currency" });
    }

    currencies.splice(currencyIndex, 1);
    res.json({ message: "Currency deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete currency" });
  }
});

// POST /api/currency/:id/toggle-status - Toggle currency status
router.post("/:id/toggle-status", authenticateToken, (req, res) => {
  try {
    const currencyIndex = currencies.findIndex((c) => c.id === req.params.id);
    if (currencyIndex === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }

    // Prevent deactivating default currency
    if (
      currencies[currencyIndex].isDefault &&
      currencies[currencyIndex].status === "active"
    ) {
      return res
        .status(400)
        .json({ error: "Cannot deactivate default currency" });
    }

    currencies[currencyIndex].status =
      currencies[currencyIndex].status === "active" ? "inactive" : "active";
    currencies[currencyIndex].lastUpdated = new Date().toISOString();

    res.json(currencies[currencyIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle currency status" });
  }
});

// POST /api/currency/:id/set-default - Set currency as default
router.post("/:id/set-default", authenticateToken, (req, res) => {
  try {
    const currencyIndex = currencies.findIndex((c) => c.id === req.params.id);
    if (currencyIndex === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }

    // Remove default flag from all currencies
    currencies = currencies.map((currency, index) => ({
      ...currency,
      isDefault: index === currencyIndex,
    }));

    res.json(currencies[currencyIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to set default currency" });
  }
});

// POST /api/currency/update-rates - Update exchange rates from external API
router.post("/update-rates", authenticateToken, async (req, res) => {
  try {
    // Using a free exchange rate API
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/INR",
      {
        timeout: 10000,
      },
    );

    const { rates } = response.data;
    let updatedCount = 0;

    currencies = currencies.map((currency) => {
      if (currency.code === "INR") return currency; // Skip base currency

      if (rates[currency.code]) {
        const newBaseRate = 1 / rates[currency.code];
        const previousRate = currency.exchangeRate;
        const newExchangeRate = newBaseRate + currency.markup;

        // Calculate 24h change
        const change24h =
          previousRate > 0
            ? ((newExchangeRate - previousRate) / previousRate) * 100
            : 0;
        const trend =
          change24h > 0.1 ? "up" : change24h < -0.1 ? "down" : "stable";

        updatedCount++;
        return {
          ...currency,
          baseRate: newBaseRate,
          exchangeRate: newExchangeRate,
          lastUpdated: new Date().toISOString(),
          source: "Exchange Rate API",
          change24h: parseFloat(change24h.toFixed(2)),
          trend,
        };
      }
      return currency;
    });

    res.json({
      message: `Successfully updated ${updatedCount} exchange rates`,
      updatedAt: new Date().toISOString(),
      source: "Exchange Rate API",
    });
  } catch (error) {
    console.error("Failed to update exchange rates:", error.message);

    // Fallback: simulate rate updates
    currencies = currencies.map((currency) => {
      if (currency.code === "INR") return currency;

      return {
        ...currency,
        lastUpdated: new Date().toISOString(),
        source: "Manual Update (API Failed)",
      };
    });

    res.json({
      message: "Exchange rate API unavailable, rates updated manually",
      updatedAt: new Date().toISOString(),
      source: "Manual Update",
      warning: "External API not available",
    });
  }
});

// POST /api/currency/convert - Convert currency
router.post("/convert", (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const fromCurr = currencies.find(
      (c) => c.code === fromCurrency && c.status === "active",
    );
    const toCurr = currencies.find(
      (c) => c.code === toCurrency && c.status === "active",
    );

    if (!fromCurr || !toCurr) {
      return res
        .status(400)
        .json({ error: "Invalid currency codes or currencies not active" });
    }

    // Convert to base currency (INR) first, then to target currency
    let convertedAmount;
    if (fromCurrency === "INR") {
      convertedAmount = amount / toCurr.exchangeRate;
    } else if (toCurrency === "INR") {
      convertedAmount = amount * fromCurr.exchangeRate;
    } else {
      // Convert from source to INR, then INR to target
      const inrAmount = amount * fromCurr.exchangeRate;
      convertedAmount = inrAmount / toCurr.exchangeRate;
    }

    // Round to appropriate precision
    convertedAmount = parseFloat(convertedAmount.toFixed(toCurr.precision));

    res.json({
      originalAmount: amount,
      convertedAmount,
      fromCurrency: {
        code: fromCurr.code,
        name: fromCurr.name,
        symbol: fromCurr.symbol,
        rate: fromCurr.exchangeRate,
      },
      toCurrency: {
        code: toCurr.code,
        name: toCurr.name,
        symbol: toCurr.symbol,
        rate: toCurr.exchangeRate,
      },
      exchangeRate:
        fromCurrency === "INR"
          ? 1 / toCurr.exchangeRate
          : toCurrency === "INR"
            ? fromCurr.exchangeRate
            : fromCurr.exchangeRate / toCurr.exchangeRate,
      convertedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to convert currency" });
  }
});

// GET /api/currency/stats - Get currency statistics
router.get("/stats/overview", authenticateToken, (req, res) => {
  try {
    const totalCurrencies = currencies.length;
    const activeCurrencies = currencies.filter(
      (c) => c.status === "active",
    ).length;
    const defaultCurrency = currencies.find((c) => c.isDefault);

    const lastUpdateTimes = currencies.map((c) =>
      new Date(c.lastUpdated).getTime(),
    );
    const latestUpdate = new Date(Math.max(...lastUpdateTimes)).toISOString();

    const trendsDistribution = currencies.reduce((acc, currency) => {
      acc[currency.trend] = (acc[currency.trend] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalCurrencies,
      activeCurrencies,
      inactiveCurrencies: totalCurrencies - activeCurrencies,
      defaultCurrency: defaultCurrency
        ? {
            code: defaultCurrency.code,
            name: defaultCurrency.name,
            symbol: defaultCurrency.symbol,
          }
        : null,
      latestUpdate,
      trendsDistribution,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currency statistics" });
  }
});

// GET /api/currency/rates/history/:code - Get rate history for currency (mock data)
router.get("/rates/history/:code", authenticateToken, (req, res) => {
  try {
    const { code } = req.params;
    const { days = 7 } = req.query;

    const currency = currencies.find((c) => c.code === code);
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }

    // Generate mock historical data
    const history = [];
    const currentRate = currency.exchangeRate;

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate slight variations around current rate
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const rate = currentRate * (1 + variation);

      history.push({
        date: date.toISOString().split("T")[0],
        rate: parseFloat(rate.toFixed(currency.precision)),
        change:
          i === parseInt(days) - 1
            ? 0
            : parseFloat((variation * 100).toFixed(2)),
      });
    }

    res.json({
      currency: {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      },
      history,
      period: `${days} days`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rate history" });
  }
});

module.exports = router;
