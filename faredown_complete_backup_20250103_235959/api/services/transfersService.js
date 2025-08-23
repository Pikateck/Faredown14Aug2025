/**
 * Transfers Service
 * Handles transfer search, booking, and management operations
 * Integrates with supplier adapters and applies business logic
 */

const HotelbedsTransfersAdapter = require("./adapters/hotelbedsTransfersAdapter");
const transfersRepository = require("../repositories/transfersRepository");
const markupService = require("./markupService");
const promoService = require("./promoService");
const auditService = require("./auditService");
const winston = require("winston");

class TransfersService {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [TRANSFERS] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Initialize adapters
    this.adapters = {
      hotelbeds: new HotelbedsTransfersAdapter(),
    };

    // Default settings
    this.defaultSettings = {
      maxResults: 20,
      cacheTimeoutMinutes: 60,
      defaultCurrency: "INR",
      defaultLanguage: "ENG",
      searchTimeoutMs: 30000,
    };
  }

  /**
   * Search for available transfers
   * @param {Object} searchParams - Search parameters
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Search results with transfers
   */
  async searchTransfers(searchParams, options = {}) {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();

    try {
      this.logger.info("Starting transfer search", {
        sessionId,
        pickupLocation: searchParams.pickupLocation,
        dropoffLocation: searchParams.dropoffLocation,
        pickupDate: searchParams.pickupDate,
        isRoundTrip: searchParams.isRoundTrip,
      });

      // Validate search parameters
      this.validateSearchParams(searchParams);

      // Check cache first
      const cachedResults = await this.getCachedResults(searchParams);
      if (cachedResults && !options.bypassCache) {
        this.logger.info("Returning cached results", {
          sessionId,
          transfersCount: cachedResults.transfers.length,
          cacheAge: Date.now() - new Date(cachedResults.cachedAt).getTime(),
        });

        return this.applyBusinessLogic(cachedResults, searchParams, sessionId);
      }

      // Search with suppliers
      const results = await this.searchWithSuppliers(searchParams, sessionId);

      // Cache results
      await this.cacheResults(searchParams, results, sessionId);

      // Apply business logic (markup, promos, etc.)
      const finalResults = await this.applyBusinessLogic(
        results,
        searchParams,
        sessionId,
      );

      const duration = Date.now() - startTime;
      this.logger.info("Transfer search completed", {
        sessionId,
        transfersCount: finalResults.transfers.length,
        duration,
        suppliers: Object.keys(results.supplierResults),
      });

      return finalResults;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Transfer search failed", {
        sessionId,
        error: error.message,
        duration,
        searchParams,
      });

      throw new Error(`Transfer search failed: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific transfer
   * @param {string} transferId - Transfer product ID
   * @param {Object} searchParams - Original search parameters
   * @returns {Promise<Object>} - Transfer details
   */
  async getTransferDetails(transferId, searchParams) {
    try {
      this.logger.info("Getting transfer details", { transferId });

      // Parse supplier from transfer ID
      const { supplierCode, productId } = this.parseTransferId(transferId);
      const adapter = this.adapters[supplierCode];

      if (!adapter) {
        throw new Error(`Unsupported supplier: ${supplierCode}`);
      }

      // Get details from supplier
      const details = await adapter.getTransferDetails(productId, searchParams);

      // Apply business logic
      const enhancedDetails = await this.enhanceTransferDetails(
        details,
        searchParams,
      );

      this.logger.info("Transfer details retrieved", {
        transferId,
        supplierCode,
        vehicleType: details.vehicleType,
        totalPrice: enhancedDetails.pricing.totalPrice,
      });

      return enhancedDetails;
    } catch (error) {
      this.logger.error("Failed to get transfer details", {
        transferId,
        error: error.message,
      });

      throw new Error(`Failed to get transfer details: ${error.message}`);
    }
  }

  /**
   * Book a transfer
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} - Booking confirmation
   */
  async bookTransfer(bookingData) {
    const bookingRef = this.generateBookingReference();

    try {
      this.logger.info("Starting transfer booking", {
        bookingRef,
        transferId: bookingData.transferId,
        totalAmount: bookingData.totalAmount,
      });

      // Validate booking data
      this.validateBookingData(bookingData);

      // Parse supplier from transfer ID
      const { supplierCode, productId } = this.parseTransferId(
        bookingData.transferId,
      );
      const adapter = this.adapters[supplierCode];

      if (!adapter) {
        throw new Error(`Unsupported supplier: ${supplierCode}`);
      }

      // Apply final pricing (with promos, markups, etc.)
      const finalPricing = await this.calculateFinalPricing(bookingData);

      // Create booking record in database
      const dbBooking = await transfersRepository.createBooking({
        bookingRef,
        ...bookingData,
        ...finalPricing,
        status: "pending",
      });

      // Book with supplier
      const supplierBooking = await adapter.bookTransfer({
        ...bookingData,
        clientReference: bookingRef,
      });

      // Update booking with supplier response
      await transfersRepository.updateBooking(dbBooking.id, {
        supplierBookingRef: supplierBooking.bookingReference,
        supplierResponse: supplierBooking.rawResponse,
        status:
          supplierBooking.status === "CONFIRMED" ? "confirmed" : "pending",
        confirmationDate: supplierBooking.confirmationDate,
      });

      // Log booking for audit
      await auditService.logTransferBooking({
        bookingId: dbBooking.id,
        bookingRef,
        supplierCode,
        userId: bookingData.userId,
        action: "booking_created",
        data: {
          transferId: bookingData.transferId,
          totalAmount: finalPricing.totalAmount,
          supplierBookingRef: supplierBooking.bookingReference,
        },
      });

      const result = {
        success: true,
        bookingReference: bookingRef,
        supplierReference: supplierBooking.bookingReference,
        status: supplierBooking.status,
        confirmationDate: supplierBooking.confirmationDate,
        transferDetails: supplierBooking.transferDetails,
        pricing: finalPricing,
        voucherUrl: supplierBooking.voucherUrl,
        bookingId: dbBooking.id,
      };

      this.logger.info("Transfer booking completed", {
        bookingRef,
        supplierBookingRef: supplierBooking.bookingReference,
        status: result.status,
        totalAmount: finalPricing.totalAmount,
      });

      return result;
    } catch (error) {
      this.logger.error("Transfer booking failed", {
        bookingRef,
        error: error.message,
        transferId: bookingData.transferId,
      });

      // Update booking status to failed
      try {
        await transfersRepository.updateBookingByRef(bookingRef, {
          status: "failed",
          internalNotes: `Booking failed: ${error.message}`,
        });
      } catch (updateError) {
        this.logger.error("Failed to update booking status", {
          bookingRef,
          error: updateError.message,
        });
      }

      throw new Error(`Transfer booking failed: ${error.message}`);
    }
  }

  /**
   * Cancel a transfer booking
   * @param {string} bookingReference - Booking reference
   * @param {Object} cancellationData - Cancellation details
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelTransfer(bookingReference, cancellationData = {}) {
    try {
      this.logger.info("Cancelling transfer", { bookingReference });

      // Get booking from database
      const booking =
        await transfersRepository.getBookingByRef(bookingReference);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      // Get supplier adapter
      const adapter = this.adapters[booking.supplierCode];
      if (!adapter) {
        throw new Error(`Unsupported supplier: ${booking.supplierCode}`);
      }

      // Cancel with supplier
      const cancellationResult = await adapter.cancelTransfer(
        booking.supplierBookingRef,
        cancellationData.cancellationFlag,
      );

      // Update booking in database
      await transfersRepository.updateBooking(booking.id, {
        status: "cancelled",
        cancellationDate: new Date(),
        internalNotes: `Cancelled: ${cancellationData.reason || "Customer request"}`,
      });

      // Log cancellation
      await auditService.logTransferBooking({
        bookingId: booking.id,
        bookingRef: bookingReference,
        userId: cancellationData.userId,
        action: "booking_cancelled",
        data: {
          reason: cancellationData.reason,
          cancellationResult,
        },
      });

      this.logger.info("Transfer cancelled successfully", {
        bookingReference,
        supplierBookingRef: booking.supplierBookingRef,
      });

      return {
        success: true,
        bookingReference,
        status: "cancelled",
        cancellationDate: new Date().toISOString(),
        refundAmount: cancellationResult.refundAmount || 0,
        cancellationFee: cancellationResult.cancellationFee || 0,
      };
    } catch (error) {
      this.logger.error("Transfer cancellation failed", {
        bookingReference,
        error: error.message,
      });

      throw new Error(`Transfer cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get booking details
   * @param {string} bookingReference - Booking reference
   * @returns {Promise<Object>} - Booking details
   */
  async getBookingDetails(bookingReference) {
    try {
      this.logger.info("Getting booking details", { bookingReference });

      const booking =
        await transfersRepository.getBookingByRef(bookingReference);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Get live status from supplier if needed
      if (booking.status === "pending" || booking.status === "confirmed") {
        try {
          const adapter = this.adapters[booking.supplierCode];
          if (adapter) {
            const liveDetails = await adapter.getBookingDetails(
              booking.supplierBookingRef,
            );

            // Update status if changed
            if (liveDetails.status !== booking.status) {
              await transfersRepository.updateBooking(booking.id, {
                status: liveDetails.status,
              });
              booking.status = liveDetails.status;
            }
          }
        } catch (error) {
          this.logger.warn("Failed to get live booking status", {
            bookingReference,
            error: error.message,
          });
        }
      }

      return {
        bookingReference: booking.bookingRef,
        supplierReference: booking.supplierBookingRef,
        status: booking.status,
        transferDetails: {
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          vehicleType: booking.vehicleType,
          vehicleClass: booking.vehicleClass,
          maxPassengers: booking.totalPassengers,
        },
        guestDetails: booking.guestDetails,
        pricing: {
          basePrice: booking.basePrice,
          markupAmount: booking.markupAmount,
          discountAmount: booking.discountAmount,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
        },
        dates: {
          bookingDate: booking.bookingDate,
          confirmationDate: booking.confirmationDate,
          cancellationDate: booking.cancellationDate,
        },
        driverDetails: booking.driverName
          ? {
              name: booking.driverName,
              phone: booking.driverPhone,
              vehicle: {
                make: booking.vehicleMake,
                model: booking.vehicleModel,
                color: booking.vehicleColor,
                licensePlate: booking.vehicleLicensePlate,
              },
            }
          : null,
        trackingUrl: booking.trackingUrl,
        voucherUrl: booking.receiptUrl,
      };
    } catch (error) {
      this.logger.error("Failed to get booking details", {
        bookingReference,
        error: error.message,
      });

      throw new Error(`Failed to get booking details: ${error.message}`);
    }
  }

  /**
   * Search with all available suppliers
   * @param {Object} searchParams - Search parameters
   * @param {string} sessionId - Session ID for tracking
   * @returns {Promise<Object>} - Combined results
   */
  async searchWithSuppliers(searchParams, sessionId) {
    const searchPromises = [];
    const supplierResults = {};

    // Search with Hotelbeds (primary supplier)
    if (this.adapters.hotelbeds) {
      searchPromises.push(
        this.adapters.hotelbeds
          .searchTransfers(searchParams)
          .then((results) => {
            supplierResults.hotelbeds = results;
            return results;
          })
          .catch((error) => {
            this.logger.error("Hotelbeds search failed", {
              sessionId,
              error: error.message,
            });
            supplierResults.hotelbeds = [];
            return [];
          }),
      );
    }

    // Wait for all searches to complete
    const allResults = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const combinedTransfers = allResults.flat();

    // If no results from suppliers and in development mode, provide mock data
    if (
      combinedTransfers.length === 0 &&
      (process.env.NODE_ENV === "development" ||
        process.env.ENABLE_MOCK_DATA === "true")
    ) {
      this.logger.info(
        "No supplier results, providing mock data for development",
        { sessionId },
      );
      return this.getMockTransferResults(searchParams, sessionId);
    }

    return {
      transfers: combinedTransfers,
      supplierResults,
      searchParams,
      sessionId,
      searchedAt: new Date().toISOString(),
    };
  }

  /**
   * Apply business logic (markup, promos, filtering)
   * @param {Object} results - Raw search results
   * @param {Object} searchParams - Search parameters
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Enhanced results
   */
  async applyBusinessLogic(results, searchParams, sessionId) {
    const enhancedTransfers = [];

    for (const transfer of results.transfers) {
      try {
        // Apply markup rules
        const markupAmount = await markupService.calculateTransferMarkup(
          transfer,
          searchParams,
        );

        // Calculate total price with markup
        const totalPrice = parseFloat(transfer.basePrice) + markupAmount;

        // Check for applicable promo codes
        let discountAmount = 0;
        if (searchParams.promoCode) {
          try {
            const promoResult = await promoService.validateTransferPromo(
              searchParams.promoCode,
              {
                transferId: transfer.id,
                totalPrice,
                route: `${searchParams.pickupLocation}-${searchParams.dropoffLocation}`,
                vehicleType: transfer.vehicleType,
              },
            );

            if (promoResult.isValid) {
              discountAmount = promoResult.discountAmount;
            }
          } catch (promoError) {
            this.logger.warn("Promo validation failed", {
              sessionId,
              promoCode: searchParams.promoCode,
              error: promoError.message,
            });
          }
        }

        // Calculate final price
        const finalPrice = Math.max(
          totalPrice - discountAmount,
          transfer.basePrice * 1.05,
        ); // Never-loss protection

        enhancedTransfers.push({
          ...transfer,
          pricing: {
            basePrice: transfer.basePrice,
            markupAmount,
            discountAmount,
            totalPrice: finalPrice,
            currency: transfer.currency,
            savings: totalPrice - finalPrice,
          },
          id: `${transfer.supplierCode}_${transfer.id}`, // Prefix with supplier
          searchSessionId: sessionId,
          enhancedAt: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.error("Failed to enhance transfer", {
          sessionId,
          transferId: transfer.id,
          error: error.message,
        });

        // Include transfer without enhancements
        enhancedTransfers.push({
          ...transfer,
          pricing: {
            basePrice: transfer.basePrice,
            markupAmount: 0,
            discountAmount: 0,
            totalPrice: transfer.basePrice,
            currency: transfer.currency,
            savings: 0,
          },
          id: `${transfer.supplierCode}_${transfer.id}`,
          searchSessionId: sessionId,
        });
      }
    }

    // Sort by price
    enhancedTransfers.sort(
      (a, b) => a.pricing.totalPrice - b.pricing.totalPrice,
    );

    return {
      transfers: enhancedTransfers,
      searchParams,
      sessionId,
      summary: {
        totalResults: enhancedTransfers.length,
        priceRange:
          enhancedTransfers.length > 0
            ? {
                min: Math.min(
                  ...enhancedTransfers.map((t) => t.pricing.totalPrice),
                ),
                max: Math.max(
                  ...enhancedTransfers.map((t) => t.pricing.totalPrice),
                ),
                currency: enhancedTransfers[0]?.pricing.currency || "INR",
              }
            : null,
        vehicleTypes: [...new Set(enhancedTransfers.map((t) => t.vehicleType))],
        suppliers: [...new Set(enhancedTransfers.map((t) => t.supplierCode))],
      },
      searchedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate search parameters
   * @param {Object} searchParams - Parameters to validate
   */
  validateSearchParams(searchParams) {
    const required = ["pickupLocation", "dropoffLocation", "pickupDate"];

    for (const field of required) {
      if (!searchParams[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate dates
    const pickupDate = new Date(searchParams.pickupDate);
    if (pickupDate < new Date()) {
      throw new Error("Pickup date cannot be in the past");
    }

    if (searchParams.isRoundTrip && searchParams.returnDate) {
      const returnDate = new Date(searchParams.returnDate);
      if (returnDate <= pickupDate) {
        throw new Error("Return date must be after pickup date");
      }
    }

    // Validate passenger counts
    if (searchParams.passengers) {
      const { adults, children, infants } = searchParams.passengers;
      if (adults < 1 || adults > 8) {
        throw new Error("Adults count must be between 1 and 8");
      }
      if (children < 0 || children > 6) {
        throw new Error("Children count must be between 0 and 6");
      }
      if (infants < 0 || infants > 3) {
        throw new Error("Infants count must be between 0 and 3");
      }
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} - Session ID
   */
  generateSessionId() {
    return `TS${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate booking reference
   * @returns {string} - Booking reference
   */
  generateBookingReference() {
    return `TR${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  /**
   * Parse transfer ID to extract supplier and product ID
   * @param {string} transferId - Transfer ID
   * @returns {Object} - Supplier code and product ID
   */
  parseTransferId(transferId) {
    const parts = transferId.split("_");
    if (parts.length !== 2) {
      throw new Error("Invalid transfer ID format");
    }

    return {
      supplierCode: parts[0].toLowerCase(),
      productId: parts[1],
    };
  }

  /**
   * Get transfer destinations
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @param {boolean} popularOnly - Return only popular destinations
   * @returns {Promise<Object>} - Destinations result
   */
  async getDestinations(query = "", limit = 15, popularOnly = false) {
    try {
      this.logger.info("Getting transfer destinations from Hotelbeds API", {
        query,
        limit,
        popularOnly,
      });

      // First try to get destinations from Hotelbeds Transfers API
      try {
        const apiDestinations = await this.adapters.hotelbeds.getDestinations(
          query,
          popularOnly ? "popular" : "",
          limit,
        );

        if (apiDestinations && apiDestinations.length > 0) {
          this.logger.info(
            `Retrieved ${apiDestinations.length} destinations from Hotelbeds API`,
          );
          return {
            success: true,
            destinations: apiDestinations,
          };
        }
      } catch (apiError) {
        this.logger.warn(
          "Hotelbeds API failed, falling back to static destinations",
          {
            error: apiError.message,
          },
        );
      }

      // Fallback to static destinations if API fails
      this.logger.info("Using fallback static destinations");
      const transferDestinations = [
        // Major Indian Airports
        {
          code: "DEL",
          name: "Delhi Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "BOM",
          name: "Mumbai Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "BLR",
          name: "Bangalore Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "MAA",
          name: "Chennai Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "CCU",
          name: "Kolkata Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "HYD",
          name: "Hyderabad Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "GOI",
          name: "Goa Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "PNQ",
          name: "Pune Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "AMD",
          name: "Ahmedabad Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },
        {
          code: "COK",
          name: "Kochi Airport",
          country: "India",
          countryCode: "IN",
          type: "airport",
          popular: true,
        },

        // Major Indian Cities
        {
          code: "DELHI",
          name: "Delhi City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "MUMBAI",
          name: "Mumbai City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "BANGALORE",
          name: "Bangalore City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "CHENNAI",
          name: "Chennai City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "KOLKATA",
          name: "Kolkata City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "HYDERABAD",
          name: "Hyderabad City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "GOA",
          name: "Goa Hotels",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },
        {
          code: "PUNE",
          name: "Pune City Center",
          country: "India",
          countryCode: "IN",
          type: "city",
          popular: true,
        },

        // International Airports
        {
          code: "DXB",
          name: "Dubai Airport",
          country: "UAE",
          countryCode: "AE",
          type: "airport",
          popular: true,
        },
        {
          code: "SIN",
          name: "Singapore Airport",
          country: "Singapore",
          countryCode: "SG",
          type: "airport",
          popular: true,
        },
        {
          code: "BKK",
          name: "Bangkok Airport",
          country: "Thailand",
          countryCode: "TH",
          type: "airport",
          popular: true,
        },
        {
          code: "LHR",
          name: "London Heathrow",
          country: "United Kingdom",
          countryCode: "GB",
          type: "airport",
          popular: true,
        },
        {
          code: "CDG",
          name: "Paris Charles de Gaulle",
          country: "France",
          countryCode: "FR",
          type: "airport",
          popular: true,
        },
        {
          code: "JFK",
          name: "New York JFK",
          country: "United States",
          countryCode: "US",
          type: "airport",
          popular: true,
        },
        {
          code: "LAX",
          name: "Los Angeles Airport",
          country: "United States",
          countryCode: "US",
          type: "airport",
          popular: true,
        },
        {
          code: "NRT",
          name: "Tokyo Narita",
          country: "Japan",
          countryCode: "JP",
          type: "airport",
          popular: true,
        },
        {
          code: "HKG",
          name: "Hong Kong Airport",
          country: "Hong Kong",
          countryCode: "HK",
          type: "airport",
          popular: true,
        },
        {
          code: "SYD",
          name: "Sydney Airport",
          country: "Australia",
          countryCode: "AU",
          type: "airport",
          popular: true,
        },

        // International Cities
        {
          code: "DUBAI",
          name: "Dubai City Center",
          country: "UAE",
          countryCode: "AE",
          type: "city",
          popular: true,
        },
        {
          code: "SINGAPORE",
          name: "Singapore City Center",
          country: "Singapore",
          countryCode: "SG",
          type: "city",
          popular: true,
        },
        {
          code: "BANGKOK",
          name: "Bangkok City Center",
          country: "Thailand",
          countryCode: "TH",
          type: "city",
          popular: true,
        },
        {
          code: "LONDON",
          name: "London City Center",
          country: "United Kingdom",
          countryCode: "GB",
          type: "city",
          popular: true,
        },
        {
          code: "PARIS",
          name: "Paris City Center",
          country: "France",
          countryCode: "FR",
          type: "city",
          popular: true,
        },
        {
          code: "NEW_YORK",
          name: "New York City Center",
          country: "United States",
          countryCode: "US",
          type: "city",
          popular: true,
        },
        {
          code: "LOS_ANGELES",
          name: "Los Angeles City Center",
          country: "United States",
          countryCode: "US",
          type: "city",
          popular: true,
        },
        {
          code: "TOKYO",
          name: "Tokyo City Center",
          country: "Japan",
          countryCode: "JP",
          type: "city",
          popular: true,
        },
        {
          code: "HONG_KONG",
          name: "Hong Kong City Center",
          country: "Hong Kong",
          countryCode: "HK",
          type: "city",
          popular: true,
        },
        {
          code: "SYDNEY",
          name: "Sydney City Center",
          country: "Australia",
          countryCode: "AU",
          type: "city",
          popular: true,
        },
      ];

      let destinations = [...transferDestinations];

      // Filter by query if provided
      if (query && query.length > 0) {
        const lowerQuery = query.toLowerCase();
        destinations = destinations.filter(
          (dest) =>
            dest.name.toLowerCase().includes(lowerQuery) ||
            dest.country.toLowerCase().includes(lowerQuery) ||
            dest.code.toLowerCase().includes(lowerQuery) ||
            dest.type.toLowerCase().includes(lowerQuery),
        );
      }

      // If popularOnly is requested, filter to popular destinations
      if (popularOnly) {
        destinations = destinations.filter((dest) => dest.popular);
      }

      // Sort by popularity first, then by name
      destinations.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      // Limit results
      destinations = destinations.slice(0, limit);

      this.logger.info("Transfer destinations retrieved from fallback", {
        query,
        count: destinations.length,
      });

      return {
        success: true,
        destinations,
      };
    } catch (error) {
      this.logger.error("Failed to get transfer destinations", {
        query,
        error: error.message,
      });

      return {
        success: false,
        error: `Failed to get transfer destinations: ${error.message}`,
      };
    }
  }

  /**
   * Get cached search results
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object|null>} - Cached results or null
   */
  async getCachedResults(searchParams) {
    try {
      // TODO: Implement Redis-based caching
      // For now, return null to always search fresh
      return null;
    } catch (error) {
      this.logger.warn("Cache retrieval failed", { error: error.message });
      return null;
    }
  }

  /**
   * Cache search results
   * @param {Object} searchParams - Search parameters
   * @param {Object} results - Search results
   * @param {string} sessionId - Session ID
   */
  async cacheResults(searchParams, results, sessionId) {
    try {
      // TODO: Implement Redis-based caching
      this.logger.debug("Results cached", {
        sessionId,
        transfersCount: results.transfers.length,
      });
    } catch (error) {
      this.logger.warn("Cache storage failed", {
        sessionId,
        error: error.message,
      });
    }
  }

  /**
   * Enhance transfer details with additional information
   * @param {Object} details - Basic transfer details
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Enhanced details
   */
  async enhanceTransferDetails(details, searchParams) {
    try {
      // Apply pricing enhancements
      const markupAmount = await markupService.calculateTransferMarkup(
        details,
        searchParams,
      );
      const totalPrice = parseFloat(details.basePrice) + markupAmount;

      // Apply promo codes if any
      let discountAmount = 0;
      if (searchParams.promoCode) {
        try {
          const promoResult = await promoService.validateTransferPromo(
            searchParams.promoCode,
            {
              transferId: details.id,
              totalPrice,
              route: `${searchParams.pickupLocation}-${searchParams.dropoffLocation}`,
              vehicleType: details.vehicleType,
            },
          );

          if (promoResult.isValid) {
            discountAmount = promoResult.discountAmount;
          }
        } catch (promoError) {
          this.logger.warn(
            "Promo validation failed during detail enhancement",
            {
              promoCode: searchParams.promoCode,
              error: promoError.message,
            },
          );
        }
      }

      const finalPrice = Math.max(
        totalPrice - discountAmount,
        details.basePrice * 1.05,
      );

      return {
        ...details,
        pricing: {
          basePrice: details.basePrice,
          markupAmount,
          discountAmount,
          totalPrice: finalPrice,
          currency: details.currency,
          savings: totalPrice - finalPrice,
        },
        enhancedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to enhance transfer details", {
        transferId: details.id,
        error: error.message,
      });

      // Return details with basic pricing if enhancement fails
      return {
        ...details,
        pricing: {
          basePrice: details.basePrice,
          markupAmount: 0,
          discountAmount: 0,
          totalPrice: details.basePrice,
          currency: details.currency,
          savings: 0,
        },
      };
    }
  }

  /**
   * Calculate final pricing for booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} - Final pricing
   */
  async calculateFinalPricing(bookingData) {
    try {
      // Get base pricing from transfer details
      const basePrice = bookingData.totalAmount || 0;

      // Apply markup
      const markupAmount = await markupService.calculateTransferMarkup(
        { basePrice, vehicleType: bookingData.vehicleType },
        bookingData,
      );

      // Apply promos
      let discountAmount = 0;
      if (bookingData.promoCode) {
        try {
          const promoResult = await promoService.validateTransferPromo(
            bookingData.promoCode,
            {
              transferId: bookingData.transferId,
              totalPrice: basePrice + markupAmount,
              route: `${bookingData.pickupLocation}-${bookingData.dropoffLocation}`,
            },
          );

          if (promoResult.isValid) {
            discountAmount = promoResult.discountAmount;
          }
        } catch (promoError) {
          this.logger.warn(
            "Promo validation failed during pricing calculation",
            {
              promoCode: bookingData.promoCode,
              error: promoError.message,
            },
          );
        }
      }

      const finalTotal = Math.max(
        basePrice + markupAmount - discountAmount,
        basePrice * 1.05,
      );

      return {
        basePrice,
        markupAmount,
        discountAmount,
        totalAmount: finalTotal,
        currency: bookingData.currency || "INR",
        breakdown: {
          subtotal: basePrice,
          markup: markupAmount,
          discount: discountAmount,
          taxes: 0, // Typically included in base price
          total: finalTotal,
        },
      };
    } catch (error) {
      this.logger.error("Failed to calculate final pricing", {
        transferId: bookingData.transferId,
        error: error.message,
      });

      // Return safe fallback pricing
      const safeTotal = bookingData.totalAmount || 1000;
      return {
        basePrice: safeTotal,
        markupAmount: 0,
        discountAmount: 0,
        totalAmount: safeTotal,
        currency: bookingData.currency || "INR",
        breakdown: {
          subtotal: safeTotal,
          markup: 0,
          discount: 0,
          taxes: 0,
          total: safeTotal,
        },
      };
    }
  }

  /**
   * Validate booking data
   * @param {Object} bookingData - Data to validate
   */
  validateBookingData(bookingData) {
    const required = ["transferId", "guestDetails", "totalAmount"];

    for (const field of required) {
      if (!bookingData[field]) {
        throw new Error(`Missing required booking field: ${field}`);
      }
    }

    // Validate guest details
    const guestRequired = ["firstName", "lastName", "email", "phone"];
    for (const field of guestRequired) {
      if (!bookingData.guestDetails[field]) {
        throw new Error(`Missing required guest field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.guestDetails.email)) {
      throw new Error("Invalid email format");
    }

    // Validate amount
    if (bookingData.totalAmount <= 0) {
      throw new Error("Total amount must be greater than zero");
    }
  }

  /**
   * Generate mock transfer results for development
   * @param {Object} searchParams - Search parameters
   * @param {string} sessionId - Session ID
   * @returns {Object} - Mock transfer results
   */
  getMockTransferResults(searchParams, sessionId) {
    const mockTransfers = [
      {
        id: "hotelbeds_1",
        rateKey: "sample_rate_1",
        supplierCode: "hotelbeds",
        vehicleType: "sedan",
        vehicleClass: "economy",
        vehicleName: "Economy Sedan",
        vehicleImage: "/api/placeholder/120/80",
        maxPassengers: 3,
        maxLuggage: 2,
        pickupLocation: searchParams.pickupLocation || "Mumbai Airport (BOM)",
        pickupInstructions: "Meet at Arrivals Hall - Terminal 2",
        dropoffLocation:
          searchParams.dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "33 km",
        pricing: {
          basePrice: 1000,
          currency: "INR",
          totalPrice: 1200,
          breakdown: {
            base: 1000,
            surcharges: 100,
            taxes: 100,
          },
        },
        features: ["Professional Driver", "Meet & Greet", "Free Waiting"],
        providerName: "Mumbai Transfers Ltd",
        providerRating: 4.6,
        cancellationPolicy: {
          freeUntil: "24h",
          feePercentage: 10,
        },
        availability: {
          available: true,
          lastAvailableDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
      {
        id: "hotelbeds_2",
        rateKey: "sample_rate_2",
        supplierCode: "hotelbeds",
        vehicleType: "suv",
        vehicleClass: "premium",
        vehicleName: "Premium SUV",
        vehicleImage: "/api/placeholder/120/80",
        maxPassengers: 6,
        maxLuggage: 4,
        pickupLocation: searchParams.pickupLocation || "Mumbai Airport (BOM)",
        pickupInstructions: "Meet at Arrivals Hall - Terminal 2",
        dropoffLocation:
          searchParams.dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "33 km",
        pricing: {
          basePrice: 1800,
          currency: "INR",
          totalPrice: 2100,
          breakdown: {
            base: 1800,
            surcharges: 150,
            taxes: 150,
          },
        },
        features: [
          "Luxury Vehicle",
          "Professional Driver",
          "Meet & Greet",
          "Free Waiting",
          "WiFi",
        ],
        providerName: "Premium Transfers Ltd",
        providerRating: 4.8,
        cancellationPolicy: {
          freeUntil: "24h",
          feePercentage: 15,
        },
        availability: {
          available: true,
          lastAvailableDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
      {
        id: "hotelbeds_3",
        rateKey: "sample_rate_3",
        supplierCode: "hotelbeds",
        vehicleType: "minivan",
        vehicleClass: "business",
        vehicleName: "Business Minivan",
        vehicleImage: "/api/placeholder/120/80",
        maxPassengers: 8,
        maxLuggage: 6,
        pickupLocation: searchParams.pickupLocation || "Mumbai Airport (BOM)",
        pickupInstructions: "Meet at Arrivals Hall - Terminal 2",
        dropoffLocation:
          searchParams.dropoffLocation || "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "33 km",
        pricing: {
          basePrice: 2500,
          currency: "INR",
          totalPrice: 3000,
          breakdown: {
            base: 2500,
            surcharges: 250,
            taxes: 250,
          },
        },
        features: [
          "Spacious Vehicle",
          "Professional Driver",
          "Meet & Greet",
          "Free Waiting",
          "WiFi",
          "Air Conditioning",
        ],
        providerName: "Business Transfers Ltd",
        providerRating: 4.7,
        cancellationPolicy: {
          freeUntil: "48h",
          feePercentage: 20,
        },
        availability: {
          available: true,
          lastAvailableDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
    ];

    return {
      transfers: mockTransfers,
      supplierResults: {
        hotelbeds: mockTransfers,
      },
      searchParams,
      sessionId,
      searchedAt: new Date().toISOString(),
      mockData: true,
    };
  }
}

module.exports = new TransfersService();
