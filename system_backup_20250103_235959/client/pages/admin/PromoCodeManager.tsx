import React, { useState, useEffect } from "react";
import {
  promoCodeService,
  type PromoCode,
  type CreatePromoCodeRequest,
} from "@/services/promoCodeService";
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
  Ticket,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Percent,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Plane,
  Hotel,
  Users,
  Target,
  Image as ImageIcon,
  MapPin,
  Building,
  Star,
  RefreshCw,
} from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description: string;
  category: "flight" | "hotel" | "both";
  image?: string;
  discountType: "percentage" | "fixed";
  discountMinValue: number;
  discountMaxValue: number;
  minimumFareAmount: number;
  marketingBudget: number;
  expiryDate: string;
  promoCodeImage: string;
  displayOnHomePage: "yes" | "no";
  status: "pending" | "active";

  // Flight-specific fields
  origin?: string;
  destination?: string;
  carrierCode?: string;
  cabinClass?: string;
  flightBy?: string;

  // Hotel-specific fields
  hotelCity?: string;
  hotelName?: string;

  createdOn: string;
  updatedOn: string;
  module: "flight" | "hotel";
  validityType: "unlimited" | "limited";
  usageCount?: number;
  maxUsage?: number;
}

const AIRLINES = [
  { code: "ALL", name: "All Airlines" },
  { code: "AI", name: "Air India" },
  { code: "UK", name: "Vistara" },
  { code: "6E", name: "IndiGo" },
  { code: "SG", name: "SpiceJet" },
  { code: "EK", name: "Emirates" },
  { code: "EY", name: "Etihad" },
  { code: "QR", name: "Qatar Airways" },
];

const CABIN_CLASSES = [
  { value: "ALL", label: "All Classes" },
  { value: "Economy", label: "Economy" },
  { value: "Business", label: "Business" },
  { value: "First", label: "First Class" },
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Dubai",
  "Singapore",
  "Bangkok",
  "Kuala Lumpur",
  "London",
  "Paris",
  "New York",
  "Los Angeles",
];

// Mock data based on the screenshots
const mockPromoCodes: PromoCode[] = [
  {
    id: "1",
    code: "FAREDOWNHOTEL",
    description: "test",
    category: "hotel",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F57003a8eaa4240e5a35dce05a23e72f5?format=webp&width=800",
    discountType: "percentage",
    discountMinValue: 2000,
    discountMaxValue: 5000,
    minimumFareAmount: 10000,
    marketingBudget: 100000,
    expiryDate: "2024-12-31",
    promoCodeImage: "",
    displayOnHomePage: "yes",
    status: "active",
    hotelCity: "",
    hotelName: "",
    createdOn: "2024-01-14 13:31",
    updatedOn: "2024-01-16 13:58",
    module: "hotel",
    validityType: "unlimited",
  },
  {
    id: "2",
    code: "FAREDOWNFLIGHT",
    description: "Flight discount promo",
    category: "flight",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F8542893d1c0b422f87eee4c35e5441ae?format=webp&width=800",
    discountType: "fixed",
    discountMinValue: 1500,
    discountMaxValue: 3000,
    minimumFareAmount: 8000,
    marketingBudget: 150000,
    expiryDate: "2024-11-30",
    promoCodeImage: "",
    displayOnHomePage: "no",
    status: "active",
    origin: "ALL",
    destination: "ALL",
    carrierCode: "ALL",
    cabinClass: "ALL",
    flightBy: "",
    createdOn: "2024-01-10 09:15",
    updatedOn: "2024-01-15 16:45",
    module: "flight",
    validityType: "limited",
    usageCount: 45,
    maxUsage: 100,
  },
];

export default function PromoCodeManager() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<PromoCode>>({});
  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Load promo codes on component mount and when filters change
  useEffect(() => {
    loadPromoCodes();
  }, [searchTerm, selectedModule, selectedStatus, pagination.page]);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await promoCodeService.getPromoCodes({
        search: searchTerm || undefined,
        module: selectedModule,
        status: selectedStatus,
        page: pagination.page,
        limit: 10,
      });

      setPromoCodes(result.promoCodes);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load promo codes",
      );
      console.error("Error loading promo codes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use server-filtered promo codes directly
  const filteredPromoCodes = promoCodes;

  const handleCreatePromoCode = () => {
    setFormData({
      code: "",
      description: "",
      category: "flight",
      discountType: "percentage",
      discountMinValue: 5.0,
      discountMaxValue: 25.0,
      minimumFareAmount: 1000,
      marketingBudget: 10000,
      expiryDate: "",
      promoCodeImage: "",
      displayOnHomePage: "yes",
      status: "pending",
      origin: "ALL",
      destination: "ALL",
      carrierCode: "ALL",
      cabinClass: "ALL",
      flightBy: "",
      validityType: "unlimited",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditPromoCode = (promo: PromoCode) => {
    setSelectedPromoCode(promo);
    setFormData({ ...promo });
    setIsEditDialogOpen(true);
  };

  const handleSavePromoCode = async () => {
    try {
      setSaving(true);
      setError(null);

      if (selectedPromoCode) {
        // Update existing promo code
        await promoCodeService.updatePromoCode(
          selectedPromoCode.id,
          formData as Partial<CreatePromoCodeRequest>,
        );
        setIsEditDialogOpen(false);
      } else {
        // Create new promo code
        if (!formData.code || !formData.description) {
          setError("Code and description are required");
          return;
        }

        await promoCodeService.createPromoCode(
          formData as CreatePromoCodeRequest,
        );
        setIsCreateDialogOpen(false);
        // Switch back to list tab after successful creation
        setActiveTab("list");
      }

      // Reload promo codes to reflect changes
      await loadPromoCodes();
      setFormData({});
      setSelectedPromoCode(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save promo code",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromoCode = async (promoId: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      try {
        setError(null);
        await promoCodeService.deletePromoCode(promoId);
        await loadPromoCodes(); // Reload list
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete promo code",
        );
      }
    }
  };

  const togglePromoCodeStatus = async (promoId: string) => {
    try {
      setError(null);
      await promoCodeService.togglePromoCodeStatus(promoId);
      await loadPromoCodes(); // Reload list to reflect changes
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update promo code status",
      );
    }
  };

  const StatusBadge = ({ status }: { status: PromoCode["status"] }) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
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

  const PromoCodeForm = ({ isEdit = false }) => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Promo Code*</Label>
          <Input
            id="code"
            value={formData.code || ""}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="Enter promo code"
          />
        </div>

        <div>
          <Label htmlFor="description">Description*</Label>
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

        <div>
          <Label htmlFor="category">Category*</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                category: value as PromoCode["category"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flight-specific fields */}
        {(formData.category === "flight" || formData.category === "both") && (
          <div className="space-y-4 border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-700">Flight Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) =>
                    setFormData({ ...formData, origin: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destination">Destination</Label>
                <Select
                  value={formData.destination}
                  onValueChange={(value) =>
                    setFormData({ ...formData, destination: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carrierCode">Carrier Code</Label>
                <Select
                  value={formData.carrierCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, carrierCode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRLINES.map((airline) => (
                      <SelectItem key={airline.code} value={airline.code}>
                        {airline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cabinClass">Cabin Class</Label>
                <Select
                  value={formData.cabinClass}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cabinClass: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {CABIN_CLASSES.map((cabin) => (
                      <SelectItem key={cabin.value} value={cabin.value}>
                        {cabin.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="flightBy">Flight By</Label>
              <Input
                id="flightBy"
                value={formData.flightBy || ""}
                onChange={(e) =>
                  setFormData({ ...formData, flightBy: e.target.value })
                }
                placeholder="Enter flight details"
              />
            </div>
          </div>
        )}

        {/* Hotel-specific fields */}
        {(formData.category === "hotel" || formData.category === "both") && (
          <div className="space-y-4 border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-700">Hotel Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hotelCity">Hotel City</Label>
                <Select
                  value={formData.hotelCity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hotelCity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Cities</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hotelName">Hotel Name</Label>
                <Input
                  id="hotelName"
                  value={formData.hotelName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, hotelName: e.target.value })
                  }
                  placeholder="Enter hotel name or 'ALL' for all hotels"
                />
              </div>
            </div>
          </div>
        )}

        {/* Discount Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Discount Configuration</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountType">Discount Type*</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    discountType: value as PromoCode["discountType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discountMinValue">
                Discount Min Value*{" "}
                {formData.discountType === "percentage" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="discountMinValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountMinValue || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountMinValue: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder={
                  formData.discountType === "percentage" ? "5.00" : "100"
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountMaxValue">
                Discount Max Value*{" "}
                {formData.discountType === "percentage" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="discountMaxValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountMaxValue || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountMaxValue: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder={
                  formData.discountType === "percentage" ? "25.00" : "2000"
                }
              />
            </div>

            <div>
              <Label htmlFor="minimumFareAmount">Minimum Fare Amount*</Label>
              <Input
                id="minimumFareAmount"
                type="number"
                value={formData.minimumFareAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumFareAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter minimum fare amount"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="marketingBudget">Marketing Budget*</Label>
            <Input
              id="marketingBudget"
              type="number"
              value={formData.marketingBudget || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  marketingBudget: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter marketing budget"
            />
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date*</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="promoCodeImage">PromoCode Image</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-gray-500">No file chosen</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayOnHomePage">Display on Home Page*</Label>
              <Select
                value={formData.displayOnHomePage}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    displayOnHomePage: value as "yes" | "no",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status*</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as PromoCode["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Promo Code List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Manage Promo Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Promo Code List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Promo Code List
                </div>
                <Button
                  onClick={handleCreatePromoCode}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add/Update Promo Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Panel */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Search Panel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Promo Code</Label>
                    <Input
                      placeholder="Enter promo code"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Module</Label>
                    <Select
                      value={selectedModule}
                      onValueChange={setSelectedModule}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Please select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        <SelectItem value="flight">Flight</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">Clear Filter</Button>
                  </div>
                </div>
              </div>

              {/* Promo Codes Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Promo Code</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Min Discount</TableHead>
                      <TableHead>Max Discount</TableHead>
                      <TableHead>Valid Upto</TableHead>
                      <TableHead>Minimum fare amount</TableHead>
                      <TableHead>Marketing Budget</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromoCodes.map((promo, index) => (
                      <TableRow key={promo.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {promo.code}
                        </TableCell>
                        <TableCell>
                          {promo.image ? (
                            <img
                              src={promo.image}
                              alt={promo.code}
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {promo.discountType === "percentage"
                            ? `${promo.discountMinValue}%`
                            : `₹${promo.discountMinValue}`}
                        </TableCell>
                        <TableCell>
                          ₹{promo.discountMaxValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(promo.expiryDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          ₹{promo.minimumFareAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ₹{promo.marketingBudget.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {promo.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={promo.status} />
                        </TableCell>
                        <TableCell>{promo.createdOn}</TableCell>
                        <TableCell>{promo.updatedOn}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditPromoCode(promo)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Promo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => togglePromoCodeStatus(promo.id)}
                              >
                                {promo.status === "active" ? (
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
                                <Activity className="w-4 h-4 mr-2" />
                                View Usage
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePromoCode(promo.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Promo
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

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add/Update Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromoCodeForm />
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setFormData({})}>
                  Reset
                </Button>
                <Button onClick={handleSavePromoCode}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Promo Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
            <DialogDescription>
              Create a new promo code with discounts and conditions.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <PromoCodeForm isEdit={false} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setError(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePromoCode}
              disabled={saving || !formData.code || !formData.description}
            >
              {saving ? "Creating..." : "Create Promo Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update promo code configuration and settings.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <PromoCodeForm isEdit={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setError(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePromoCode}
              disabled={saving || !formData.code || !formData.description}
            >
              {saving ? "Updating..." : "Update Promo Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
