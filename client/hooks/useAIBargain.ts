import { useState, useCallback, useRef } from 'react';

export interface BargainProductDetails {
  productRef: string;
  basePrice: number;
  // Flight specific
  airline?: string;
  flightNo?: string;
  route?: { from: string; to: string };
  // Hotel specific
  hotelName?: string;
  city?: string;
  // Sightseeing specific
  tourName?: string;
  location?: string;
  // Transfer specific
  pickup?: string;
  dropoff?: string;
}

export interface BargainSession {
  sessionId: string | null;
  module: 'flights' | 'hotels' | 'sightseeing' | 'transfers';
  productDetails: BargainProductDetails;
  isOpen: boolean;
  userOffer: number;
  title: string;
}

export interface UseAIBargainReturn {
  // State
  session: BargainSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startBargain: (params: {
    module: 'flights' | 'hotels' | 'sightseeing' | 'transfers';
    title: string;
    productDetails: BargainProductDetails;
    userOffer: number;
  }) => void;
  closeBargain: () => void;
  onBargainSuccess: (finalPrice: number, orderRef: string) => void;
  onBargainFailed: () => void;
  
  // Callbacks for integration
  setSuccessCallback: (callback: (finalPrice: number, orderRef: string) => void) => void;
  setFailureCallback: (callback: () => void) => void;
}

export function useAIBargain(): UseAIBargainReturn {
  const [session, setSession] = useState<BargainSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const successCallbackRef = useRef<((finalPrice: number, orderRef: string) => void) | null>(null);
  const failureCallbackRef = useRef<(() => void) | null>(null);

  const startBargain = useCallback((params: {
    module: 'flights' | 'hotels' | 'sightseeing' | 'transfers';
    title: string;
    productDetails: BargainProductDetails;
    userOffer: number;
  }) => {
    setError(null);
    setSession({
      sessionId: null,
      module: params.module,
      productDetails: params.productDetails,
      isOpen: true,
      userOffer: params.userOffer,
      title: params.title,
    });
  }, []);

  const closeBargain = useCallback(() => {
    setSession(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const onBargainSuccess = useCallback((finalPrice: number, orderRef: string) => {
    // Call the registered success callback
    if (successCallbackRef.current) {
      successCallbackRef.current(finalPrice, orderRef);
    }
    
    // Close the bargain modal
    closeBargain();
  }, [closeBargain]);

  const onBargainFailed = useCallback(() => {
    // Call the registered failure callback
    if (failureCallbackRef.current) {
      failureCallbackRef.current();
    }
    
    // Close the bargain modal
    closeBargain();
  }, [closeBargain]);

  const setSuccessCallback = useCallback((callback: (finalPrice: number, orderRef: string) => void) => {
    successCallbackRef.current = callback;
  }, []);

  const setFailureCallback = useCallback((callback: () => void) => {
    failureCallbackRef.current = callback;
  }, []);

  return {
    session,
    isLoading,
    error,
    startBargain,
    closeBargain,
    onBargainSuccess,
    onBargainFailed,
    setSuccessCallback,
    setFailureCallback,
  };
}

// Helper functions for different modules
export const createFlightBargainDetails = (
  flight: any,
  flightKey: string = 'defaultKey'
): BargainProductDetails => ({
  productRef: flightKey,
  basePrice: flight.totalPrice || flight.price || 0,
  airline: flight.airline || flight.carrierCode,
  flightNo: flight.flightNumber || flight.flightNo,
  route: {
    from: flight.departure?.iataCode || flight.origin || '',
    to: flight.arrival?.iataCode || flight.destination || ''
  }
});

export const createHotelBargainDetails = (
  hotel: any,
  roomType?: any
): BargainProductDetails => ({
  productRef: hotel.id?.toString() || 'hotel-' + Date.now(),
  basePrice: roomType?.totalPrice || hotel.totalPrice || hotel.price || 0,
  hotelName: hotel.name || hotel.hotelName,
  city: hotel.location || hotel.city || hotel.destination
});

export const createSightseeingBargainDetails = (
  attraction: any,
  ticketType?: any
): BargainProductDetails => ({
  productRef: attraction.id?.toString() || 'tour-' + Date.now(),
  basePrice: ticketType?.price || attraction.price || attraction.ticketPricing?.[0]?.price || 0,
  tourName: attraction.name || attraction.title,
  location: attraction.location || attraction.city || attraction.destination
});

export const createTransferBargainDetails = (
  transfer: any
): BargainProductDetails => ({
  productRef: transfer.id?.toString() || 'transfer-' + Date.now(),
  basePrice: transfer.price || transfer.totalPrice || 0,
  pickup: transfer.pickup || transfer.pickupLocation || transfer.from,
  dropoff: transfer.dropoff || transfer.dropoffLocation || transfer.to
});
