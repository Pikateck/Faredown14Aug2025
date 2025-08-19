import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileBookingFormWrapper from "@/components/mobile/MobileBookingFormWrapper";
import {
  Menu,
  Bell,
  User,
  Globe,
  Settings,
  Plane,
  Hotel,
  Car,
  MapPin,
  BookOpen,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const MobileHome = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setShowMenu(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-800">Faredown</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {currency}
            </span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-8 text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Find Your Perfect Trip</h1>
        <p className="text-blue-100 text-sm mb-6">
          Hotels, flights, and more at unbeatable prices
        </p>

        {/* Quick Service Icons */}
        <div className="flex justify-center space-x-8 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-100">Hotels</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-100">Flights</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-100">Transfers</span>
          </div>
        </div>
      </div>

      {/* Mobile Search Form Container */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Search Form Wrapper with Mobile Optimizations */}
          <MobileBookingFormWrapper
            className="p-1"
            showCurrencySelector={false}
            redirectToMobileResults={true}
          />
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-4 py-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Popular Destinations
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              name: "Dubai",
              country: "UAE",
              image: "🏙️",
              deals: "2,847 deals",
            },
            {
              name: "London",
              country: "UK",
              image: "🏰",
              deals: "1,923 deals",
            },
            {
              name: "Barcelona",
              country: "Spain",
              image: "🏖️",
              deals: "1,456 deals",
            },
            {
              name: "New York",
              country: "USA",
              image: "🗽",
              deals: "3,124 deals",
            },
            {
              name: "Paris",
              country: "France",
              image: "🗼",
              deals: "2,234 deals",
            },
            {
              name: "Tokyo",
              country: "Japan",
              image: "🏯",
              deals: "987 deals",
            },
          ].map((destination, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl">
                {destination.image}
              </div>
              <div className="p-3">
                <div className="font-medium text-gray-800">
                  {destination.name}
                </div>
                <div className="text-sm text-gray-500">
                  {destination.country}
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {destination.deals}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Offers */}
      <div className="px-4 pb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Special Offers
        </h3>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">🔥 Flash Sale</div>
                <div className="text-sm opacity-90">Up to 70% off hotels</div>
              </div>
              <button className="bg-white text-fuchsia-600 px-4 py-2 rounded-full text-sm font-semibold">
                Grab Now
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">✈️ Flight Deals</div>
                <div className="text-sm opacity-90">Book now, travel later</div>
              </div>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="bg-white w-80 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Welcome!</div>
                  <div className="text-sm text-gray-500">
                    Sign in to unlock deals
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {[
                { icon: Plane, label: "Flights", path: "/flights" },
                { icon: Hotel, label: "Hotels", path: "/hotels" },
                { icon: Car, label: "Transfers", path: "/transfers" },
                { icon: BookOpen, label: "My Bookings", path: "/bookings" },
                {
                  icon: Settings,
                  label: "Settings",
                  path: "/account?tab=settings",
                },
              ].map(({ icon: Icon, label, path }, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowMenu(false);
                    navigate(path);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific CSS for search form */}
      <style jsx>{`
        .mobile-search-wrapper {
          /* Override desktop styles for mobile */
        }

        .mobile-search-wrapper .booking-search-form {
          padding: 1rem;
        }

        .mobile-search-wrapper .search-input {
          font-size: 16px; /* Prevent zoom on iOS */
        }

        .mobile-search-wrapper .date-picker {
          touch-action: manipulation;
        }

        .mobile-search-wrapper .guest-selector {
          touch-action: manipulation;
        }

        /* Ensure dropdowns work properly on mobile */
        .mobile-search-wrapper .dropdown-content {
          position: fixed;
          left: 1rem;
          right: 1rem;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
};

export default MobileHome;
