/**
 * Enhanced Promo Code Integration with Bargain Engine
 * Implements Zubin's Flow: Bargain Logic → Promo Code Application → Final Price Protection
 */

import { promoCodeService } from "./promoCodeService";

export interface BargainPromoIntegrationRequest {
  // Base pricing
  netFare: number; // Original supplier fare
  markedUpPrice: number; // After Current Fare Range markup

  // Bargain results
  bargainedPrice: number; // Price after successful bargain
  bargainSuccess: boolean;

  // Promo code
  promoCode?: string;
  bookingType: "flight" | "hotel";

  // Protection parameters
  minimumMarkupPercent: number; // Never go below this markup on net fare
}

export interface BargainPromoIntegrationResult {
  // Final pricing
  finalPrice: number;
  totalDiscount: number;

  // Breakdown
  netFare: number;
  markupAmount: number;
  bargainDiscount: number;
  promoDiscount: number;

  // Flow tracking
  promoApplied: boolean;
  promoAdjusted: boolean; // If promo was reduced to respect minimum
  netFareProtected: boolean;

  // User messaging
  savingsMessage: string;
  flowExplanation: string[];
}

export class BargainPromoIntegrationService {
  /**
   * Apply Zubin's Integrated Flow:
   * 1. Start with Net Fare
   * 2. Apply markup to get user-visible price
   * 3. Process bargain logic
   * 4. Apply promo code on bargained price
   * 5. Ensure final price never drops below net fare
   */
  async integratePromoWithBargain(
    request: BargainPromoIntegrationRequest,
  ): Promise<BargainPromoIntegrationResult> {
    const {
      netFare,
      markedUpPrice,
      bargainedPrice,
      bargainSuccess,
      promoCode,
      bookingType,
      minimumMarkupPercent,
    } = request;

    // Calculate minimum acceptable final price (net fare protection)
    const minimumFinalPrice = netFare * (1 + minimumMarkupPercent / 100);

    let finalPrice = bargainedPrice;
    let promoDiscount = 0;
    let promoApplied = false;
    let promoAdjusted = false;

    const flowExplanation: string[] = [
      `Step 1: Net Fare from supplier = ₹${netFare.toLocaleString()}`,
      `Step 2: Marked-up price shown to user = ₹${markedUpPrice.toLocaleString()}`,
    ];

    if (bargainSuccess) {
      flowExplanation.push(
        `Step 3: Bargain successful at ₹${bargainedPrice.toLocaleString()}`,
      );
    } else {
      flowExplanation.push(
        `Step 3: No bargain applied, proceeding with marked-up price`,
      );
    }

    // Step 4: Apply promo code if provided
    if (promoCode) {
      try {
        const promoValidation = await promoCodeService.validatePromoCode(
          promoCode,
          {
            amount: finalPrice,
            category: bookingType,
          },
        );

        if (promoValidation.valid) {
          const proposedDiscount = promoValidation.discount;
          const proposedFinalPrice = finalPrice - proposedDiscount;

          if (proposedFinalPrice >= minimumFinalPrice) {
            // Promo can be applied in full
            promoDiscount = proposedDiscount;
            finalPrice = proposedFinalPrice;
            promoApplied = true;
            flowExplanation.push(
              `Step 4: Promo "${promoCode}" applied = -₹${promoDiscount.toLocaleString()}`,
            );
          } else {
            // Promo would violate minimum, adjust it
            const maxAllowedDiscount = finalPrice - minimumFinalPrice;
            promoDiscount = Math.max(0, maxAllowedDiscount);
            finalPrice = minimumFinalPrice;
            promoApplied = true;
            promoAdjusted = true;
            flowExplanation.push(
              `Step 4: Promo "${promoCode}" adjusted to ₹${promoDiscount.toLocaleString()} (minimum markup protection)`,
            );
          }
        } else {
          flowExplanation.push(
            `Step 4: Promo "${promoCode}" invalid or expired`,
          );
        }
      } catch (error) {
        flowExplanation.push(`Step 4: Promo validation failed`);
      }
    } else {
      flowExplanation.push(`Step 4: No promo code provided`);
    }

    // Final protection check
    if (finalPrice < netFare) {
      finalPrice = netFare;
      promoDiscount = bargainedPrice - netFare;
      promoAdjusted = true;
      flowExplanation.push(
        `Step 5: Final price adjusted to protect net fare = ₹${finalPrice.toLocaleString()}`,
      );
    } else {
      flowExplanation.push(
        `Step 5: Final price = ₹${finalPrice.toLocaleString()}`,
      );
    }

    // Calculate totals
    const markupAmount = markedUpPrice - netFare;
    const bargainDiscount = markedUpPrice - bargainedPrice;
    const totalDiscount = markedUpPrice - finalPrice;

    // Generate savings message
    let savingsMessage = "";
    if (totalDiscount > 0) {
      const savingsPercent = ((totalDiscount / markedUpPrice) * 100).toFixed(1);
      savingsMessage = `You saved ₹${totalDiscount.toLocaleString()} (${savingsPercent}%)`;

      if (bargainSuccess && promoApplied) {
        savingsMessage += ` through bargaining + promo code!`;
      } else if (bargainSuccess) {
        savingsMessage += ` through bargaining!`;
      } else if (promoApplied) {
        savingsMessage += ` with promo code!`;
      }
    } else {
      savingsMessage = "Price locked at minimum rate for quality assurance.";
    }

    return {
      finalPrice: Math.round(finalPrice),
      totalDiscount: Math.round(totalDiscount),
      netFare: Math.round(netFare),
      markupAmount: Math.round(markupAmount),
      bargainDiscount: Math.round(bargainDiscount),
      promoDiscount: Math.round(promoDiscount),
      promoApplied,
      promoAdjusted,
      netFareProtected: finalPrice >= netFare,
      savingsMessage,
      flowExplanation,
    };
  }

  /**
   * Validate if a promo code can be applied after bargain logic
   */
  async validatePromoAfterBargain(
    promoCode: string,
    bargainedPrice: number,
    netFare: number,
    minimumMarkupPercent: number,
    bookingType: "flight" | "hotel",
  ): Promise<{
    canApply: boolean;
    maxDiscountAllowed: number;
    fullDiscountAmount: number;
    reason: string;
  }> {
    try {
      const validation = await promoCodeService.validatePromoCode(promoCode, {
        amount: bargainedPrice,
        category: bookingType,
      });

      if (!validation.valid) {
        return {
          canApply: false,
          maxDiscountAllowed: 0,
          fullDiscountAmount: 0,
          reason: validation.message || "Promo code is invalid",
        };
      }

      const minimumFinalPrice = netFare * (1 + minimumMarkupPercent / 100);
      const maxAllowedDiscount = Math.max(
        0,
        bargainedPrice - minimumFinalPrice,
      );
      const fullDiscountAmount = validation.discount;

      if (fullDiscountAmount <= maxAllowedDiscount) {
        return {
          canApply: true,
          maxDiscountAllowed: fullDiscountAmount,
          fullDiscountAmount,
          reason: "Promo code can be applied in full",
        };
      } else {
        return {
          canApply: true,
          maxDiscountAllowed: maxAllowedDiscount,
          fullDiscountAmount,
          reason: `Promo discount reduced to ₹${maxAllowedDiscount.toLocaleString()} to respect minimum markup`,
        };
      }
    } catch (error) {
      return {
        canApply: false,
        maxDiscountAllowed: 0,
        fullDiscountAmount: 0,
        reason: "Failed to validate promo code",
      };
    }
  }
}

export const bargainPromoIntegrationService =
  new BargainPromoIntegrationService();
export default bargainPromoIntegrationService;
