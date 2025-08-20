import React, { useState } from "react";
import {
  X,
  Search,
  Plane,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CityData {
  code: string;
  name: string;
  airport: string;
  fullName: string;
}

interface ResponsiveCityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cities: Record<string, CityData>;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  context?: "flights" | "hotels";
}

export function ResponsiveCityDropdown({
  isOpen,
  onClose,
  title,
  cities,
  selectedCity,
  onSelectCity,
  context = "flights",
}: ResponsiveCityDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");

  console.log('ResponsiveCityDropdown render:', { isOpen, title });

  if (!isOpen) {
    console.log('Dropdown not open, returning null');
    return null;
  }
  
  console.log('Dropdown should be visible!');

  // Filter cities based on search query
  const filteredCities = Object.entries(cities).filter(([city, data]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      city.toLowerCase().includes(query) ||
      data.code.toLowerCase().includes(query) ||
      data.name.toLowerCase().includes(query) ||
      data.airport.toLowerCase().includes(query) ||
      data.fullName.toLowerCase().includes(query)
    );
  });

  // Popular destinations
  const popularDestinations = [
    {
      id: "DXB",
      code: "DXB",
      name: "Dubai",
      country: "United Arab Emirates",
      airport: "Dubai International Airport",
    },
    {
      id: "BCN",
      code: "BCN",
      name: "Barcelona",
      country: "Spain",
      airport: "Barcelona-El Prat Airport",
    },
    {
      id: "LON",
      code: "LON",
      name: "London",
      country: "United Kingdom",
      airport: "Heathrow Airport",
    },
    {
      id: "PAR",
      code: "PAR",
      name: "Paris",
      country: "France",
      airport: "Charles de Gaulle Airport",
    },
    {
      id: "ROM",
      code: "ROM",
      name: "Rome",
      country: "Italy",
      airport: "Fiumicino Airport",
    },
    {
      id: "NYC",
      code: "NYC",
      name: "New York",
      country: "United States",
      airport: "John F. Kennedy Airport",
    },
  ];

  const filteredPopularDestinations = popularDestinations.filter((dest) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dest.name.toLowerCase().includes(query) ||
      dest.code.toLowerCase().includes(query) ||
      dest.country.toLowerCase().includes(query) ||
      dest.airport.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Mobile: Full-screen modal */}
      <div className="sm:hidden fixed inset-0 bg-white z-[9999] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search airports, cities or countries"
                className="w-full pl-10 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          {/* Popular Destinations */}
          <div className="mb-6">
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <h3 className="text-sm font-semibold text-blue-800">Popular Flight Destinations</h3>
              <p className="text-xs text-blue-600">Popular airports and cities worldwide</p>
            </div>
            <div className="space-y-2">
              {filteredPopularDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    onSelectCity(dest.name);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-4 hover:bg-blue-50 rounded-lg border border-gray-100 touch-manipulation"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-900">
                          <span className="font-semibold">{dest.code}</span> • {dest.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Popular
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{dest.airport}</div>
                      <div className="text-xs text-gray-400">{dest.country}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Cities */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 px-4 py-2">Regular Destinations</h3>
          </div>
          <div className="space-y-2">
            {filteredCities.map(([city, data]) => (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={cn(
                  "w-full text-left px-4 py-4 hover:bg-gray-50 rounded-lg border touch-manipulation",
                  selectedCity === city ? "border-blue-500 bg-blue-50" : "border-gray-100",
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-900">
                      <span className="font-semibold">{data.code}</span> • {city}
                    </div>
                    <div className="text-sm text-gray-500">{data.airport}</div>
                    <div className="text-xs text-gray-400">{data.fullName}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Dropdown */}
      <div className="hidden sm:block fixed inset-0 z-[9999]">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25" 
          onClick={onClose}
        />
        
        {/* Dropdown positioned relative to trigger */}
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities or airports"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Popular Destinations - Compact */}
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Popular Destinations
              </h4>
              <div className="space-y-1">
                {filteredPopularDestinations.slice(0, 5).map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      onSelectCity(dest.name);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <Plane className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          <span className="font-semibold">{dest.code}</span> • {dest.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{dest.country}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Regular Cities - Compact */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                All Destinations
              </h4>
              <div className="space-y-1">
                {filteredCities.map(([city, data]) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md",
                      selectedCity === city ? "bg-blue-50 text-blue-900" : "",
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                        <Plane className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          <span className="font-semibold">{data.code}</span> • {city}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{data.airport}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
