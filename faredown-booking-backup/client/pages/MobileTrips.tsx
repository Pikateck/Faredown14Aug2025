import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share,
  Eye,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Star,
  Gift,
  User,
  Mail,
  Phone,
  Bell,
  Settings,
} from "lucide-react";

const MobileTrips: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "profile">(
    "upcoming",
  );

  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = JSON.parse(
      localStorage.getItem("faredownBookings") || "[]",
    );
    setBookings(savedBookings);
  }, []);

  const upcomingBookings = bookings.filter(() => true); // For demo, all are upcoming
  const pastBookings: any[] = []; // For demo

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const viewTicket = (booking: any) => {
    navigate("/mobile-ticket-view", { state: { booking } });
  };

  return (
    <MobileLayout title="My Trips">
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === "upcoming"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Upcoming
              {upcomingBookings.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {upcomingBookings.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === "past"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Past Trips
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "upcoming" && (
          <>
            {upcomingBookings.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Upcoming Trips
                </h3>
                <p className="text-gray-600 mb-6">
                  Ready for your next adventure? Start by booking a flight.
                </p>
                <Button
                  onClick={() => navigate("/mobile-search")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book a Flight
                </Button>
              </div>
            ) : (
              <div className="px-4 space-y-4">
                {/* Search and Filter */}
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                {/* Booking Cards */}
                {upcomingBookings.map((booking, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              Emirates Airlines
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.bookingDetails.bookingRef}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={getStatusColor("Confirmed")}
                          variant="outline"
                        >
                          Confirmed
                        </Badge>
                      </div>

                      {/* Bargain Success Indicator */}
                      {booking.bookingDetails.bargainSuccess && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              Bargain Success!
                            </span>
                            <span className="text-sm text-orange-600">
                              Saved ₹
                              {(
                                25000 - booking.bookingDetails.totalAmount
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Flight Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Mumbai → Dubai</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Sat, Aug 16, 2024</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            10:15 AM - 11:45 AM (2h 25m)
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          Total Paid:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{booking.bookingDetails.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewTicket(booking)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "past" && (
          <div className="px-4 py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Past Trips
            </h3>
            <p className="text-gray-600">
              Your completed trips will appear here.
            </p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="px-4 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Welcome to Faredown
                </h2>
                <p className="text-gray-600 mb-4">
                  Bargain smarter, travel better
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {bookings.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹
                      {bookings
                        .reduce(
                          (total, booking) =>
                            total +
                            (25000 - booking.bookingDetails.totalAmount),
                          0,
                        )
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Menu */}
            <div className="space-y-2">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Personal Details</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Bargain History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Rate Us</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>
            </div>

            {/* App Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Faredown App v1.0
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  The World's First Online Travel Bargain Portal™
                </p>
                <div className="text-xs text-gray-500">
                  © 2024 Faredown Technologies
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileTrips;
