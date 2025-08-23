import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface SightseeingItem {
  id: string;
  activity_id: string;
  name: string;
  category: string;
  destination: string;
  duration: number;
  price: number;
  currency: string;
  rating: number;
  image_url: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  available_times: string[];
  min_capacity: number;
  max_capacity: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface SightseeingBooking {
  id: string;
  booking_reference: string;
  activity_id: string;
  activity_name: string;
  user_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  visit_date: string;
  selected_time: string;
  guest_count: number;
  total_price: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  voucher_code: string;
  special_requests: string;
  created_at: string;
  updated_at: string;
}

interface MarkupRule {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  conditions: {
    destination?: string;
    category?: string;
    price_range?: { min: number; max: number };
    date_range?: { start: string; end: string };
  };
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_booking_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SightseeingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("activities");
  const [activities, setActivities] = useState<SightseeingItem[]>([]);
  const [bookings, setBookings] = useState<SightseeingBooking[]>([]);
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMarkupModalOpen, setIsMarkupModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<SightseeingItem | null>(null);
  const [editingMarkup, setEditingMarkup] = useState<MarkupRule | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form states
  const [activityForm, setActivityForm] = useState({
    name: "",
    category: "",
    destination: "",
    duration: 0,
    price: 0,
    currency: "USD",
    description: "",
    inclusions: "",
    exclusions: "",
    available_times: "",
    min_capacity: 1,
    max_capacity: 10,
    status: "active" as "active" | "inactive",
  });

  const [markupForm, setMarkupForm] = useState({
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    destination: "",
    category: "",
    price_min: 0,
    price_max: 0,
    date_start: "",
    date_end: "",
    priority: 1,
    is_active: true,
  });

  const [promoForm, setPromoForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    min_booking_amount: 0,
    max_discount_amount: 0,
    usage_limit: 100,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  // Statistics
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeActivities: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    activePromoCodes: 0,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "activities":
          await fetchActivities();
          break;
        case "bookings":
          await fetchBookings();
          break;
        case "markup":
          await fetchMarkupRules();
          break;
        case "promos":
          await fetchPromoCodes();
          break;
      }
      await fetchStats();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/sightseeing/activities");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/sightseeing/bookings");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchMarkupRules = async () => {
    try {
      const response = await fetch("/api/admin/sightseeing/markup-rules");
      const data = await response.json();
      setMarkupRules(data);
    } catch (error) {
      console.error("Error fetching markup rules:", error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/admin/sightseeing/promo-codes");
      const data = await response.json();
      setPromoCodes(data);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/sightseeing/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSaveActivity = async () => {
    try {
      const url = editingActivity
        ? `/api/admin/sightseeing/activities/${editingActivity.id}`
        : "/api/admin/sightseeing/activities";

      const method = editingActivity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activityForm,
          inclusions: activityForm.inclusions.split(",").map((i) => i.trim()),
          exclusions: activityForm.exclusions.split(",").map((i) => i.trim()),
          available_times: activityForm.available_times
            .split(",")
            .map((i) => i.trim()),
        }),
      });

      if (response.ok) {
        setIsActivityModalOpen(false);
        setEditingActivity(null);
        setActivityForm({
          name: "",
          category: "",
          destination: "",
          duration: 0,
          price: 0,
          currency: "USD",
          description: "",
          inclusions: "",
          exclusions: "",
          available_times: "",
          min_capacity: 1,
          max_capacity: 10,
          status: "active",
        });
        await fetchActivities();
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleSaveMarkupRule = async () => {
    try {
      const url = editingMarkup
        ? `/api/admin/sightseeing/markup-rules/${editingMarkup.id}`
        : "/api/admin/sightseeing/markup-rules";

      const method = editingMarkup ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...markupForm,
          conditions: {
            destination: markupForm.destination || undefined,
            category: markupForm.category || undefined,
            price_range:
              markupForm.price_min > 0 || markupForm.price_max > 0
                ? { min: markupForm.price_min, max: markupForm.price_max }
                : undefined,
            date_range:
              markupForm.date_start && markupForm.date_end
                ? { start: markupForm.date_start, end: markupForm.date_end }
                : undefined,
          },
        }),
      });

      if (response.ok) {
        setIsMarkupModalOpen(false);
        setEditingMarkup(null);
        setMarkupForm({
          name: "",
          type: "percentage",
          value: 0,
          destination: "",
          category: "",
          price_min: 0,
          price_max: 0,
          date_start: "",
          date_end: "",
          priority: 1,
          is_active: true,
        });
        await fetchMarkupRules();
      }
    } catch (error) {
      console.error("Error saving markup rule:", error);
    }
  };

  const handleSavePromoCode = async () => {
    try {
      const url = editingPromo
        ? `/api/admin/sightseeing/promo-codes/${editingPromo.id}`
        : "/api/admin/sightseeing/promo-codes";

      const method = editingPromo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoForm),
      });

      if (response.ok) {
        setIsPromoModalOpen(false);
        setEditingPromo(null);
        setPromoForm({
          code: "",
          type: "percentage",
          value: 0,
          min_booking_amount: 0,
          max_discount_amount: 0,
          usage_limit: 100,
          valid_from: "",
          valid_until: "",
          is_active: true,
        });
        await fetchPromoCodes();
      }
    } catch (error) {
      console.error("Error saving promo code:", error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      try {
        const response = await fetch(
          `/api/admin/sightseeing/activities/${id}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          await fetchActivities();
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    }
  };

  const handleDeleteMarkupRule = async (id: string) => {
    if (confirm("Are you sure you want to delete this markup rule?")) {
      try {
        const response = await fetch(
          `/api/admin/sightseeing/markup-rules/${id}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          await fetchMarkupRules();
        }
      } catch (error) {
        console.error("Error deleting markup rule:", error);
      }
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      try {
        const response = await fetch(
          `/api/admin/sightseeing/promo-codes/${id}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          await fetchPromoCodes();
        }
      } catch (error) {
        console.error("Error deleting promo code:", error);
      }
    }
  };

  const editActivity = (activity: SightseeingItem) => {
    setEditingActivity(activity);
    setActivityForm({
      name: activity.name,
      category: activity.category,
      destination: activity.destination,
      duration: activity.duration,
      price: activity.price,
      currency: activity.currency,
      description: activity.description,
      inclusions: activity.inclusions.join(", "),
      exclusions: activity.exclusions.join(", "),
      available_times: activity.available_times.join(", "),
      min_capacity: activity.min_capacity,
      max_capacity: activity.max_capacity,
      status: activity.status,
    });
    setIsActivityModalOpen(true);
  };

  const editMarkupRule = (rule: MarkupRule) => {
    setEditingMarkup(rule);
    setMarkupForm({
      name: rule.name,
      type: rule.type,
      value: rule.value,
      destination: rule.conditions.destination || "",
      category: rule.conditions.category || "",
      price_min: rule.conditions.price_range?.min || 0,
      price_max: rule.conditions.price_range?.max || 0,
      date_start: rule.conditions.date_range?.start || "",
      date_end: rule.conditions.date_range?.end || "",
      priority: rule.priority,
      is_active: rule.is_active,
    });
    setIsMarkupModalOpen(true);
  };

  const editPromoCode = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      min_booking_amount: promo.min_booking_amount,
      max_discount_amount: promo.max_discount_amount,
      usage_limit: promo.usage_limit,
      valid_from: promo.valid_from,
      valid_until: promo.valid_until,
      is_active: promo.is_active,
    });
    setIsPromoModalOpen(true);
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.booking_reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.activity_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sightseeing Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeActivities} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePromoCodes}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="markup">Markup Rules</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
        </TabsList>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsActivityModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={activity.image_url}
                          alt={activity.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Rating: {activity.rating}/5
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{activity.category}</TableCell>
                    <TableCell>{activity.destination}</TableCell>
                    <TableCell>{activity.duration}h</TableCell>
                    <TableCell>
                      {activity.currency} {activity.price}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.status === "active" ? "default" : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => editActivity(activity)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono">
                      {booking.booking_reference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.guest_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.guest_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.activity_name}</TableCell>
                    <TableCell>
                      <div>
                        <div>
                          {new Date(booking.visit_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.selected_time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.guest_count}</TableCell>
                    <TableCell>
                      {booking.currency} {booking.total_price}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.payment_status === "paid"
                            ? "default"
                            : booking.payment_status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Markup Rules Tab */}
        <TabsContent value="markup" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Markup Rules</h2>
            <Button onClick={() => setIsMarkupModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Markup Rule
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {markupRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {rule.type === "percentage"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.type === "percentage"
                        ? `${rule.value}%`
                        : `$${rule.value}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rule.conditions.destination && (
                          <div>Destination: {rule.conditions.destination}</div>
                        )}
                        {rule.conditions.category && (
                          <div>Category: {rule.conditions.category}</div>
                        )}
                        {rule.conditions.price_range && (
                          <div>
                            Price: ${rule.conditions.price_range.min} - $
                            {rule.conditions.price_range.max}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => editMarkupRule(rule)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMarkupRule(rule.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Promo Codes</h2>
            <Button onClick={() => setIsPromoModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Promo Code
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-bold">
                      {promo.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promo.type === "percentage"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.type === "percentage"
                        ? `${promo.value}%`
                        : `$${promo.value}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {promo.used_count}/{promo.usage_limit}
                        </div>
                        <div className="text-muted-foreground">
                          {Math.round(
                            (promo.used_count / promo.usage_limit) * 100,
                          )}
                          % used
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {new Date(promo.valid_from).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          to {new Date(promo.valid_until).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={promo.is_active ? "default" : "secondary"}
                      >
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => editPromoCode(promo)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePromoCode(promo.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Edit Activity" : "Add New Activity"}
            </DialogTitle>
            <DialogDescription>
              Configure activity details and availability.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Activity Name</Label>
                <Input
                  id="name"
                  value={activityForm.name}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={activityForm.category}
                  onValueChange={(value) =>
                    setActivityForm({ ...activityForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tours">Tours</SelectItem>
                    <SelectItem value="attractions">Attractions</SelectItem>
                    <SelectItem value="experiences">Experiences</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={activityForm.destination}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      destination: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={activityForm.duration}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      duration: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={activityForm.price}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={activityForm.description}
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="inclusions">Inclusions (comma-separated)</Label>
                <Textarea
                  id="inclusions"
                  value={activityForm.inclusions}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      inclusions: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exclusions">Exclusions (comma-separated)</Label>
                <Textarea
                  id="exclusions"
                  value={activityForm.exclusions}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      exclusions: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="available_times">
                Available Times (comma-separated)
              </Label>
              <Input
                id="available_times"
                value={activityForm.available_times}
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    available_times: e.target.value,
                  })
                }
                placeholder="09:00, 11:00, 14:00, 16:00"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_capacity">Min Capacity</Label>
                <Input
                  id="min_capacity"
                  type="number"
                  value={activityForm.min_capacity}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      min_capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={activityForm.max_capacity}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      max_capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={activityForm.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setActivityForm({ ...activityForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActivityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveActivity}>
              {editingActivity ? "Update" : "Create"} Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Markup Rule Modal */}
      <Dialog open={isMarkupModalOpen} onOpenChange={setIsMarkupModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMarkup ? "Edit Markup Rule" : "Add New Markup Rule"}
            </DialogTitle>
            <DialogDescription>
              Create rules to automatically adjust pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="markup-name">Rule Name</Label>
              <Input
                id="markup-name"
                value={markupForm.name}
                onChange={(e) =>
                  setMarkupForm({ ...markupForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="markup-type">Type</Label>
                <Select
                  value={markupForm.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setMarkupForm({ ...markupForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="markup-value">Value</Label>
                <Input
                  id="markup-value"
                  type="number"
                  value={markupForm.value}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="markup-destination">
                  Destination (optional)
                </Label>
                <Input
                  id="markup-destination"
                  value={markupForm.destination}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      destination: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="markup-category">Category (optional)</Label>
                <Input
                  id="markup-category"
                  value={markupForm.category}
                  onChange={(e) =>
                    setMarkupForm({ ...markupForm, category: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price-min">Min Price (optional)</Label>
                <Input
                  id="price-min"
                  type="number"
                  value={markupForm.price_min}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      price_min: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price-max">Max Price (optional)</Label>
                <Input
                  id="price-max"
                  type="number"
                  value={markupForm.price_max}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      price_max: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={markupForm.priority}
                onChange={(e) =>
                  setMarkupForm({
                    ...markupForm,
                    priority: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="markup-active"
                checked={markupForm.is_active}
                onCheckedChange={(checked) =>
                  setMarkupForm({ ...markupForm, is_active: checked })
                }
              />
              <Label htmlFor="markup-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMarkupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMarkupRule}>
              {editingMarkup ? "Update" : "Create"} Markup Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Code Modal */}
      <Dialog open={isPromoModalOpen} onOpenChange={setIsPromoModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? "Edit Promo Code" : "Add New Promo Code"}
            </DialogTitle>
            <DialogDescription>
              Create promotional codes for discounts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input
                id="promo-code"
                value={promoForm.code}
                onChange={(e) =>
                  setPromoForm({
                    ...promoForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="SUMMER20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-type">Type</Label>
                <Select
                  value={promoForm.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setPromoForm({ ...promoForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-value">Value</Label>
                <Input
                  id="promo-value"
                  type="number"
                  value={promoForm.value}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min-booking">Min Booking Amount</Label>
                <Input
                  id="min-booking"
                  type="number"
                  value={promoForm.min_booking_amount}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      min_booking_amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-discount">Max Discount Amount</Label>
                <Input
                  id="max-discount"
                  type="number"
                  value={promoForm.max_discount_amount}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      max_discount_amount: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="usage-limit">Usage Limit</Label>
              <Input
                id="usage-limit"
                type="number"
                value={promoForm.usage_limit}
                onChange={(e) =>
                  setPromoForm({
                    ...promoForm,
                    usage_limit: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={promoForm.valid_from}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, valid_from: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={promoForm.valid_until}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, valid_until: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="promo-active"
                checked={promoForm.is_active}
                onCheckedChange={(checked) =>
                  setPromoForm({ ...promoForm, is_active: checked })
                }
              />
              <Label htmlFor="promo-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePromoCode}>
              {editingPromo ? "Update" : "Create"} Promo Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SightseeingManagement;
