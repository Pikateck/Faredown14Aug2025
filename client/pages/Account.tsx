import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import LoyaltyOverview from "@/components/loyalty/LoyaltyOverview";
import LoyaltyHistory from "@/components/loyalty/LoyaltyHistory";
import DigitalMembershipCard from "@/components/loyalty/DigitalMembershipCard";
import {
  Plane,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Download,
  Eye,
  ArrowLeft,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  Bell,
  Shield,
  Gift,
  Edit,
  Save,
  X,
  ChevronDown,
  Menu,
  LogOut,
  BookOpen,
  Award,
  Heart,
  CheckCircle,
  Plus,
  Hotel,
  Camera,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Account() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "bookings",
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedCurrency] = useState({ code: "INR", symbol: "₹" });
  const [isLoggedIn] = useState(true);
  const [userName] = useState("Zubin Aibara");

  // Settings modal states
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  // Email notification settings
  const [emailSettings, setEmailSettings] = useState({
    bookingConfirmations: true,
    flightUpdates: true,
    promotions: false,
    weeklyDeals: true,
    priceAlerts: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  // Saved profiles management
  const [savedProfiles, setSavedProfiles] = useState(() => {
    const saved = localStorage.getItem("customer_profiles");
    const profiles = saved ? JSON.parse(saved) : [];

    // Ensure all profiles have unique IDs and remove any duplicates
    const uniqueProfiles = profiles.filter(
      (profile, index, self) =>
        index === self.findIndex((p) => p.id === profile.id),
    );

    return uniqueProfiles;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editingProfileData, setEditingProfileData] = useState({});

  // Edit profile functions
  const startEditingProfile = (profile) => {
    setEditingProfileId(profile.id);
    setEditingProfileData({ ...profile });
  };

  const cancelEditingProfile = () => {
    setEditingProfileId(null);
    setEditingProfileData({});
  };

  const saveEditedProfile = () => {
    const updatedProfileData = {
      ...editingProfileData,
      profileName:
        `${editingProfileData.firstName || ""} ${editingProfileData.lastName || ""}`.trim(),
    };

    const updatedProfiles = savedProfiles.map((profile) =>
      profile.id === editingProfileId ? updatedProfileData : profile,
    );
    setSavedProfiles(updatedProfiles);
    localStorage.setItem("customer_profiles", JSON.stringify(updatedProfiles));
    setEditingProfileId(null);
    setEditingProfileData({});
  };

  // Delete profile function
  const deleteProfile = (profileId) => {
    const updatedProfiles = savedProfiles.filter((p) => p.id !== profileId);
    setSavedProfiles(updatedProfiles);
    localStorage.setItem("customer_profiles", JSON.stringify(updatedProfiles));
    setShowDeleteConfirm(null);
  };

  // Save account holder as primary profile
  const saveAccountHolderProfile = () => {
    const accountProfile = {
      id: "account_holder_primary",
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      gender: "Male", // Default, can be updated
      type: "Adult",
      title: "Mr",
      nationality: "Indian",
      profileName: `${profileData.firstName} ${profileData.lastName}`,
      isAccountHolder: true,
      email: profileData.email,
      phone: profileData.phone,
      savedAt: new Date().toISOString(),
      mealPreference: "Veg",
      middleName: "",
      dateOfBirth: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      panCardNumber: "",
      address: "",
      pincode: "",
    };

    // Check if account holder profile already exists
    const existingAccountProfile = savedProfiles.find((p) => p.isAccountHolder);
    if (!existingAccountProfile) {
      const updatedProfiles = [accountProfile, ...savedProfiles];
      setSavedProfiles(updatedProfiles);
      localStorage.setItem(
        "customer_profiles",
        JSON.stringify(updatedProfiles),
      );
    }
  };

  // Payment methods (mock data)
  const [paymentMethods] = useState([
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2027",
      isDefault: true,
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8888",
      expiryMonth: "09",
      expiryYear: "2026",
      isDefault: false,
    },
  ]);

  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = JSON.parse(
      localStorage.getItem("faredownBookings") || "[]",
    );
    setBookings(savedBookings);
  }, []);

  useEffect(() => {
    // Update active tab based on URL parameter
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["bookings", "profile", "loyalty", "payment"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBookingStatus = (bookingDate) => {
    // For demo purposes, all bookings are confirmed
    return "Confirmed";
  };

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <div className="text-sm text-gray-600">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
          found
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your journey by booking your first flight
          </p>
          <Link to="/flights">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Search Flights
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Mumbai ⇄ Dubai
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Booking Reference: {booking.bookingDetails.bookingRef}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      {getBookingStatus(booking.bookingDetails.bookingDate)}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Booked on {formatDate(booking.bookingDetails.bookingDate)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Flight Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Outbound Flight
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>BOM ��� DXB</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Sat, Aug 3 • 10:15 - 13:45</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Plane className="w-4 h-4" />
                        <span>
                          {booking.flightDetails?.airline || "Airlines"}{" "}
                          {booking.flightDetails?.flightNumber || "FL-001"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Return Flight
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>DXB → BOM</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Sat, Aug 10 • 15:20 - 20:00</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Plane className="w-4 h-4" />
                        <span>
                          {booking.flightDetails?.airline || "Airlines"}{" "}
                          {booking.flightDetails?.returnFlightNumber ||
                            "FL-002"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Passengers
                    </h4>
                    <div className="space-y-2">
                      {booking.bookingDetails.passengers.map(
                        (passenger, pIndex) => (
                          <div key={pIndex} className="text-sm">
                            <div className="font-medium text-gray-900">
                              {passenger.firstName} {passenger.lastName}
                            </div>
                            <div className="text-gray-600">
                              Adult {pIndex + 1} •{" "}
                              {passenger.title || "Not specified"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-1">
                        Contact
                      </h5>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {booking.bookingDetails.contactDetails.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {
                            booking.bookingDetails.contactDetails.countryCode
                          }{" "}
                          {booking.bookingDetails.contactDetails.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Booking Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Paid</span>
                        <span className="font-semibold text-gray-900">
                          {booking.bookingDetails.currency.symbol}
                          {booking.bookingDetails.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID</span>
                        <span className="text-gray-900 font-mono text-xs">
                          {booking.paymentId?.slice(0, 12)}...
                        </span>
                      </div>
                      {booking.bookingDetails.selectedSeats &&
                        Object.keys(booking.bookingDetails.selectedSeats)
                          .length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Seats</span>
                            <span className="text-gray-900">
                              {Object.values(
                                booking.bookingDetails.selectedSeats,
                              ).join(", ")}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => alert("View ticket functionality")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Ticket
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          try {
                            // Generate ticket content
                            const ticketContent = `
FLIGHT TICKET
faredown.com

Booking Reference: ${booking.bookingDetails.bookingRef}
Date: ${formatDate(booking.bookingDetails.bookingDate)}

Flight Details:
Mumbai → Dubai
${booking.flightDetails?.airline || "Airlines"} ${booking.flightDetails?.flightNumber || "FL-001"}
Sat, Aug 3 • 10:15 - 13:45

Passenger: ${booking.bookingDetails.passengers[0]?.firstName} ${booking.bookingDetails.passengers[0]?.lastName}
Seat: ${Object.values(booking.bookingDetails.selectedSeats || {}).join(", ") || "To be assigned"}

Total Paid: ${booking.bookingDetails.currency.symbol}${booking.bookingDetails.totalAmount.toLocaleString()}

Please keep this ticket for your records.
                            `;

                            // Create and download the file
                            const blob = new Blob([ticketContent], {
                              type: "text/plain",
                            });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `flight-ticket-${booking.bookingDetails.bookingRef}.txt`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Download failed:", error);
                            alert("Download failed. Please try again.");
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        {!isEditingProfile ? (
          <Button
            onClick={() => setIsEditingProfile(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                setIsEditingProfile(false);
                // Save logic would go here
              }}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={() => setIsEditingProfile(false)}
              variant="outline"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {bookings.length > 0
                ? `${bookings[0].bookingDetails.passengers[0]?.firstName} ${bookings[0].bookingDetails.passengers[0]?.lastName}`
                : `${profileData.firstName} ${profileData.lastName}`}
            </h3>
            <p className="text-gray-600">Frequent Traveler</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Contact Information
            </h4>
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-600 mr-2" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-600 mr-2" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-600 mr-2" />
                  <span>
                    {bookings.length > 0
                      ? bookings[0].bookingDetails.contactDetails.email
                      : profileData.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-600 mr-2" />
                  <span>
                    {bookings.length > 0
                      ? `${bookings[0].bookingDetails.contactDetails.countryCode} ${bookings[0].bookingDetails.contactDetails.phone}`
                      : profileData.phone}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Travel Statistics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-medium">{bookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries Visited</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">Dec 2024</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Saved Traveller Profiles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Saved Traveller Profiles
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage your saved traveller information for faster bookings
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {savedProfiles.length + 1} profiles
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Account Holder Profile */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
            </div>

            <div className="flex items-start space-x-4 mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h4>
                <p className="text-sm text-blue-700 font-medium">
                  Account Holder • Adult
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-gray-600 font-medium">Email</span>
                </div>
                <p className="text-gray-900 truncate">{profileData.email}</p>
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Phone className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-gray-600 font-medium">Phone</span>
                </div>
                <p className="text-gray-900">{profileData.phone}</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-blue-700 bg-white/50 rounded-lg p-2">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Primary profile used for contact and billing
              </div>
            </div>
          </div>

          {/* Saved Traveller Profiles */}
          {savedProfiles.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Additional Profiles
              </h4>
              <p className="text-sm text-gray-600 mb-4 max-w-sm">
                Additional traveller profiles will appear here when you complete
                bookings with different passenger details
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                💡 Tip: Profiles are automatically saved during the booking
                process
              </div>
            </div>
          ) : (
            savedProfiles.map((profile, index) => (
              <div
                key={`${profile.id}-${index}`}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {profile.profileName}
                      </h4>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {profile.type || "Adult"}
                        </Badge>
                        {profile.gender}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingProfile(profile)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(profile.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete Profile"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingProfileId === profile.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Title
                        </Label>
                        <Select
                          value={editingProfileData.title || ""}
                          onValueChange={(value) =>
                            setEditingProfileData({
                              ...editingProfileData,
                              title: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            First Name
                          </Label>
                          <Input
                            value={editingProfileData.firstName || ""}
                            onChange={(e) =>
                              setEditingProfileData({
                                ...editingProfileData,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Last Name
                          </Label>
                          <Input
                            value={editingProfileData.lastName || ""}
                            onChange={(e) =>
                              setEditingProfileData({
                                ...editingProfileData,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Date of Birth
                        </Label>
                        <Input
                          type="date"
                          value={editingProfileData.dateOfBirth || ""}
                          onChange={(e) =>
                            setEditingProfileData({
                              ...editingProfileData,
                              dateOfBirth: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Gender
                          </Label>
                          <Select
                            value={editingProfileData.gender || ""}
                            onValueChange={(value) =>
                              setEditingProfileData({
                                ...editingProfileData,
                                gender: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Nationality
                          </Label>
                          <Input
                            value={editingProfileData.nationality || ""}
                            onChange={(e) =>
                              setEditingProfileData({
                                ...editingProfileData,
                                nationality: e.target.value,
                              })
                            }
                            placeholder="Nationality"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Passport Number
                        </Label>
                        <Input
                          value={editingProfileData.passportNumber || ""}
                          onChange={(e) =>
                            setEditingProfileData({
                              ...editingProfileData,
                              passportNumber: e.target.value,
                            })
                          }
                          placeholder="Passport number"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          PAN Card Number
                        </Label>
                        <Input
                          value={editingProfileData.panCardNumber || ""}
                          onChange={(e) =>
                            setEditingProfileData({
                              ...editingProfileData,
                              panCardNumber: e.target.value,
                            })
                          }
                          placeholder="PAN card number"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Meal Preference
                        </Label>
                        <Select
                          value={editingProfileData.mealPreference || ""}
                          onValueChange={(value) =>
                            setEditingProfileData({
                              ...editingProfileData,
                              mealPreference: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Veg">Vegetarian</SelectItem>
                            <SelectItem value="Non-Veg">
                              Non-Vegetarian
                            </SelectItem>
                            <SelectItem value="Vegan">Vegan</SelectItem>
                            <SelectItem value="Kosher">Kosher</SelectItem>
                            <SelectItem value="Halal">Halal</SelectItem>
                            <SelectItem value="No Preference">
                              No Preference
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={cancelEditingProfile}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={saveEditedProfile}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {profile.dateOfBirth && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">Date of Birth</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {new Date(profile.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {profile.nationality && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600 text-xs">
                              Nationality
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">
                            {profile.nationality}
                          </p>
                        </div>
                      )}

                      {profile.mealPreference && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Gift className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600 text-xs">
                              Meal Pref
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">
                            {profile.mealPreference}
                          </p>
                        </div>
                      )}
                    </div>

                    {profile.passportNumber && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">Passport</span>
                          </div>
                          <span className="font-medium text-gray-900 font-mono">
                            ***{profile.passportNumber.slice(-4)}
                          </span>
                        </div>
                      </div>
                    )}

                    {profile.panCardNumber && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">PAN Card</span>
                          </div>
                          <span className="font-medium text-gray-900 font-mono">
                            ***
                            {profile.panCardNumber?.slice(-4) || "Not provided"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Saved: {new Date(profile.savedAt).toLocaleDateString()}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      Ready to use
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderLoyalty = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Faredown Rewards</h2>
        <Link to="/membership-card">
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            View Card
          </Button>
        </Link>
      </div>

      {/* Main Loyalty Overview */}
      <LoyaltyOverview />

      {/* Digital Membership Card Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Digital Membership Card
        </h3>
        <div className="max-w-md">
          <DigitalMembershipCard variant="compact" showActions={false} />
        </div>
        <div className="mt-4">
          <Link to="/membership-card">
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              View Full Card & Benefits
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Points Activity
        </h3>
        <LoyaltyHistory />
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment & Wallet</h2>

      {/* Wallet Balance */}
      <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Wallet Balance</h3>
            <p className="text-green-100">Use for instant bookings</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">₹0</div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-green-600 border-white hover:bg-white"
            >
              Add Money
            </Button>
          </div>
        </div>
      </Card>

      {/* Saved Payment Methods */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Saved Payment Methods</h3>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">
                      {method.type} •••• {method.last4}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Your payment history will appear here</p>
          </div>
        </div>
      </Card>

      {/* Rewards & Cashback */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">Rewards & Cashback</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700">₹0</div>
            <div className="text-sm text-yellow-600">Cashback Earned</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">0</div>
            <div className="text-sm text-blue-600">Reward Points</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="grid gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Receive booking confirmations and updates
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailSettings(true)}
            >
              Manage
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Privacy & Security
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your privacy settings
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivacySettings(true)}
            >
              Configure
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-600">
                  Manage saved cards and payment options
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaymentSettings(true)}
            >
              Manage
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header - Landing Page Style */}
      <header
        className="text-white sticky top-0 z-40"
        style={{ backgroundColor: "#003580" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                faredown.com
              </span>
            </Link>

            {/* Centered Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/flights"
                className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
              >
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
              >
                <span>Hotels</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2 touch-manipulation"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Language and Currency */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <button className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1">
                  <span>English (UK)</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1"
                  >
                    <span>
                      {selectedCurrency.symbol} {selectedCurrency.code}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showCurrencyDropdown && (
                    <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48 max-h-60 overflow-y-auto">
                      {[
                        { code: "USD", symbol: "$", name: "US Dollar" },
                        { code: "EUR", symbol: "€", name: "Euro" },
                        { code: "GBP", symbol: "£", name: "British Pound" },
                        { code: "INR", symbol: "₹", name: "Indian Rupee" },
                        { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
                      ].map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-900 flex items-center justify-between"
                        >
                          <span>{currency.name}</span>
                          <span className="font-medium">
                            {currency.symbol} {currency.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-2 md:px-3 py-2 hover:bg-blue-800">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {userName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-white hidden sm:inline">
                        {userName}
                      </span>
                      <span className="text-xs text-yellow-300 hidden md:inline">
                        Loyalty Level 1
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Link to="/bookings" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="w-4 h-4 mr-2" />
                        Loyalty program
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          to="/account/payment"
                          className="flex items-center"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Rewards & Wallet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-blue-700 border-white hover:bg-gray-100 rounded text-xs md:text-sm font-medium px-2 md:px-4 py-1.5"
                    >
                      Register
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-800 text-white rounded text-xs md:text-sm font-medium px-2 md:px-4 py-1.5"
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden bg-blue-800 border-t border-blue-600">
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/flights"
                className="flex items-center space-x-2 text-white py-2 border-b border-blue-600"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="flex items-center space-x-2 text-white py-2 border-b border-blue-600"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>Hotels</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-2 lg:p-4">
              <nav className="lg:space-y-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-2 lg:space-x-0 pb-2 lg:pb-0">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={cn(
                    "lg:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium min-w-fit",
                    activeTab === "bookings"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Plane className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline lg:inline">
                    My Bookings
                  </span>
                  <span className="sm:hidden">Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "lg:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium min-w-fit",
                    activeTab === "profile"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("loyalty")}
                  className={cn(
                    "lg:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium min-w-fit",
                    activeTab === "loyalty"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Award className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline lg:inline">
                    Loyalty Program
                  </span>
                  <span className="sm:hidden">Loyalty</span>
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={cn(
                    "lg:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium min-w-fit",
                    activeTab === "payment"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline lg:inline">
                    Payment & Wallet
                  </span>
                  <span className="sm:hidden">Payment</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={cn(
                    "lg:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium min-w-fit",
                    activeTab === "settings"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>Settings</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bookings" && renderBookings()}
            {activeTab === "profile" && renderProfile()}
            {activeTab === "loyalty" && renderLoyalty()}
            {activeTab === "payment" && renderPayment()}
            {activeTab === "settings" && renderSettings()}
          </div>
        </div>
      </div>

      {/* Email Notifications Settings Modal */}
      <Dialog open={showEmailSettings} onOpenChange={setShowEmailSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Email Notifications
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Booking Confirmations</p>
                  <p className="text-sm text-gray-600">
                    Get notified when your booking is confirmed
                  </p>
                </div>
                <Switch
                  checked={emailSettings.bookingConfirmations}
                  onCheckedChange={(checked) =>
                    setEmailSettings({
                      ...emailSettings,
                      bookingConfirmations: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Flight Updates</p>
                  <p className="text-sm text-gray-600">
                    Gate changes, delays, and cancellations
                  </p>
                </div>
                <Switch
                  checked={emailSettings.flightUpdates}
                  onCheckedChange={(checked) =>
                    setEmailSettings({
                      ...emailSettings,
                      flightUpdates: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions & Offers</p>
                  <p className="text-sm text-gray-600">
                    Special deals and discount offers
                  </p>
                </div>
                <Switch
                  checked={emailSettings.promotions}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, promotions: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Deals</p>
                  <p className="text-sm text-gray-600">
                    Best deals of the week
                  </p>
                </div>
                <Switch
                  checked={emailSettings.weeklyDeals}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, weeklyDeals: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Alerts</p>
                  <p className="text-sm text-gray-600">
                    Price drop notifications
                  </p>
                </div>
                <Switch
                  checked={emailSettings.priceAlerts}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, priceAlerts: checked })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowEmailSettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowEmailSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy & Security Settings Modal */}
      <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Privacy & Security
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Profile Visibility</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Control who can see your profile
                </p>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Sharing</p>
                  <p className="text-sm text-gray-600">
                    Share data with partner airlines
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataSharing}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      dataSharing: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics Tracking</p>
                  <p className="text-sm text-gray-600">
                    Help improve our service
                  </p>
                </div>
                <Switch
                  checked={privacySettings.analyticsTracking}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      analyticsTracking: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-600">
                    Receive marketing communications
                  </p>
                </div>
                <Switch
                  checked={privacySettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      marketingEmails: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">
                    Add extra security to your account
                  </p>
                </div>
                <Switch
                  checked={privacySettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      twoFactorAuth: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPrivacySettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowPrivacySettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Settings Modal */}
      <Dialog open={showPaymentSettings} onOpenChange={setShowPaymentSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Payment Methods
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {method.type === "Visa" ? "VISA" : "MC"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed">
                <CreditCard className="w-4 h-4 mr-2" />
                Add New Payment Method
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Payment Security</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All payment information is encrypted</li>
                <li>• We use secure payment processors</li>
                <li>• Your card details are never stored on our servers</li>
                <li>• 24/7 fraud monitoring and protection</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPaymentSettings(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Plane className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Flights</span>
          </Link>
          <Link
            to="/hotels"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Hotel className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Hotels</span>
          </Link>
          <Link
            to="/sightseeing"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Camera className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Sightseeing</span>
          </Link>
          <Link
            to="/saved"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Saved</span>
          </Link>
          <Link
            to="/account"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <User className="w-5 h-5 text-[#003580]" />
            <span className="text-xs text-[#003580] font-medium">Account</span>
          </Link>
        </div>
      </div>

      {/* Delete Profile Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm !== null}
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this saved profile? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteProfile(showDeleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <MobileNavigation />
    </div>
  );
}
