import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookingCalendar } from "@/components/BookingCalendar";
import {
  MobileDatePicker,
  MobileTravelers,
  MobileCityDropdown,
} from "@/components/MobileDropdowns";
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
  Clock,
  Car,
  Plane,
  Hotel,
  ArrowRight,
  Building2,
  Settings,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/components/ErrorBanner";

interface PassengerConfig {
  adults: number;
  children: number;
  childrenAges: number[];
  infants: number;
}

type TripType = "one-way" | "return";
type TransferMode = "airport" | "rental";

export function TransfersSearchForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const [transferMode, setTransferMode] = useState<TransferMode>("airport");
  const [tripType, setTripType] = useState<TripType>("one-way");

  // Location states
  const [pickup, setPickup] = useState<{
    code: string;
    label: string;
    type: string;
  } | null>(null);
  const [dropoff, setDropoff] = useState<{
    code: string;
    label: string;
    type: string;
  } | null>(null);

  // Date states
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState("12:00");
  const [returnTime, setReturnTime] = useState("12:00");

  // Passenger states
  const [passengers, setPassengers] = useState<PassengerConfig>({
    adults: 2,
    children: 0,
    childrenAges: [],
    infants: 0,
  });

  // Mobile dropdowns
  const [showMobileFromDestination, setShowMobileFromDestination] =
    useState(false);
  const [showMobileToDestination, setShowMobileToDestination] = useState(false);
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
  const [showMobilePassengers, setShowMobilePassengers] = useState(false);

  // Dropdown states for desktop
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [isDropoffDropdownOpen, setIsDropoffDropdownOpen] = useState(false);
  const [isPickupDateOpen, setIsPickupDateOpen] = useState(false);
  const [isReturnDateOpen, setIsReturnDateOpen] = useState(false);
  const [isPickupTimeOpen, setIsPickupTimeOpen] = useState(false);
  const [isReturnTimeOpen, setIsReturnTimeOpen] = useState(false);
  const [isPassengersDropdownOpen, setIsPassengersDropdownOpen] =
    useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Sample locations for transfers
  const transferLocations = [
    { code: "BOM", label: "Mumbai Airport (BOM)", type: "airport" },
    { code: "DEL", label: "Delhi Airport (DEL)", type: "airport" },
    { code: "DXB", label: "Dubai Airport (DXB)", type: "airport" },
    { code: "LHR", label: "London Heathrow (LHR)", type: "airport" },
    { code: "JFK", label: "New York JFK (JFK)", type: "airport" },
    { code: "taj-mumbai", label: "Hotel Taj Mahal Palace", type: "hotel" },
    { code: "oberoi-mumbai", label: "The Oberoi Mumbai", type: "hotel" },
    {
      code: "mumbai-central",
      label: "Mumbai Central Station",
      type: "station",
    },
    { code: "colaba", label: "Colaba District", type: "city" },
    { code: "downtown-dubai", label: "Downtown Dubai", type: "city" },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize form from URL parameters
  useEffect(() => {
    console.log(
      "🔄 Initializing transfers form from URL parameters:",
      searchParams.toString(),
    );

    // Initialize transfer mode
    const urlTransferMode = searchParams.get("transferMode");
    if (urlTransferMode === "airport" || urlTransferMode === "rental") {
      setTransferMode(urlTransferMode);
    }

    // Initialize trip type
    const urlTripType = searchParams.get("tripType");
    if (urlTripType === "one-way" || urlTripType === "return") {
      setTripType(urlTripType);
      console.log("✅ Set trip type from URL:", urlTripType);
    }

    // Initialize pickup location
    const urlPickup = searchParams.get("pickup");
    const urlPickupLocation = searchParams.get("pickupLocation");
    if (urlPickup && urlPickupLocation) {
      const pickupLocation = transferLocations.find(
        (loc) => loc.code === urlPickup,
      );
      if (pickupLocation) {
        setPickup(pickupLocation);
        console.log("✅ Set pickup from URL:", pickupLocation.label);
      } else {
        // Create location from URL params if not in predefined list
        setPickup({
          code: urlPickup,
          label: decodeURIComponent(urlPickupLocation),
          type: "unknown",
        });
        console.log(
          "✅ Set pickup from URL (custom):",
          decodeURIComponent(urlPickupLocation),
        );
      }
    }

    // Initialize dropoff location
    const urlDropoff = searchParams.get("dropoff");
    const urlDropoffLocation = searchParams.get("dropoffLocation");
    if (urlDropoff && urlDropoffLocation) {
      const dropoffLocation = transferLocations.find(
        (loc) => loc.code === urlDropoff,
      );
      if (dropoffLocation) {
        setDropoff(dropoffLocation);
        console.log("✅ Set dropoff from URL:", dropoffLocation.label);
      } else {
        // Create location from URL params if not in predefined list
        setDropoff({
          code: urlDropoff,
          label: decodeURIComponent(urlDropoffLocation),
          type: "unknown",
        });
        console.log(
          "✅ Set dropoff from URL (custom):",
          decodeURIComponent(urlDropoffLocation),
        );
      }
    }

    // Initialize pickup date
    const urlPickupDate = searchParams.get("pickupDate");
    if (urlPickupDate) {
      try {
        const parsedDate = new Date(urlPickupDate);
        if (!isNaN(parsedDate.getTime())) {
          setPickupDate(parsedDate);
          console.log("✅ Set pickup date from URL:", parsedDate);
        }
      } catch (error) {
        console.error("❌ Error parsing pickup date from URL:", error);
      }
    }

    // Initialize return date
    const urlReturnDate = searchParams.get("returnDate");
    if (urlReturnDate) {
      try {
        const parsedDate = new Date(urlReturnDate);
        if (!isNaN(parsedDate.getTime())) {
          setReturnDate(parsedDate);
          console.log("✅ Set return date from URL:", parsedDate);
        }
      } catch (error) {
        console.error("❌ Error parsing return date from URL:", error);
      }
    }

    // Initialize pickup time
    const urlPickupTime = searchParams.get("pickupTime");
    if (urlPickupTime) {
      setPickupTime(decodeURIComponent(urlPickupTime));
      console.log(
        "✅ Set pickup time from URL:",
        decodeURIComponent(urlPickupTime),
      );
    }

    // Initialize return time
    const urlReturnTime = searchParams.get("returnTime");
    if (urlReturnTime) {
      setReturnTime(decodeURIComponent(urlReturnTime));
      console.log(
        "✅ Set return time from URL:",
        decodeURIComponent(urlReturnTime),
      );
    }

    // Initialize passengers
    const urlAdults = searchParams.get("adults");
    const urlChildren = searchParams.get("children");
    const urlInfants = searchParams.get("infants");
    if (urlAdults || urlChildren || urlInfants) {
      setPassengers({
        adults: urlAdults ? parseInt(urlAdults) : 2,
        children: urlChildren ? parseInt(urlChildren) : 0,
        childrenAges: [],
        infants: urlInfants ? parseInt(urlInfants) : 0,
      });
      console.log("✅ Set passengers from URL:", {
        adults: urlAdults ? parseInt(urlAdults) : 2,
        children: urlChildren ? parseInt(urlChildren) : 0,
        infants: urlInfants ? parseInt(urlInfants) : 0,
      });
    }
  }, [searchParams]);

  // Time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  // Handle search
  const handleSearch = () => {
    if (!pickup || !dropoff || !pickupDate) {
      setErrorMessage(
        "Please select pickup location, dropoff location, and pickup date",
      );
      setShowError(true);
      return;
    }

    if (tripType === "return" && !returnDate) {
      setErrorMessage("Please select return date for round trip");
      setShowError(true);
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("transferMode", transferMode);
    searchParams.set("tripType", tripType);
    searchParams.set("pickup", pickup.code);
    searchParams.set("dropoff", dropoff.code);
    searchParams.set("pickupLocation", pickup.label);
    searchParams.set("dropoffLocation", dropoff.label);
    searchParams.set("pickupDate", pickupDate.toISOString().split("T")[0]);
    searchParams.set("pickupTime", pickupTime);

    if (tripType === "return" && returnDate) {
      searchParams.set("returnDate", returnDate.toISOString().split("T")[0]);
      searchParams.set("returnTime", returnTime);
    }

    searchParams.set("adults", passengers.adults.toString());
    searchParams.set("children", passengers.children.toString());
    searchParams.set("infants", passengers.infants.toString());

    navigate(`/transfer-results?${searchParams.toString()}`);
  };

  // Check if form is valid
  const isFormValid =
    pickup && dropoff && pickupDate && (tripType === "one-way" || returnDate);

  if (isMobile) {
    // Mobile layout - simplified for small screens
    return (
      <>
        <ErrorBanner
          message={errorMessage}
          isVisible={showError}
          onClose={() => setShowError(false)}
        />

        <div className="space-y-4">
          {/* Transfer Mode Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setTransferMode("airport")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium border-b-2 -mb-px",
                transferMode === "airport"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500",
              )}
            >
              Airport taxi
            </button>
            <button
              onClick={() => setTransferMode("rental")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium border-b-2 -mb-px",
                transferMode === "rental"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500",
              )}
            >
              Car rentals
            </button>
          </div>

          {/* Trip Type Selector */}
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">One-way</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={tripType === "return"}
                onChange={() => setTripType("return")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">Return</span>
            </label>
          </div>

          {/* Mobile form fields */}
          <div className="space-y-3">
            {/* Pickup Location */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowMobileFromDestination(true)}
                className="w-full p-4 text-left flex items-center space-x-3"
              >
                <Navigation className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    From pick-up location
                  </div>
                  <div className="font-medium text-gray-900">
                    {pickup ? pickup.label : "Enter pick-up location"}
                  </div>
                </div>
              </button>
            </div>

            {/* Dropoff Location */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowMobileToDestination(true)}
                className="w-full p-4 text-left flex items-center space-x-3"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    Enter destination
                  </div>
                  <div className="font-medium text-gray-900">
                    {dropoff ? dropoff.label : "Enter destination"}
                  </div>
                </div>
              </button>
            </div>

            {/* Dates */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowMobileDatePicker(true)}
                className="w-full p-4 text-left flex items-center space-x-3"
              >
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    {tripType === "return"
                      ? "Pick-up and return dates"
                      : "Pick-up date"}
                  </div>
                  <div className="font-medium text-gray-900">
                    {pickupDate
                      ? format(pickupDate, "EEE, MMM d")
                      : "Add dates"}
                    {tripType === "return" && returnDate && (
                      <span> - {format(returnDate, "EEE, MMM d")}</span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Travelers */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowMobilePassengers(true)}
                className="w-full p-4 text-left flex items-center space-x-3"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    No. of passengers
                  </div>
                  <div className="font-medium text-gray-900">
                    {passengers.adults + passengers.children} passenger
                    {passengers.adults + passengers.children !== 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-lg"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Mobile Dropdowns */}
        <MobileDatePicker
          isOpen={showMobileDatePicker}
          onClose={() => setShowMobileDatePicker(false)}
          tripType={tripType}
          selectedDepartureDate={pickupDate}
          selectedReturnDate={returnDate}
          setSelectedDepartureDate={setPickupDate}
          setSelectedReturnDate={setReturnDate}
          selectingDeparture={true}
          setSelectingDeparture={() => {}}
          bookingType="transfers"
        />

        <MobileTravelers
          isOpen={showMobilePassengers}
          onClose={() => setShowMobilePassengers(false)}
          travelers={{
            adults: passengers.adults,
            children: passengers.children,
            childAges: passengers.childrenAges,
          }}
          setTravelers={(travelers) => {
            setPassengers({
              adults: travelers.adults,
              children: travelers.children,
              childrenAges: travelers.childAges,
              infants: passengers.infants,
            });
          }}
        />

        <MobileCityDropdown
          isOpen={showMobileFromDestination}
          onClose={() => setShowMobileFromDestination(false)}
          title="Select pickup location"
          cities={transferLocations.reduce(
            (acc, loc) => {
              acc[loc.label] = { code: loc.code, name: loc.label };
              return acc;
            },
            {} as Record<string, { code: string; name: string }>,
          )}
          selectedCity={pickup?.label || ""}
          onSelectCity={(cityLabel) => {
            const location = transferLocations.find(
              (loc) => loc.label === cityLabel,
            );
            if (location) {
              setPickup(location);
            }
            setShowMobileFromDestination(false);
          }}
          context="transfers"
        />

        <MobileCityDropdown
          isOpen={showMobileToDestination}
          onClose={() => setShowMobileToDestination(false)}
          title="Select drop-off location"
          cities={transferLocations.reduce(
            (acc, loc) => {
              acc[loc.label] = { code: loc.code, name: loc.label };
              return acc;
            },
            {} as Record<string, { code: string; name: string }>,
          )}
          selectedCity={dropoff?.label || ""}
          onSelectCity={(cityLabel) => {
            const location = transferLocations.find(
              (loc) => loc.label === cityLabel,
            );
            if (location) {
              setDropoff(location);
            }
            setShowMobileToDestination(false);
          }}
          context="transfers"
        />
      </>
    );
  }

  // Desktop layout - Elegant Classy Design
  return (
    <>
      <ErrorBanner
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        {/* Transfer Mode Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setTransferMode("airport")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all duration-200",
              transferMode === "airport"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Airport taxi
          </button>
          <button
            onClick={() => setTransferMode("rental")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all duration-200",
              transferMode === "rental"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Car rentals
          </button>
        </div>

        {/* Trip Type Radio Buttons */}
        <div className="flex space-x-6 mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={tripType === "one-way"}
              onChange={() => setTripType("one-way")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">One-way</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={tripType === "return"}
              onChange={() => setTripType("return")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Return</span>
          </label>
        </div>

        {/* Search Form - Compact Layout */}
        <div className="space-y-3">
          {/* Top Row - Locations */}
          <div className="grid grid-cols-12 gap-2">
            {/* Pick-up Location */}
            <div className="col-span-6">
              <Popover
                open={isPickupDropdownOpen}
                onOpenChange={setIsPickupDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer border border-gray-300 rounded-l-lg h-12 hover:border-gray-400 bg-white border-r-0">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Navigation className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                      <div className="text-xs text-gray-500">
                        From pick-up location
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {pickup
                          ? pickup.label.split("(")[0].trim()
                          : "Enter pick-up location"}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 border shadow-lg"
                  align="start"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {transferLocations.map((location) => (
                      <button
                        key={location.code}
                        className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setPickup(location);
                          setIsPickupDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {location.type === "airport" ? (
                              <Plane className="h-4 w-4 text-blue-600" />
                            ) : location.type === "hotel" ? (
                              <Hotel className="h-4 w-4 text-blue-600" />
                            ) : (
                              <MapPin className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {location.label}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {location.type}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Drop-off Location */}
            <div className="col-span-6">
              <Popover
                open={isDropoffDropdownOpen}
                onOpenChange={setIsDropoffDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer border border-gray-300 rounded-r-lg h-12 hover:border-gray-400 bg-white border-l-0">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                      <div className="text-xs text-gray-500">
                        Enter destination
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {dropoff
                          ? dropoff.label.split("(")[0].trim()
                          : "Enter destination"}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 border shadow-lg"
                  align="start"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {transferLocations.map((location) => (
                      <button
                        key={location.code}
                        className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setDropoff(location);
                          setIsDropoffDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {location.type === "airport" ? (
                              <Plane className="h-4 w-4 text-blue-600" />
                            ) : location.type === "hotel" ? (
                              <Hotel className="h-4 w-4 text-blue-600" />
                            ) : (
                              <MapPin className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {location.label}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {location.type}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Second Row - Dates, Times & Controls */}
          <div className="grid grid-cols-12 gap-2">
            {/* Pickup Date */}
            <div
              className={cn(
                tripType === "one-way" ? "col-span-3" : "col-span-2",
              )}
            >
              <Popover
                open={isPickupDateOpen}
                onOpenChange={setIsPickupDateOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer border border-gray-300 rounded-l-lg h-12 hover:border-gray-400 bg-white border-r-0">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <CalendarIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                      <div className="text-xs text-gray-500">
                        {tripType === "return" ? "Pick-up date" : "Date"}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {pickupDate
                          ? format(pickupDate, "EEE, MMM d")
                          : "Add date"}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  side="bottom"
                >
                  <BookingCalendar
                    onChange={({ startDate, endDate }) => {
                      if (startDate) setPickupDate(startDate);
                      if (endDate && tripType === "return")
                        setReturnDate(endDate);
                    }}
                    initialRange={
                      pickupDate
                        ? {
                            startDate: pickupDate,
                            endDate: returnDate || addDays(pickupDate, 3),
                          }
                        : undefined
                    }
                    onClose={() => setIsPickupDateOpen(false)}
                    bookingType="transfers"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date (if return trip) */}
            {tripType === "return" && (
              <div className="col-span-2">
                <Popover
                  open={isReturnDateOpen}
                  onOpenChange={setIsReturnDateOpen}
                >
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer border border-gray-300 h-12 hover:border-gray-400 bg-white border-l-0 border-r-0">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <CalendarIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                        <div className="text-xs text-gray-500">Return date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {returnDate
                            ? format(returnDate, "EEE, MMM d")
                            : "Add date"}
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    side="bottom"
                  >
                    <BookingCalendar
                      onChange={({ startDate, endDate }) => {
                        if (startDate) setPickupDate(startDate);
                        if (endDate) setReturnDate(endDate);
                      }}
                      initialRange={
                        pickupDate
                          ? {
                              startDate: pickupDate,
                              endDate: returnDate || addDays(pickupDate, 3),
                            }
                          : undefined
                      }
                      onClose={() => setIsReturnDateOpen(false)}
                      bookingType="transfers"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Going Time */}
            <div
              className={cn(
                tripType === "one-way" ? "col-span-2" : "col-span-1",
              )}
            >
              <Popover
                open={isPickupTimeOpen}
                onOpenChange={setIsPickupTimeOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer border border-gray-300 h-12 hover:border-gray-400 bg-white border-l-0 border-r-0">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                      <div className="text-xs text-gray-500">
                        {tripType === "return" ? "Going time" : "Time"}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {pickupTime}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-48 p-2 max-h-64 overflow-y-auto"
                  align="start"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {timeOptions.map((time) => (
                      <button
                        key={time.value}
                        className="p-2 text-sm hover:bg-gray-100 rounded text-left"
                        onClick={() => {
                          setPickupTime(time.value);
                          setIsPickupTimeOpen(false);
                        }}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Coming Time (if return trip) */}
            {tripType === "return" && (
              <div className="col-span-1">
                <Popover
                  open={isReturnTimeOpen}
                  onOpenChange={setIsReturnTimeOpen}
                >
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer border border-gray-300 h-12 hover:border-gray-400 bg-white border-l-0 border-r-0">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                        <div className="text-xs text-gray-500">Coming time</div>
                        <div className="text-sm font-medium text-gray-900">
                          {returnTime}
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-48 p-2 max-h-64 overflow-y-auto"
                    align="start"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {timeOptions.map((time) => (
                        <button
                          key={time.value}
                          className="p-2 text-sm hover:bg-gray-100 rounded text-left"
                          onClick={() => {
                            setReturnTime(time.value);
                            setIsReturnTimeOpen(false);
                          }}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Passengers */}
            <div
              className={cn(
                tripType === "one-way" ? "col-span-4" : "col-span-3",
              )}
            >
              <Popover
                open={isPassengersDropdownOpen}
                onOpenChange={setIsPassengersDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer border border-gray-300 h-12 hover:border-gray-400 bg-white border-l-0">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="pl-10 pr-3 h-full flex flex-col justify-center">
                      <div className="text-xs text-gray-500">Passengers</div>
                      <div className="text-sm font-medium text-gray-900">
                        {passengers.adults + passengers.children}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 p-4 border shadow-lg"
                  align="start"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Adults
                        </div>
                        <div className="text-xs text-gray-500">Age 18+</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (passengers.adults > 1) {
                              setPassengers({
                                ...passengers,
                                adults: passengers.adults - 1,
                              });
                            }
                          }}
                          disabled={passengers.adults <= 1}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {passengers.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (passengers.adults < 8) {
                              setPassengers({
                                ...passengers,
                                adults: passengers.adults + 1,
                              });
                            }
                          }}
                          disabled={passengers.adults >= 8}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Children
                        </div>
                        <div className="text-xs text-gray-500">Age 2-17</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (passengers.children > 0) {
                              const newAges = [...passengers.childrenAges];
                              newAges.pop();
                              setPassengers({
                                ...passengers,
                                children: passengers.children - 1,
                                childrenAges: newAges,
                              });
                            }
                          }}
                          disabled={passengers.children <= 0}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {passengers.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (passengers.children < 6) {
                              setPassengers({
                                ...passengers,
                                children: passengers.children + 1,
                                childrenAges: [...passengers.childrenAges, 10],
                              });
                            }
                          }}
                          disabled={passengers.children >= 6}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div
              className={cn(
                tripType === "one-way" ? "col-span-3" : "col-span-3",
              )}
            >
              <Button
                onClick={handleSearch}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-r-lg border-0"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
