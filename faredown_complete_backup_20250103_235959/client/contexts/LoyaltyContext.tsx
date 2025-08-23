import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  loyaltyService,
  LoyaltyProfile,
  RedemptionQuote,
} from "../services/loyaltyService";

interface CartRedemption {
  cartId: string;
  pointsApplied: number;
  rupeeValue: number;
  lockedId: string;
}

interface LoyaltyContextType {
  // Profile data
  profile: LoyaltyProfile | null;
  isLoading: boolean;
  error: string | null;

  // Cart redemption state
  cartRedemption: CartRedemption | null;
  pendingQuote: RedemptionQuote | null;

  // Actions
  refreshProfile: () => Promise<void>;
  quoteRedemption: (
    eligibleAmount: number,
    currency?: string,
    fxRate?: number,
  ) => Promise<RedemptionQuote>;
  applyPoints: (
    cartId: string,
    points: number,
    eligibleAmount: number,
  ) => Promise<boolean>;
  cancelRedemption: () => Promise<boolean>;
  clearCart: () => void;

  // Helper methods
  canRedeem: (amount: number) => boolean;
  getMaxRedeemablePoints: (eligibleAmount: number) => number;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

interface LoyaltyProviderProps {
  children: React.ReactNode;
}

export function LoyaltyProvider({ children }: LoyaltyProviderProps) {
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartRedemption, setCartRedemption] = useState<CartRedemption | null>(
    null,
  );
  const [pendingQuote, setPendingQuote] = useState<RedemptionQuote | null>(
    null,
  );

  // Load profile on mount
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData = await loyaltyService.getProfile();
      setProfile(profileData);
    } catch (err) {
      // Don't treat fallback data as errors
      if (err instanceof Error && !err.message.includes("Failed to fetch")) {
        setError(err.message);
      } else {
        // Silent failure for fetch errors, just use fallback
        console.log("Using loyalty fallback data due to API unavailability");
        setError(null);
      }
      console.error("Error loading loyalty profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Quote redemption
  const quoteRedemption = useCallback(
    async (
      eligibleAmount: number,
      currency = "INR",
      fxRate = 1.0,
    ): Promise<RedemptionQuote> => {
      try {
        const quote = await loyaltyService.quoteRedemption(
          eligibleAmount,
          currency,
          fxRate,
        );
        setPendingQuote(quote);
        return quote;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to quote redemption";
        setError(errorMsg);
        throw err;
      }
    },
    [],
  );

  // Apply points to cart
  const applyPoints = useCallback(
    async (
      cartId: string,
      points: number,
      eligibleAmount: number,
    ): Promise<boolean> => {
      try {
        const result = await loyaltyService.applyRedemption(
          cartId,
          points,
          eligibleAmount,
        );

        setCartRedemption({
          cartId,
          pointsApplied: points,
          rupeeValue: result.rupeeValue,
          lockedId: result.lockedId,
        });

        // Refresh profile to show updated locked points
        refreshProfile();

        return true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to apply points";
        setError(errorMsg);
        return false;
      }
    },
    [refreshProfile],
  );

  // Cancel current redemption
  const cancelRedemption = useCallback(async (): Promise<boolean> => {
    if (!cartRedemption) return false;

    try {
      const success = await loyaltyService.cancelRedemption(
        cartRedemption.lockedId,
      );

      if (success) {
        setCartRedemption(null);
        setPendingQuote(null);

        // Refresh profile to show released points
        refreshProfile();
      }

      return success;
    } catch (err) {
      console.error("Error cancelling redemption:", err);
      return false;
    }
  }, [cartRedemption, refreshProfile]);

  // Clear cart state (called after successful booking)
  const clearCart = useCallback(() => {
    setCartRedemption(null);
    setPendingQuote(null);

    // Refresh profile to show updated balance
    refreshProfile();
  }, [refreshProfile]);

  // Check if user can redeem points
  const canRedeem = useCallback(
    (minAmount: number): boolean => {
      if (!profile) return false;

      const availablePoints =
        profile.member.pointsBalance - profile.member.pointsLocked;
      return availablePoints >= 200 && minAmount >= 1000; // Min ₹1000 booking for redemption
    },
    [profile],
  );

  // Get maximum redeemable points for an amount
  const getMaxRedeemablePoints = useCallback(
    (eligibleAmount: number): number => {
      if (!profile) return 0;

      const maxRedeemValue = eligibleAmount * 0.2; // 20% cap
      const maxPointsByValue = Math.floor((maxRedeemValue / 10) * 100); // 100 points = ₹10
      const availablePoints =
        profile.member.pointsBalance - profile.member.pointsLocked;

      return Math.min(maxPointsByValue, availablePoints);
    },
    [profile],
  );

  // Load profile on mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Auto-refresh profile every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (profile && !isLoading) {
          refreshProfile();
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [profile, isLoading, refreshProfile]);

  const value: LoyaltyContextType = {
    profile,
    isLoading,
    error,
    cartRedemption,
    pendingQuote,
    refreshProfile,
    quoteRedemption,
    applyPoints,
    cancelRedemption,
    clearCart,
    canRedeem,
    getMaxRedeemablePoints,
  };

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider");
  }
  return context;
}

export default LoyaltyContext;
