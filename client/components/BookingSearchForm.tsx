import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { hotelsService } from "@/services/hotelsService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookingCalendar } from "@/components/BookingCalendar";
import { MobileDatePicker } from "@/components/MobileDropdowns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import {
  MapPin,
  CalendarIcon,
  Users,
  Search,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/components/ErrorBanner";

interface GuestConfig {
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

interface DestinationOption {
  id: string;
  code: string;
  name: string;
  country: string;
  type: string;
  flag?: string;
  popular?: boolean;
}

export function BookingSearchForm() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [destination, setDestination] = useState("");
  const [destinationCode, setDestinationCode] = useState(""); // Store destination code
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    DestinationOption[]
  >([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  // Set default dates to future dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkOutDefault = new Date();
  checkOutDefault.setDate(checkOutDefault.getDate() + 4);

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(tomorrow);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    checkOutDefault,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guests, setGuests] = useState<GuestConfig>({
    adults: 2,
    children: 1,
    childrenAges: [10],
    rooms: 1,
  });
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [lookingForEntireHome, setLookingForEntireHome] = useState(false);
  const [lookingForFlights, setLookingForFlights] = useState(false);
  const [travelingWithPets, setTravelingWithPets] = useState(false);

  // Mobile-specific states
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
  const [tripType, setTripType] = useState("round-trip");

  // Calculate nights between check-in and check-out dates
  const calculateNights = (
    checkIn: Date | undefined,
    checkOut: Date | undefined,
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(nights, 1); // Minimum 1 night
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  // Popular destinations will be loaded from database
  const [popularDestinations, setPopularDestinations] = useState<
    DestinationOption[]
  >([]);
  const [popularDestinationsLoaded, setPopularDestinationsLoaded] =
    useState(false);

  // State to track if user is actively typing (not pre-filled)
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Debounced search function
  const debouncedSearchRef = useRef<NodeJS.Timeout>();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load popular destinations from database on component mount
  useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        console.log("🎆 Loading popular destinations from database...");
        const popular = await hotelsService.searchDestinations("", 8, true); // Get 8 popular destinations
        const formattedPopular = popular.map((dest) => ({
          id: dest.id,
          code: dest.id, // dest.id is the destination code
          name: dest.name,
          country: dest.country,
          type: dest.type as "city" | "region" | "country" | "landmark",
        }));
        setPopularDestinations(formattedPopular);
        setPopularDestinationsLoaded(true);
        console.log(
          "✅ Loaded",
          formattedPopular.length,
          "popular destinations from database",
        );
      } catch (error) {
        console.error(
          "⚠️ Failed to load popular destinations, using fallback:",
          error,
        );
        // Static fallback if database fails
        setPopularDestinations([
          {
            id: "DXB",
            code: "DXB",
            name: "Dubai",
            country: "United Arab Emirates",
            type: "city",
            flag: "🇦🇪",
          },
          {
            id: "LON",
            code: "LON",
            name: "London",
            country: "United Kingdom",
            type: "city",
            flag: "🇬🇧",
          },
          {
            id: "BCN",
            code: "BCN",
            name: "Barcelona",
            country: "Spain",
            type: "city",
            flag: "🇪🇸",
          },
          {
            id: "NYC",
            code: "NYC",
            name: "New York",
            country: "United States",
            type: "city",
            flag: "🇺🇸",
          },
          {
            id: "PAR",
            code: "PAR",
            name: "Paris",
            country: "France",
            type: "city",
            flag: "🇫🇷",
          },
          {
            id: "BOM",
            code: "BOM",
            name: "Mumbai",
            country: "India",
            type: "city",
            flag: "🇮🇳",
          },
        ]);
        setPopularDestinationsLoaded(true);
      }
    };

    loadPopularDestinations();
  }, []);

  const searchDestinations = useCallback(
    async (query: string) => {
      // Show suggestions immediately like Booking.com (single character minimum)
      if (query.length < 1) {
        setDestinationSuggestions([]);
        return;
      }

      // Clear previous timeout
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }

      // Ultra-fast response time like Booking.com
      debouncedSearchRef.current = setTimeout(async () => {
        try {
          setLoadingDestinations(true);
          console.log(`🔍 Real-time search: "${query}"`);

          // Get more results like Booking.com
          const results = await hotelsService.searchDestinations(query, 15);

          const formattedResults = results.map((dest) => ({
            id: dest.id,
            code: dest.id,
            name: dest.name,
            country: dest.country,
            type: dest.type as "city" | "region" | "country" | "landmark",
            popular: (dest as any).popular || false,
            flag: (dest as any).flag || "����",
          }));

          setDestinationSuggestions(formattedResults);
          console.log(
            `✅ Real-time results: ${formattedResults.length} destinations`,
          );
        } catch (error) {
          console.error("⚠️ Real-time search failed:", error);

          // Enhanced fallback with popular destinations filter
          const fallbackDestinations = popularDestinations.filter(
            (dest) =>
              dest.name.toLowerCase().includes(query.toLowerCase()) ||
              dest.country.toLowerCase().includes(query.toLowerCase()) ||
              dest.code.toLowerCase().includes(query.toLowerCase()),
          );

          setDestinationSuggestions(fallbackDestinations.slice(0, 8));
          console.log(
            `🔄 Fallback results: ${fallbackDestinations.length} destinations`,
          );
        } finally {
          setLoadingDestinations(false);
        }
      }, 100); // Ultra-fast like Booking.com
    },
    [popularDestinations],
  );

  // Handle destination search only when user actively types
  useEffect(() => {
    if (popularDestinationsLoaded && isDestinationOpen && isUserTyping) {
      if (inputValue && inputValue.length >= 1) {
        // Search immediately as user types (like Booking.com)
        searchDestinations(inputValue);
      } else {
        // Clear search results when input is empty
        setDestinationSuggestions([]);
      }
    }
  }, [
    inputValue,
    searchDestinations,
    popularDestinationsLoaded,
    isDestinationOpen,
    isUserTyping,
  ]);

  const childAgeOptions = Array.from({ length: 18 }, (_, i) => i);

  const handleSearch = () => {
    console.log("🔍 Starting Hotelbeds search with:", {
      destination,
      destinationCode,
      checkInDate,
      checkOutDate,
      guests,
    });

    // Only validate dates, destination is optional for browsing
    if (!checkInDate || !checkOutDate) {
      console.log("⚠️ Missing required fields:", {
        checkInDate,
        checkOutDate,
      });

      // Show user-friendly error
      setErrorMessage("Please select check-in and check-out dates");
      setShowError(true);
      return;
    }

    // Validate date range
    const daysBetween = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysBetween < 1) {
      setErrorMessage("Check-out date must be after check-in date");
      setShowError(true);
      return;
    }
    if (daysBetween > 30) {
      setErrorMessage("Maximum stay duration is 30 days");
      setShowError(true);
      return;
    }

    try {
      const searchParams = new URLSearchParams({
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: guests.adults.toString(),
        children: guests.children.toString(),
        rooms: guests.rooms.toString(),
        // Additional metadata for improved search
        searchType: "live", // Flag to indicate live API search preference
        searchId: Date.now().toString(), // Unique search identifier
      });

      // Only add destination if it exists
      if (destination && destinationCode) {
        searchParams.set("destination", destinationCode);
        searchParams.set("destinationName", destination);
      }

      const url = `/hotels/results?${searchParams.toString()}`;
      console.log("�� Navigating to live Hotelbeds search:", url);
      navigate(url);
    } catch (error) {
      console.error("🚨 Error in handleSearch:", error);
      setErrorMessage("Search failed. Please try again.");
      setShowError(true);
    }
  };

  const updateGuestCount = (
    type: keyof Pick<GuestConfig, "adults" | "children" | "rooms">,
    operation: "increment" | "decrement",
  ) => {
    setGuests((prev) => {
      const newValue =
        operation === "increment" ? prev[type] + 1 : prev[type] - 1;

      // Validation rules
      if (type === "adults" && newValue < 1) return prev;
      if (type === "children" && newValue < 0) return prev;
      if (type === "rooms" && newValue < 1) return prev;
      if (type === "rooms" && newValue > 8) return prev;
      if ((type === "adults" || type === "children") && newValue > 16)
        return prev;

      // Handle children ages array
      if (type === "children") {
        const childrenAges = [...prev.childrenAges];
        if (newValue > prev.children) {
          // Add new child age
          childrenAges.push(10);
        } else if (newValue < prev.children) {
          // Remove last child age
          childrenAges.pop();
        }
        return {
          ...prev,
          [type]: newValue,
          childrenAges,
        };
      }

      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  const updateChildAge = (index: number, age: number) => {
    setGuests((prev) => ({
      ...prev,
      childrenAges: prev.childrenAges.map((existingAge, i) =>
        i === index ? age : existingAge,
      ),
    }));
  };

  const guestSummary = () => {
    const parts = [];
    parts.push(`${guests.adults} adult${guests.adults > 1 ? "s" : ""}`);
    if (guests.children > 0) {
      parts.push(`${guests.children} child${guests.children > 1 ? "ren" : ""}`);
    }
    parts.push(`${guests.rooms} room${guests.rooms > 1 ? "s" : ""}`);
    return parts.join(" • ");
  };

  return (
    <>
      <ErrorBanner
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg max-w-6xl mx-auto border border-gray-200">
        {/* Main Search Form */}
        <div className="flex flex-col lg:flex-row gap-2 mb-4">
          {/* Destination */}
          <div className="flex-1 lg:max-w-[320px] relative destination-container">
            <label className="text-xs font-medium text-gray-800 mb-1 block sm:hidden">
              Destination
            </label>

            <Popover
              open={isDestinationOpen}
              onOpenChange={setIsDestinationOpen}
            >
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4 z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <Input
                    type="text"
                    value={isUserTyping ? inputValue : destination || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInputValue(value);
                      setIsUserTyping(true);
                      // Auto-open dropdown when user starts typing
                      if (!isDestinationOpen) {
                        setIsDestinationOpen(true);
                      }
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      setIsDestinationOpen(true);
                      // Set inputValue to current destination when focusing for editing
                      if (!isUserTyping && destination) {
                        setInputValue(destination);
                        setIsUserTyping(true);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDestinationOpen(true);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    readOnly={false}
                    disabled={false}
                    className="pl-10 pr-8 h-10 sm:h-12 bg-white border-2 border-blue-400 focus:border-[#003580] rounded font-medium text-xs sm:text-sm touch-manipulation relative z-10"
                    placeholder="Where are you going?"
                    autoComplete="off"
                    data-destination-input="true"
                  />
                  {(destination || (isUserTyping && inputValue)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDestination("");
                        setInputValue("");
                        setIsUserTyping(false);
                        setDestinationCode("");
                        setIsDestinationOpen(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                      title="Clear destination"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 sm:w-[480px] p-0 border border-gray-200 shadow-2xl rounded-lg"
                align="start"
              >
                <div className="max-h-80 overflow-y-auto">
                  {!popularDestinationsLoaded ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Loading destinations...
                      </span>
                    </div>
                  ) : loadingDestinations ? (
                    <div className="flex items-center justify-center p-3">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-xs text-gray-600">
                        🔍 Searching...
                      </span>
                    </div>
                  ) : isUserTyping &&
                    inputValue.length > 0 &&
                    destinationSuggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b">
                        <span className="text-xs font-medium text-gray-600">
                          🔍 Search Results
                        </span>
                      </div>
                      {destinationSuggestions.map((dest, index) => (
                        <div
                          key={dest.id || index}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                          onMouseDown={(e) => {
                            // Prevent input blur from firing before click
                            e.preventDefault();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const fullName = `${dest.name}, ${dest.country}`;
                            console.log("🎯 Destination selected:", {
                              name: fullName,
                              code: dest.code || dest.id,
                              type: dest.type,
                              popular: (dest as any).popular,
                            });
                            setDestination(fullName);
                            setDestinationCode(dest.code || dest.id);
                            setInputValue("");
                            setIsUserTyping(false);
                            setIsDestinationOpen(false);
                          }}
                        >
                          {/* Elegant search result icon */}
                          <div className="flex items-center justify-center w-8 h-8 mr-3 flex-shrink-0">
                            {dest.type === "hotel" ? (
                              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Main content area */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                {/* City name and popular badge */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm truncate">
                                    {dest.name}
                                  </span>
                                  {(dest as any).popular && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      Popular
                                    </span>
                                  )}
                                  {dest.type === "hotel" && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                      Hotel
                                    </span>
                                  )}
                                </div>

                                {/* Country and region info */}
                                <div className="text-xs text-gray-500">
                                  <span className="capitalize">
                                    {dest.type === "hotel"
                                      ? "Hotel"
                                      : dest.type}
                                  </span>
                                  {dest.country && (
                                    <span> in {dest.country}</span>
                                  )}
                                </div>
                              </div>

                              {/* City code aligned right */}
                              <div className="flex-shrink-0 ml-3">
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
                                  {dest.code || dest.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isUserTyping &&
                    inputValue.length > 0 &&
                    !loadingDestinations ? (
                    <div className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        No destinations found for "{inputValue}"
                      </div>
                      <div className="text-xs text-gray-400">
                        Try a different city or country name
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Hotelbeds Test Destinations */}
                      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                        <span className="text-sm font-semibold text-blue-800">
                          🏨 Hotelbeds Test Destinations
                        </span>
                        <div className="text-xs text-blue-600 mt-1">
                          Available cities for testing with live API data
                        </div>
                      </div>
                      {[
                        {
                          id: "DXB",
                          code: "DXB",
                          name: "Dubai",
                          country: "United Arab Emirates",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "BCN",
                          code: "BCN",
                          name: "Barcelona",
                          country: "Spain",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "LON",
                          code: "LON",
                          name: "London",
                          country: "United Kingdom",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "PAR",
                          code: "PAR",
                          name: "Paris",
                          country: "France",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "ROM",
                          code: "ROM",
                          name: "Rome",
                          country: "Italy",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "NYC",
                          code: "NYC",
                          name: "New York",
                          country: "United States",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "BKK",
                          code: "BKK",
                          name: "Bangkok",
                          country: "Thailand",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "SIN",
                          code: "SIN",
                          name: "Singapore",
                          country: "Singapore",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "TKO",
                          code: "TKO",
                          name: "Tokyo",
                          country: "Japan",
                          type: "city",
                          popular: true,
                        },
                        {
                          id: "SYD",
                          code: "SYD",
                          name: "Sydney",
                          country: "Australia",
                          type: "city",
                          popular: true,
                        },
                      ].map((dest, index) => (
                        <div
                          key={dest.id}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                          onClick={() => {
                            const fullName = `${dest.name}, ${dest.country}`;
                            console.log(
                              "🎯 Hotelbeds test destination selected:",
                              {
                                name: fullName,
                                code: dest.code,
                                type: dest.type,
                              },
                            );
                            setDestination(fullName);
                            setDestinationCode(dest.code);
                            setInputValue(""); // Clear the input to show placeholder
                            setIsUserTyping(false);
                            setIsDestinationOpen(false);
                          }}
                        >
                          {/* Elegant location icon */}
                          <div className="flex items-center justify-center w-8 h-8 mr-3 flex-shrink-0">
                            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                              <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Main content area */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                {/* City name and Live API badge */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm truncate">
                                    {dest.name}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    Live API
                                  </span>
                                </div>

                                {/* Country info */}
                                <div className="text-xs text-gray-500">
                                  <span className="capitalize">
                                    {dest.type}
                                  </span>
                                  {dest.country && (
                                    <span> in {dest.country}</span>
                                  )}
                                </div>
                              </div>

                              {/* City code aligned right */}
                              <div className="flex-shrink-0 ml-3">
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
                                  {dest.code}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="px-4 py-2 border-t bg-gray-50">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <span>🔍</span>
                          <span>
                            Type to search 1000+ destinations from database
                          </span>
                        </p>
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <span>💡</span>
                          <span>
                            Use the cities above for testing live Hotelbeds API
                            data
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-in Date */}
          <div className="flex-1 lg:max-w-[280px]">
            {isMobile ? (
              <Button
                variant="outline"
                className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-blue-400 hover:border-blue-500 rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                onClick={() => setShowMobileDatePicker(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  <span className="sm:hidden text-xs">
                    {checkInDate && checkOutDate ? (
                      <>
                        {format(checkInDate, "EEE, MMM d")} -{" "}
                        {format(checkOutDate, "EEE, MMM d")}
                      </>
                    ) : (
                      "Dates"
                    )}
                  </span>
                </span>
              </Button>
            ) : (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-blue-400 hover:border-blue-500 rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm">
                      <span className="hidden md:inline">
                        {checkInDate && checkOutDate ? (
                          <>
                            {format(checkInDate, "EEE, MMM d")} to{" "}
                            {format(checkOutDate, "EEE, MMM d")}
                          </>
                        ) : (
                          "Check-in to Check-out"
                        )}
                      </span>
                      <span className="hidden sm:inline md:hidden">
                        {checkInDate && checkOutDate ? (
                          <>
                            {format(checkInDate, "d MMM")} -{" "}
                            {format(checkOutDate, "d MMM")}
                          </>
                        ) : (
                          "Select dates"
                        )}
                      </span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex flex-col">
                    <BookingCalendar
                      initialRange={{
                        startDate: checkInDate || new Date(),
                        endDate:
                          checkOutDate || addDays(checkInDate || new Date(), 3),
                      }}
                      onChange={(range) => {
                        console.log("Booking calendar range selected:", range);
                        setCheckInDate(range.startDate);
                        setCheckOutDate(range.endDate);
                      }}
                      onClose={() => setIsCalendarOpen(false)}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Guests & Rooms */}
          <div className="flex-1 lg:max-w-[220px]">
            <label className="text-xs font-medium text-gray-800 mb-1 block sm:hidden">
              Guests & Rooms
            </label>
            <Popover
              open={isGuestPopoverOpen}
              onOpenChange={setIsGuestPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-blue-400 hover:border-blue-500 rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                >
                  <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    <span className="hidden md:inline">
                      {guests.adults} adults, {guests.children} children,{" "}
                      {guests.rooms} room{guests.rooms > 1 ? "s" : ""}
                    </span>
                    <span className="hidden sm:inline md:hidden">
                      {guests.adults + guests.children} guests, {guests.rooms}{" "}
                      room{guests.rooms > 1 ? "s" : ""}
                    </span>
                    <span className="sm:hidden">
                      {guests.rooms} Room{guests.rooms > 1 ? "s" : ""} •{" "}
                      {guests.adults} Adult{guests.adults > 1 ? "s" : ""} •{" "}
                      {guests.children} Child
                      {guests.children !== 1 ? "ren" : ""}
                    </span>
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96" align="start">
                <div className="space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Adults</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateGuestCount("adults", "decrement")}
                        disabled={guests.adults <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {guests.adults}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateGuestCount("adults", "increment")}
                        disabled={guests.adults >= 16}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Children</div>
                      <div className="text-sm text-gray-500">Ages 0-17</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() =>
                          updateGuestCount("children", "decrement")
                        }
                        disabled={guests.children <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {guests.children}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() =>
                          updateGuestCount("children", "increment")
                        }
                        disabled={guests.children >= 16}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Children Ages */}
                  {guests.children > 0 && (
                    <div className="space-y-2">
                      {guests.childrenAges.map((age, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            Age of child {index + 1}
                          </span>
                          <Select
                            value={age.toString()}
                            onValueChange={(value) =>
                              updateChildAge(index, parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {childAgeOptions.map((ageOption) => (
                                <SelectItem
                                  key={ageOption}
                                  value={ageOption.toString()}
                                >
                                  {ageOption} years old
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Rooms</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateGuestCount("rooms", "decrement")}
                        disabled={guests.rooms <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {guests.rooms}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateGuestCount("rooms", "increment")}
                        disabled={guests.rooms >= 8}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Traveling with pets */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Traveling with pets?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={travelingWithPets}
                        onChange={(e) => setTravelingWithPets(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="text-xs text-gray-500">
                    Assistance animals aren't considered pets.
                  </div>

                  <Button
                    onClick={() => setIsGuestPopoverOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Button
              onClick={handleSearch}
              className="h-10 sm:h-12 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded px-6 sm:px-8 touch-manipulation transition-all duration-150"
              title="Search hotels"
            >
              <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Search</span>
            </Button>
          </div>
        </div>

        {/* Mobile Date Picker */}
        <MobileDatePicker
          isOpen={showMobileDatePicker}
          onClose={() => setShowMobileDatePicker(false)}
          tripType={tripType}
          setTripType={setTripType}
          selectedDepartureDate={checkInDate}
          selectedReturnDate={checkOutDate}
          setSelectedDepartureDate={(date) => setCheckInDate(date)}
          setSelectedReturnDate={(date) => setCheckOutDate(date)}
          selectingDeparture={true}
          setSelectingDeparture={() => {}}
        />
      </div>
    </>
  );
}
