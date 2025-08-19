import React, { useState } from "react";
import {
  X,
  Search,
  Plane,
  Building,
  Calendar,
  CalendarIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  Navigation,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingCalendar } from "@/components/BookingCalendar";
import { addDays } from "date-fns";

interface CityData {
  code: string;
  name: string;
  airport: string;
  fullName: string;
}

interface MobileCityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cities: Record<string, CityData>;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  context?: "flights" | "hotels"; // Add context to determine what to show
}

export function MobileCityDropdown({
  isOpen,
  onClose,
  title,
  cities,
  selectedCity,
  onSelectCity,
  context = "flights", // Default to flights for backward compatibility
}: MobileCityDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
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
              placeholder={
                context === "hotels"
                  ? "Search cities, destinations or countries"
                  : "Search airports, cities or countries"
              }
              className="w-full pl-10 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
        {/* Popular Destinations */}
        <div className="mb-6">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <h3 className="text-sm font-semibold text-blue-800">
              {context === "hotels"
                ? "Popular Hotel Destinations"
                : "Popular Flight Destinations"}
            </h3>
            <p className="text-xs text-blue-600">
              {context === "hotels"
                ? "Top destinations for hotel bookings"
                : "Popular airports and cities worldwide"}
            </p>
          </div>
          <div className="space-y-2">
            {(context === "hotels"
              ? [
                  {
                    id: "Dubai",
                    code: "DXB",
                    name: "Dubai",
                    country: "United Arab Emirates",
                    airport: "Downtown Dubai, Marina, Business Bay",
                    description: "Luxury hotels, beaches, shopping malls",
                  },
                  {
                    id: "Mumbai",
                    code: "BOM",
                    name: "Mumbai",
                    country: "India",
                    airport: "Bandra, Andheri, South Mumbai",
                    description: "Business hotels, city center locations",
                  },
                  {
                    id: "Delhi",
                    code: "DEL",
                    name: "Delhi",
                    country: "India",
                    airport: "Connaught Place, Gurgaon, Airport area",
                    description: "Heritage hotels, business districts",
                  },
                  {
                    id: "Singapore",
                    code: "SIN",
                    name: "Singapore",
                    country: "Singapore",
                    airport: "Marina Bay, Orchard Road, Sentosa",
                    description: "Luxury resorts, city center hotels",
                  },
                  {
                    id: "Bangkok",
                    code: "BKK",
                    name: "Bangkok",
                    country: "Thailand",
                    airport: "Sukhumvit, Silom, Chatuchak",
                    description: "Budget to luxury hotels, city center",
                  },
                  {
                    id: "London",
                    code: "LON",
                    name: "London",
                    country: "United Kingdom",
                    airport: "Westminster, Kensington, Canary Wharf",
                    description: "Historic hotels, business districts",
                  },
                  {
                    id: "Paris",
                    code: "PAR",
                    name: "Paris",
                    country: "France",
                    airport: "Champs-Élysées, Le Marais, Montmartre",
                    description: "Boutique hotels, romantic locations",
                  },
                  {
                    id: "New York",
                    code: "NYC",
                    name: "New York",
                    country: "United States",
                    airport: "Manhattan, Times Square, Central Park",
                    description: "Luxury hotels, iconic locations",
                  },
                ]
              : [
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
                  {
                    id: "BKK",
                    code: "BKK",
                    name: "Bangkok",
                    country: "Thailand",
                    airport: "Suvarnabhumi Airport",
                  },
                  {
                    id: "SIN",
                    code: "SIN",
                    name: "Singapore",
                    country: "Singapore",
                    airport: "Changi Airport",
                  },
                  {
                    id: "TKO",
                    code: "TKO",
                    name: "Tokyo",
                    country: "Japan",
                    airport: "Haneda Airport",
                  },
                  {
                    id: "SYD",
                    code: "SYD",
                    name: "Sydney",
                    country: "Australia",
                    airport: "Kingsford Smith Airport",
                  },
                ]
            ).map((dest) => (
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
                    {context === "hotels" ? (
                      <Building className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Plane className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-900">
                        {context === "hotels" ? (
                          dest.name
                        ) : (
                          <>
                            <span className="font-semibold">{dest.code}</span> •{" "}
                            {dest.name}
                          </>
                        )}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Popular
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {context === "hotels" && dest.description
                        ? dest.description
                        : dest.airport}
                    </div>
                    <div className="text-xs text-gray-400">{dest.country}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Cities */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 px-4 py-2">
            Regular Destinations
          </h3>
        </div>
        <div className="space-y-2">
          {Object.entries(cities).map(([city, data]) => (
            <button
              key={city}
              onClick={() => {
                onSelectCity(city);
                onClose();
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
  );
}

interface MobileDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  tripType: string;
  setTripType: (type: string) => void;
  selectedDepartureDate: Date | null;
  selectedReturnDate: Date | null;
  setSelectedDepartureDate: (date: Date | null) => void;
  setSelectedReturnDate: (date: Date | null) => void;
  selectingDeparture: boolean;
  setSelectingDeparture: (selecting: boolean) => void;
  bookingType?: "flights" | "hotels"; // Add booking type context
}

export function MobileDatePicker({
  isOpen,
  onClose,
  tripType,
  setTripType,
  selectedDepartureDate,
  selectedReturnDate,
  setSelectedDepartureDate: setParentDepartureDate,
  setSelectedReturnDate: setParentReturnDate,
  selectingDeparture,
  setSelectingDeparture,
  bookingType = "flights", // Default to flights for backward compatibility
}: MobileDatePickerProps) {
  if (!isOpen) return null;

  // Helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  const handleCalendarChange = (range: { startDate: Date; endDate: Date }) => {
    console.log("Mobile calendar range selected:", range);
    console.log("Current tripType:", tripType);
    console.log("Current bookingType:", bookingType);

    // Update parent component state immediately
    setParentDepartureDate(range.startDate);

    if (bookingType === "hotels") {
      // For hotels, always set both check-in and check-out dates
      setParentReturnDate(range.endDate);
      console.log("Hotel booking: Set check-out date:", range.endDate);
    } else if (tripType === "round-trip") {
      // For flights round-trip
      setParentReturnDate(range.endDate);
      console.log("Flight round-trip: Set return date:", range.endDate);
    } else {
      // For flights one-way, clear the return date
      setParentReturnDate(null);
      console.log("Flight one-way: cleared return date");
    }
  };

  const handleDoneClick = () => {
    console.log("=== MOBILE DATE PICKER DONE CLICKED ===");
    console.log("selectedDepartureDate:", selectedDepartureDate);
    console.log("selectedReturnDate:", selectedReturnDate);
    console.log("tripType:", tripType);
    console.log("bookingType:", bookingType);

    // Make sure parent component state is updated
    if (selectedDepartureDate) {
      setParentDepartureDate(selectedDepartureDate);
    }

    if (bookingType === "hotels") {
      // For hotels, always require check-out date
      if (selectedReturnDate) {
        setParentReturnDate(selectedReturnDate);
      }
    } else if (tripType === "round-trip") {
      // For flights round-trip
      if (selectedReturnDate) {
        setParentReturnDate(selectedReturnDate);
      }
    } else {
      // For flights one-way
      setParentReturnDate(null);
    }

    // Close the modal
    console.log("Closing mobile date picker");
    onClose();
  };

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Select dates</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        {/* Trip Type Selector - Only show for flights */}
        {bookingType === "flights" && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setTripType("round-trip")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium touch-manipulation",
                tripType === "round-trip"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700",
              )}
            >
              Round trip
            </button>
            <button
              onClick={() => setTripType("one-way")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium touch-manipulation",
                tripType === "one-way"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700",
              )}
            >
              One way
            </button>
          </div>
        )}

        {/* Elegant Date Selection Display */}
        {(selectedDepartureDate || selectedReturnDate) && (
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {bookingType === "hotels" ? "Your Stay" : "Your Trip"}
                </span>
              </div>
              {selectedDepartureDate && selectedReturnDate && (
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  ✓ Complete
                </div>
              )}
            </div>

            <div className="space-y-2">
              {bookingType === "hotels" ? (
                // Hotel date display
                <>
                  <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Check-in</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDepartureDate
                        ? formatDate(selectedDepartureDate)
                        : "Select date"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Check-out</span>
                    <span className="font-semibold text-gray-900">
                      {selectedReturnDate
                        ? formatDate(selectedReturnDate)
                        : "Select date"}
                    </span>
                  </div>
                </>
              ) : (
                // Flight date display
                <>
                  <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Departure</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDepartureDate
                        ? formatDate(selectedDepartureDate)
                        : "Select date"}
                    </span>
                  </div>
                  {tripType === "round-trip" && (
                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-600">Return</span>
                      <span className="font-semibold text-gray-900">
                        {selectedReturnDate
                          ? formatDate(selectedReturnDate)
                          : "Select date"}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Professional Hotel-Style Calendar */}
        <div className="mb-6">
          <BookingCalendar
            initialRange={{
              startDate: selectedDepartureDate || new Date(),
              endDate:
                selectedReturnDate ||
                addDays(
                  selectedDepartureDate || new Date(),
                  bookingType === "hotels" ? 3 : tripType === "one-way" ? 1 : 7,
                ),
            }}
            onChange={handleCalendarChange}
            onClose={handleDoneClick} // Use custom handler for Done button
            className="w-full"
            bookingType={bookingType === "hotels" ? "hotel" : "flight"}
          />
        </div>

        {/* BookingCalendar has its own Done button - no need for duplicate */}
      </div>
    </div>
  );
}

interface MobileTravelersProps {
  isOpen: boolean;
  onClose: () => void;
  travelers: { adults: number; children: number; childAges: number[] };
  setTravelers: React.Dispatch<
    React.SetStateAction<{
      adults: number;
      children: number;
      childAges: number[];
    }>
  >;
}

interface MobileClassDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  onSelectClass: (classType: string) => void;
}

export function MobileClassDropdown({
  isOpen,
  onClose,
  selectedClass,
  onSelectClass,
}: MobileClassDropdownProps) {
  if (!isOpen) return null;

  const classOptions = [
    { value: "Economy", description: "Standard service" },
    { value: "Premium Economy", description: "Enhanced comfort" },
    { value: "Business", description: "Premium service" },
    { value: "First Class", description: "Luxury experience" },
  ];

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Travel Class</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {classOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSelectClass(option.value);
              onClose();
            }}
            className={cn(
              "w-full text-left px-4 py-4 hover:bg-gray-50 rounded-lg border touch-manipulation",
              selectedClass === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-100",
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-gray-900">
                  {option.value}
                </div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileTravelers({
  isOpen,
  onClose,
  travelers,
  setTravelers,
}: MobileTravelersProps) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Travelers</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4 space-y-8">
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <div className="text-lg font-medium text-gray-900">Adults</div>
            <div className="text-sm text-gray-500">Age 18+</div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  adults: Math.max(1, prev.adults - 1),
                }))
              }
              disabled={travelers.adults <= 1}
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold text-xl touch-manipulation"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900 text-lg">
              {travelers.adults}
            </span>
            <button
              onClick={() =>
                setTravelers((prev) => ({ ...prev, adults: prev.adults + 1 }))
              }
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold text-xl touch-manipulation"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <div className="text-lg font-medium text-gray-900">Children</div>
            <div className="text-sm text-gray-500">Age 0-17</div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  children: Math.max(0, prev.children - 1),
                  childAges: (prev.childAges || []).slice(0, -1), // Remove last age
                }))
              }
              disabled={travelers.children <= 0}
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold text-xl touch-manipulation"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900 text-lg">
              {travelers.children}
            </span>
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  children: prev.children + 1,
                  childAges: [...(prev.childAges || []), 10], // Default age 10
                }))
              }
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold text-xl touch-manipulation"
            >
              +
            </button>
          </div>
        </div>

        {/* Child Age Selection - Mobile */}
        {travelers.children > 0 && (
          <div className="space-y-4 py-6 border-b border-gray-100">
            <div className="text-lg font-medium text-gray-900 mb-4">
              Ages of children
            </div>
            {Array.from({ length: travelers.children }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
              >
                <span className="text-base font-medium text-gray-700">
                  Child {index + 1}
                </span>
                <select
                  value={travelers.childAges?.[index] || 10}
                  onChange={(e) => {
                    const newAges = [...(travelers.childAges || [])];
                    newAges[index] = parseInt(e.target.value);
                    setTravelers((prev) => ({
                      ...prev,
                      childAges: newAges,
                    }));
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                >
                  {Array.from({ length: 18 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} {i === 1 ? "year" : "years"}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={() => {
              console.log("Done button clicked - Mobile Travelers");
              onClose();
            }}
            onTouchStart={(e) => {
              console.log("Touch start on Travelers Done button");
              // Don't preventDefault to allow onClick to fire
            }}
            onTouchEnd={(e) => {
              console.log("Touch end on Travelers Done button");
              // Don't preventDefault to allow onClick to fire
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-base touch-manipulation relative z-10 min-h-[48px] active:bg-blue-800"
            style={{
              WebkitTapHighlightColor: "transparent",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
