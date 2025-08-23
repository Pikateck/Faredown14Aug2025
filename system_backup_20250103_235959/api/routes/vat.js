const express = require("express");
const router = express.Router();

// Mock database
let vatRules = [
  {
    id: "1",
    name: "India Flight GST",
    description: "GST for domestic flight bookings in India",
    serviceType: "flight",
    country: "India",
    state: "All States",
    vatRate: 18,
    hsnCode: "9958",
    sacCode: "998311",
    applicableFrom: "2024-01-01",
    applicableTo: "2024-12-31",
    minAmount: 0,
    maxAmount: 0,
    customerType: "all",
    taxType: "gst",
    isDefault: true,
    status: "active",
    priority: 1,
    specialConditions: "Applicable for all domestic flight bookings",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "2",
    name: "India Hotel GST",
    description: "GST for hotel bookings in India",
    serviceType: "hotel",
    country: "India",
    state: "All States",
    vatRate: 18,
    hsnCode: "9963",
    sacCode: "996312",
    applicableFrom: "2024-01-01",
    applicableTo: "2024-12-31",
    minAmount: 1000,
    maxAmount: 0,
    customerType: "all",
    taxType: "gst",
    isDefault: true,
    status: "active",
    priority: 1,
    specialConditions: "Applicable for hotel bookings above ₹1000",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
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

// GET /api/vat - Get all VAT rules
router.get("/", authenticateToken, (req, res) => {
  try {
    const {
      search,
      serviceType,
      country,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    let filteredRules = [...vatRules];

    // Apply filters
    if (search) {
      filteredRules = filteredRules.filter(
        (rule) =>
          rule.name.toLowerCase().includes(search.toLowerCase()) ||
          rule.description.toLowerCase().includes(search.toLowerCase()) ||
          rule.country.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (serviceType && serviceType !== "all") {
      filteredRules = filteredRules.filter(
        (rule) => rule.serviceType === serviceType,
      );
    }

    if (country && country !== "all") {
      filteredRules = filteredRules.filter((rule) => rule.country === country);
    }

    if (status && status !== "all") {
      filteredRules = filteredRules.filter((rule) => rule.status === status);
    }

    // Sort by priority
    filteredRules.sort((a, b) => a.priority - b.priority);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRules = filteredRules.slice(startIndex, endIndex);

    res.json({
      vatRules: paginatedRules,
      total: filteredRules.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredRules.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch VAT rules" });
  }
});

// GET /api/vat/:id - Get VAT rule by ID
router.get("/:id", authenticateToken, (req, res) => {
  try {
    const vatRule = vatRules.find((rule) => rule.id === req.params.id);
    if (!vatRule) {
      return res.status(404).json({ error: "VAT rule not found" });
    }

    res.json(vatRule);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch VAT rule" });
  }
});

// POST /api/vat - Create new VAT rule
router.post("/", authenticateToken, (req, res) => {
  try {
    const {
      name,
      description,
      serviceType,
      country,
      state,
      vatRate,
      hsnCode,
      sacCode,
      applicableFrom,
      applicableTo,
      minAmount,
      maxAmount,
      customerType,
      taxType,
      isDefault,
      status,
      priority,
      specialConditions,
    } = req.body;

    // Validate required fields
    if (!name || !serviceType || !country || !vatRate || !taxType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // If setting as default, remove default flag from other rules of same service type and country
    if (isDefault) {
      vatRules = vatRules.map((rule) => {
        if (rule.serviceType === serviceType && rule.country === country) {
          return { ...rule, isDefault: false };
        }
        return rule;
      });
    }

    const newVATRule = {
      id: Date.now().toString(),
      name,
      description: description || "",
      serviceType,
      country,
      state: state || "All States",
      vatRate,
      hsnCode: hsnCode || "",
      sacCode: sacCode || "",
      applicableFrom: applicableFrom || new Date().toISOString().split("T")[0],
      applicableTo: applicableTo || "2024-12-31",
      minAmount: minAmount || 0,
      maxAmount: maxAmount || 0,
      customerType: customerType || "all",
      taxType,
      isDefault: isDefault || false,
      status: status || "active",
      priority: priority || 1,
      specialConditions: specialConditions || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vatRules.push(newVATRule);
    res.status(201).json(newVATRule);
  } catch (error) {
    res.status(500).json({ error: "Failed to create VAT rule" });
  }
});

// PUT /api/vat/:id - Update VAT rule
router.put("/:id", authenticateToken, (req, res) => {
  try {
    const ruleIndex = vatRules.findIndex((rule) => rule.id === req.params.id);
    if (ruleIndex === -1) {
      return res.status(404).json({ error: "VAT rule not found" });
    }

    const { isDefault, serviceType, country } = req.body;

    // If setting as default, remove default flag from other rules of same service type and country
    if (
      isDefault &&
      (serviceType || vatRules[ruleIndex].serviceType) &&
      (country || vatRules[ruleIndex].country)
    ) {
      const targetServiceType = serviceType || vatRules[ruleIndex].serviceType;
      const targetCountry = country || vatRules[ruleIndex].country;

      vatRules = vatRules.map((rule, index) => {
        if (
          index !== ruleIndex &&
          rule.serviceType === targetServiceType &&
          rule.country === targetCountry
        ) {
          return { ...rule, isDefault: false };
        }
        return rule;
      });
    }

    const updatedRule = {
      ...vatRules[ruleIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    vatRules[ruleIndex] = updatedRule;
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ error: "Failed to update VAT rule" });
  }
});

// DELETE /api/vat/:id - Delete VAT rule
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const ruleIndex = vatRules.findIndex((rule) => rule.id === req.params.id);
    if (ruleIndex === -1) {
      return res.status(404).json({ error: "VAT rule not found" });
    }

    // Prevent deletion of default rules
    if (vatRules[ruleIndex].isDefault) {
      return res.status(400).json({ error: "Cannot delete default VAT rule" });
    }

    vatRules.splice(ruleIndex, 1);
    res.json({ message: "VAT rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete VAT rule" });
  }
});

// POST /api/vat/:id/toggle-status - Toggle VAT rule status
router.post("/:id/toggle-status", authenticateToken, (req, res) => {
  try {
    const ruleIndex = vatRules.findIndex((rule) => rule.id === req.params.id);
    if (ruleIndex === -1) {
      return res.status(404).json({ error: "VAT rule not found" });
    }

    vatRules[ruleIndex].status =
      vatRules[ruleIndex].status === "active" ? "inactive" : "active";
    vatRules[ruleIndex].updatedAt = new Date().toISOString();

    res.json(vatRules[ruleIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle VAT rule status" });
  }
});

// POST /api/vat/calculate - Calculate VAT for given amount
router.post("/calculate", (req, res) => {
  try {
    const { amount, serviceType, country, customerType } = req.body;

    if (!amount || !serviceType || !country) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Find applicable VAT rule
    let applicableRule = vatRules.find(
      (rule) =>
        rule.serviceType === serviceType &&
        rule.country === country &&
        rule.customerType === (customerType || "all") &&
        rule.status === "active" &&
        amount >= rule.minAmount &&
        (rule.maxAmount === 0 || amount <= rule.maxAmount),
    );

    // If no specific rule found, try to find a rule for 'all' customer types
    if (!applicableRule) {
      applicableRule = vatRules.find(
        (rule) =>
          rule.serviceType === serviceType &&
          rule.country === country &&
          rule.customerType === "all" &&
          rule.status === "active" &&
          amount >= rule.minAmount &&
          (rule.maxAmount === 0 || amount <= rule.maxAmount),
      );
    }

    if (!applicableRule) {
      return res.json({
        vatAmount: 0,
        vatRate: 0,
        totalAmount: amount,
        applicableRule: null,
        message: "No applicable VAT rule found",
      });
    }

    const vatAmount = (amount * applicableRule.vatRate) / 100;
    const totalAmount = amount + vatAmount;

    res.json({
      vatAmount,
      vatRate: applicableRule.vatRate,
      totalAmount,
      applicableRule: {
        id: applicableRule.id,
        name: applicableRule.name,
        taxType: applicableRule.taxType,
        hsnCode: applicableRule.hsnCode,
        sacCode: applicableRule.sacCode,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate VAT" });
  }
});

// GET /api/vat/countries - Get list of countries with VAT rules
router.get("/meta/countries", (req, res) => {
  try {
    const countries = [...new Set(vatRules.map((rule) => rule.country))];
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// GET /api/vat/stats - Get VAT statistics
router.get("/stats/overview", authenticateToken, (req, res) => {
  try {
    const totalRules = vatRules.length;
    const activeRules = vatRules.filter(
      (rule) => rule.status === "active",
    ).length;
    const defaultRules = vatRules.filter((rule) => rule.isDefault).length;

    const serviceTypeDistribution = vatRules.reduce((acc, rule) => {
      acc[rule.serviceType] = (acc[rule.serviceType] || 0) + 1;
      return acc;
    }, {});

    const countryDistribution = vatRules.reduce((acc, rule) => {
      acc[rule.country] = (acc[rule.country] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalRules,
      activeRules,
      inactiveRules: totalRules - activeRules,
      defaultRules,
      serviceTypeDistribution,
      countryDistribution,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch VAT statistics" });
  }
});

// GET /api/vat/default/:serviceType/:country - Get default VAT rule for service type and country
router.get("/default/:serviceType/:country", (req, res) => {
  try {
    const { serviceType, country } = req.params;

    const defaultRule = vatRules.find(
      (rule) =>
        rule.serviceType === serviceType &&
        rule.country === country &&
        rule.isDefault &&
        rule.status === "active",
    );

    if (!defaultRule) {
      return res.status(404).json({ error: "No default VAT rule found" });
    }

    res.json(defaultRule);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch default VAT rule" });
  }
});

module.exports = router;
