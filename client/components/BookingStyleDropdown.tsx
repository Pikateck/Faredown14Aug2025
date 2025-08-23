import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { X, Search, Plane, Building, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityData {
  code: string;
  name: string;
  airport: string;
  fullName: string;
}

interface BookingStyleDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cities: Record<string, CityData>;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  context?: "flights" | "hotels";
  triggerRef?: React.RefObject<HTMLElement>;
}

export function BookingStyleDropdown({
  isOpen,
  onClose,
  title,
  cities,
  selectedCity,
  onSelectCity,
  context = "flights",
  triggerRef,
}: BookingStyleDropdownProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 250); // 250ms debounce for search
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoized popular destinations (static data)
  const popularDestinations = useMemo(
    () => [
      {
        id: "DXB",
        code: "DXB",
        name: "Dubai",
        country: "United Arab Emirates",
        airport: "Dubai International Airport",
      },
      {
        id: "BOM",
        code: "BOM",
        name: "Mumbai",
        country: "India",
        airport: "Rajiv Gandhi Shivaji International",
      },
      {
        id: "DEL",
        code: "DEL",
        name: "Delhi",
        country: "India",
        airport: "Indira Gandhi International",
      },
      {
        id: "SIN",
        code: "SIN",
        name: "Singapore",
        country: "Singapore",
        airport: "Changi Airport",
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
    ],
    [],
  );

  // Memoized city filtering with debounced search
  const filteredCities = useMemo(() => {
    if (!debouncedSearchQuery) return Object.entries(cities);
    const query = debouncedSearchQuery.toLowerCase();
    return Object.entries(cities).filter(
      ([city, data]) =>
        city.toLowerCase().includes(query) ||
        data.code.toLowerCase().includes(query) ||
        data.name.toLowerCase().includes(query) ||
        data.airport.toLowerCase().includes(query) ||
        data.fullName.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery, cities]);

  // Memoized filtered popular destinations
  const filteredPopularDestinations = useMemo(() => {
    if (!debouncedSearchQuery) return popularDestinations;
    const query = debouncedSearchQuery.toLowerCase();
    return popularDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        dest.code.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.airport.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery, popularDestinations]);

  // Calculate position based on trigger element
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Clean production experience
  // Dropdown state is now managed cleanly

  // CONDITIONAL RETURN AFTER ALL HOOKS
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile: Full-screen modal */}
      <div
        className="sm:hidden fixed inset-0 bg-white overflow-y-auto"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCities.length > 0) {
                    onSelectCity(filteredCities[0][0]);
                    onClose();
                  }
                }}
                placeholder="Search airports, cities or countries"
                className="w-full pl-10 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="mb-6">
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <h3 className="text-sm font-semibold text-blue-800">
                Popular Flight Destinations
              </h3>
              <p className="text-xs text-blue-600">
                Popular airports and cities worldwide
              </p>
            </div>
            <div className="space-y-2">
              {filteredPopularDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onPointerDown={(e) => e.preventDefault()} // Prevent blur race
                  onPointerUp={() => {
                    onSelectCity(dest.name);
                    // Use requestAnimationFrame to ensure state commits before close
                    requestAnimationFrame(() => onClose());
                  }}
                  className="w-full text-left px-4 py-4 hover:bg-blue-50 active:bg-blue-100 rounded-lg border border-gray-100 touch-manipulation"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-900">
                          <span className="font-semibold">{dest.code}</span> •{" "}
                          {dest.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Popular
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {dest.airport}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dest.country}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Cities */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 px-4 py-2">
              All Destinations
            </h3>
          </div>
          <div className="space-y-2">
            {filteredCities.map(([city, data]) => (
              <button
                key={city}
                onPointerDown={(e) => e.preventDefault()} // Prevent blur race
                onPointerUp={() => {
                  onSelectCity(city);
                  // Use requestAnimationFrame to ensure state commits before close
                  requestAnimationFrame(() => onClose());
                }}
                className={cn(
                  "w-full text-left px-4 py-4 hover:bg-gray-50 rounded-lg border touch-manipulation",
                  selectedCity === city
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100",
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-900">
                      <span className="font-semibold">{data.code}</span> •{" "}
                      {city}
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

      {/* Desktop: Booking.com style dropdown positioned below input */}
      <div className="hidden sm:block">
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[400px] overflow-hidden z-[9999]"
          style={{
            top: position.top,
            left: position.left,
            minWidth: Math.max(position.width, 400),
            maxWidth: 500,
          }}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCities.length > 0) {
                    onSelectCity(filteredCities[0][0]);
                    onClose();
                  }
                }}
                placeholder="Airport, city or country"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {/* Popular Destinations */}
            {searchQuery === "" && (
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  POPULAR DESTINATIONS
                </h4>
                <div className="space-y-1">
                  {popularDestinations.slice(0, 4).map((dest) => (
                    <button
                      key={dest.id}
                      onPointerDown={(e) => e.preventDefault()}
                      onPointerUp={() => {
                        onSelectCity(dest.name);
                        requestAnimationFrame(() => onClose());
                      }}
                      className="w-full text-left px-2 py-2 hover:bg-blue-50 active:bg-blue-100 rounded-md flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plane className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          <span className="font-bold">{dest.code}</span>{" "}
                          {dest.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {dest.airport}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {dest.country}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results or All Cities */}
            <div className="p-3">
              {searchQuery && (
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  SEARCH RESULTS
                </h4>
              )}
              <div className="space-y-1">
                {(searchQuery ? filteredCities : Object.entries(cities))
                  .slice(0, 8)
                  .map(([city, data]) => (
                    <button
                      key={city}
                      onPointerDown={(e) => e.preventDefault()}
                      onPointerUp={() => {
                        onSelectCity(city);
                        requestAnimationFrame(() => onClose());
                      }}
                      className={cn(
                        "w-full text-left px-2 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3",
                        selectedCity === city ? "bg-blue-50" : "",
                      )}
                    >
                      <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plane className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          <span className="font-bold">{data.code}</span> {city}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {data.airport}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {data.fullName.split(",").pop()?.trim()}
                      </div>
                    </button>
                  ))}
              </div>

              {filteredCities.length === 0 && searchQuery && (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    No destinations found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
