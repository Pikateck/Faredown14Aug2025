import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings");
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
                        <span>BOM → DXB</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Sat, Aug 3 • 10:15 - 13:45</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Plane className="w-4 h-4" />
                        <span>Emirates EK 508</span>
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
                        <span>Emirates EK 509</span>
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
Emirates EK 508
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
    <div className="min-h-screen bg-gray-50">
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
                        <Link to="/my-account" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          My account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/account/trips" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Bookings & Trips
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

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors",
                    activeTab === "bookings"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <Plane className="w-4 h-4" />
                  <span>My Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors",
                    activeTab === "profile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors",
                    activeTab === "settings"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bookings" && renderBookings()}
            {activeTab === "profile" && renderProfile()}
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
    </div>
  );
}
