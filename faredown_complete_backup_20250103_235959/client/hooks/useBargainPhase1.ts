/**
 * useBargainPhase1 Hook
 * Easy integration hook for Phase 1 Bargain Engine
 * Handles modal state and booking flow integration
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBargain, type BargainProductCPO } from "@/hooks/useBargain";

interface BargainItem {
  type: "flight" | "hotel" | "sightseeing";
  itemId: string;
  title: string;
  basePrice: number;
  userType?: "b2c" | "b2b";
  // Flight specific
  airline?: string;
  route?: { from: string; to: string };
  class?: string;
  // Hotel specific
  city?: string;
  hotelName?: string;
  starRating?: string;
  roomCategory?: string;
  // Sightseeing specific
  location?: string;
  category?: string;
  duration?: string;
  activityName?: string;
}

interface UseBargainPhase1Options {
  onBookingConfirmed?: (item: BargainItem, finalPrice: number) => void;
  redirectToBooking?: boolean;
  promoCode?: string;
  userLocation?: string;
  deviceType?: "mobile" | "desktop";
  useLiveAPI?: boolean; // New option to use live API
}

// Helper function to convert BargainItem to CPO format
function createCPO(item: BargainItem): BargainProductCPO {
  const cpo: BargainProductCPO = {
    type: item.type,
    supplier: item.airline || "hotelbeds", // Default supplier based on type
    product_id: item.itemId,
  };

  // Add type-specific fields
  if (item.type === "flight" && item.route) {
    cpo.route = `${item.route.from}-${item.route.to}`;
    cpo.class_of_service = item.class || "economy";
  } else if (item.type === "hotel") {
    cpo.city = item.city;
  } else if (item.type === "sightseeing") {
    cpo.activity_type = item.category;
    cpo.city = item.location;
  }

  return cpo;
}

export function useBargainPhase1(options: UseBargainPhase1Options = {}) {
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [currentBargainItem, setCurrentBargainItem] =
    useState<BargainItem | null>(null);
  const navigate = useNavigate();

  // Optionally use live API
  const liveBargain = useBargain();

  const startBargain = useCallback((item: BargainItem) => {
    setCurrentBargainItem(item);
    setIsBargainModalOpen(true);
  }, []);

  const closeBargainModal = useCallback(() => {
    setIsBargainModalOpen(false);
    setCurrentBargainItem(null);
  }, []);

  const handleBookingConfirmed = useCallback(
    async (finalPrice: number) => {
      if (!currentBargainItem) return;

      // For live API, complete the transaction
      if (options.useLiveAPI && liveBargain.hasActiveSession) {
        try {
          const result = await liveBargain.acceptCurrentOffer();
          console.log("✅ Booking confirmed via live API:", result);
        } catch (err) {
          console.error("❌ Failed to complete booking via live API:", err);
          // Continue with fallback flow
        }
      }

      // Call custom handler if provided
      if (options.onBookingConfirmed) {
        options.onBookingConfirmed(currentBargainItem, finalPrice);
      }

      // Default behavior: redirect to booking flow
      if (options.redirectToBooking !== false) {
        const bookingParams = new URLSearchParams({
          type: currentBargainItem.type,
          itemId: currentBargainItem.itemId,
          finalPrice: finalPrice.toString(),
          bargainApplied: "true",
          promoCode: options.promoCode || "",
          // Add live API session info if available
          ...(liveBargain.session && {
            sessionId: liveBargain.session.session_id,
          }),
        });

        if (currentBargainItem.type === "flight") {
          navigate(`/booking/flight?${bookingParams.toString()}`);
        } else if (currentBargainItem.type === "hotel") {
          navigate(`/booking/hotel?${bookingParams.toString()}`);
        } else if (currentBargainItem.type === "sightseeing") {
          navigate(`/booking/sightseeing?${bookingParams.toString()}`);
        }
      }

      closeBargainModal();
    },
    [currentBargainItem, options, navigate, closeBargainModal, liveBargain],
  );

  return {
    // State
    isBargainModalOpen,
    currentBargainItem,

    // Actions
    startBargain,
    closeBargainModal,
    handleBookingConfirmed,

    // Modal props helper
    getBargainModalProps: () => ({
      isOpen: isBargainModalOpen,
      onClose: closeBargainModal,
      onBookingConfirmed: handleBookingConfirmed,
      itemDetails: currentBargainItem || {
        type: "flight" as const,
        itemId: "",
        title: "",
        basePrice: 0,
      },
      promoCode: options.promoCode,
      userLocation: options.userLocation,
      deviceType: options.deviceType,
      useLiveAPI: options.useLiveAPI, // Pass through to modal
    }),

    // Expose live API functions if enabled
    ...(options.useLiveAPI && {
      liveBargain,
      startLiveBargain: async (item: BargainItem) => {
        const cpo = createCPO(item);
        return liveBargain.startBargainSession(cpo, options.promoCode);
      },
    }),
  };
}

// Helper function to extract bargain item from flight data
export function createFlightBargainItem(flight: {
  id: string;
  airline: string;
  route: { from: string; to: string };
  class: string;
  price: number;
  [key: string]: any;
}): BargainItem {
  return {
    type: "flight",
    itemId: flight.id,
    title: `${flight.airline} • ${flight.route.from} → ${flight.route.to}`,
    basePrice: flight.price,
    airline: flight.airline,
    route: flight.route,
    class: flight.class,
    userType: "b2c", // Default, can be overridden
  };
}

// Helper function to extract bargain item from hotel data
export function createHotelBargainItem(hotel: {
  id: string;
  name: string;
  city: string;
  starRating?: string | number;
  roomCategory?: string;
  price: number;
  [key: string]: any;
}): BargainItem {
  return {
    type: "hotel",
    itemId: hotel.id,
    title: `${hotel.name} • ${hotel.city}`,
    basePrice: hotel.price,
    city: hotel.city,
    hotelName: hotel.name,
    starRating: hotel.starRating?.toString(),
    roomCategory: hotel.roomCategory,
    userType: "b2c", // Default, can be overridden
  };
}

// Helper function to extract bargain item from sightseeing data
export function createSightseeingBargainItem(activity: {
  id: string;
  name: string;
  location: string;
  category?: string;
  duration?: string;
  rating?: number;
  price: number;
  [key: string]: any;
}): BargainItem {
  return {
    type: "sightseeing",
    itemId: activity.id,
    title: `${activity.name} • ${activity.location}`,
    basePrice: activity.price,
    location: activity.location,
    category: activity.category,
    duration: activity.duration,
    activityName: activity.name,
    starRating: activity.rating?.toString(),
    userType: "b2c", // Default, can be overridden
  };
}

// Utility function to create CPO from different item types
export { createCPO };

export default useBargainPhase1;
