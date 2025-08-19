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
  DollarSign,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  BarChart3,
  Calculator,
  ExternalLink,
  History,
  Zap,
  Target,
} from "lucide-react";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  country: string;
  exchangeRate: number;
  baseRate: number;
  markup: number;
  status: "active" | "inactive";
  isDefault: boolean;
  lastUpdated: string;
  source: string;
  precision: number;
  minAmount: number;
  maxAmount: number;
  trend: "up" | "down" | "stable";
  change24h: number;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

// Currency definitions with comprehensive data
const CURRENCY_DEFINITIONS = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", country: "European Union" },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    country: "United Kingdom",
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    country: "United Arab Emirates",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    country: "Australia",
  },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "Switzerland" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore" },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    country: "Hong Kong",
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    country: "New Zealand",
  },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", country: "Poland" },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    country: "Czech Republic",
  },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", country: "Hungary" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", country: "Romania" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", country: "Bulgaria" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "Thailand" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "Malaysia" },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    country: "Indonesia",
  },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "Philippines" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "Vietnam" },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    country: "South Korea",
  },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", country: "Taiwan" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "Pakistan" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "Bangladesh" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨", country: "Sri Lanka" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨", country: "Nepal" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", country: "Saudi Arabia" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", country: "Qatar" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", country: "Kuwait" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب", country: "Bahrain" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", country: "Oman" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", country: "Jordan" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", country: "Israel" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "Turkey" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "Russia" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", country: "Ukraine" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", country: "Egypt" },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    country: "South Africa",
  },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", country: "Nigeria" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "Kenya" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", country: "Ghana" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "Argentina" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "Chile" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "Colombia" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "Peru" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "Mexico" },
];

// Mock currency data
const mockCurrencies: Currency[] = [
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
  {
    id: "3",
    code: "EUR",
    name: "Euro",
    symbol: "€",
    country: "European Union",
    exchangeRate: 89.75,
    baseRate: 89.45,
    markup: 0.3,
    status: "active",
    isDefault: false,
    lastUpdated: new Date().toISOString(),
    source: "Exchange Rate API",
    precision: 2,
    minAmount: 1,
    maxAmount: 50000,
    trend: "down",
    change24h: -0.25,
  },
  {
    id: "4",
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    country: "United Kingdom",
    exchangeRate: 104.85,
    baseRate: 104.42,
    markup: 0.43,
    status: "active",
    isDefault: false,
    lastUpdated: new Date().toISOString(),
    source: "Exchange Rate API",
    precision: 2,
    minAmount: 1,
    maxAmount: 50000,
    trend: "up",
    change24h: 0.32,
  },
  {
    id: "5",
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    country: "United Arab Emirates",
    exchangeRate: 22.65,
    baseRate: 22.62,
    markup: 0.03,
    status: "active",
    isDefault: false,
    lastUpdated: new Date().toISOString(),
    source: "Exchange Rate API",
    precision: 2,
    minAmount: 1,
    maxAmount: 100000,
    trend: "stable",
    change24h: 0.05,
  },
];

export default function CurrencyManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<Currency>>({});
  const [activeTab, setActiveTab] = useState("list");
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState(
    new Date().toISOString(),
  );

  // Filter currencies
  const filteredCurrencies = currencies.filter((currency) => {
    const matchesSearch =
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || currency.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Free exchange rate API service
  const fetchExchangeRates = async () => {
    setIsUpdatingRates(true);
    try {
      // Use mock exchange rates to avoid fetch calls
      console.log("Currency rates: Using mock data (fetch disabled)");
      const data: ExchangeRateResponse = {
        base: "INR",
        date: new Date().toISOString().split("T")[0],
        rates: {
          USD: 0.012,
          EUR: 0.011,
          GBP: 0.0095,
          AED: 0.044,
          SAR: 0.045,
          QAR: 0.043,
          KWD: 0.0037,
          OMR: 0.0046,
          BHD: 0.0045,
        },
      };

      // Update currency rates
      setCurrencies((prevCurrencies) =>
        prevCurrencies.map((currency) => {
          if (currency.code === "INR") return currency; // Skip base currency

          const newBaseRate = 1 / (data.rates[currency.code] || 1);
          const newExchangeRate = newBaseRate + currency.markup;

          return {
            ...currency,
            baseRate: newBaseRate,
            exchangeRate: newExchangeRate,
            lastUpdated: new Date().toISOString(),
            source: "Exchange Rate API",
          };
        }),
      );

      setLastRateUpdate(new Date().toISOString());
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      // Fallback to mock data update
      setCurrencies((prevCurrencies) =>
        prevCurrencies.map((currency) => ({
          ...currency,
          lastUpdated: new Date().toISOString(),
        })),
      );
    } finally {
      setIsUpdatingRates(false);
    }
  };

  useEffect(() => {
    // Auto-update rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCurrency = () => {
    setFormData({
      code: "",
      name: "",
      symbol: "",
      country: "",
      exchangeRate: 1,
      baseRate: 1,
      markup: 0,
      status: "active",
      isDefault: false,
      precision: 2,
      minAmount: 1,
      maxAmount: 100000,
      source: "Manual",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setFormData({ ...currency });
    setIsEditDialogOpen(true);
  };

  const handleSaveCurrency = () => {
    if (selectedCurrency) {
      // Update existing currency
      setCurrencies(
        currencies.map((c) =>
          c.id === selectedCurrency.id
            ? { ...c, ...formData, lastUpdated: new Date().toISOString() }
            : c,
        ),
      );
      setIsEditDialogOpen(false);
    } else {
      // Create new currency
      const newCurrency: Currency = {
        ...(formData as Currency),
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString(),
        trend: "stable",
        change24h: 0,
      };
      setCurrencies([...currencies, newCurrency]);
      setIsCreateDialogOpen(false);
    }
    setFormData({});
    setSelectedCurrency(null);
  };

  const handleDeleteCurrency = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId);
    if (currency?.isDefault) {
      alert("Cannot delete the default currency");
      return;
    }

    if (confirm("Are you sure you want to delete this currency?")) {
      setCurrencies(currencies.filter((c) => c.id !== currencyId));
    }
  };

  const toggleCurrencyStatus = (currencyId: string) => {
    setCurrencies(
      currencies.map((c) =>
        c.id === currencyId
          ? {
              ...c,
              status: c.status === "active" ? "inactive" : "active",
              lastUpdated: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const setDefaultCurrency = (currencyId: string) => {
    setCurrencies(
      currencies.map((c) => ({
        ...c,
        isDefault: c.id === currencyId,
      })),
    );
  };

  const handleCurrencyCodeChange = (code: string) => {
    const currencyDef = CURRENCY_DEFINITIONS.find((c) => c.code === code);
    if (currencyDef) {
      setFormData({
        ...formData,
        code: currencyDef.code,
        name: currencyDef.name,
        symbol: currencyDef.symbol,
        country: currencyDef.country,
      });
    } else {
      setFormData({ ...formData, code });
    }
  };

  const StatusBadge = ({ status }: { status: Currency["status"] }) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const TrendIndicator = ({
    trend,
    change,
  }: {
    trend: Currency["trend"];
    change: number;
  }) => {
    const trendConfig = {
      up: { color: "text-green-600", icon: TrendingUp },
      down: { color: "text-red-600", icon: TrendingDown },
      stable: { color: "text-gray-600", icon: Target },
    };

    const config = trendConfig[trend];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    );
  };

  const CurrencyForm = ({ isEdit = false }) => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">
          Currency Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Currency Code</Label>
            <Select
              value={formData.code}
              onValueChange={handleCurrencyCodeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency code" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                {CURRENCY_DEFINITIONS.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Currency Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter currency name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="symbol">Currency Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol || ""}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value })
              }
              placeholder="Enter currency symbol"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country || ""}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="Enter country name"
            />
          </div>
        </div>
      </div>

      {/* Exchange Rate Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">
          Exchange Rate Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="baseRate">Base Rate (API Rate)</Label>
            <Input
              id="baseRate"
              type="number"
              step="0.0001"
              value={formData.baseRate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  baseRate: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 83.1200"
            />
          </div>

          <div>
            <Label htmlFor="markup">Markup</Label>
            <Input
              id="markup"
              type="number"
              step="0.0001"
              value={formData.markup || ""}
              onChange={(e) => {
                const markup = parseFloat(e.target.value) || 0;
                const baseRate = formData.baseRate || 0;
                setFormData({
                  ...formData,
                  markup,
                  exchangeRate: baseRate + markup,
                });
              }}
              placeholder="e.g., 0.1300"
            />
          </div>

          <div>
            <Label htmlFor="exchangeRate">Final Rate (Base + Markup)</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.0001"
              value={formData.exchangeRate || ""}
              onChange={(e) => {
                const exchangeRate = parseFloat(e.target.value) || 0;
                const baseRate = formData.baseRate || 0;
                setFormData({
                  ...formData,
                  exchangeRate,
                  markup: exchangeRate - baseRate,
                });
              }}
              placeholder="e.g., 83.2500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="precision">Decimal Precision</Label>
            <Select
              value={formData.precision?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, precision: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 decimals</SelectItem>
                <SelectItem value="2">2 decimals</SelectItem>
                <SelectItem value="4">4 decimals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Rate Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) =>
                setFormData({ ...formData, source: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Exchange Rate API">
                  Exchange Rate API
                </SelectItem>
                <SelectItem value="Manual">Manual Entry</SelectItem>
                <SelectItem value="Bank Rate">Bank Rate</SelectItem>
                <SelectItem value="Custom API">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Limits and Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Limits & Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minAmount">Minimum Amount</Label>
            <Input
              id="minAmount"
              type="number"
              value={formData.minAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <Label htmlFor="maxAmount">Maximum Amount</Label>
            <Input
              id="maxAmount"
              type="number"
              value={formData.maxAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 100000"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked })
              }
            />
            <Label htmlFor="isDefault">Default Currency</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === "active"}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  status: checked ? "active" : "inactive",
                })
              }
            />
            <Label htmlFor="status">Active</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Currency List
          </TabsTrigger>
          <TabsTrigger value="converter" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Converter
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Currency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Currency Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Currency Conversion
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchExchangeRates}
                    disabled={isUpdatingRates}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isUpdatingRates ? "animate-spin" : ""}`}
                    />
                    Update Rates
                  </Button>
                  <Button
                    onClick={handleCreateCurrency}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Currency
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search currencies by code, name, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Last Update Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>
                      Last rates update:{" "}
                      {new Date(lastRateUpdate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Zap className="w-4 h-4" />
                    <span>Auto-updates every 30 minutes</span>
                  </div>
                </div>
              </div>

              {/* Currencies Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Exchange Rate</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrencies.map((currency, index) => (
                      <TableRow key={currency.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-xs">
                                {currency.code}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {currency.code}
                                {currency.isDefault && (
                                  <Badge variant="outline" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {currency.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {currency.country}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              1 INR ={" "}
                              {currency.exchangeRate.toFixed(
                                currency.precision,
                              )}{" "}
                              {currency.symbol}
                            </div>
                            <div className="text-xs text-gray-600">
                              Base: {currency.baseRate.toFixed(4)} | Markup:{" "}
                              {currency.markup.toFixed(4)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TrendIndicator
                            trend={currency.trend}
                            change={currency.change24h}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {new Date(
                                currency.lastUpdated,
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              {currency.source}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={currency.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditCurrency(currency)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Currency
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleCurrencyStatus(currency.id)
                                }
                              >
                                {currency.status === "active" ? (
                                  <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              {!currency.isDefault && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDefaultCurrency(currency.id)
                                  }
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  Set as Default
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <History className="w-4 h-4 mr-2" />
                                Rate History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteCurrency(currency.id)
                                }
                                className="text-red-600"
                                disabled={currency.isDefault}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Currency
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

        <TabsContent value="converter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Currency Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label>From Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies
                          .filter((c) => c.status === "active")
                          .map((currency) => (
                            <SelectItem key={currency.id} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies
                          .filter((c) => c.status === "active")
                          .map((currency) => (
                            <SelectItem key={currency.id} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-center">
                  <Button size="lg">
                    <Calculator className="w-4 h-4 mr-2" />
                    Convert
                  </Button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    Result will appear here
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Enter amount and select currencies to convert
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyForm />
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setFormData({})}>
                  Reset
                </Button>
                <Button onClick={handleSaveCurrency}>Save Currency</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Currency Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
            <DialogDescription>
              Update currency exchange rate and configuration.
            </DialogDescription>
          </DialogHeader>
          <CurrencyForm isEdit={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCurrency}>Update Currency</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
