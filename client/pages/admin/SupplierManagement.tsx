import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supplierService, Supplier, SyncLog } from "@/services/supplierService";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  Eye,
  Download,
  AlertTriangle,
  Briefcase,
  Globe,
  Key,
  Calendar,
  BarChart3,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  type: "flight" | "hotel" | "car" | "package";
  status: "active" | "inactive" | "testing";
  apiEndpoint: string;
  lastSync: string;
  totalBookings: number;
  successRate: number;
  averageResponseTime: number;
  credentials: {
    apiKey: string;
    secret: string;
    username?: string;
    password?: string;
  };
  configuration: {
    contentAPI?: string;
    bookingAPI?: string;
    timeoutMs: number;
    retryAttempts: number;
    cacheEnabled: boolean;
    syncFrequency: string;
  };
  supportedCurrencies: string[];
  supportedDestinations: string[];
  markup: {
    defaultPercentage: number;
    minPercentage: number;
    maxPercentage: number;
  };
}

interface SyncLog {
  id: string;
  supplierId: string;
  timestamp: string;
  status: "success" | "failed" | "partial";
  recordsProcessed: number;
  duration: number;
  errors: string[];
  details: string;
}

// Enhanced supplier interface to match API response
interface EnhancedSupplier extends Supplier {
  code: string;
  environment: string;
  healthStatus: string;
  credentialProfile: string;
  recentSyncs?: number;
  successfulSyncs?: number;
  failedSyncs?: number;
  lastSyncAttempt?: string;
  lastSyncStatus?: string;
  credentials: {
    profileName: string;
    hasApiKey: boolean;
    hasApiSecret: boolean;
    configuredEnvironment: string;
  };
}

// Analytics interface to match API response
interface SupplierAnalytics {
  totalSuppliers: number;
  activeSuppliers: number;
  testingSuppliers: number;
  disabledSuppliers: number;
  healthySuppliers: number;
  degradedSuppliers: number;
  downSuppliers: number;
  averageSuccessRate: number;
  averageResponseTime: number;
  supplierTypes: {
    hotel: number;
    flight: number;
    car: number;
    package: number;
  };
  recentSyncs: SyncLog[];
}

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<EnhancedSupplier[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
  const [selectedSupplier, setSelectedSupplier] =
    useState<EnhancedSupplier | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingSupplier, setSyncingSupplier] = useState<string | null>(null);
  const [testingSupplier, setTestingSupplier] = useState<string | null>(null);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadSuppliers(), loadSyncLogs(), loadAnalytics()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const suppliersData = await supplierService.getSuppliers();
      setSuppliers(suppliersData as EnhancedSupplier[]);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      // Use empty array on error to prevent crashes
      setSuppliers([]);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const logsData = await supplierService.getSyncLogs();
      setSyncLogs(logsData);
    } catch (error) {
      console.error("Failed to load sync logs:", error);
      setSyncLogs([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await supplierService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // Provide fallback analytics data when API fails
      setAnalytics({
        totalSuppliers: suppliers.length,
        activeSuppliers: suppliers.filter((s) => s.status === "active").length,
        testingSuppliers: suppliers.filter((s) => s.status === "testing")
          .length,
        disabledSuppliers: suppliers.filter((s) => s.status === "disabled")
          .length,
        healthySuppliers: 0,
        degradedSuppliers: 0,
        downSuppliers: 0,
        averageSuccessRate:
          suppliers.length > 0
            ? suppliers.reduce((acc, s) => acc + s.successRate, 0) /
              suppliers.length
            : 0,
        averageResponseTime:
          suppliers.length > 0
            ? suppliers.reduce((acc, s) => acc + s.averageResponseTime, 0) /
              suppliers.length
            : 0,
        supplierTypes: {
          hotel: suppliers.filter((s) => s.type === "hotel").length,
          flight: suppliers.filter((s) => s.type === "flight").length,
          car: suppliers.filter((s) => s.type === "car").length,
          package: suppliers.filter((s) => s.type === "package").length,
        },
        recentSyncs: [],
      });
    }
  };

  const handleAddSupplier = (newSupplier: Partial<Supplier>) => {
    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name || "",
      type: newSupplier.type || "hotel",
      status: "testing",
      apiEndpoint: newSupplier.apiEndpoint || "",
      lastSync: "",
      totalBookings: 0,
      successRate: 0,
      averageResponseTime: 0,
      credentials: newSupplier.credentials || { apiKey: "", secret: "" },
      configuration: {
        timeoutMs: 30000,
        retryAttempts: 3,
        cacheEnabled: true,
        syncFrequency: "daily",
        ...newSupplier.configuration,
      },
      supportedCurrencies: newSupplier.supportedCurrencies || [],
      supportedDestinations: newSupplier.supportedDestinations || [],
      markup: {
        defaultPercentage: 10,
        minPercentage: 5,
        maxPercentage: 20,
        ...newSupplier.markup,
      },
    };

    setSuppliers([...suppliers, supplier]);
    setIsAddDialogOpen(false);
  };

  const handleEditSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(
      suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)),
    );
    setIsEditDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
  };

  const handleToggleStatus = async (supplierId: string) => {
    try {
      const supplier = suppliers.find((s) => s.id === supplierId);
      if (!supplier) return;

      const newStatus = supplier.status === "active" ? "inactive" : "active";
      await supplierService.toggleSupplierStatus(supplierId, newStatus);

      // Update local state
      setSuppliers(
        suppliers.map((s) =>
          s.id === supplierId ? { ...s, status: newStatus } : s,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle supplier status:", error);
    }
  };

  const handleTestSupplier = async (supplierId: string) => {
    try {
      setTestingSupplier(supplierId);

      const testResult =
        await supplierService.testSupplierConnection(supplierId);

      // Reload data to get updated health status
      await loadSuppliers();
      await loadSyncLogs();

      console.log("Test completed:", testResult);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setTestingSupplier(null);
    }
  };

  const handleSyncSupplier = async (supplierId: string) => {
    try {
      setSyncingSupplier(supplierId);

      // Get default destination codes for sync - you can make this configurable
      const destinationCodes = ["DXB", "BOM", "DEL"]; // Dubai, Mumbai, Delhi

      const syncResult = await supplierService.syncSupplier(
        supplierId,
        destinationCodes,
        false,
      );

      // Reload all data to get updated metrics
      await loadAllData();

      console.log("Sync completed:", syncResult);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncingSupplier(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "testing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      case "testing":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "partial":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Supplier Management
          </h2>
          <p className="text-muted-foreground">
            Manage hotel and flight suppliers, API integrations, and data
            synchronization
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleAddSupplier}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Suppliers
                    </p>
                    <p className="text-2xl font-bold">
                      {analytics?.totalSuppliers || suppliers.length}
                    </p>
                  </div>
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics?.activeSuppliers ||
                        suppliers.filter((s) => s.status === "active").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Testing</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analytics?.testingSuppliers ||
                        suppliers.filter((s) => s.status === "testing").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Success Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {analytics?.averageSuccessRate?.toFixed(1) ||
                        (suppliers.length > 0
                          ? (
                              suppliers.reduce(
                                (acc, s) => acc + s.successRate,
                                0,
                              ) / suppliers.length
                            ).toFixed(1)
                          : "0.0")}
                      %
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supplier List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-xs text-gray-500">
                            {supplier.code}
                          </div>
                          <div className="text-xs text-blue-600">
                            {supplier.credentials?.profileName ||
                              "No credentials"}
                            {supplier.credentials?.hasApiKey &&
                            supplier.credentials?.hasApiSecret
                              ? " ✓"
                              : " ✗"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(supplier.status)}>
                            {getStatusIcon(supplier.status)}
                            <span className="ml-1">{supplier.status}</span>
                          </Badge>
                          {supplier.healthStatus && (
                            <div className="text-xs">
                              <Badge
                                variant="outline"
                                className={
                                  supplier.healthStatus === "healthy"
                                    ? "text-green-600"
                                    : supplier.healthStatus === "degraded"
                                      ? "text-yellow-600"
                                      : supplier.healthStatus === "down"
                                        ? "text-red-600"
                                        : "text-gray-600"
                                }
                              >
                                {supplier.healthStatus}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {supplier.environment || "sandbox"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {supplier.lastSync ? (
                          <div className="text-sm">
                            {new Date(supplier.lastSync).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(supplier.lastSync).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {supplier.successRate}%
                          </span>
                          <div className="ml-2 w-16 h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${supplier.successRate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.totalBookings.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestSupplier(supplier.id)}
                            disabled={testingSupplier === supplier.id}
                            title="Test Connection"
                          >
                            {testingSupplier === supplier.id ? (
                              <Activity className="w-4 h-4 animate-pulse" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSyncSupplier(supplier.id)}
                            disabled={syncingSupplier === supplier.id}
                            title="Sync Data"
                          >
                            {syncingSupplier === supplier.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setIsEditDialogOpen(true);
                            }}
                            title="Edit Supplier"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={supplier.status === "active"}
                            onCheckedChange={() =>
                              handleToggleStatus(supplier.id)
                            }
                            title="Toggle Active Status"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => {
                    const supplier = suppliers.find(
                      (s) => s.id === log.supplierId,
                    );
                    return (
                      <TableRow key={log.id}>
                        <TableCell>{supplier?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.timestamp).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSyncStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          {log.errors.length > 0 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />
                          )}
                        </TableCell>
                        <TableCell>
                          {log.recordsProcessed.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {(log.duration / 1000).toFixed(1)}s
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {log.details}
                          </div>
                          {log.errors.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {log.errors.length} error(s)
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">
                          {supplier.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {supplier.successRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {supplier.totalBookings} bookings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">
                          {supplier.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {supplier.averageResponseTime}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          avg response
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierForm
              supplier={selectedSupplier}
              onSubmit={handleEditSupplier}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Supplier Form Component
function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
}: {
  supplier?: Supplier;
  onSubmit: (supplier: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: supplier?.name || "",
    type: supplier?.type || "hotel",
    apiEndpoint: supplier?.apiEndpoint || "",
    apiKey: supplier?.credentials?.apiKey || "",
    secret: supplier?.credentials?.secret || "",
    contentAPI: supplier?.configuration?.contentAPI || "",
    bookingAPI: supplier?.configuration?.bookingAPI || "",
    timeoutMs: supplier?.configuration?.timeoutMs || 30000,
    retryAttempts: supplier?.configuration?.retryAttempts || 3,
    cacheEnabled: supplier?.configuration?.cacheEnabled || true,
    syncFrequency: supplier?.configuration?.syncFrequency || "daily",
    defaultPercentage: supplier?.markup?.defaultPercentage || 10,
    minPercentage: supplier?.markup?.minPercentage || 5,
    maxPercentage: supplier?.markup?.maxPercentage || 20,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const supplierData = {
      ...supplier,
      name: formData.name,
      type: formData.type,
      apiEndpoint: formData.apiEndpoint,
      credentials: {
        apiKey: formData.apiKey,
        secret: formData.secret,
      },
      configuration: {
        contentAPI: formData.contentAPI,
        bookingAPI: formData.bookingAPI,
        timeoutMs: formData.timeoutMs,
        retryAttempts: formData.retryAttempts,
        cacheEnabled: formData.cacheEnabled,
        syncFrequency: formData.syncFrequency,
      },
      markup: {
        defaultPercentage: formData.defaultPercentage,
        minPercentage: formData.minPercentage,
        maxPercentage: formData.maxPercentage,
      },
    };

    onSubmit(supplierData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Supplier Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Hotelbeds"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData({ ...formData, type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="car">Car Rental</SelectItem>
              <SelectItem value="package">Package</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">API Endpoint</label>
        <Input
          value={formData.apiEndpoint}
          onChange={(e) =>
            setFormData({ ...formData, apiEndpoint: e.target.value })
          }
          placeholder="https://api.supplier.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData({ ...formData, apiKey: e.target.value })
            }
            placeholder="API Key"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Secret</label>
          <Input
            type="password"
            value={formData.secret}
            onChange={(e) =>
              setFormData({ ...formData, secret: e.target.value })
            }
            placeholder="Secret Key"
            required
          />
        </div>
      </div>

      {formData.type === "hotel" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Content API URL</label>
            <Input
              value={formData.contentAPI}
              onChange={(e) =>
                setFormData({ ...formData, contentAPI: e.target.value })
              }
              placeholder="Content API endpoint"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Booking API URL</label>
            <Input
              value={formData.bookingAPI}
              onChange={(e) =>
                setFormData({ ...formData, bookingAPI: e.target.value })
              }
              placeholder="Booking API endpoint"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Default Markup %</label>
          <Input
            type="number"
            value={formData.defaultPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                defaultPercentage: parseInt(e.target.value),
              })
            }
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Min Markup %</label>
          <Input
            type="number"
            value={formData.minPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                minPercentage: parseInt(e.target.value),
              })
            }
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Markup %</label>
          <Input
            type="number"
            value={formData.maxPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxPercentage: parseInt(e.target.value),
              })
            }
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{supplier ? "Update" : "Add"} Supplier</Button>
      </div>
    </form>
  );
}
