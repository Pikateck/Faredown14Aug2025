/**
 * Loyalty Service Bridge
 * Provides loyalty program functionality to the legacy API layer
 */

const fetch = require("node-fetch");

class LoyaltyService {
  constructor() {
    // Get server URL from environment or default to localhost
    this.serverUrl = process.env.LOYALTY_SERVER_URL || "http://localhost:5000";
  }

  /**
   * Process loyalty points earning for a completed booking
   * @param {Object} bookingData - Booking information
   * @param {string} bookingData.userId - User ID
   * @param {string} bookingData.bookingId - Booking reference
   * @param {string} bookingData.bookingType - 'HOTEL' or 'FLIGHT'
   * @param {Object} bookingData.eligibility - Earning eligibility details
   * @param {number} bookingData.eligibility.eligibleAmount - Amount eligible for points
   * @param {string} bookingData.eligibility.currency - Currency code
   * @param {number} bookingData.eligibility.fxRate - Exchange rate to INR
   * @param {string} bookingData.description - Transaction description
   * @returns {Promise<Object>} Earning result
   */
  async processEarning(bookingData) {
    try {
      console.log(
        `🎯 Processing loyalty earning for booking ${bookingData.bookingId}`,
      );

      // Validate required fields
      if (
        !bookingData.userId ||
        !bookingData.bookingId ||
        !bookingData.bookingType
      ) {
        console.error("❌ Missing required fields for loyalty earning");
        return { success: false, error: "Missing required fields" };
      }

      if (!bookingData.eligibility || !bookingData.eligibility.eligibleAmount) {
        console.error("❌ Missing eligibility amount for loyalty earning");
        return { success: false, error: "Missing eligibility amount" };
      }

      // Call the TypeScript loyalty service
      const response = await fetch(
        `${this.serverUrl}/api/loyalty/process-earning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: bookingData.userId,
            bookingId: bookingData.bookingId,
            bookingType: bookingData.bookingType,
            eligibility: {
              eligibleAmount: parseFloat(
                bookingData.eligibility.eligibleAmount,
              ),
              currency: bookingData.eligibility.currency || "INR",
              fxRate: parseFloat(bookingData.eligibility.fxRate || 1.0),
            },
            description:
              bookingData.description ||
              `${bookingData.bookingType} booking earning`,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Loyalty service error: ${response.status} - ${errorText}`,
        );
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();

      if (result.success) {
        console.log(
          `✅ Loyalty earning processed: ${result.data.earnedPoints} points earned`,
        );
        if (result.data.tierUpdate) {
          console.log(
            `🏆 Member tier updated: ${result.data.tierUpdate.oldTier} → ${result.data.tierUpdate.newTier}`,
          );
        }
      } else {
        console.error(`❌ Loyalty earning failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Error processing loyalty earning:", error);
      return {
        success: false,
        error: "Failed to process loyalty earning",
        details: error.message,
      };
    }
  }

  /**
   * Get user information for loyalty processing
   * @param {string} userEmail - User email address
   * @returns {Promise<Object>} User information
   */
  async getUserByEmail(userEmail) {
    try {
      // Since this is a bridge service, we may need to query the user database
      // For now, return a simple user object that can be extended
      // In a real implementation, this would query the users table

      console.log(`🔍 Looking up user by email: ${userEmail}`);

      // This is a simplified approach - in production you'd want to:
      // 1. Query the users table to get the user ID
      // 2. Handle user authentication properly
      // 3. Ensure proper security measures

      return {
        success: true,
        userId: null, // Will need to be populated from actual user lookup
        email: userEmail,
      };
    } catch (error) {
      console.error("❌ Error getting user by email:", error);
      return {
        success: false,
        error: "Failed to get user information",
      };
    }
  }

  /**
   * Calculate points that would be earned for an amount (preview)
   * @param {number} amount - Amount to calculate points for
   * @param {string} bookingType - 'HOTEL' or 'FLIGHT'
   * @param {string} currency - Currency code
   * @param {number} fxRate - Exchange rate to INR
   * @returns {Promise<Object>} Points calculation
   */
  async calculateEarning(amount, bookingType, currency = "INR", fxRate = 1.0) {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/loyalty/calculate-earning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eligibleAmount: parseFloat(amount),
            bookingType,
            currency,
            fxRate: parseFloat(fxRate),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Points calculation error: ${response.status} - ${errorText}`,
        );
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error calculating earning:", error);
      return {
        success: false,
        error: "Failed to calculate earning",
      };
    }
  }
}

module.exports = new LoyaltyService();
