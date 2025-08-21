import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Plane,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Download,
  Share,
} from "lucide-react";

const MobileTrips = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trips");

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    avatar: "JD",
    memberSince: "2023",
    totalBookings: 12,
    totalSavings: 45000,
  };

  // Mock trips data
  const trips = [
    {
      id: 1,
      bookingRef: "FD123456",
      status: "upcoming",
      airline: "Indigo",
      logo: "🛩️",
      route: "Mumbai → Dubai",
      date: "2024-02-15",
      time: "06:30",
      passenger: "John Doe",
      price: 25890,
    },
    {
      id: 2,
      bookingRef: "FD123455",
      status: "completed",
      airline: "Emirates",
      logo: "✈️",
      route: "Delhi → London",
      date: "2024-01-20",
      time: "14:20",
      passenger: "John Doe",
      price: 45000,
    },
    {
      id: 3,
      bookingRef: "FD123454",
      status: "cancelled",
      airline: "Air India",
      logo: "🇮🇳",
      route: "Bangalore → Singapore",
      date: "2024-01-10",
      time: "22:10",
      passenger: "John Doe",
      price: 28000,
    },
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const renderTripsTab = () => (
    <div className="space-y-4">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{trip.logo}</div>
              <div>
                <div className="font-semibold text-gray-800">
                  {trip.airline}
                </div>
                <div className="text-sm text-gray-500">{trip.bookingRef}</div>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}
            >
              {getStatusText(trip.status)}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{trip.route}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{trip.date}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Departure: {trip.time}</div>
            <div className="font-semibold text-blue-600">
              {formatCurrency(trip.price)}
            </div>
          </div>

          {trip.status === "upcoming" && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium">
                View Details
              </button>
              <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-sm font-medium">
                Download Ticket
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">{user.avatar}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
            <p className="text-gray-500">Member since {user.memberSince}</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {user.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(user.totalSavings)}
            </div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-800 mb-4">
          Contact Information
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">{user.phone}</span>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {[
          { icon: Bell, label: "Notifications", action: () => {} },
          { icon: Globe, label: "Language & Currency", action: () => {} },
          { icon: CreditCard, label: "Payment Methods", action: () => {} },
          { icon: Shield, label: "Privacy & Security", action: () => {} },
          { icon: Download, label: "Download Data", action: () => {} },
          { icon: Share, label: "Invite Friends", action: () => {} },
        ].map(({ icon: Icon, label, action }, index) => (
          <button
            key={index}
            onClick={action}
            className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
          >
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left text-gray-800">{label}</span>
            <span className="text-gray-400">���</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate("/mobile-home")}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="font-semibold text-lg text-gray-800">
          {activeTab === "trips" ? "My Bookings" : "Profile"}
        </h1>

        <div className="w-8"></div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("trips")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "trips"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <Plane className="w-5 h-5 inline mr-2" />
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {activeTab === "trips" ? renderTripsTab() : renderProfileTab()}
      </div>

      {/* Quick Actions - Floating */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => navigate("/mobile-home")}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        >
          <Plane className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileTrips;
