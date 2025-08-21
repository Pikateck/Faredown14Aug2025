import React, { useState, useEffect } from "react";
import {
  markupService,
  type HotelMarkup,
  type CreateHotelMarkupRequest,
} from "@/services/markupService";
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
  Camera,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Star,
  MapPin,
  Clock,
  Users,
  Ticket,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Eye,
} from "lucide-react";

// Sightseeing-specific markup interface
interface SightseeingMarkup {
  id: string;
  destinationCode: string;
  destinationName: string;
  experienceType:
    | "landmark"
    | "museum"
    | "tour"
    | "activity"
    | "food"
    | "culture"
    | "adventure"
    | "all";
  experienceName?: string;
  markupType: "percentage" | "fixed";
  markupValue: number;
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  priority: number;
  validFrom: string;
  validTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  avgExperiencePrice: number;
  totalRevenue: number;
}

interface CreateSightseeingMarkupRequest {
  destinationCode: string;
  destinationName: string;
  experienceType: string;
  experienceName?: string;
  markupType: "percentage" | "fixed";
  markupValue: number;
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  priority: number;
  validFrom: string;
  validTo?: string;
  notes?: string;
}

export default function MarkupManagementSightseeing() {
  const [markups, setMarkups] = useState<SightseeingMarkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMarkup, setEditingMarkup] = useState<SightseeingMarkup | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmMarkup, setDeleteConfirmMarkup] =
    useState<SightseeingMarkup | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSightseeingMarkupRequest>({
    destinationCode: "",
    destinationName: "",
    experienceType: "all",
    experienceName: "",
    markupType: "percentage",
    markupValue: 0,
    currency: "AED",
    minPrice: undefined,
    maxPrice: undefined,
    isActive: true,
    priority: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
    notes: "",
  });

  // Sample sightseeing markup data
  const sampleMarkups: SightseeingMarkup[] = [
    {
      id: "sgts-001",
      destinationCode: "DXB",
      destinationName: "Dubai",
      experienceType: "landmark",
      experienceName: "Burj Khalifa",
      markupType: "percentage",
      markupValue: 15,
      currency: "AED",
      minPrice: 100,
      maxPrice: 500,
      isActive: true,
      priority: 1,
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      notes: "Premium landmark experience markup",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      usageCount: 234,
      avgExperiencePrice: 189,
      totalRevenue: 8756.45,
    },
    {
      id: "sgts-002",
      destinationCode: "DXB",
      destinationName: "Dubai",
      experienceType: "tour",
      experienceName: "Desert Safari",
      markupType: "fixed",
      markupValue: 25,
      currency: "AED",
      isActive: true,
      priority: 2,
      validFrom: "2024-01-01",
      notes: "Popular desert experience fixed markup",
      createdAt: "2024-01-20T14:30:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      usageCount: 156,
      avgExperiencePrice: 179,
      totalRevenue: 4569.78,
    },
    {
      id: "sgts-003",
      destinationCode: "LON",
      destinationName: "London",
      experienceType: "museum",
      markupType: "percentage",
      markupValue: 12,
      currency: "GBP",
      minPrice: 20,
      maxPrice: 150,
      isActive: true,
      priority: 1,
      validFrom: "2024-02-01",
      validTo: "2024-11-30",
      notes: "London museums and cultural experiences",
      createdAt: "2024-02-01T09:15:00Z",
      updatedAt: "2024-02-01T09:15:00Z",
      usageCount: 89,
      avgExperiencePrice: 45,
      totalRevenue: 2134.67,
    },
    {
      id: "sgts-004",
      destinationCode: "PAR",
      destinationName: "Paris",
      experienceType: "food",
      experienceName: "Food Walking Tour",
      markupType: "percentage",
      markupValue: 18,
      currency: "EUR",
      isActive: false,
      priority: 3,
      validFrom: "2024-03-01",
      validTo: "2024-08-31",
      notes: "Seasonal food experience markup - currently disabled",
      createdAt: "2024-03-01T11:45:00Z",
      updatedAt: "2024-03-15T16:20:00Z",
      usageCount: 67,
      avgExperiencePrice: 89,
      totalRevenue: 1456.23,
    },
    {
      id: "sgts-005",
      destinationCode: "NYC",
      destinationName: "New York",
      experienceType: "activity",
      markupType: "percentage",
      markupValue: 20,
      currency: "USD",
      minPrice: 50,
      maxPrice: 300,
      isActive: true,
      priority: 1,
      validFrom: "2024-01-01",
      notes: "NYC activities and experiences",
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2024-01-10T08:00:00Z",
      usageCount: 312,
      avgExperiencePrice: 125,
      totalRevenue: 9834.56,
    },
  ];

  // Load markups
  useEffect(() => {
    const loadMarkups = async () => {
      try {
        setLoading(true);
        // Use sample data for now
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMarkups(sampleMarkups);
      } catch (error) {
        console.error("Error loading sightseeing markups:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMarkups();
  }, []);

  // Filter markups
  const filteredMarkups = markups.filter((markup) => {
    const matchesSearch =
      markup.destinationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      markup.experienceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (markup.experienceName &&
        markup.experienceName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === "all" || markup.experienceType === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && markup.isActive) ||
      (filterStatus === "inactive" && !markup.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Form handlers
  const handleInputChange = (
    field: keyof CreateSightseeingMarkupRequest,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingMarkup) {
        // Update existing markup
        const updatedMarkup: SightseeingMarkup = {
          ...editingMarkup,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        setMarkups((prev) =>
          prev.map((m) => (m.id === editingMarkup.id ? updatedMarkup : m)),
        );
      } else {
        // Create new markup
        const newMarkup: SightseeingMarkup = {
          id: `sgts-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          avgExperiencePrice: 0,
          totalRevenue: 0,
        };
        setMarkups((prev) => [...prev, newMarkup]);
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving sightseeing markup:", error);
    }
  };

  const openDialog = (markup?: SightseeingMarkup) => {
    if (markup) {
      setEditingMarkup(markup);
      setFormData({
        destinationCode: markup.destinationCode,
        destinationName: markup.destinationName,
        experienceType: markup.experienceType,
        experienceName: markup.experienceName || "",
        markupType: markup.markupType,
        markupValue: markup.markupValue,
        currency: markup.currency,
        minPrice: markup.minPrice,
        maxPrice: markup.maxPrice,
        isActive: markup.isActive,
        priority: markup.priority,
        validFrom: markup.validFrom,
        validTo: markup.validTo || "",
        notes: markup.notes || "",
      });
    } else {
      setEditingMarkup(null);
      setFormData({
        destinationCode: "",
        destinationName: "",
        experienceType: "all",
        experienceName: "",
        markupType: "percentage",
        markupValue: 0,
        currency: "AED",
        minPrice: undefined,
        maxPrice: undefined,
        isActive: true,
        priority: 1,
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingMarkup(null);
  };

  const handleDelete = async (markup: SightseeingMarkup) => {
    try {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMarkups((prev) => prev.filter((m) => m.id !== markup.id));
      setDeleteConfirmMarkup(null);
    } catch (error) {
      console.error("Error deleting sightseeing markup:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleMarkupStatus = async (markup: SightseeingMarkup) => {
    const updatedMarkup = {
      ...markup,
      isActive: !markup.isActive,
      updatedAt: new Date().toISOString(),
    };
    setMarkups((prev) =>
      prev.map((m) => (m.id === markup.id ? updatedMarkup : m)),
    );
  };

  const getExperienceTypeIcon = (type: string) => {
    switch (type) {
      case "landmark":
        return "🏛️";
      case "museum":
        return "🎨";
      case "tour":
        return "🚌";
      case "activity":
        return "🎯";
      case "food":
        return "🍽️";
      case "culture":
        return "🎭";
      case "adventure":
        return "⛰️";
      default:
        return "🎪";
    }
  };

  const getExperienceTypeColor = (type: string) => {
    switch (type) {
      case "landmark":
        return "bg-blue-100 text-blue-800";
      case "museum":
        return "bg-purple-100 text-purple-800";
      case "tour":
        return "bg-green-100 text-green-800";
      case "activity":
        return "bg-orange-100 text-orange-800";
      case "food":
        return "bg-red-100 text-red-800";
      case "culture":
        return "bg-indigo-100 text-indigo-800";
      case "adventure":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total stats
  const totalMarkups = markups.length;
  const activeMarkups = markups.filter((m) => m.isActive).length;
  const totalRevenue = markups.reduce((sum, m) => sum + m.totalRevenue, 0);
  const totalUsage = markups.reduce((sum, m) => sum + m.usageCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            Sightseeing Markup Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage markups for sightseeing experiences and attractions
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sightseeing Markup
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Markups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMarkups}
                </p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Markups</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeMarkups}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalUsage.toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by destination, experience type, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Experience Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="landmark">🏛️ Landmarks</SelectItem>
                <SelectItem value="museum">🎨 Museums</SelectItem>
                <SelectItem value="tour">🚌 Tours</SelectItem>
                <SelectItem value="activity">🎯 Activities</SelectItem>
                <SelectItem value="food">🍽️ Food & Dining</SelectItem>
                <SelectItem value="culture">🎭 Cultural</SelectItem>
                <SelectItem value="adventure">⛰️ Adventure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Markups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Sightseeing Markups ({filteredMarkups.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading markups...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarkups.map((markup) => (
                    <TableRow key={markup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {markup.destinationName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {markup.destinationCode}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getExperienceTypeColor(
                              markup.experienceType,
                            )}
                          >
                            {getExperienceTypeIcon(markup.experienceType)}{" "}
                            {markup.experienceType}
                          </Badge>
                          {markup.experienceName && (
                            <div className="text-sm text-gray-600">
                              {markup.experienceName}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {markup.markupType === "percentage"
                              ? `${markup.markupValue}%`
                              : `${markup.markupValue} ${markup.currency}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {markup.markupType}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        {markup.minPrice || markup.maxPrice ? (
                          <div className="text-sm">
                            {markup.minPrice &&
                              `${markup.minPrice} ${markup.currency}`}
                            {markup.minPrice && markup.maxPrice && " - "}
                            {markup.maxPrice &&
                              `${markup.maxPrice} ${markup.currency}`}
                          </div>
                        ) : (
                          <span className="text-gray-500">No limit</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{markup.usageCount.toLocaleString()}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-green-600">
                          $
                          {markup.totalRevenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={markup.isActive}
                            onCheckedChange={() => toggleMarkupStatus(markup)}
                            size="sm"
                          />
                          <Badge
                            variant={markup.isActive ? "default" : "secondary"}
                          >
                            {markup.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {new Date(markup.validFrom).toLocaleDateString()}
                          </div>
                          {markup.validTo && (
                            <div className="text-gray-500">
                              to {new Date(markup.validTo).toLocaleDateString()}
                            </div>
                          )}
                        </div>
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
                              onClick={() => openDialog(markup)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmMarkup(markup)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMarkups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No sightseeing markups found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {editingMarkup
                ? "Edit Sightseeing Markup"
                : "Add Sightseeing Markup"}
            </DialogTitle>
            <DialogDescription>
              {editingMarkup
                ? "Update the sightseeing markup configuration"
                : "Create a new markup rule for sightseeing experiences"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationCode">Destination Code *</Label>
                    <Input
                      id="destinationCode"
                      placeholder="e.g., DXB, LON, PAR"
                      value={formData.destinationCode}
                      onChange={(e) =>
                        handleInputChange(
                          "destinationCode",
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destinationName">Destination Name *</Label>
                    <Input
                      id="destinationName"
                      placeholder="e.g., Dubai, London, Paris"
                      value={formData.destinationName}
                      onChange={(e) =>
                        handleInputChange("destinationName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceType">Experience Type *</Label>
                    <Select
                      value={formData.experienceType}
                      onValueChange={(value) =>
                        handleInputChange("experienceType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🎪 All Types</SelectItem>
                        <SelectItem value="landmark">🏛️ Landmarks</SelectItem>
                        <SelectItem value="museum">🎨 Museums</SelectItem>
                        <SelectItem value="tour">🚌 Tours</SelectItem>
                        <SelectItem value="activity">🎯 Activities</SelectItem>
                        <SelectItem value="food">🍽️ Food & Dining</SelectItem>
                        <SelectItem value="culture">🎭 Cultural</SelectItem>
                        <SelectItem value="adventure">⛰️ Adventure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceName">
                      Specific Experience (Optional)
                    </Label>
                    <Input
                      id="experienceName"
                      placeholder="e.g., Burj Khalifa, Desert Safari"
                      value={formData.experienceName}
                      onChange={(e) =>
                        handleInputChange("experienceName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="markupType">Markup Type *</Label>
                    <Select
                      value={formData.markupType}
                      onValueChange={(value) =>
                        handleInputChange("markupType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markupValue">Markup Value *</Label>
                    <Input
                      id="markupValue"
                      type="number"
                      min="0"
                      step={formData.markupType === "percentage" ? "0.1" : "1"}
                      placeholder={
                        formData.markupType === "percentage" ? "15.0" : "25"
                      }
                      value={formData.markupValue || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "markupValue",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        handleInputChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Price (Optional)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      placeholder="e.g., 50"
                      value={formData.minPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "minPrice",
                          parseFloat(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price (Optional)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      placeholder="e.g., 500"
                      value={formData.maxPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "maxPrice",
                          parseFloat(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority.toString()}
                      onValueChange={(value) =>
                        handleInputChange("priority", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Highest)</SelectItem>
                        <SelectItem value="2">2 (High)</SelectItem>
                        <SelectItem value="3">3 (Medium)</SelectItem>
                        <SelectItem value="4">4 (Low)</SelectItem>
                        <SelectItem value="5">5 (Lowest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        handleInputChange("validFrom", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validTo">Valid To (Optional)</Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) =>
                        handleInputChange("validTo", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this markup rule..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                  <span className="text-sm text-gray-500">
                    (Inactive markups won't be applied to bookings)
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingMarkup ? "Update Markup" : "Create Markup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmMarkup}
        onOpenChange={() => setDeleteConfirmMarkup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the markup for "
              {deleteConfirmMarkup?.destinationName}" - "
              {deleteConfirmMarkup?.experienceType}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmMarkup(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmMarkup && handleDelete(deleteConfirmMarkup)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Markup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
