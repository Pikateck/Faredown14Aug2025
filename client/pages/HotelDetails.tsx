import React, { useState, useEffect, useRef } from "react";

// Custom slider styles
const sliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-track {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #2563eb;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
  }

  .slider::-moz-range-track {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
  }

  .slider::-moz-range-thumb {
    background: #2563eb;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlightStyleBargainModal } from "@/components/FlightStyleBargainModal";
import { EnhancedFilters } from "@/components/EnhancedFilters";
import { calculateTotalPrice as calculatePriceBreakdown } from "@/lib/pricing";
import {
  Star,
  MapPin,
  Share2,
  ChevronDown,
  Bookmark,
  Search,
  Filter,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Building2,
  Sparkles,
  Baby,
  Shirt,
  Briefcase,
  Shield,
  Info,
  MessageSquare,
  Cigarette,
  Coffee,
  ChefHat,
  Wifi,
  Home,
  Accessibility,
  CreditCard,
  Key,
  Camera,
  Bell,
  Languages,
  Flame,
  Lock,
  ArrowUpDown,
  CheckCircle,
  X,
  ChevronLeft,
  TrendingDown,
} from "lucide-react";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { MobileBottomBar } from "@/components/mobile/MobileBottomBar";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { hotelsService } from "@/services/hotelsService";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { BookingSearchForm } from "@/components/BookingSearchForm";

export default function HotelDetails() {
  useScrollToTop();
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if tab parameter is provided in URL
    const tabParam = searchParams.get("tab");
    return tabParam || "overview";
  });
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSaveDropdown(false);
      }
    };

    if (showSaveDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSaveDropdown]);
  const [bargainingRoomId, setBargainingRoomId] = useState<string | null>(null);
  const [bargainedRooms, setBargainedRooms] = useState<Set<string>>(new Set());

  // Hotel bargain modal state
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(100);
  const [selectedRating, setSelectedRating] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hotelData, setHotelData] = useState<any>(null);
  const [isLoadingHotel, setIsLoadingHotel] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    popularFilters: new Set<string>(),
    propertyTypes: new Set<string>(),
    facilities: new Set<string>(),
    mealOptions: new Set<string>(),
    starRatings: new Set<string>(),
  });

  // Format date to DD-MMM-YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate().toString().padStart(2, "0")}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  // Get booking parameters from URL or use defaults
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const roomsParam = searchParams.get("rooms");
  const adultsParam = searchParams.get("adults");

  // Calculate dates and nights dynamically
  const checkInDate = checkInParam
    ? new Date(checkInParam)
    : new Date("2025-07-16");
  const checkOutDate = checkOutParam
    ? new Date(checkOutParam)
    : new Date("2025-07-19");
  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Fetch live hotel data from Hotelbeds API
  useEffect(() => {
    const fetchHotelData = async () => {
      if (!hotelId) return;

      setIsLoadingHotel(true);

      // Helper function to fetch with timeout and retry
      const fetchWithTimeout = async (
        url: string,
        options: RequestInit = {},
        timeout = 8000,
      ): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      // Retry logic with exponential backoff
      const attemptFetch = async (retryCount = 0): Promise<any> => {
        try {
          console.log(
            `🏨 Attempt ${retryCount + 1}: Fetching hotel details for: ${hotelId}`,
          );

          // Try using the hotels service first for proper API integration
          try {
            const searchParams = {
              checkIn: checkInParam,
              checkOut: checkOutParam,
              rooms: parseInt(roomsParam || "1"),
              adults: parseInt(adultsParam || "2"),
              children: parseInt(childrenParam || "0"),
            };

            console.log(
              "🔍 Using hotelsService.getHotelDetails:",
              hotelId,
              searchParams,
            );
            const hotel = await hotelsService.getHotelDetails(
              hotelId,
              searchParams,
            );
            console.log("✅ Hotel data received via service:", hotel);
            return hotel;
          } catch (serviceError) {
            console.warn("⚠️ Service failed, trying direct API:", serviceError);

            // Fallback to direct API call
            const apiUrl = new URL(
              `/api/hotels-live/hotel/${hotelId}`,
              window.location.origin,
            );
            if (checkInParam) apiUrl.searchParams.set("checkIn", checkInParam);
            if (checkOutParam)
              apiUrl.searchParams.set("checkOut", checkOutParam);

            const response = await fetchWithTimeout(apiUrl.toString(), {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }

            const data = await response.json();

            if (data.success && data.hotel) {
              console.log(
                "✅ Live hotel data received via direct API:",
                data.hotel,
              );
              return data.hotel;
            } else {
              throw new Error("Invalid response structure or no hotel data");
            }
          }
        } catch (error) {
          console.warn(`⚠️ Attempt ${retryCount + 1} failed:`, error);

          // Retry up to 2 times with exponential backoff
          if (
            retryCount < 2 &&
            (error instanceof TypeError || // Network errors
              error.message.includes("Failed to fetch") ||
              error.message.includes("NetworkError") ||
              error.message.includes("fetch"))
          ) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`🔄 Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      try {
        const hotelData = await attemptFetch();
        setHotelData(hotelData);
      } catch (error) {
        console.error("❌ All attempts failed, using fallback data:", error);

        // Immediate fallback - don't wait for API in production
        const fallbackData = getMockHotelData();
        setHotelData(fallbackData);

        // Show user-friendly message for network issues
        if (
          error instanceof TypeError ||
          error.message.includes("Failed to fetch")
        ) {
          console.info(
            "ℹ️ Using offline mode due to network connectivity issues",
          );
        }
      } finally {
        setIsLoadingHotel(false);
      }
    };

    fetchHotelData();
  }, [hotelId, checkInParam, checkOutParam]);

  // Fallback mock data function
  const getMockHotelData = () => {
    // Extract hotel info from URL or use defaults
    const hotelCode = hotelId || "1";
    const isBusinessHotel = hotelCode.toLowerCase().includes("business");
    const isLuxuryHotel =
      hotelCode.toLowerCase().includes("grand") ||
      hotelCode.toLowerCase().includes("luxury");
    const isBoutiqueHotel = hotelCode.toLowerCase().includes("boutique");

    // Generate realistic hotel names based on code
    const hotelNames = {
      "htl-DXB-001": "Grand Hyatt Dubai",
      "htl-DXB-002": "Business Hotel Dubai Marina",
      "htl-DXB-003": "Boutique Hotel Downtown Dubai",
      "htl-DXB-004": "Premium Hotel Dubai Creek",
      "htl-DXB-005": "City Hotel Dubai Mall",
      "htl-DXB-006": "Express Hotel Dubai Airport",
    };

    const defaultName =
      hotelNames[hotelCode] ||
      (isBusinessHotel
        ? `Business Hotel ${hotelCode}`
        : isLuxuryHotel
          ? `Grand Luxury Hotel ${hotelCode}`
          : isBoutiqueHotel
            ? `Boutique Hotel ${hotelCode}`
            : `Premium Hotel ${hotelCode}`);

    // Hotel-specific locations
    const hotelLocations = {
      "htl-DXB-001": "Sheikh Zayed Road, Dubai, United Arab Emirates",
      "htl-DXB-002": "Dubai Marina, Dubai, United Arab Emirates",
      "htl-DXB-003": "Downtown Dubai, Dubai, United Arab Emirates",
      "htl-DXB-004": "Dubai Creek, Dubai, United Arab Emirates",
      "htl-DXB-005": "Near Dubai Mall, Dubai, United Arab Emirates",
      "htl-DXB-006": "Dubai International Airport, Dubai, United Arab Emirates",
    };

    return {
      id: parseInt(hotelCode.replace(/\D/g, "")) || 1,
      code: hotelCode,
      name: defaultName,
      location: hotelLocations[hotelCode] || "Dubai, United Arab Emirates",
      images: (() => {
        // Hotel-specific images based on hotel code and type
        const imageCollections = {
          "htl-DXB-001": [
            // Grand Hyatt Dubai
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&q=80&auto=format&fit=crop",
          ],
          "htl-DXB-002": [
            // Business Hotel Dubai Marina
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&q=80&auto=format&fit=crop",
          ],
          "htl-DXB-003": [
            // Boutique Hotel Downtown Dubai
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=600&q=80&auto=format&fit=crop",
          ],
          "htl-DXB-004": [
            // Premium Hotel Dubai Creek
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&q=80&auto=format&fit=crop",
          ],
        };
        return imageCollections[hotelCode] || imageCollections["htl-DXB-003"]; // Default to boutique hotel
      })(),
      rating: isLuxuryHotel ? 4.8 : isBoutiqueHotel ? 4.3 : 4.2,
      reviews: Math.floor(Math.random() * 800) + 400,
      reviewCount: Math.floor(Math.random() * 800) + 400,
      description: `Experience exceptional hospitality at ${defaultName}. Located in the heart of Dubai with modern amenities and world-class service.`,
      amenities: [
        "Free WiFi",
        "Swimming Pool",
        "Fitness Center",
        "Restaurant",
        "Room Service",
        "Business Center",
        "Concierge",
        "Valet Parking",
        ...(isLuxuryHotel ? ["Spa & Wellness", "Premium Dining"] : []),
        ...(isBusinessHotel ? ["Meeting Rooms", "Executive Lounge"] : []),
      ],
      features: [
        "City View",
        "Modern Design",
        "24/7 Service",
        ...(isLuxuryHotel ? ["Luxury Amenities", "Premium Location"] : []),
        ...(isBoutiqueHotel ? ["Unique Design", "Personalized Service"] : []),
      ],
      currentPrice: isLuxuryHotel ? 250 : isBoutiqueHotel ? 180 : 167,
      totalPrice:
        (isLuxuryHotel ? 250 : isBoutiqueHotel ? 180 : 167) * totalNights,
      currency: "USD",
      available: true,
      supplier: "offline-mode",
      isLiveData: false,
      fallback: true,
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
      address: {
        street: "Dubai Marina District",
        city: "Dubai",
        country: "United Arab Emirates",
      },
    };
  };

  // Temporary hotel data for roomTypes calculation
  const tempHotelData = hotelData
    ? {
        id: parseInt(hotelId || "1"),
        name: (() => {
          const hotelNames = {
            "htl-DXB-001": "Grand Hyatt Dubai",
            "htl-DXB-002": "Business Hotel Dubai Marina",
            "htl-DXB-003": "Boutique Hotel Downtown Dubai",
            "htl-DXB-004": "Premium Hotel Dubai Creek",
            "htl-DXB-005": "City Hotel Dubai Mall",
            "htl-DXB-006": "Express Hotel Dubai Airport",
          };
          // Prioritize API name, fallback to mapped names only if API data is missing
          return hotelData.name || hotelNames[hotelId] || "Premium Hotel Dubai";
        })(),
        location: (() => {
          const hotelLocations = {
            "htl-DXB-001": "Sheikh Zayed Road, Dubai, United Arab Emirates",
            "htl-DXB-002": "Dubai Marina, Dubai, United Arab Emirates",
            "htl-DXB-003": "Downtown Dubai, Dubai, United Arab Emirates",
            "htl-DXB-004": "Dubai Creek, Dubai, United Arab Emirates",
            "htl-DXB-005": "Near Dubai Mall, Dubai, United Arab Emirates",
            "htl-DXB-006":
              "Dubai International Airport, Dubai, United Arab Emirates",
          };
          // Prioritize API location data, fallback to mapped locations if API data is missing
          return (
            (typeof hotelData.location === "string"
              ? hotelData.location
              : hotelData.location?.address?.street ||
                hotelData.address?.street ||
                hotelData.location?.city ||
                hotelData.address?.city) ||
            hotelLocations[hotelId] ||
            "Dubai, United Arab Emirates"
          );
        })(),
        image:
          hotelData.images && hotelData.images.length > 0
            ? typeof hotelData.images[0] === "string"
              ? hotelData.images[0]
              : hotelData.images[0].url
            : // Hotel-specific fallback images
              (() => {
                const hotelCode = hotelId || "htl-DXB-003";
                const fallbackImages = {
                  "htl-DXB-001":
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80&auto=format&fit=crop",
                  "htl-DXB-002":
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&q=80&auto=format&fit=crop",
                  "htl-DXB-003":
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop",
                  "htl-DXB-004":
                    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&q=80&auto=format&fit=crop",
                };
                return (
                  fallbackImages[hotelCode] || fallbackImages["htl-DXB-003"]
                );
              })(),
        images: hotelData.images || [],
        rating: hotelData.rating || 4.5,
        reviews: hotelData.reviews || hotelData.reviewCount || 1247,
        checkIn: checkInDate.toISOString().split("T")[0],
        checkOut: checkOutDate.toISOString().split("T")[0],
        totalNights: totalNights,
        rooms: parseInt(roomsParam || "1"),
        adults: parseInt(adultsParam || "2"),
        description:
          hotelData.description ||
          "Experience luxury accommodations with exceptional service.",
        amenities: hotelData.amenities || ["WiFi", "Pool", "Restaurant"],
        features: hotelData.features || ["City View"],
        currentPrice: hotelData.currentPrice || 167,
        totalPrice:
          hotelData.totalPrice || (hotelData.currentPrice || 167) * totalNights,
        currency: hotelData.currency || "USD",
        available: hotelData.available !== false,
        supplier: hotelData.supplier || "hotelbeds",
        isLiveData: hotelData.supplier === "hotelbeds",
      }
    : null;

  const calculateTotalPrice = (roomPricePerNight: number) => {
    const rooms = parseInt(roomsParam || "1");
    const breakdown = calculatePriceBreakdown(
      roomPricePerNight,
      totalNights,
      rooms,
    );
    return breakdown.total;
  };

  // Generate room types from live data or use mock data
  const roomTypes = (() => {
    if (hotelData && hotelData.roomTypes && hotelData.roomTypes.length > 0) {
      // Use live room data from Hotelbeds
      return hotelData.roomTypes.map((room: any, index: number) => ({
        id: `live-room-${index}`,
        name: room.name || `Room Type ${index + 1}`,
        type: room.name || `1 X ${room.name || "Standard"}`,
        details: room.features
          ? room.features.join(", ")
          : "Standard accommodations",
        pricePerNight:
          room.price || room.pricePerNight || hotelData.currentPrice || 167,
        status: index === 0 ? "Best Value - Start Here!" : `Available`,
        statusColor: index === 0 ? "green" : "blue",
        nonRefundable: true,
        image:
          room.image ||
          (hotelData.images && hotelData.images.length > 1
            ? typeof hotelData.images[1] === "string"
              ? hotelData.images[1]
              : hotelData.images[1].url
            : "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300"),
        features: room.features || [
          "Standard room",
          "Free WiFi",
          "Air conditioning",
          "Private bathroom",
        ],
        isLiveData: true,
      }));
    }

    // Fallback mock room types
    return [
      {
        id: "twin-skyline",
        name: "Twin Room with Skyline View",
        type: "1 X Twin Classic",
        details: "Twin bed",
        pricePerNight: tempHotelData?.currentPrice || 167,
        status: "Base Price",
        statusColor: "green",
        nonRefundable: true,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&q=80&auto=format&fit=crop", // Twin room
        features: [
          "No price change",
          "Twin Classic",
          "Complimentary breakfast",
        ],
      },
      {
        id: "king-skyline",
        name: "King Room with Skyline View",
        type: "1 X King Classic",
        details: "1 king bed",
        pricePerNight: (tempHotelData?.currentPrice || 167) + 18,
        status: "Upgrade for +₹18",
        statusColor: "yellow",
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&q=80&auto=format&fit=crop", // King room
        features: ["Upgrade for +₹18", "King Room", "Better city views"],
      },
      {
        id: "deluxe-suite",
        name: "Deluxe Suite with Ocean View",
        type: "1 X Deluxe Suite",
        details: "Suite with separate living area",
        pricePerNight: (tempHotelData?.currentPrice || 167) + 55,
        status: "Upgrade for +₹55",
        statusColor: "blue",
        nonRefundable: false,
        image:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&q=80&auto=format&fit=crop", // Deluxe suite
        features: ["Upgrade for +₹55", "Ocean View Suite", "Premium amenities"],
      },
      {
        id: "family-room",
        name: "Family Room with City View",
        type: "1 X Family Room",
        details: "Spacious room for families",
        pricePerNight: (tempHotelData?.currentPrice || 167) + 35,
        status: "Upgrade for +₹35",
        statusColor: "blue",
        nonRefundable: true,
        image:
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&q=80&auto=format&fit=crop", // Family room
        features: ["Upgrade for +₹35", "Family Room", "Kid-friendly space"],
      },
      {
        id: "executive-room",
        name: "Executive Room with Business Lounge",
        type: "1 X Executive Room",
        details: "Business-class accommodation",
        pricePerNight: (tempHotelData?.currentPrice || 167) + 42,
        status: "Upgrade for +₹42",
        statusColor: "blue",
        nonRefundable: false,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&q=80&auto=format&fit=crop", // Executive room
        features: ["Upgrade for +₹42", "Executive Access", "Business lounge"],
      },
      {
        id: "standard-double",
        name: "Standard Double Room",
        type: "1 X Standard Double",
        details: "Comfortable double room",
        pricePerNight: (tempHotelData?.currentPrice || 167) - 15,
        status: "Save ₹15",
        statusColor: "green",
        nonRefundable: true,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&q=80&auto=format&fit=crop", // Standard double
        features: ["Save ₹15", "Standard Room", "Best value option"],
      },
    ].sort((a, b) => a.pricePerNight - b.pricePerNight);
  })();

  // Expand first room by default when room types are available
  useEffect(() => {
    if (roomTypes.length > 0) {
      setExpandedRooms(new Set([roomTypes[0].id]));
    }
  }, [roomTypes.length]);

  // Create final hotel object with calculated roomTypes
  const hotel = tempHotelData
    ? {
        ...tempHotelData,
        roomTypes: roomTypes,
      }
    : null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "gallery", label: "Gallery" },
    { id: "amenities", label: "Amenities" },
    { id: "reviews", label: "Reviews" },
    { id: "street-view", label: "Street View" },
    { id: "location", label: "Location" },
  ];

  // Calculate the lowest price from available room types
  const lowestPrice =
    roomTypes.length > 0
      ? Math.min(...roomTypes.map((room) => room.pricePerNight))
      : 167; // fallback price

  const handleBargainClick = (roomType: any) => {
    console.log("Bargain clicked for room:", roomType.id);
    setSelectedRoomType(roomType);
    setBargainingRoomId(roomType.id);
    setIsBargainModalOpen(true);
  };

  const handleStarClick = () => {
    console.log("⭐ Star clicked - navigating to reviews");
    setActiveTab("reviews");
    // Scroll to reviews section smoothly - try both mobile and desktop versions
    setTimeout(() => {
      const reviewsSectionMobile = document.getElementById("reviews-section");
      const reviewsSectionDesktop = document.getElementById(
        "reviews-section-desktop",
      );
      const targetSection = reviewsSectionMobile || reviewsSectionDesktop;
      if (targetSection) {
        console.log("📍 Scrolling to reviews section:", targetSection.id);
        targetSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.log("❌ Reviews section not found");
      }
    }, 100);
  };

  const handleFilterChange = (category: string, filterName: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const categoryFilters = new Set(
        newFilters[category as keyof typeof newFilters],
      );

      if (categoryFilters.has(filterName)) {
        categoryFilters.delete(filterName);
      } else {
        categoryFilters.add(filterName);
      }

      newFilters[category as keyof typeof newFilters] = categoryFilters;
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange(100);
    setSelectedFilters({
      popularFilters: new Set(),
      propertyTypes: new Set(),
      facilities: new Set(),
      mealOptions: new Set(),
      starRatings: new Set(),
    });
  };

  const filterRooms = (rooms: any[]) => {
    return rooms.filter((room) => {
      // Search by name
      if (
        searchTerm &&
        !room.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Price range filter (only apply if price range is not at maximum)
      if (priceRange < 90) {
        const maxPrice = (priceRange / 100) * 15000; // Assuming max price of 15000
        if (room.pricePerNight > maxPrice) {
          return false;
        }
      }

      // Popular filters (only apply if filters are selected)
      if (selectedFilters.popularFilters.size > 0) {
        const roomFeatures = room.features || [];
        const hasSelectedFeature = Array.from(
          selectedFilters.popularFilters,
        ).some((filter) =>
          roomFeatures.some((feature: string) =>
            feature.toLowerCase().includes(filter.toLowerCase()),
          ),
        );
        if (!hasSelectedFeature) return false;
      }

      return true;
    });
  };

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const handleBooking = (roomType: any, bargainPrice?: number) => {
    let perNightPrice: number;
    let totalPrice: number;

    if (bargainPrice) {
      // bargainPrice from the modal is the total bargained price
      totalPrice = bargainPrice;
      perNightPrice = Math.round(bargainPrice / hotel.totalNights);
    } else {
      // Regular booking - calculate from per-night price
      perNightPrice = roomType.pricePerNight;
      totalPrice = calculateTotalPrice(perNightPrice);
    }
    // Preserve original search parameters and add booking specific ones
    const existingParams = searchParams.toString();
    const bookingParams = new URLSearchParams({
      hotelId: hotel.id.toString(),
      roomType: roomType.type,
      pricePerNight: perNightPrice.toString(),
      totalPrice: totalPrice.toString(),
      nights: hotel.totalNights.toString(),
      bargained: (!!bargainPrice).toString(),
      roomName: roomType.name,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      rooms: hotel.rooms.toString(),
      guests: hotel.adults.toString(),
      hotelName: hotel.name,
      location: hotel.location,
      rating: hotel.rating.toString(),
      reviews: hotel.reviews.toString(),
    });

    // Merge existing search params with booking params
    const mergedParams = new URLSearchParams(existingParams);
    bookingParams.forEach((value, key) => {
      mergedParams.set(key, value);
    });

    navigate(`/reserve?${mergedParams.toString()}`);
  };

  // Show loading state while fetching hotel data
  if (isLoadingHotel || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching live data from Hotelbeds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{sliderStyles}</style>

      {/* Mobile-First Layout */}
      <div className="md:hidden min-h-screen bg-gray-50">
        <MobileNavBar
          title="Hotel Details"
          rating={hotel.rating}
          reviewCount={hotel.reviews}
          showBookmark={true}
          showShare={true}
          isBookmarked={isSaved}
          onBookmarkToggle={() => setIsSaved(!isSaved)}
          onShareClick={() => setIsShareModalOpen(true)}
          onBack={() => {
            console.log("Back button clicked - navigating to hotels");
            navigate("/hotels");
          }}
        />

        {/* Mobile Search Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-md mx-auto">
            <BookingSearchForm />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="pb-24">
          {/* Simple Hero Image */}
          <div className="relative w-full h-64 overflow-hidden bg-white">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Rating and Live Data Indicator */}
            <div className="absolute bottom-4 left-4 space-y-2">
              <div
                className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-white/100 transition-colors"
                onClick={handleStarClick}
                title="Click to view reviews"
              >
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                  <span className="font-semibold text-sm text-gray-900">
                    {hotel.rating}
                  </span>
                  <span className="text-xs text-gray-600">
                    ({hotel.reviews})
                  </span>
                </div>
              </div>
              {hotel.isLiveData && (
                <div className="bg-green-500/95 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                  🔴 LIVE DATA
                </div>
              )}
              {hotel.fallback && (
                <div className="bg-orange-500/95 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                  📱 OFFLINE MODE
                </div>
              )}
            </div>
          </div>

          {/* Hotel Info with Star Rating */}
          <div className="bg-white p-4 border-b border-gray-100">
            <div
              className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleStarClick}
              title="Click to view reviews"
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(hotel.rating)
                        ? "text-blue-600 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                {hotel.rating}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {hotel.name}
            </h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm">{hotel.location}</span>
            </div>

            {/* Simple Booking Details */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Check-in</div>
                <div className="font-semibold text-sm text-gray-900">
                  {formatDate(hotel.checkIn)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Check-out</div>
                <div className="font-semibold text-sm text-gray-900">
                  {formatDate(hotel.checkOut)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Nights</div>
                <div className="font-semibold text-sm text-gray-900">
                  {hotel.totalNights}
                </div>
              </div>
            </div>

            {/* Simple Features */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1 text-xs">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Free WiFi</span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Free Parking</span>
                </div>
              </div>
              <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded">
                Hot Deal
              </span>
            </div>
          </div>

          {/* Clean Mobile Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex overflow-x-auto scrollbar-hide px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Mobile Content Sections */}
          <div className="p-4 bg-gray-50">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Simple Room Selection */}
                <div className="bg-white rounded-lg p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Choose your room
                  </h2>

                  <div className="space-y-3">
                    {hotel.roomTypes.map((room, index) => (
                      <div
                        key={room.id}
                        className={`border rounded-lg overflow-hidden ${
                          selectedRoomType?.id === room.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        {/* Status Badge */}
                        {index === 0 && (
                          <div className="bg-green-600 text-white px-3 py-1 text-xs font-medium">
                            Cheapest Room
                          </div>
                        )}
                        {index > 0 && (
                          <div className="bg-orange-500 text-white px-3 py-1 text-xs font-medium">
                            Upgrade for +₹
                            {room.pricePerNight - roomTypes[0].pricePerNight}
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {room.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {room.type}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-gray-900">
                                ₹
                                {calculateTotalPrice(
                                  room.pricePerNight,
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                ₹{room.pricePerNight.toLocaleString()} per room
                                per night
                              </div>
                            </div>
                          </div>

                          {/* Simple Room Features */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {room.features?.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <Button
                              onClick={() => {
                                setSelectedRoomType(room);
                                if (navigator.vibrate) {
                                  navigator.vibrate(50);
                                }
                              }}
                              className={`w-full font-medium py-3 text-sm ${
                                selectedRoomType?.id === room.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {selectedRoomType?.id === room.id ? (
                                <span className="flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Selected
                                </span>
                              ) : (
                                "Select This Room"
                              )}
                            </Button>

                            <Button
                              onClick={() => {
                                handleBargainClick(room);
                                if (navigator.vibrate) {
                                  navigator.vibrate(50);
                                }
                              }}
                              className="w-full bg-[#febb02] hover:bg-[#e6a602] text-black font-medium py-2 text-sm flex items-center justify-center gap-2"
                            >
                              <TrendingDown className="w-4 h-4" />
                              Bargain Now
                            </Button>

                            <Button
                              onClick={handleStarClick}
                              variant="outline"
                              className="w-full font-medium py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              View Reviews
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Photos</h2>
                  {hotel.isLiveData && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Live Images
                    </span>
                  )}
                  {hotel.fallback && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                      Sample Images
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    // Use live images if available, otherwise fallback to sample images
                    const galleryImages =
                      hotel.images && hotel.images.length > 0
                        ? hotel.images.slice(0, 12) // Limit to 12 images for mobile
                        : [
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop",
                          ];

                    return galleryImages.map((image, idx) => {
                      // Handle both string URLs and image objects
                      const imageUrl =
                        typeof image === "string"
                          ? image
                          : image.urlStandard || image.url || image;
                      const imageAlt =
                        typeof image === "object" && image.alt
                          ? image.alt
                          : `${hotel.name} - Image ${idx + 1}`;
                      const imageCategory =
                        typeof image === "object" && image.category
                          ? image.category
                          : "general";

                      return (
                        <div
                          key={idx}
                          className="aspect-video overflow-hidden rounded-lg relative group cursor-pointer"
                          onClick={() => {
                            // TODO: Open lightbox/modal for full-size image viewing
                            console.log("Image clicked:", imageUrl);
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.src =
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
                            }}
                          />
                          {/* Image overlay with category */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-end">
                            {typeof image === "object" && image.description && (
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {image.description}
                              </div>
                            )}
                          </div>
                          {/* Image count indicator for first image */}
                          {idx === 0 && galleryImages.length > 6 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              +{galleryImages.length - 6} more
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* View all photos button if more images available */}
                {hotel.images && hotel.images.length > 12 && (
                  <div className="mt-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      View All {hotel.images.length} Photos
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Amenities
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Waves, name: "Swimming Pool" },
                    { icon: Dumbbell, name: "Fitness Center" },
                    { icon: Wifi, name: "Free WiFi" },
                    { icon: Utensils, name: "Restaurant" },
                    { icon: Bell, name: "Room Service" },
                    { icon: Car, name: "Parking" },
                    { icon: Sparkles, name: "Spa" },
                    { icon: Briefcase, name: "Business Center" },
                    { icon: Shirt, name: "Laundry" },
                    { icon: Building2, name: "Concierge" },
                    { icon: Baby, name: "Childcare" },
                    { icon: Accessibility, name: "Accessibility" },
                  ].map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <amenity.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{amenity.name}</span>
                      <div className="ml-auto">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div id="reviews-section" className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Guest Reviews
                  </h2>
                  <Button
                    onClick={() => setIsWriteReviewModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg min-h-[44px] active:scale-95 transition-all duration-200 touch-manipulation"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {hotel.rating}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {hotel.reviews} reviews
                  </div>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(hotel.rating)
                            ? "text-blue-600 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="space-y-3">
                  {[
                    {
                      name: "Sarah M.",
                      date: "2 days ago",
                      rating: 5,
                      comment:
                        "Excellent service and beautiful rooms. The staff was incredibly helpful!",
                    },
                    {
                      name: "John D.",
                      date: "1 week ago",
                      rating: 4,
                      comment:
                        "Great location and amenities. Pool area was fantastic.",
                    },
                    {
                      name: "Emily R.",
                      date: "2 weeks ago",
                      rating: 5,
                      comment:
                        "Perfect for business travel. Clean, modern, and professional.",
                    },
                  ].map((review, idx) => (
                    <div
                      key={idx}
                      className="border-b border-gray-100 pb-3 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {review.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "text-blue-600 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write Another Review Button for bottom of reviews */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setIsWriteReviewModalOpen(true)}
                    variant="outline"
                    className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 font-medium py-3 min-h-[48px] active:scale-95 transition-all duration-200 touch-manipulation"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Share Your Experience
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Location
                </h2>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-600 font-medium">
                      Interactive map
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Tap to open full map
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Address</p>
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                    </div>
                  </div>
                </div>

                {/* Nearby attractions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Nearby Attractions
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Burj Khalifa",
                        distance: "2.5 km",
                        time: "5 min drive",
                      },
                      {
                        name: "Dubai Mall",
                        distance: "1.8 km",
                        time: "3 min drive",
                      },
                      {
                        name: "Dubai Fountain",
                        distance: "2.0 km",
                        time: "4 min drive",
                      },
                      {
                        name: "Dubai International Airport",
                        distance: "12 km",
                        time: "15 min drive",
                      },
                    ].map((place, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {place.name}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">
                            {place.distance}
                          </div>
                          <div className="text-xs text-gray-500">
                            {place.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />

        {/* Desktop Search Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <BookingSearchForm />
          </div>
        </div>

        {/* Desktop Hotel Info Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleStarClick}
                title="Click to view reviews"
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(hotel.rating)
                          ? "text-blue-600 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-600 ml-2">
                  {hotel.rating}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{hotel.name}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm">{hotel.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Mobile Header Bar - for tablet view */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-[64px] z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </Button>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-600">
                ₹{lowestPrice}+ per night
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-3 py-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Map</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex relative">
        {/* Left Sidebar - Filters (Always Expanded on Desktop, Modal on Mobile) */}
        <div
          className={`${
            isMobileFilterOpen ? "fixed inset-0 z-50 bg-white" : "hidden"
          } lg:block lg:relative lg:w-80 xl:w-96 bg-white border-r border-gray-200 min-h-screen lg:sticky lg:top-[64px] lg:max-h-[calc(100vh-64px)]`}
        >
          <div className="overflow-y-auto h-full p-3 lg:p-4">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Enhanced Filters Component */}
            <EnhancedFilters
              priceRange={[Math.round((priceRange / 100) * 15000), 15000]}
              setPriceRange={(range) => setPriceRange((range[0] / 15000) * 100)}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={setSelectedAmenities}
              onFilterChange={(filters) => {
                // Handle filter changes
                console.log("Filters changed:", filters);
              }}
            />

            {/* Mobile Apply Filters Button */}
            <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
              <Button
                className="w-full bg-[#003580] hover:bg-[#002a66] text-white font-medium py-3"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-h-screen pb-20 md:pb-0">
          {/* Tab Navigation - Sticky */}
          <div className="bg-white border-b border-gray-200 sticky top-[64px] lg:top-0 z-30">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 lg:px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="p-2 sm:p-3 lg:p-4 overflow-y-auto max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-60px)]">
            {activeTab === "overview" && (
              <>
                {/* Hotel Header with Large Image */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  {/* Hotel Image - Large and Prominent */}
                  <div className="relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-40 sm:h-48 md:h-56 lg:h-72 xl:h-80 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="relative" ref={saveDropdownRef}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs px-3 py-1 bg-white/90 backdrop-blur ${
                            isSaved
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : ""
                          }`}
                          onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                        >
                          <Bookmark
                            className={`w-3 h-3 mr-1 ${isSaved ? "fill-current" : ""}`}
                          />
                          Save
                        </Button>

                        {/* Save Dropdown Menu */}
                        {showSaveDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-3">
                              <h4 className="font-semibold text-sm text-gray-900 mb-3">
                                Save to list
                              </h4>
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    setIsSaved(true);
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Bookmark className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>My Saved Properties</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <div className="w-4 h-4 mr-2 text-green-600">
                                    +
                                  </div>
                                  <span>Create new list</span>
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => {
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Share2 className="w-4 h-4 mr-2 text-gray-600" />
                                  <span>Share this property</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 bg-white/90 backdrop-blur"
                        onClick={() => setIsShareModalOpen(true)}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Available Rooms Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-blue-700 text-white p-3">
                    <h2 className="text-base font-semibold">
                      Available Rooms - Starting from Cheapest
                    </h2>
                    <p className="text-sm opacity-90">
                      Start with our cheapest room, then upgrade to better
                      options for just a little more!
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filterRooms(roomTypes).map((room, index) => (
                      <div
                        key={room.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <div
                          className={`flex items-center justify-between cursor-pointer p-5 transition-all duration-200 ${
                            expandedRooms.has(room.id)
                              ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                              : "hover:bg-gray-50 hover:shadow-sm"
                          }`}
                          onClick={() => toggleRoomExpansion(room.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-gray-900">
                                {room.name}
                              </h3>
                              {index === 0 && (
                                <Badge className="bg-green-500 text-white border border-green-600 shadow-sm text-xs font-semibold px-3 py-1">
                                  Cheapest Room
                                </Badge>
                              )}
                              {index > 0 && (
                                <Badge className="bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold px-3 py-1">
                                  Upgrade for +₹
                                  {room.pricePerNight -
                                    roomTypes[0].pricePerNight}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {room.type} �� {room.details}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₹
                                {calculateTotalPrice(
                                  room.pricePerNight,
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Price (incl. taxes)
                              </div>
                              <div className="text-xs text-gray-400">
                                ₹{room.pricePerNight.toLocaleString()} per night
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                expandedRooms.has(room.id) ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Room Details */}
                        {expandedRooms.has(room.id) && (
                          <div className="bg-white border-t border-gray-200 p-6 mt-2">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Room Image */}
                              <div className="lg:col-span-3">
                                <img
                                  src={room.image}
                                  alt={room.name}
                                  className="w-full h-40 lg:h-32 object-cover rounded-lg"
                                />
                              </div>

                              {/* Room Details */}
                              <div className="lg:col-span-6">
                                <h4 className="font-semibold text-lg mb-2 text-gray-900">
                                  {room.type}
                                </h4>
                                <div className="text-sm text-gray-600 mb-3">
                                  {room.details}
                                </div>
                                {room.nonRefundable && (
                                  <Badge className="bg-red-100 text-red-800 text-xs mb-3 px-2 py-1">
                                    Non Refundable Rate
                                  </Badge>
                                )}
                                {bargainingRoomId === room.id && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs mb-3 px-2 py-1 animate-pulse">
                                    <Sparkles className="w-3 h-3 mr-1 inline" />
                                    Bargaining in Progress
                                  </Badge>
                                )}
                                <div className="space-y-2">
                                  <h5 className="font-medium text-sm text-gray-900 mb-2">
                                    Room features:
                                  </h5>
                                  <div className="grid grid-cols-1 gap-2 text-sm">
                                    {room.features &&
                                    room.features.length > 0 ? (
                                      room.features.map((feature, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start"
                                        >
                                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                          <span className="text-gray-700">
                                            {feature}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                        <span className="text-gray-700">
                                          Comfortable room with standard
                                          amenities
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Pricing and Actions */}
                              <div className="lg:col-span-3 mt-4 lg:mt-0">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                  <div className="text-2xl font-bold text-gray-900 mb-1">
                                    ₹
                                    {calculateTotalPrice(
                                      room.pricePerNight,
                                    ).toLocaleString()}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 mb-1">
                                    Total Price (incl. taxes)
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    ₹{room.pricePerNight.toLocaleString()} per
                                    night × {hotel.totalNights} nights
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Includes taxes, fees & charges
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div
                                    className={`flex items-center text-sm font-medium ${
                                      room.statusColor === "green"
                                        ? "text-green-700"
                                        : "text-blue-700"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full mr-2 ${
                                        room.statusColor === "green"
                                          ? "bg-green-600"
                                          : "bg-blue-600"
                                      }`}
                                    ></span>
                                    {room.statusColor === "green"
                                      ? "Cheapest Option Available"
                                      : "Premium Upgrade Available"}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Button
                                    onClick={() => handleBooking(room)}
                                    variant="outline"
                                    className="w-full font-semibold py-3 text-sm transition-all duration-200 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-md"
                                  >
                                    Reserve Room
                                  </Button>
                                  <Button
                                    onClick={() => handleBargainClick(room)}
                                    className={`w-full font-medium py-2 text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                      bargainedRooms.has(room.id)
                                        ? "bg-green-600 text-white"
                                        : bargainingRoomId === room.id
                                          ? "bg-blue-600 text-white animate-pulse"
                                          : "bg-[#febb02] hover:bg-[#e6a602] text-black"
                                    }`}
                                  >
                                    {bargainedRooms.has(room.id) ? (
                                      <span className="flex items-center justify-center">
                                        Bargained
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                      </span>
                                    ) : bargainingRoomId === room.id ? (
                                      "Bargaining..."
                                    ) : (
                                      <>
                                        <TrendingDown className="w-4 h-4" />
                                        Bargain Now
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-green-700">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    No prepayment
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    Free cancellation
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "gallery" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Hotel Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    hotel.image,
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
                  ].map((image, index) => (
                    <div key={index} className="aspect-video">
                      <img
                        src={image}
                        alt={`${hotel.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Facilities of Grand Hyatt Dubai
                  </h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                    See availability
                  </button>
                </div>
                {/* Most popular facilities */}
                <div className="mb-8">
                  <h3 className="font-semibold text-base mb-4">
                    Most popular facilities
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">2 swimming pools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">Fitness centre</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Cigarette className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700">Non-smoking rooms</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-gray-700">17 restaurants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">
                        Spa and wellness centre
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Room service</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                          <Coffee className="w-3 h-3 text-amber-600" />
                        </div>
                        <span>Tea/Coffee Maker on All Rooms</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Car className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Car</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                          <ChefHat className="w-3 h-3 text-orange-600" />
                        </div>
                        <span>Excellent Breakfast</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <Wifi className="w-3 h-3 text-green-600" />
                        </div>
                        <span>Free WiFi available on request</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Great for your stay */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Great for your stay
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        17 restaurants
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Parking
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">₹</span> Air
                        conditioning
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">₹</span> Private
                        bathroom
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Free WiFi
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa and wellness centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Family rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Non-smoking rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fitness centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Live music/performance
                      </li>
                    </ul>
                  </div>

                  {/* Parking */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Car className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">Parking</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Free private parking is possible on site (reservation is
                        not needed)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Valet parking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Parking garage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Accessible parking
                      </li>
                    </ul>
                  </div>

                  {/* 2 swimming pools */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Waves className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        2 swimming pools
                      </h3>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">
                        Pool 1 - Indoor Pool
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Opening times
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          All ages welcome
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">
                        Pool 2 - outdoor Pool
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Opening times
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          All ages welcome
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Reception services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Reception services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Invoice provided
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Private check-in/out
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Concierge service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        ATM/cash machine on site
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Currency exchange
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Tour desk
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Luggage storage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Express check-in/out
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        24-hour front desk
                      </li>
                    </ul>
                  </div>

                  {/* Wellness */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Sparkles className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-base">Wellness</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fitness/spa locker rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Personal trainer
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Yoga classes
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Full body massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Hand massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Head massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Couples massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Foot massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Neck massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Back massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Beauty Services
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa lounge/relaxation area
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Steam room
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa facilities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Sauna
                      </li>
                    </ul>
                  </div>

                  {/* Entertainment and family services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Baby className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Entertainment and family services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Babysitting/child services
                      </li>
                    </ul>
                  </div>

                  {/* Cleaning services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <Shirt className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Cleaning services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Daily housekeeping
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Trouser press
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Ironing service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Dry cleaning
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Laundry
                      </li>
                    </ul>
                  </div>

                  {/* Business facilities */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                        <Briefcase className="w-4 h-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Business facilities
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fax/photocopying
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Business centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Meeting/banquet facilities
                      </li>
                    </ul>
                  </div>

                  {/* Safety & security */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Safety & security
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fire extinguishers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        CCTV outside property
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        CCTV in common areas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Smoke alarms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Security alarm
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Key card access
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        24-hour security
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Safety deposit box
                      </li>
                    </ul>
                  </div>

                  {/* General */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Info className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-base">General</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Grocery deliveries
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Designated smoking area
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Air conditioning
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Wake-up service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Car hire
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Lift
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Family rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Barber/beauty shop
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Ironing facilities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Facilities for disabled guests
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Non-smoking rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Room service
                      </li>
                    </ul>
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Languages className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Languages Spoken
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Arabic
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        German
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        English
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spanish
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        French
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Hindi
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Indonesian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Italian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Japanese
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Korean
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Russian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Chinese
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div
                id="reviews-section-desktop"
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    Guest reviews for {hotel.name}
                  </h2>
                  <Button
                    onClick={() => setIsWriteReviewModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] active:scale-95 transition-all duration-200 touch-manipulation"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-700 text-white px-3 py-1 rounded text-lg font-bold mr-3">
                        8.5
                      </div>
                      <div>
                        <div className="font-semibold">Excellent</div>
                        <div className="text-sm text-gray-600">
                          {hotel.reviews} reviews
                        </div>
                        <div className="text-xs text-gray-500">
                          We aim for 100% real reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { category: "Staff", score: 9.6 },
                      { category: "Facilities", score: 9 },
                      { category: "Cleanliness", score: 9.2 },
                      { category: "Comfort", score: 9.1 },
                      { category: "Value for money", score: 8.5 },
                      { category: "Location", score: 8.8 },
                      { category: "Free WiFi", score: 8.6 },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          {item.category}
                        </div>
                        <div className="font-bold text-lg">{item.score}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.score * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Mia",
                      location: "United Arab Emirates",
                      room: "Twin Room",
                      date: "August 2023",
                      type: "Family",
                      title: "We are happy",
                      review:
                        "It's my pleasure to be thankful for the polite service and see my birthday 🎂 Thanks for making it special for me",
                      helpful: 0,
                      avatar: "M",
                    },
                    {
                      name: "Rachelle",
                      location: "United Arab Emirates",
                      room: "King Room with Skyline View",
                      date: "July 2023",
                      type: "Family",
                      title: "Wonderful",
                      review:
                        "The hotel exceeded our expectations in every way. The staff was incredibly friendly and helpful, the room was spacious and clean, and the location was perfect for exploring the city.",
                      helpful: 3,
                      avatar: "R",
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.name}</span>
                            <span className="text-xs text-gray-500">
                              {review.location}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {review.room} • {review.date} • {review.type}
                          </div>
                          <h4 className="font-semibold mb-1">{review.title}</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {review.review}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <button className="text-blue-600 hover:underline">
                              Helpful ({review.helpful})
                            </button>
                            <button className="text-gray-500 hover:underline">
                              Not helpful
                            </button>
                          </div>
                        </div>
                        <div className="bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold">
                          {8 + index}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "street-view" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Street View</h2>
                <p className="text-gray-600 mb-4">
                  Explore the area around Grand Hyatt Dubai with Google Street
                  View
                </p>

                <div className="mb-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    Street View
                  </Button>
                </div>

                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fa819714c5cc047bf850c81dad7db477e?format=webp&width=800"
                    alt="Street View of Grand Hyatt Dubai Entrance"
                    className="w-full h-full object-cover"
                  />

                  {/* Street View Label Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                      <MapPin className="w-4 h-4 mr-1 inline" />
                      Street View: Grand Hyatt Dubai
                    </div>
                  </div>

                  {/* Live Street View Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Live Street View
                    </div>
                  </div>

                  {/* Location Info Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded">
                      <div className="text-sm font-medium">
                        Near Sheikh Zayed Road & Mall Mall, Dubai, United Arab
                        Emirates
                      </div>
                    </div>
                  </div>

                  {/* Street View Navigation Note */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-xs">
                      Drag street view to look around
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>��️</span>
                    <span>
                      <strong>Interactive View</strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/@25.2048,55.2708,3a,75y,210h,90t/data=!3m6!1e1!3m4!1sAF1QipO8EibS-hL-yfA-v8sVtSxBJBn2J8bv1U_7UW-9!2e10!7i5760!8i2880`,
                          "_blank",
                        );
                      }}
                      className="ml-2"
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag to explore around
                  </p>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Location & Map</h2>
                <p className="text-gray-600 mb-6">
                  See the exact location of {hotel.name} and nearby attractions
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-4">
                      <Button className="bg-blue-700 text-white px-3 py-1 text-sm">
                        Map
                      </Button>
                      <Button variant="outline" className="px-3 py-1 text-sm">
                        Satellite
                      </Button>
                      <Button variant="outline" className="px-3 py-1 text-sm">
                        Terrain
                      </Button>
                    </div>
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-4xl mb-2">���️</div>
                        <div className="text-gray-600">Interactive Map</div>
                        <div className="text-sm text-gray-500">
                          Hotel location and nearby landmarks
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs shadow">
                        <MapPin className="w-3 h-3 mr-1 inline" />
                        {hotel.name}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Hotel Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Address:</span>
                        <div className="text-gray-600">{hotel.location}</div>
                      </div>
                    </div>

                    <h3 className="font-semibold mt-6 mb-3">
                      Nearby Landmarks
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dubai International Airport</span>
                        <span className="text-gray-500">8.5 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Burj Khalifa</span>
                        <span className="text-gray-500">2.1 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dubai Mall</span>
                        <span className="text-gray-500">1.8 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Bay Metro Station</span>
                        <span className="text-gray-500">0.5 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share this hotel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{hotel.name} - faredown</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check out this amazing hotel in {hotel.location}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
              >
                🔗 Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Check out ${hotel.name} in ${hotel.location}! ${window.location.href}`;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(text)}`,
                    "_blank",
                  );
                }}
              >
                💬 WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Check out ${hotel.name} in ${hotel.location}!`;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                }}
              >
                🐦 Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                }}
              >
                📘 Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hotel Bargain Modal */}
      {selectedRoomType && (
        <FlightStyleBargainModal
          roomType={{
            id: selectedRoomType.id,
            name: selectedRoomType.name,
            description:
              selectedRoomType.features?.join(", ") ||
              "Comfortable room with great amenities",
            image: selectedRoomType.image || hotel.image,
            marketPrice: selectedRoomType.pricePerNight * 1.2,
            totalPrice: selectedRoomType.pricePerNight,
            total: selectedRoomType.pricePerNight,
            features: selectedRoomType.features || ["City View", "Free WiFi"],
            maxOccupancy: 2,
            bedType: selectedRoomType.details || "Comfortable bed",
            size: "Standard size",
            cancellation: "Free cancellation",
          }}
          hotel={{
            id: hotel.id,
            name: hotel.name,
            location: hotel.location,
            rating: hotel.rating,
            image: hotel.image,
          }}
          isOpen={isBargainModalOpen}
          onClose={() => {
            setIsBargainModalOpen(false);
            setSelectedRoomType(null);
            setBargainingRoomId(null);
          }}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          roomsCount={parseInt(roomsParam || "1")}
          onBookingSuccess={(finalPrice) => {
            setIsBargainModalOpen(false);
            handleBooking(selectedRoomType, finalPrice);
            // Mark room as successfully bargained
            if (selectedRoomType) {
              setBargainedRooms(
                (prev) => new Set([...prev, selectedRoomType.id]),
              );
            }
            setSelectedRoomType(null);
            setBargainingRoomId(null);
          }}
        />
      )}

      {/* Write Review Modal - Optimized for Mobile/Native */}
      <Dialog
        open={isWriteReviewModalOpen}
        onOpenChange={setIsWriteReviewModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Write a review for {hotel.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pb-4">
            {/* Overall Rating - Larger touch targets for mobile */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">
                Overall rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-8 h-8 md:w-6 md:h-6 text-gray-300 hover:text-yellow-400 cursor-pointer touch-manipulation active:scale-95 transition-all duration-150"
                  />
                ))}
              </div>
            </div>

            {/* Category Ratings - Mobile responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-900">
                  Rate your experience
                </label>
                <div className="space-y-4">
                  {["Staff", "Cleanliness", "Value for money", "Free WiFi"].map(
                    (category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-6 h-6 md:w-4 md:h-4 text-gray-300 hover:text-yellow-400 cursor-pointer touch-manipulation active:scale-95 transition-all duration-150"
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="md:mt-[28px]">
                <div className="space-y-4">
                  {["Facilities", "Comfort", "Location"].map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-6 h-6 md:w-4 md:h-4 text-gray-300 hover:text-yellow-400 cursor-pointer touch-manipulation active:scale-95 transition-all duration-150"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Title - Enhanced for mobile */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Review title *
              </label>
              <input
                type="text"
                placeholder="Give your review a title"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            {/* Review Text - Enhanced for mobile */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Tell us about your experience *
              </label>
              <textarea
                placeholder="Share your experience to help other travelers"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
              />
            </div>

            {/* Personal Details - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Your name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Country *
                </label>
                <input
                  type="text"
                  placeholder="Enter your country"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            {/* Stay Details - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Room type
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white">
                  <option>Select room type</option>
                  {hotel.roomTypes.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Date of stay
                </label>
                <input
                  type="date"
                  defaultValue={hotel.checkIn}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            {/* Trip Type - Enhanced buttons for mobile */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">
                Type of trip
              </label>
              <div className="flex flex-wrap gap-2">
                {["Leisure", "Business", "Family", "Couple", "Solo travel"].map(
                  (type) => (
                    <Button
                      key={type}
                      variant="outline"
                      className="px-4 py-2 text-sm min-h-[44px] border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:scale-95 transition-all duration-200 touch-manipulation"
                    >
                      {type}
                    </Button>
                  ),
                )}
              </div>
            </div>

            {/* Action Buttons - Enhanced for mobile */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setIsWriteReviewModalOpen(false)}
                variant="outline"
                className="flex-1 min-h-[48px] border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-200 touch-manipulation font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsWriteReviewModalOpen(false);
                  // Handle review submission here
                  if (navigator.vibrate) {
                    navigator.vibrate(100);
                  }
                }}
                className="flex-1 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all duration-200 touch-manipulation font-medium"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-[60]">
        {selectedRoomType ? (
          /* Room Selected - Clean Design */
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {selectedRoomType.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    ₹{selectedRoomType.pricePerNight.toLocaleString()} per room
                    per night
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ₹
                    {calculateTotalPrice(
                      selectedRoomType.pricePerNight,
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Total Price (All Inclusive)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  handleBooking(selectedRoomType);
                  if (navigator.vibrate) {
                    navigator.vibrate(100);
                  }
                }}
                className="flex-1 bg-blue-600 text-white font-semibold py-3"
              >
                Reserve
              </Button>
              <Button
                onClick={() => {
                  handleBargainClick(selectedRoomType);
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }}
                className="flex-1 bg-[#febb02] hover:bg-[#e6a602] text-black font-semibold py-3 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <TrendingDown className="w-4 h-4" />
                Bargain Now
              </Button>
            </div>
          </div>
        ) : (
          /* No Room Selected - Simple Prompt */
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Starting from</div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{calculateTotalPrice(lowestPrice).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Total Price (All Inclusive)
                </div>
                <div className="text-xs text-gray-500">
                  ��{lowestPrice.toLocaleString()} per room per night
                </div>
              </div>
              <div>
                <Button
                  disabled
                  className="bg-gray-200 text-gray-500 cursor-not-allowed px-6 py-3"
                >
                  Select Room First
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
