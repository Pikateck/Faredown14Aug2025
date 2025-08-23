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
  FileText,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Percent,
  Calendar,
  DollarSign,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Plane,
  Hotel,
  Calculator,
  Receipt,
  Building,
  MapPin,
} from "lucide-react";

interface VATRule {
  id: string;
  name: string;
  description: string;
  serviceType: "flight" | "hotel" | "both";
  country: string;
  state: string;
  vatRate: number;
  hsnCode: string;
  sacCode: string;
  applicableFrom: string;
  applicableTo: string;
  minAmount: number;
  maxAmount: number;
  customerType: "all" | "b2c" | "b2b" | "international";
  taxType: "gst" | "vat" | "service_tax" | "other";
  isDefault: boolean;
  status: "active" | "inactive" | "expired";
  priority: number;
  specialConditions: string;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_TYPES = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "both", label: "Both Services", icon: Globe },
];

const COUNTRIES = [
  {
    code: "IN",
    name: "India",
    states: [
      "Maharashtra",
      "Delhi",
      "Karnataka",
      "Tamil Nadu",
      "Gujarat",
      "Rajasthan",
      "Uttar Pradesh",
      "West Bengal",
      "Goa",
    ],
  },
  {
    code: "AE",
    name: "UAE",
    states: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  },
  {
    code: "US",
    name: "USA",
    states: ["California", "New York", "Texas", "Florida"],
  },
  {
    code: "UK",
    name: "United Kingdom",
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
  },
  { code: "SG", name: "Singapore", states: ["Singapore"] },
  {
    code: "MY",
    name: "Malaysia",
    states: ["Kuala Lumpur", "Selangor", "Penang"],
  },
  { code: "TH", name: "Thailand", states: ["Bangkok", "Phuket", "Chiang Mai"] },
];

const TAX_TYPES = [
  { value: "gst", label: "GST (Goods & Services Tax)" },
  { value: "vat", label: "VAT (Value Added Tax)" },
  { value: "service_tax", label: "Service Tax" },
  { value: "other", label: "Other Tax" },
];

const CUSTOMER_TYPES = [
  { value: "all", label: "All Customers" },
  { value: "b2c", label: "B2C (Individual)" },
  { value: "b2b", label: "B2B (Business)" },
  { value: "international", label: "International" },
];

// Mock data
const mockVATRules: VATRule[] = [
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
  {
    id: "3",
    name: "UAE VAT",
    description: "VAT for all services in UAE",
    serviceType: "both",
    country: "UAE",
    state: "All Emirates",
    vatRate: 5,
    hsnCode: "",
    sacCode: "",
    applicableFrom: "2024-01-01",
    applicableTo: "2024-12-31",
    minAmount: 0,
    maxAmount: 0,
    customerType: "all",
    taxType: "vat",
    isDefault: true,
    status: "active",
    priority: 1,
    specialConditions: "Standard VAT rate for UAE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T12:00:00Z",
  },
];

export default function VATManagement() {
  const [vatRules, setVATRules] = useState<VATRule[]>(mockVATRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVATRule, setSelectedVATRule] = useState<VATRule | null>(null);
  const [formData, setFormData] = useState<Partial<VATRule>>({});
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCountryStates, setSelectedCountryStates] = useState<string[]>(
    [],
  );

  // Filter VAT rules
  const filteredVATRules = vatRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServiceType =
      selectedServiceType === "all" || rule.serviceType === selectedServiceType;
    const matchesCountry =
      selectedCountry === "all" || rule.country === selectedCountry;
    const matchesStatus =
      selectedStatus === "all" || rule.status === selectedStatus;

    return (
      matchesSearch && matchesServiceType && matchesCountry && matchesStatus
    );
  });

  const handleCreateVATRule = () => {
    setFormData({
      name: "",
      description: "",
      serviceType: "flight",
      country: "",
      state: "",
      vatRate: 0,
      hsnCode: "",
      sacCode: "",
      applicableFrom: "",
      applicableTo: "",
      minAmount: 0,
      maxAmount: 0,
      customerType: "all",
      taxType: "gst",
      isDefault: false,
      status: "active",
      priority: 1,
      specialConditions: "",
    });
    setSelectedCountryStates([]);
    setIsCreateDialogOpen(true);
  };

  const handleEditVATRule = (rule: VATRule) => {
    setSelectedVATRule(rule);
    setFormData({ ...rule });

    // Set states for selected country
    const country = COUNTRIES.find((c) => c.name === rule.country);
    setSelectedCountryStates(country?.states || []);

    setIsEditDialogOpen(true);
  };

  const handleSaveVATRule = () => {
    if (selectedVATRule) {
      // Update existing rule
      setVATRules(
        vatRules.map((r) =>
          r.id === selectedVATRule.id
            ? { ...r, ...formData, updatedAt: new Date().toISOString() }
            : r,
        ),
      );
      setIsEditDialogOpen(false);
    } else {
      // Create new rule
      const newRule: VATRule = {
        ...(formData as VATRule),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVATRules([...vatRules, newRule]);
      setIsCreateDialogOpen(false);
    }
    setFormData({});
    setSelectedVATRule(null);
    setSelectedCountryStates([]);
  };

  const handleDeleteVATRule = (ruleId: string) => {
    if (confirm("Are you sure you want to delete this VAT rule?")) {
      setVATRules(vatRules.filter((r) => r.id !== ruleId));
    }
  };

  const toggleVATRuleStatus = (ruleId: string) => {
    setVATRules(
      vatRules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              status: r.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  };

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, state: "" });
    const selectedCountry = COUNTRIES.find((c) => c.name === country);
    setSelectedCountryStates(selectedCountry?.states || []);
  };

  const StatusBadge = ({ status }: { status: VATRule["status"] }) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      expired: { color: "bg-gray-100 text-gray-800", icon: Clock },
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

  const VATRuleForm = ({ isEdit = false }) => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

        <div>
          <Label htmlFor="name">VAT Rule Name</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter VAT rule name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  serviceType: value as VATRule["serviceType"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taxType">Tax Type</Label>
            <Select
              value={formData.taxType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  taxType: value as VATRule["taxType"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                {TAX_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state">State/Region</Label>
            <Select
              value={formData.state}
              onValueChange={(value) =>
                setFormData({ ...formData, state: value })
              }
              disabled={!selectedCountryStates.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state/region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All States">All States/Regions</SelectItem>
                {selectedCountryStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="customerType">Customer Type</Label>
          <Select
            value={formData.customerType}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                customerType: value as VATRule["customerType"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Tax Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vatRate">VAT/Tax Rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              step="0.01"
              value={formData.vatRate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vatRate: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 18.00"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: parseInt(e.target.value) || 1,
                })
              }
              placeholder="1 = Highest"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              value={formData.hsnCode || ""}
              onChange={(e) =>
                setFormData({ ...formData, hsnCode: e.target.value })
              }
              placeholder="Enter HSN code (for goods)"
            />
          </div>

          <div>
            <Label htmlFor="sacCode">SAC Code</Label>
            <Input
              id="sacCode"
              value={formData.sacCode || ""}
              onChange={(e) =>
                setFormData({ ...formData, sacCode: e.target.value })
              }
              placeholder="Enter SAC code (for services)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
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
              placeholder="0 = No minimum"
            />
          </div>

          <div>
            <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
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
              placeholder="0 = No maximum"
            />
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Validity Period</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="applicableFrom">Applicable From</Label>
            <Input
              id="applicableFrom"
              type="date"
              value={formData.applicableFrom || ""}
              onChange={(e) =>
                setFormData({ ...formData, applicableFrom: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="applicableTo">Applicable To</Label>
            <Input
              id="applicableTo"
              type="date"
              value={formData.applicableTo || ""}
              onChange={(e) =>
                setFormData({ ...formData, applicableTo: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Settings</h3>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked })
              }
            />
            <Label htmlFor="isDefault">Default Rule</Label>
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

        <div>
          <Label htmlFor="specialConditions">Special Conditions</Label>
          <Textarea
            id="specialConditions"
            value={formData.specialConditions || ""}
            onChange={(e) =>
              setFormData({ ...formData, specialConditions: e.target.value })
            }
            placeholder="Enter any special conditions or notes"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            VAT Rules List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create VAT Rule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  VAT Management
                </div>
                <Button
                  onClick={handleCreateVATRule}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add VAT Rule
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search VAT rules by name, country, or description..."
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
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* VAT Rules Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VAT Rule</TableHead>
                      <TableHead>Service & Tax Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rate & Codes</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVATRules.map((rule) => {
                      const serviceType = SERVICE_TYPES.find(
                        (t) => t.value === rule.serviceType,
                      );
                      const ServiceIcon = serviceType?.icon || FileText;

                      return (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {rule.name}
                                {rule.isDefault && (
                                  <Badge variant="outline" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 truncate max-w-48">
                                {rule.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <ServiceIcon className="w-3 h-3 mr-1" />
                                {serviceType?.label}
                              </div>
                              <div className="text-xs text-gray-600 uppercase">
                                {rule.taxType.replace("_", " ")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Globe className="w-3 h-3 mr-1" />
                                {rule.country}
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {rule.state}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm font-medium">
                                <Percent className="w-3 h-3 mr-1" />
                                {rule.vatRate}%
                              </div>
                              <div className="text-xs text-gray-600">
                                {rule.hsnCode && `HSN: ${rule.hsnCode}`}
                                {rule.sacCode && ` SAC: ${rule.sacCode}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(
                                  rule.applicableFrom,
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-600">
                                to{" "}
                                {new Date(
                                  rule.applicableTo,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rule.status} />
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
                                  onClick={() => handleEditVATRule(rule)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Rule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleVATRuleStatus(rule.id)}
                                >
                                  {rule.status === "active" ? (
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
                                <DropdownMenuItem>
                                  <Calculator className="w-4 h-4 mr-2" />
                                  Tax Calculator
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Receipt className="w-4 h-4 mr-2" />
                                  View Reports
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteVATRule(rule.id)}
                                  className="text-red-600"
                                  disabled={rule.isDefault}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Rule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New VAT Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VATRuleForm />
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setFormData({})}>
                  Reset
                </Button>
                <Button onClick={handleSaveVATRule}>Save VAT Rule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit VAT Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit VAT Rule</DialogTitle>
            <DialogDescription>
              Update VAT/tax configuration for services.
            </DialogDescription>
          </DialogHeader>
          <VATRuleForm isEdit={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveVATRule}>Update VAT Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
