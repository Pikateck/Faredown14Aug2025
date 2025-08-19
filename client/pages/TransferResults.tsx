import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FlightStyleBargainModal } from "@/components/FlightStyleBargainModal";
import { TransfersSearchForm } from "@/components/TransfersSearchForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MobileBottomBar } from "@/components/mobile/MobileBottomBar";
import {
  Filter,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Car,
  Shield,
  Wifi,
  User,
  X,
  ArrowUpDown,
  ChevronDown,
  TrendingDown,
  Navigation,
  Luggage,
  Baby,
  Accessibility,
  CheckCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transfer {
  id: string;
  rateKey: string;
  supplierCode: string;
  vehicleType: string;
  vehicleClass: string;
  vehicleName: string;
  vehicleImage?: string;
  maxPassengers: number;
  maxLuggage: number;
  pickupLocation: string;
  pickupInstructions?: string;
  dropoffLocation: string;
  dropoffInstructions?: string;
  estimatedDuration: number;
  distance?: string;
  currency: string;
  basePrice: number;
  totalPrice: number;
  pricing: {
    basePrice: number;
    markupAmount: number;
    discountAmount: number;
    totalPrice: number;
    currency: string;
    savings: number;
  };
  features: string[];
  inclusions: string[];
  exclusions: string[];
  providerName: string;
  providerRating?: number;
  cancellationPolicy: any;
  freeWaitingTime: number;
  confirmationType: string;
  searchSessionId: string;
}

export default function TransferResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  // Extract search parameters
  const pickupCode = searchParams.get("pickup") || "";
  const dropoffCode = searchParams.get("dropoff") || "";
  const pickupLocation =
    searchParams.get("pickupLocation") || searchParams.get("pickup") || "";
  const dropoffLocation =
    searchParams.get("dropoffLocation") || searchParams.get("dropoff") || "";
  const pickupDate = searchParams.get("pickupDate") || "";
  const pickupTime = searchParams.get("pickupTime") || "10:00";
  const returnDate = searchParams.get("returnDate") || "";
  const returnTime = searchParams.get("returnTime") || "14:00";
  const passengers = searchParams.get("passengers") || "2";
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");
  const vehicleType = searchParams.get("vehicleType") || "";
  const isRoundTrip =
    searchParams.get("returnDate") !== null ||
    searchParams.get("isRoundTrip") === "true";

  // State for transfers data
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and sort states
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [sortBy, setSortBy] = useState("price_low");

  // Mobile states
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Bargain modal states
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null,
  );

  // Selection state for mobile
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(
    new Set(),
  );
  const [showBottomBar, setShowBottomBar] = useState(false);

  // Available filters based on current data
  const availableFilters = useMemo(() => {
    const vehicleTypes = [...new Set(transfers.map((t) => t.vehicleType))];
    const vehicleClasses = [...new Set(transfers.map((t) => t.vehicleClass))];
    const providers = [...new Set(transfers.map((t) => t.providerName))];
    const maxCapacities = [
      ...new Set(transfers.map((t) => t.maxPassengers)),
    ].sort((a, b) => a - b);

    return {
      vehicleType: vehicleTypes,
      vehicleClass: vehicleClasses,
      provider: providers,
      capacity: maxCapacities,
      features: [
        "meet_greet",
        "flight_monitoring",
        "free_waiting",
        "professional_driver",
        "wifi",
        "air_conditioning",
      ],
    };
  }, [transfers]);

  // Filter transfers based on selected filters and price range
  const filteredTransfers = useMemo(() => {
    let filtered = transfers.filter((transfer) => {
      // Price range filter
      if (
        transfer.pricing.totalPrice < priceRange[0] ||
        transfer.pricing.totalPrice > priceRange[1]
      ) {
        return false;
      }

      // Vehicle type filter
      if (
        selectedFilters.vehicleType?.length &&
        !selectedFilters.vehicleType.includes(transfer.vehicleType)
      ) {
        return false;
      }

      // Vehicle class filter
      if (
        selectedFilters.vehicleClass?.length &&
        !selectedFilters.vehicleClass.includes(transfer.vehicleClass)
      ) {
        return false;
      }

      // Provider filter
      if (
        selectedFilters.provider?.length &&
        !selectedFilters.provider.includes(transfer.providerName)
      ) {
        return false;
      }

      // Capacity filter
      if (selectedFilters.capacity?.length) {
        const capacityMatch = selectedFilters.capacity.some(
          (cap) => transfer.maxPassengers >= parseInt(cap),
        );
        if (!capacityMatch) return false;
      }

      // Features filter
      if (selectedFilters.features?.length) {
        const featuresMatch = selectedFilters.features.every((feature) =>
          transfer.features.includes(feature),
        );
        if (!featuresMatch) return false;
      }

      return true;
    });

    // Sort transfers
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);
        break;
      case "price_high":
        filtered.sort((a, b) => b.pricing.totalPrice - a.pricing.totalPrice);
        break;
      case "duration":
        filtered.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
        break;
      case "capacity":
        filtered.sort((a, b) => b.maxPassengers - a.maxPassengers);
        break;
      case "rating":
        filtered.sort(
          (a, b) => (b.providerRating || 0) - (a.providerRating || 0),
        );
        break;
      default:
        // Keep original order (recommended)
        break;
    }

    return filtered;
  }, [transfers, selectedFilters, priceRange, sortBy]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load transfer data
  useEffect(() => {
    const loadTransfers = async () => {
      try {
        setLoading(true);
        setError("");

        const searchPayload = {
          pickupLocation,
          dropoffLocation,
          pickupDate,
          pickupTime,
          ...(isRoundTrip && { returnDate, returnTime }),
          passengers: {
            adults: parseInt(adults),
            children: parseInt(children),
            infants: parseInt(infants),
          },
          isRoundTrip,
          vehicleType,
        };

        // Try API call first, but fallback to sample data if it fails
        try {
          const response = await fetch("/api/transfers/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchPayload),
          });

          if (!response.ok) {
            throw new Error(
              `API returned ${response.status}: ${response.statusText}`,
            );
          }

          const data = await response.json();

          if (data.success) {
            setTransfers(data.data.transfers || []);

            // Set initial price range based on results
            if (data.data.transfers.length > 0) {
              const prices = data.data.transfers.map(
                (t: Transfer) => t.pricing.totalPrice,
              );
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              setPriceRange([minPrice, maxPrice]);
            }
          } else {
            throw new Error(data.error || "API returned unsuccessful response");
          }
        } catch (apiError) {
          console.log("API call failed, using sample data:", apiError);
          // API failed, use sample data instead
          throw new Error("API unavailable, using demo data");
        }
      } catch (err) {
        console.log("Loading sample transfer data due to:", err);
        setError(""); // Clear error since we're using fallback data
        // Load sample data for demo
        loadSampleData();
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, [
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    adults,
    children,
    infants,
    vehicleType,
    isRoundTrip,
  ]);

  // Load sample data for demo
  const loadSampleData = () => {
    const sampleTransfers: Transfer[] = [
      {
        id: "hotelbeds_1",
        rateKey: "sample_rate_1",
        supplierCode: "hotelbeds",
        vehicleType: "sedan",
        vehicleClass: "economy",
        vehicleName: "Sedan - Economy",
        maxPassengers: 3,
        maxLuggage: 2,
        pickupLocation: pickupLocation || "Mumbai Airport (BOM)",
        dropoffLocation: dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "25 km",
        currency: "INR",
        basePrice: 1200,
        totalPrice: 1380,
        pricing: {
          basePrice: 1200,
          markupAmount: 180,
          discountAmount: 0,
          totalPrice: 1380,
          currency: "INR",
          savings: 0,
        },
        features: ["meet_greet", "professional_driver", "free_waiting"],
        inclusions: [
          "Professional driver",
          "Meet & greet service",
          "60 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Mumbai Transfers Ltd",
        providerRating: 4.3,
        cancellationPolicy: { freeUntil: "24h", feePercentage: 10 },
        freeWaitingTime: 60,
        confirmationType: "INSTANT",
        searchSessionId: "demo_session",
      },
      {
        id: "hotelbeds_2",
        rateKey: "sample_rate_2",
        supplierCode: "hotelbeds",
        vehicleType: "suv",
        vehicleClass: "premium",
        vehicleName: "SUV - Premium",
        maxPassengers: 6,
        maxLuggage: 4,
        pickupLocation: pickupLocation || "Mumbai Airport (BOM)",
        dropoffLocation: dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "25 km",
        currency: "INR",
        basePrice: 2200,
        totalPrice: 2530,
        pricing: {
          basePrice: 2200,
          markupAmount: 330,
          discountAmount: 0,
          totalPrice: 2530,
          currency: "INR",
          savings: 0,
        },
        features: [
          "meet_greet",
          "professional_driver",
          "free_waiting",
          "wifi",
          "air_conditioning",
        ],
        inclusions: [
          "Professional driver",
          "Meet & greet service",
          "Free WiFi",
          "Air conditioning",
          "90 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Premium Transfers",
        providerRating: 4.7,
        cancellationPolicy: { freeUntil: "24h", feePercentage: 15 },
        freeWaitingTime: 90,
        confirmationType: "INSTANT",
        searchSessionId: "demo_session",
      },
      {
        id: "hotelbeds_3",
        rateKey: "sample_rate_3",
        supplierCode: "hotelbeds",
        vehicleType: "luxury",
        vehicleClass: "luxury",
        vehicleName: "Mercedes E-Class",
        maxPassengers: 3,
        maxLuggage: 3,
        pickupLocation: pickupLocation || "Mumbai Airport (BOM)",
        dropoffLocation: dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 40,
        distance: "25 km",
        currency: "INR",
        basePrice: 3800,
        totalPrice: 4370,
        pricing: {
          basePrice: 3800,
          markupAmount: 570,
          discountAmount: 0,
          totalPrice: 4370,
          currency: "INR",
          savings: 0,
        },
        features: [
          "meet_greet",
          "professional_driver",
          "free_waiting",
          "wifi",
          "air_conditioning",
          "flight_monitoring",
        ],
        inclusions: [
          "Professional chauffeur",
          "VIP service",
          "Flight monitoring",
          "Complimentary refreshments",
          "120 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Luxury Chauffeurs",
        providerRating: 4.9,
        cancellationPolicy: { freeUntil: "12h", feePercentage: 25 },
        freeWaitingTime: 120,
        confirmationType: "INSTANT",
        searchSessionId: "demo_session",
      },
    ];

    setTransfers(sampleTransfers);

    // Set price range
    const prices = sampleTransfers.map((t) => t.pricing.totalPrice);
    setPriceRange([Math.min(...prices), Math.max(...prices)]);
  };

  const handleFilterChange = (
    filterType: string,
    value: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => {
      const current = prev[filterType] || [];
      if (checked) {
        return { ...prev, [filterType]: [...current, value] };
      } else {
        return { ...prev, [filterType]: current.filter((v) => v !== value) };
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    const prices = transfers.map((t) => t.pricing.totalPrice);
    if (prices.length > 0) {
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
  };

  const handleBargain = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowBargainModal(true);
  };

  // Handle transfer selection
  const handleTransferSelect = (transfer: Transfer) => {
    const newSelected = new Set(selectedTransfers);
    if (newSelected.has(transfer.id)) {
      newSelected.delete(transfer.id);
    } else {
      newSelected.add(transfer.id);
    }
    setSelectedTransfers(newSelected);
    setShowBottomBar(newSelected.size > 0);
  };

  // Calculate total price for selected transfers
  const calculateTotalPrice = () => {
    if (selectedTransfers.size === 0) return 0;

    return Array.from(selectedTransfers).reduce((total, transferId) => {
      const transfer = transfers.find((t) => t.id === transferId);
      return total + (transfer?.pricing.totalPrice || 0);
    }, 0);
  };

  // Handle bottom bar actions
  const handleBottomBarBargain = () => {
    if (selectedTransfers.size > 0) {
      const firstSelected = transfers.find((t) => selectedTransfers.has(t.id));
      if (firstSelected) {
        handleBargain(firstSelected);
      }
    }
  };

  const handleBottomBarViewDetails = () => {
    if (selectedTransfers.size > 0) {
      const firstSelected = transfers.find((t) => selectedTransfers.has(t.id));
      if (firstSelected) {
        const detailParams = new URLSearchParams({
          price: firstSelected.pricing.totalPrice.toString(),
          from: firstSelected.pickupLocation,
          to: firstSelected.dropoffLocation,
          vehicle: firstSelected.vehicleName,
          pickupDate,
          pickupTime,
          ...(isRoundTrip && { returnDate, returnTime }),
          adults: adults.toString(),
          children: children.toString(),
          infants: infants.toString(),
          tripType: isRoundTrip ? "return" : "one-way",
        });
        navigate(
          `/transfer-details/${firstSelected.id}?${detailParams.toString()}`,
        );
      }
    }
  };

  const handleBookNow = (transfer: Transfer) => {
    const bookingParams = new URLSearchParams({
      transferId: transfer.id,
      rateKey: transfer.rateKey,
      vehicleName: transfer.vehicleName,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      ...(isRoundTrip && { returnDate, returnTime }),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      price: transfer.pricing.totalPrice.toString(),
    });

    navigate(`/transfer-booking?${bookingParams.toString()}`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case "sedan":
        return <Car className="w-5 h-5" />;
      case "suv":
        return <Car className="w-5 h-5" />;
      case "minivan":
        return <Car className="w-5 h-5" />;
      case "luxury":
        return <Car className="w-5 h-5" />;
      case "wheelchair":
        return <Accessibility className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "meet_greet":
        return <User className="w-4 h-4" />;
      case "flight_monitoring":
        return <Navigation className="w-4 h-4" />;
      case "free_waiting":
        return <Clock className="w-4 h-4" />;
      case "professional_driver":
        return <User className="w-4 h-4" />;
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "air_conditioning":
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {/* Search Form at Top */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <TransfersSearchForm />
        </div>
      </div>

      {/* Search Summary Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{pickupLocation}</span>
                <span>→</span>
                <span>{dropoffLocation}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {pickupDate && !isNaN(new Date(pickupDate).getTime())
                    ? `${new Date(pickupDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at ${pickupTime}`
                    : "Date not selected"}
                </span>
                {isRoundTrip && returnDate && (
                  <>
                    <span>-</span>
                    <span>
                      {!isNaN(new Date(returnDate).getTime())
                        ? `${new Date(returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at ${returnTime}`
                        : "Return date not selected"}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>
                  {(() => {
                    const totalPassengers =
                      parseInt(adults) + parseInt(children) + parseInt(infants);
                    const parts = [];
                    if (parseInt(adults) > 0)
                      parts.push(
                        `${adults} adult${parseInt(adults) > 1 ? "s" : ""}`,
                      );
                    if (parseInt(children) > 0)
                      parts.push(
                        `${children} child${parseInt(children) > 1 ? "ren" : ""}`,
                      );
                    if (parseInt(infants) > 0)
                      parts.push(
                        `${infants} infant${parseInt(infants) > 1 ? "s" : ""}`,
                      );
                    return parts.length > 0
                      ? parts.join(" • ")
                      : `${totalPassengers} passenger${totalPassengers !== 1 ? "s" : ""}`;
                  })()}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar */}
          <div
            className={cn(
              "lg:col-span-1",
              isMobile && !showFilters && "hidden",
            )}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={Math.max(
                    ...transfers.map((t) => t.pricing.totalPrice),
                    10000,
                  )}
                  min={Math.min(
                    ...transfers.map((t) => t.pricing.totalPrice),
                    0,
                  )}
                  step={100}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Vehicle Type */}
              {availableFilters.vehicleType.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Vehicle Type</h4>
                  <div className="space-y-2">
                    {availableFilters.vehicleType.map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <Checkbox
                          checked={
                            selectedFilters.vehicleType?.includes(type) || false
                          }
                          onCheckedChange={(checked) =>
                            handleFilterChange("vehicleType", type, !!checked)
                          }
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle Class */}
              {availableFilters.vehicleClass.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Vehicle Class</h4>
                  <div className="space-y-2">
                    {availableFilters.vehicleClass.map((cls) => (
                      <label key={cls} className="flex items-center space-x-2">
                        <Checkbox
                          checked={
                            selectedFilters.vehicleClass?.includes(cls) || false
                          }
                          onCheckedChange={(checked) =>
                            handleFilterChange("vehicleClass", cls, !!checked)
                          }
                        />
                        <span className="text-sm capitalize">{cls}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-2">
                  {availableFilters.features.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={
                          selectedFilters.features?.includes(feature) || false
                        }
                        onCheckedChange={(checked) =>
                          handleFilterChange("features", feature, !!checked)
                        }
                      />
                      <span className="text-sm">
                        {feature
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filteredTransfers.length} transfer
                {filteredTransfers.length !== 1 ? "s" : ""} found
              </h2>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                  Sort:
                </span>
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="duration">Duration</option>
                    <option value="capacity">Capacity</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Transfer Cards */}
            <div className="space-y-3">
              {filteredTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className={cn(
                    "bg-white rounded-lg shadow-sm border-2 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group mb-4",
                    selectedTransfers.has(transfer.id)
                      ? "border-[#ff6b00] shadow-lg ring-2 ring-[#ff6b00] ring-opacity-30"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden p-4">
                    {/* Transfer Header with Selection */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Vehicle Icon */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getVehicleIcon(transfer.vehicleType)}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base mb-1">
                            {transfer.vehicleName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {transfer.vehicleClass}
                            </Badge>
                            <span className="text-sm text-gray-600 truncate">
                              By {transfer.providerName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex-shrink-0">
                        {selectedTransfers.has(transfer.id) ? (
                          <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transfer Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {transfer.maxPassengers}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Luggage className="w-4 h-4" />
                        <span>{transfer.maxLuggage} bags</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDuration(transfer.estimatedDuration)}
                        </span>
                      </div>
                      {transfer.distance && (
                        <div className="flex items-center space-x-1">
                          <Navigation className="w-4 h-4" />
                          <span>{transfer.distance}</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {transfer.features.slice(0, 3).map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          {getFeatureIcon(feature)}
                          <span>
                            {feature
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {isRoundTrip ? "Round trip" : "One way"}
                          </div>
                          {transfer.pricing.savings > 0 && (
                            <div className="text-xs text-green-600 mb-1">
                              Save {formatPrice(transfer.pricing.savings)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(transfer.pricing.totalPrice)}
                          </div>
                          {transfer.providerRating && (
                            <div className="flex items-center justify-end gap-1 text-xs">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-gray-600">
                                {transfer.providerRating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SELECT Button - Native App Style */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleTransferSelect(transfer)}
                        className={cn(
                          "w-full py-3 px-4 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 border",
                          selectedTransfers.has(transfer.id)
                            ? "bg-[#003580] text-white border-[#003580] hover:bg-[#002a66] shadow-md"
                            : "bg-white text-[#003580] border-[#003580] hover:bg-gray-50",
                        )}
                      >
                        {selectedTransfers.has(transfer.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">SELECTED</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">SELECT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4">
                    {/* Left Section - Transfer Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {/* Vehicle Icon */}
                        <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getVehicleIcon(transfer.vehicleType)}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {transfer.vehicleName}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {transfer.vehicleClass}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                Up to {transfer.maxPassengers} passengers
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Luggage className="w-4 h-4" />
                              <span>{transfer.maxLuggage} bags</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatDuration(transfer.estimatedDuration)}
                              </span>
                            </div>
                            {transfer.distance && (
                              <div className="flex items-center space-x-1">
                                <Navigation className="w-4 h-4" />
                                <span>{transfer.distance}</span>
                              </div>
                            )}
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {transfer.features.slice(0, 4).map((feature) => (
                              <div
                                key={feature}
                                className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                              >
                                {getFeatureIcon(feature)}
                                <span>
                                  {feature
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              </div>
                            ))}
                            {transfer.features.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{transfer.features.length - 4} more
                              </span>
                            )}
                          </div>

                          {/* Provider Info */}
                          <div className="flex items-center space-x-3 text-sm">
                            <span className="text-gray-600">
                              By {transfer.providerName}
                            </span>
                            {transfer.providerRating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-gray-600">
                                  {transfer.providerRating}
                                </span>
                              </div>
                            )}
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-200"
                            >
                              {transfer.confirmationType === "INSTANT"
                                ? "Instant Confirmation"
                                : "Confirmation Required"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Pricing and Actions */}
                    <div className="flex-shrink-0 lg:w-56 text-right">
                      {/* Pricing */}
                      <div className="mb-2">
                        {transfer.pricing.savings > 0 && (
                          <div className="text-sm text-green-600 mb-1">
                            Save {formatPrice(transfer.pricing.savings)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(transfer.pricing.totalPrice)}
                        </div>
                        {transfer.pricing.markupAmount > 0 && (
                          <div className="text-sm text-gray-500">
                            Base: {formatPrice(transfer.pricing.basePrice)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {isRoundTrip ? "Round trip" : "One way"}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            const detailParams = new URLSearchParams({
                              price: transfer.pricing.totalPrice.toString(),
                              from: transfer.pickupLocation,
                              to: transfer.dropoffLocation,
                              vehicle: transfer.vehicleName,
                              pickupDate,
                              pickupTime,
                              ...(isRoundTrip && { returnDate, returnTime }),
                              adults: adults.toString(),
                              children: children.toString(),
                              infants: infants.toString(),
                              tripType: isRoundTrip ? "return" : "one-way",
                            });
                            navigate(
                              `/transfer-details/${transfer.id}?${detailParams.toString()}`,
                            );
                          }}
                          className="w-full py-3 border-2 border-[#003580] bg-transparent hover:bg-[#003580] text-[#003580] hover:text-white font-semibold text-sm min-h-[44px] rounded-xl shadow-sm active:scale-95 touch-manipulation transition-all duration-200"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleBargain(transfer)}
                          className="w-full py-3 bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] rounded-xl shadow-sm active:scale-95 touch-manipulation transition-all duration-200"
                        >
                          <TrendingDown className="w-4 h-4" />
                          Bargain
                        </Button>
                      </div>

                      {/* Cancellation Policy */}
                      <div className="text-xs text-gray-500 mt-2">
                        Free cancellation up to{" "}
                        {transfer.cancellationPolicy?.freeUntil || "24h"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredTransfers.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No transfers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Bottom Bar */}
      {isMobile && !showBottomBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                {filteredTransfers.length} transfer
                {filteredTransfers.length !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-600">
                From{" "}
                {filteredTransfers.length > 0
                  ? formatPrice(
                      Math.min(
                        ...filteredTransfers.map((t) => t.pricing.totalPrice),
                      ),
                    )
                  : "N/A"}
              </div>
            </div>
            <Button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      )}

      {/* Transfer Selection Bottom Panel */}
      {showBottomBar && selectedTransfers.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {selectedTransfers.size} transfer
                  {selectedTransfers.size > 1 ? "s" : ""} selected
                </div>
                <div className="text-xs text-gray-600">
                  From{" "}
                  {formatPrice(calculateTotalPrice() / selectedTransfers.size)}{" "}
                  average
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#003580]">
                  {formatPrice(calculateTotalPrice())}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBottomBarBargain}
                className="flex-1 py-3 bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px] rounded-xl shadow-sm active:scale-95 touch-manipulation transition-all duration-200"
              >
                <TrendingDown className="w-4 h-4" />
                Bargain
              </Button>
              <Button
                onClick={handleBottomBarViewDetails}
                className="flex-1 py-3 border-2 border-[#003580] bg-transparent hover:bg-[#003580] text-[#003580] hover:text-white font-semibold text-sm min-h-[48px] rounded-xl shadow-sm active:scale-95 touch-manipulation transition-all duration-200"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Bargain Modal */}
      <FlightStyleBargainModal
        type="transfer"
        roomType={
          selectedTransfer
            ? {
                id: selectedTransfer.id,
                name: selectedTransfer.vehicleName,
                description: `${selectedTransfer.vehicleClass.charAt(0).toUpperCase() + selectedTransfer.vehicleClass.slice(1)} transfer for up to ${selectedTransfer.maxPassengers} passengers`,
                image:
                  selectedTransfer.vehicleImage || "/api/placeholder/120/80",
                marketPrice: selectedTransfer.pricing.totalPrice * 1.2, // Show higher market price
                totalPrice: selectedTransfer.pricing.totalPrice,
                total: selectedTransfer.pricing.totalPrice,
                features: selectedTransfer.features || [],
                maxOccupancy: selectedTransfer.maxPassengers,
                bedType: `${formatDuration(selectedTransfer.estimatedDuration)} journey`,
                size: selectedTransfer.vehicleType,
                cancellation: "Free cancellation",
              }
            : null
        }
        hotel={
          selectedTransfer
            ? {
                id: parseInt(selectedTransfer.id.replace(/\D/g, "") || "1"),
                name: `${selectedTransfer.vehicleClass.charAt(0).toUpperCase() + selectedTransfer.vehicleClass.slice(1)} - ${selectedTransfer.vehicleType.charAt(0).toUpperCase() + selectedTransfer.vehicleType.slice(1)}`,
                location: `${pickupLocation} → ${dropoffLocation}`,
                rating: selectedTransfer.providerRating || 4.5,
                image:
                  selectedTransfer.vehicleImage || "/api/placeholder/120/80",
              }
            : null
        }
        isOpen={showBargainModal}
        onClose={() => {
          setShowBargainModal(false);
          setSelectedTransfer(null);
        }}
        checkInDate={new Date()} // Transfer date
        checkOutDate={new Date()} // Same day for transfers
        roomsCount={1} // One transfer booking
        onBookingSuccess={(finalPrice) => {
          setShowBargainModal(false);
          setSelectedTransfer(null);

          // Navigate to transfer booking with bargained price
          const bookingParams = new URLSearchParams({
            transferId: selectedTransfer?.id || "",
            rateKey: selectedTransfer?.rateKey || "",
            vehicleName: selectedTransfer?.vehicleName || "",
            price: finalPrice.toString(),
            bargainApplied: "true",
            pickupLocation: pickupLocation,
            dropoffLocation: dropoffLocation,
            pickupDate: pickupDate,
            pickupTime: pickupTime,
            ...(isRoundTrip && { returnDate, returnTime }),
            adults: adults.toString(),
            children: children.toString(),
            infants: infants.toString(),
          });

          navigate(`/transfer-booking?${bookingParams.toString()}`);
        }}
      />
    </div>
  );
}
