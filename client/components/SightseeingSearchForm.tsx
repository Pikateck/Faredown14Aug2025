import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sightseeingService } from "@/services/sightseeingService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookingCalendar } from "@/components/BookingCalendar";
import { MobileDatePicker } from "@/components/MobileDropdowns";
import { format, addDays } from "date-fns";
import { MapPin, CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/components/ErrorBanner";

interface DestinationOption {
  id: string;
  code: string;
  name: string;
  country: string;
  type: string;
  flag?: string;
  popular?: boolean;
}

export function SightseeingSearchForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // EXACT HOTELS STATE PATTERN - WHOLESALE COPY
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

  // Mobile-specific states
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
  const [tripType, setTripType] = useState("round-trip");

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

  // Debug effect to track destination changes
  useEffect(() => {
    console.log("🔍 [DEBUG] Destination state changed:", {
      destination,
      destinationCode,
      isUserTyping,
      inputValue,
      displayValue: isUserTyping ? inputValue : destination || "",
    });
  }, [destination, destinationCode, isUserTyping, inputValue]);

  // Mobile-optimized destination selection handler
  const selectDestination = useCallback(
    (dest: any, source: string) => {
      const fullName = `${dest.name}, ${dest.country}`;
      console.log(`🎯 [${source}] Destination selection triggered:`, {
        name: fullName,
        code: dest.code || dest.id,
        type: dest.type,
        currentState: { destination, destinationCode, isUserTyping },
      });

      // Update all states immediately
      setDestination(fullName);
      setDestinationCode(dest.code || dest.id);
      setIsUserTyping(false);
      setInputValue("");
      setIsDestinationOpen(false);

      // Force a re-render to ensure UI updates
      setTimeout(() => {
        setDestination(fullName);
        console.log(`🔄 [${source}] Force refresh completed:`, fullName);
      }, 10);

      console.log(`✅ [${source}] Destination selection completed:`, fullName);
    },
    [destination, destinationCode, isUserTyping],
  );

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load popular destinations from database on component mount - EXACT HOTELS PATTERN
  useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        console.log(
          "🎆 Loading popular sightseeing destinations from database...",
        );
        const popular = await sightseeingService.searchDestinations(""); // Empty query for popular
        const formattedPopular = popular.map((dest) => ({
          id: dest.code,
          code: dest.code, // dest.code is the destination code
          name: dest.name,
          country: dest.country,
          type: dest.type as "city" | "region" | "country" | "landmark",
        }));
        setPopularDestinations(formattedPopular);
        setPopularDestinationsLoaded(true);
        console.log(
          "✅ Loaded",
          formattedPopular.length,
          "popular sightseeing destinations from database",
        );
      } catch (error) {
        console.error(
          "⚠️ Failed to load popular destinations, using fallback:",
          error,
        );
        // Static fallback if database fails - EXACT HOTELS PATTERN
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
            flag: "🇫��",
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

  // Initialize form state from URL parameters - CRITICAL FOR MOBILE
  useEffect(() => {
    console.log(
      "🔄 Initializing sightseeing form from URL parameters:",
      searchParams.toString(),
    );

    // Initialize destination
    const urlDestination = searchParams.get("dest");
    const urlDestinationName = searchParams.get("destinationName");

    if (urlDestination && urlDestinationName) {
      setDestination(urlDestinationName);
      setDestinationCode(urlDestination);
      setInputValue("");
      setIsUserTyping(false);
      console.log(
        "✅ Set destination from URL:",
        urlDestinationName,
        "->",
        urlDestination,
      );
    }

    // Initialize check-in date
    const urlCheckIn = searchParams.get("checkIn");
    if (urlCheckIn) {
      try {
        const parsedDate = new Date(decodeURIComponent(urlCheckIn));
        if (!isNaN(parsedDate.getTime())) {
          const localDate = new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate(),
          );
          setCheckInDate(localDate);
          console.log("✅ Set check-in date from URL:", localDate);
        }
      } catch (error) {
        console.error("❌ Error parsing check-in date from URL:", error);
      }
    }

    // Initialize check-out date
    const urlCheckOut = searchParams.get("checkOut");
    if (urlCheckOut) {
      try {
        const parsedDate = new Date(decodeURIComponent(urlCheckOut));
        if (!isNaN(parsedDate.getTime())) {
          const localDate = new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate(),
          );
          setCheckOutDate(localDate);
          console.log("✅ Set check-out date from URL:", localDate);
        }
      } catch (error) {
        console.error("❌ Error parsing check-out date from URL:", error);
      }
    }
  }, [searchParams]);

  // EXACT HOTELS SEARCH PATTERN
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
          console.log(`🔍 Real-time sightseeing search: "${query}"`);

          // Get search results using single query parameter - ONLY CHANGE FROM HOTELS
          const results = await sightseeingService.searchDestinations(query);

          const formattedResults = results.map((dest) => ({
            id: dest.code,
            code: dest.code,
            name: dest.name,
            country: dest.country,
            type: dest.type as "city" | "region" | "country" | "landmark",
            popular: (dest as any).popular || false,
            flag: (dest as any).flag || "🌍",
          }));

          setDestinationSuggestions(formattedResults);
          console.log(
            `✅ Real-time sightseeing results: ${formattedResults.length} destinations`,
          );
        } catch (error) {
          console.error("⚠️ Real-time sightseeing search failed:", error);

          // Enhanced fallback with popular destinations filter
          const fallbackDestinations = popularDestinations.filter(
            (dest) =>
              dest.name.toLowerCase().includes(query.toLowerCase()) ||
              dest.country.toLowerCase().includes(query.toLowerCase()) ||
              dest.code.toLowerCase().includes(query.toLowerCase()),
          );

          setDestinationSuggestions(fallbackDestinations.slice(0, 8));
          console.log(
            `🔄 Fallback sightseeing results: ${fallbackDestinations.length} destinations`,
          );
        } finally {
          setLoadingDestinations(false);
        }
      }, 100); // Ultra-fast like Booking.com
    },
    [popularDestinations],
  );

  // Search only when typing - FIXED
  useEffect(() => {
    if (popularDestinationsLoaded && isDestinationOpen && isUserTyping) {
      if (inputValue && inputValue.trim().length >= 3) {
        // Search only when actively typing with min 3 chars
        searchDestinations(inputValue);
      } else {
        // Clear search results when input is too short
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

  const handleSearch = () => {
    console.log("🔍 Starting sightseeing search with:", {
      destination,
      destinationCode,
      checkInDate,
      checkOutDate,
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
        dest: destinationCode, // USE DESTINATION CODE
        destinationName: destination,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: "2",
        children: "0",
      });

      const url = `/sightseeing/results?${searchParams.toString()}`;
      console.log("🎭 Navigating to live sightseeing search:", url);
      navigate(url);
    } catch (error) {
      console.error("🚨 Error in handleSearch:", error);
      setErrorMessage("Search failed. Please try again.");
      setShowError(true);
    }
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
          {/* Destination - EXACT HOTELS PATTERN */}
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
                      d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
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
                    onFocus={() => {
                      setIsDestinationOpen(true);
                      if (!destinationCode) {
                        setIsUserTyping(true);
                      } else {
                        setIsUserTyping(false); // show popular, no fetch
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
                    className="pl-10 pr-8 h-10 sm:h-12 bg-white border-2 border-blue-400 focus:border-[#003580] rounded font-medium text-xs sm:text-sm touch-manipulation relative z-10 text-gray-900 placeholder-gray-500"
                    placeholder="Where do you want to explore?"
                    autoComplete="off"
                    data-destination-input="true"
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectDestination(dest, "SEARCH_CLICK");
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectDestination(dest, "SEARCH_TOUCH");
                          }}
                        >
                          {/* Elegant search result icon */}
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
                                  d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                                />
                              </svg>
                            </div>
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
                                </div>

                                {/* Country and region info */}
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
                      {/* Sightseeing Test Destinations */}
                      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                        <span className="text-sm font-semibold text-blue-800">
                          🎯 Sightseeing Test Destinations
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectDestination(dest, "POPULAR_CLICK");
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectDestination(dest, "POPULAR_TOUCH");
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
                                  d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
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
                            Use the cities above for testing live Hotelbeds
                            Activities API
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
                className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-blue-400 hover:border-blue-500 hover:bg-white rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation text-black"
                onClick={() => setShowMobileDatePicker(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
                <span className="truncate text-xs sm:text-sm text-black">
                  {checkInDate && checkOutDate ? (
                    <>
                      {format(checkInDate, "EEE, MMM d")} -{" "}
                      {format(checkOutDate, "EEE, MMM d")}
                    </>
                  ) : (
                    "Select dates"
                  )}
                </span>
              </Button>
            ) : (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-blue-400 hover:border-blue-500 hover:bg-white rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation text-black"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
                    <span className="truncate text-xs sm:text-sm text-black">
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

          {/* Search Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Button
              onClick={handleSearch}
              className="h-10 sm:h-12 w-full sm:w-auto font-bold rounded px-6 sm:px-8 touch-manipulation transition-all duration-150 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white"
              title="Search sightseeing activities"
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
          selectedDepartureDate={checkInDate || null}
          selectedReturnDate={checkOutDate || null}
          setSelectedDepartureDate={(date) => {
            setCheckInDate(date || undefined);
          }}
          setSelectedReturnDate={(date) => {
            setCheckOutDate(date || undefined);
          }}
          selectingDeparture={true}
          setSelectingDeparture={() => {}}
          bookingType="hotels"
        />
      </div>
    </>
  );
}
