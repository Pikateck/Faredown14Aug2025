import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  ArrowUpDown,
  Bell,
  User,
  Menu,
  Plane,
} from "lucide-react";

const MobileHome = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    departure: "",
    return: "",
    travelers: { adults: 2, children: 0, infants: 0 },
    tripType: "roundtrip",
    class: "Economy",
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [showClass, setShowClass] = useState(false);

  const handleBargainNow = () => {
    // Navigate to mobile search results with bargain enabled
    navigate("/mobile-search", { state: { searchData, bargainEnabled: true } });
  };

  const handleSearch = () => {
    navigate("/mobile-search", { state: { searchData } });
  };

  const swapLocations = () => {
    setSearchData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const updateTravelers = (type: string, operation: string) => {
    setSearchData((prev) => ({
      ...prev,
      travelers: {
        ...prev.travelers,
        [type]:
          operation === "add"
            ? prev.travelers[type] + 1
            : Math.max(0, prev.travelers[type] - 1),
      },
    }));
  };

  const totalTravelers =
    searchData.travelers.adults +
    searchData.travelers.children +
    searchData.travelers.infants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setShowMenu(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
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
      <div className="px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Find Your Perfect Flight
        </h1>
        <p className="text-gray-600 text-sm">
          Upgrade. Bargain. Book. Save more with every search.
        </p>
      </div>

      {/* Search Card */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {/* Trip Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() =>
                setSearchData((prev) => ({ ...prev, tripType: "roundtrip" }))
              }
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                searchData.tripType === "roundtrip"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Round Trip
            </button>
            <button
              onClick={() =>
                setSearchData((prev) => ({ ...prev, tripType: "oneway" }))
              }
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                searchData.tripType === "oneway"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              One Way
            </button>
          </div>

          {/* From/To Fields */}
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Departure city"
                  value={searchData.from}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapLocations}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Destination city"
                  value={searchData.to}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Date Fields */}
          <div
            className={`grid ${searchData.tripType === "roundtrip" ? "grid-cols-2" : "grid-cols-1"} gap-3`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={searchData.departure}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      departure: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {searchData.tripType === "roundtrip" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.return}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        return: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Travelers and Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Travelers
              </label>
              <button
                onClick={() => setShowTravelers(true)}
                className="w-full flex items-center justify-between px-3 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {totalTravelers} Traveler{totalTravelers !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <button
                onClick={() => setShowClass(true)}
                className="w-full flex items-center justify-between px-3 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">{searchData.class}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 space-y-3 pb-6">
        {/* Bargain Now Button - Primary */}
        <button
          onClick={handleBargainNow}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          🔥 Bargain Now & Save More
        </button>

        {/* Regular Search Button - Secondary */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Search Flights
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🏨</div>
            <span className="text-sm font-medium text-gray-700">Hotels</span>
          </button>
          <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">���</div>
            <span className="text-sm font-medium text-gray-700">
              My Bookings
            </span>
          </button>
        </div>
      </div>

      {/* Travelers Modal */}
      {showTravelers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Travelers</h3>
              <button
                onClick={() => setShowTravelers(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {[
              { key: "adults", label: "Adults", desc: "12+ years" },
              { key: "children", label: "Children", desc: "2-11 years" },
              { key: "infants", label: "Infants", desc: "Under 2 years" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateTravelers(key, "subtract")}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {searchData.travelers[key]}
                  </span>
                  <button
                    onClick={() => updateTravelers(key, "add")}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowTravelers(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Class</h3>
              <button
                onClick={() => setShowClass(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {["Economy", "Premium Economy", "Business", "First Class"].map(
              (classType) => (
                <button
                  key={classType}
                  onClick={() => {
                    setSearchData((prev) => ({ ...prev, class: classType }));
                    setShowClass(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg mb-2 border ${
                    searchData.class === classType
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {classType}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHome;
