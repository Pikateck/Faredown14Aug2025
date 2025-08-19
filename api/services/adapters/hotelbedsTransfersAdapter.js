/**
 * Hotelbeds Transfers Supplier Adapter
 * Integrates with Hotelbeds Transfers API for transfer booking services
 * Based on https://developer.hotelbeds.com/documentation/transfers/booking-api/overview/
 */

const BaseSupplierAdapter = require("./baseSupplierAdapter");
const axios = require("axios");
const crypto = require("crypto");
const winston = require("winston");

class HotelbedsTransfersAdapter extends BaseSupplierAdapter {
  constructor(config = {}) {
    super("HOTELBEDS_TRANSFERS", {
      baseUrl:
        process.env.TRANSFERS__BASE_URL_TRANSFERS ||
        (process.env.TRANSFERS__HOTELBEDS__ENV === "live"
          ? "https://api.hotelbeds.com/transfers-api/1.0"
          : "https://api.test.hotelbeds.com/transfers-api/1.0"),
      contentUrl:
        process.env.TRANSFERS__BASE_URL_CONTENT ||
        (process.env.TRANSFERS__HOTELBEDS__ENV === "live"
          ? "https://api.hotelbeds.com/transfers-cache-api/1.0"
          : "https://api.test.hotelbeds.com/transfers-cache-api/1.0"),
      apiKey: process.env.TRANSFERS__HOTELBEDS__API_KEY,
      secret: process.env.TRANSFERS__HOTELBEDS__SECRET,
      environment: process.env.TRANSFERS__HOTELBEDS__ENV || "test",
      timeout: parseInt(process.env.TRANSFERS__TIMEOUT_MS) || 15000,
      retryMax: parseInt(process.env.TRANSFERS__RETRY_MAX) || 2,
      rateLimit: {
        windowMs: parseInt(process.env.TRANSFERS__RATE_LIMIT_WINDOW_MS) || 4000,
        maxRequests: parseInt(process.env.TRANSFERS__RATE_LIMIT_MAX) || 8,
      },
      ...config,
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [HOTELBEDS-TRANSFERS] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Rate limiting state
    this.rateLimitState = {
      requests: [],
      lastWindowReset: Date.now(),
    };

    // Initialize HTTP clients
    this.transfersClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "Faredown-Transfers/1.0",
      },
    });

    this.contentClient = axios.create({
      baseURL: this.config.contentUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "Faredown-Transfers/1.0",
      },
    });

    // Add authentication interceptors
    this.transfersClient.interceptors.request.use(
      this.addAuthHeaders.bind(this),
    );
    this.contentClient.interceptors.request.use(this.addAuthHeaders.bind(this));

    // Add rate limiting interceptors
    this.transfersClient.interceptors.request.use(
      this.rateLimitRequest.bind(this),
    );
    this.contentClient.interceptors.request.use(
      this.rateLimitRequest.bind(this),
    );

    // Add retry interceptors
    this.transfersClient.interceptors.response.use(
      null,
      this.retryRequest.bind(this),
    );
    this.contentClient.interceptors.response.use(
      null,
      this.retryRequest.bind(this),
    );

    this.logger.info("Hotelbeds Transfers adapter initialized", {
      environment: this.config.environment,
      baseUrl: this.config.baseUrl,
      hasCredentials: !!(this.config.apiKey && this.config.secret),
    });
  }

  /**
   * Generate Hotelbeds authentication signature
   * X-Signature = SHA256(apiKey + secret + epochMillis)
   */
  generateSignature(timestamp) {
    const payload = this.config.apiKey + this.config.secret + timestamp;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Add authentication headers to requests
   */
  addAuthHeaders(config) {
    if (!this.config.apiKey || !this.config.secret) {
      throw new Error("Hotelbeds Transfers API credentials not configured");
    }

    const timestamp = Date.now();
    const signature = this.generateSignature(timestamp);

    config.headers["Api-key"] = this.config.apiKey;
    config.headers["X-Signature"] = signature;
    config.headers["X-Timestamp"] = timestamp.toString();

    return config;
  }

  /**
   * Rate limiting implementation - 8 requests per 4 seconds
   */
  async rateLimitRequest(config) {
    const now = Date.now();
    const windowMs = this.config.rateLimit.windowMs;
    const maxRequests = this.config.rateLimit.maxRequests;

    // Reset window if expired
    if (now - this.rateLimitState.lastWindowReset > windowMs) {
      this.rateLimitState.requests = [];
      this.rateLimitState.lastWindowReset = now;
    }

    // Check if we're at the limit
    if (this.rateLimitState.requests.length >= maxRequests) {
      const waitTime = windowMs - (now - this.rateLimitState.lastWindowReset);
      this.logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      // Reset after waiting
      this.rateLimitState.requests = [];
      this.rateLimitState.lastWindowReset = Date.now();
    }

    // Add this request to the window
    this.rateLimitState.requests.push(now);

    return config;
  }

  /**
   * Retry logic for failed requests
   */
  async retryRequest(error) {
    const config = error.config;

    // Don't retry if max retries reached
    if (!config || config.__retryCount >= this.config.retryMax) {
      return Promise.reject(error);
    }

    // Only retry on 5xx errors or timeouts
    const shouldRetry =
      error.response?.status >= 500 ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT";

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    config.__retryCount = (config.__retryCount || 0) + 1;

    // Exponential backoff with jitter
    const delay = Math.min(1000 * Math.pow(2, config.__retryCount - 1), 5000);
    const jitter = Math.random() * 500;

    this.logger.warn(
      `Retrying request (${config.__retryCount}/${this.config.retryMax}) after ${delay + jitter}ms`,
      {
        url: config.url,
        error: error.message,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, delay + jitter));

    return this.transfersClient(config);
  }

  /**
   * Search airport taxi transfers
   */
  async searchAirportTaxi(params) {
    try {
      this.logger.info("Searching airport taxi transfers", { params });

      const searchPayload = this.buildSearchPayload(params);

      const response = await this.transfersClient.post(
        "/availability",
        searchPayload,
      );

      if (!response.data?.services) {
        this.logger.warn("No services found in response", {
          response: response.data,
        });
        return [];
      }

      const offers = this.normalizeOffers(response.data.services, params);

      this.logger.info(`Found ${offers.length} transfer offers`);

      return offers;
    } catch (error) {
      this.logger.error("Error searching airport taxi transfers", {
        error: error.message,
        params,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw this.normalizeError(error);
    }
  }

  /**
   * Build search payload for Hotelbeds API
   */
  buildSearchPayload(params) {
    const {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime = "10:00",
      returnDate,
      returnTime,
      passengers = { adults: 2, children: 0, infants: 0 },
      isRoundTrip = false,
      vehicleType,
      currency = "INR",
    } = params;

    // Determine transfer type based on locations
    let transferType = "PRIVATE";
    if (
      pickupLocation.type === "airport" ||
      dropoffLocation.type === "airport"
    ) {
      transferType = "AIRPORT";
    }

    const payload = {
      language: "ENG",
      from: {
        type: this.mapLocationType(pickupLocation.type),
        code: pickupLocation.code || pickupLocation.name,
      },
      to: {
        type: this.mapLocationType(dropoffLocation.type),
        code: dropoffLocation.code || dropoffLocation.name,
      },
      outbound: `${pickupDate}T${pickupTime}:00`,
      occupancies: [
        {
          adults: passengers.adults,
          children: passengers.children,
          infants: passengers.infants,
        },
      ],
    };

    // Add return journey for round trips
    if (isRoundTrip && returnDate) {
      payload.inbound = `${returnDate}T${returnTime || "14:00"}:00`;
    }

    // Add vehicle type filter if specified
    if (vehicleType) {
      payload.transferType = this.mapVehicleType(vehicleType);
    }

    return payload;
  }

  /**
   * Map location types to Hotelbeds format
   */
  mapLocationType(type) {
    const typeMap = {
      airport: "IATA",
      hotel: "ATLAS",
      city: "ATLAS",
      address: "GIATA",
    };
    return typeMap[type] || "ATLAS";
  }

  /**
   * Map vehicle types to Hotelbeds format
   */
  mapVehicleType(vehicleType) {
    const typeMap = {
      sedan: "PRIVATE",
      suv: "PRIVATE",
      minivan: "PRIVATE",
      luxury: "LUXURY",
      wheelchair: "WHEELCHAIR",
    };
    return typeMap[vehicleType] || "PRIVATE";
  }

  /**
   * Normalize API response to standard format
   */
  normalizeOffers(services, originalParams) {
    return services.map((service) => ({
      id: service.id,
      supplierReference: service.code,
      vehicleType: this.normalizeVehicleType(service.content?.vehicle?.name),
      vehicleClass: service.content?.category?.name || "Standard",
      vehicleName: service.content?.vehicle?.name || "Private Transfer",
      maxPassengers:
        service.content?.vehicle?.maxPax ||
        originalParams.passengers.adults + originalParams.passengers.children,
      maxLuggage: service.content?.vehicle?.maxLuggage || 2,
      features: this.extractFeatures(service),
      distance: service.content?.distance,
      duration: service.content?.time,
      pickupInstructions: service.content?.pickupInstructions,
      cancellationPolicy: this.normalizeCancellationPolicy(
        service.cancellationPolicies,
      ),
      pricing: {
        currency:
          service.price?.currencyCode || originalParams.currency || "INR",
        netAmount: parseFloat(service.price?.totalAmount || 0),
        breakdown: {
          basePrice: parseFloat(service.price?.totalAmount || 0),
          taxes: 0,
          fees: 0,
        },
      },
      supplier: {
        code: "hotelbeds-transfers",
        name: "Hotelbeds Transfers",
        reference: service.code,
      },
      meta: {
        originalService: service,
        searchParams: originalParams,
      },
    }));
  }

  /**
   * Normalize vehicle type
   */
  normalizeVehicleType(vehicleName) {
    if (!vehicleName) return "sedan";

    const name = vehicleName.toLowerCase();
    if (name.includes("suv") || name.includes("4x4")) return "suv";
    if (name.includes("van") || name.includes("minibus")) return "minivan";
    if (name.includes("luxury") || name.includes("premium")) return "luxury";
    if (name.includes("wheelchair") || name.includes("accessible"))
      return "wheelchair";

    return "sedan";
  }

  /**
   * Extract service features
   */
  extractFeatures(service) {
    const features = [];

    if (service.content?.vehicle?.driverIncluded) {
      features.push("professional_driver");
    }

    if (service.content?.pickupInstructions?.includes("meet")) {
      features.push("meet_greet");
    }

    if (service.content?.waitingTime > 0) {
      features.push("free_waiting");
    }

    if (service.content?.vehicle?.airConditioning) {
      features.push("air_conditioning");
    }

    return features;
  }

  /**
   * Normalize cancellation policy
   */
  normalizeCancellationPolicy(policies) {
    if (!policies || !policies.length) {
      return {
        type: "moderate",
        freeUntil: "24h",
        feePercentage: 100,
      };
    }

    const policy = policies[0];
    return {
      type: "custom",
      freeUntil: policy.daysBeforeArrival
        ? `${policy.daysBeforeArrival * 24}h`
        : "24h",
      feePercentage: policy.penaltyPercentage || 100,
      description: policy.description,
    };
  }

  /**
   * Book a transfer
   */
  async book(bookingInput) {
    try {
      this.logger.info("Booking transfer", {
        bookingReference: bookingInput.reference,
      });

      const bookingPayload = this.buildBookingPayload(bookingInput);

      const response = await this.transfersClient.post(
        "/bookings",
        bookingPayload,
      );

      if (!response.data?.reference) {
        throw new Error("No booking reference returned from supplier");
      }

      const booking = this.normalizeBookingResponse(
        response.data,
        bookingInput,
      );

      this.logger.info("Transfer booking successful", {
        supplierReference: booking.supplierReference,
        status: booking.status,
      });

      return booking;
    } catch (error) {
      this.logger.error("Error booking transfer", {
        error: error.message,
        bookingInput,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw this.normalizeError(error);
    }
  }

  /**
   * Build booking payload
   */
  buildBookingPayload(bookingInput) {
    const { offer, guestDetails, flightDetails, specialRequests } =
      bookingInput;

    const payload = {
      language: "ENG",
      clientReference: bookingInput.reference,
      welcomeMessage: "",
      remark: specialRequests || "",

      // Transfer service
      transfers: [
        {
          service: offer.supplierReference,
          from: offer.meta.searchParams.pickupLocation,
          to: offer.meta.searchParams.dropoffLocation,
          pickupInformation: {
            date: offer.meta.searchParams.pickupDate,
            time: offer.meta.searchParams.pickupTime || "10:00",
            instructions: "",
          },
        },
      ],

      // Primary passenger
      holder: {
        name: guestDetails.firstName,
        surname: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
      },
    };

    // Add flight information if provided
    if (flightDetails?.flightNumber) {
      payload.transfers[0].pickupInformation.flight = {
        number: flightDetails.flightNumber,
        company: flightDetails.airline || "",
        arrivalTime: flightDetails.arrivalTime || "",
      };
    }

    return payload;
  }

  /**
   * Normalize booking response
   */
  normalizeBookingResponse(response, originalInput) {
    return {
      supplierReference: response.reference,
      status: this.mapBookingStatus(response.status),
      confirmationNumber: response.reference,
      serviceDetails:
        response.transfers?.map((transfer) => ({
          transferId: transfer.id,
          vehicleDetails: transfer.vehicle,
          driverDetails: transfer.driver,
          pickupDetails: transfer.pickup,
          trackingInfo: transfer.tracking,
        })) || [],
      voucher: {
        url: response.voucher?.url,
        instructions: response.voucher?.instructions,
      },
      meta: {
        originalResponse: response,
        bookingInput: originalInput,
      },
    };
  }

  /**
   * Map booking status from Hotelbeds to our format
   */
  mapBookingStatus(status) {
    const statusMap = {
      CONFIRMED: "confirmed",
      PENDING: "pending",
      CANCELLED: "cancelled",
      FAILED: "failed",
    };
    return statusMap[status] || "pending";
  }

  /**
   * Get booking details
   */
  async getBooking(reference) {
    try {
      this.logger.info("Getting booking details", { reference });

      const response = await this.transfersClient.get(`/bookings/${reference}`);

      const booking = this.normalizeBookingResponse(response.data, {});

      this.logger.info("Booking details retrieved", {
        reference,
        status: booking.status,
      });

      return booking;
    } catch (error) {
      this.logger.error("Error getting booking details", {
        error: error.message,
        reference,
        status: error.response?.status,
      });

      throw this.normalizeError(error);
    }
  }

  /**
   * Cancel a booking
   */
  async cancel(reference, reason = "") {
    try {
      this.logger.info("Cancelling booking", { reference, reason });

      const cancelPayload = {
        reason: reason || "Customer requested cancellation",
      };

      const response = await this.transfersClient.post(
        `/bookings/${reference}/cancel`,
        cancelPayload,
      );

      const result = {
        success: response.data?.status === "CANCELLED",
        status: this.mapBookingStatus(response.data?.status),
        refundAmount: response.data?.refund?.amount || 0,
        refundCurrency: response.data?.refund?.currency || "INR",
        cancellationFee: response.data?.cancellationFee?.amount || 0,
        meta: {
          originalResponse: response.data,
        },
      };

      this.logger.info("Booking cancellation processed", {
        reference,
        success: result.success,
        refundAmount: result.refundAmount,
      });

      return result;
    } catch (error) {
      this.logger.error("Error cancelling booking", {
        error: error.message,
        reference,
        status: error.response?.status,
      });

      throw this.normalizeError(error);
    }
  }

  /**
   * Get destinations/locations for autocomplete
   */
  async getDestinations(query = "", type = "", limit = 10) {
    try {
      this.logger.info("Getting destinations", { query, type, limit });

      const params = {
        language: "ENG",
        fields: "code,name,country,type,coordinates",
        ...(query && { name: query }),
        ...(type && { type: type.toUpperCase() }),
        limit,
      };

      const response = await this.contentClient.get("/locations", { params });

      const destinations =
        response.data?.map((location) => ({
          id: location.code,
          code: location.code,
          name: location.name,
          country: location.country?.name || "",
          type: location.type?.toLowerCase() || "city",
          coordinates: location.coordinates,
          popular: location.popular || false,
        })) || [];

      this.logger.info(`Found ${destinations.length} destinations`);

      return destinations;
    } catch (error) {
      this.logger.error("Error getting destinations", {
        error: error.message,
        query,
        status: error.response?.status,
      });

      // Return fallback data on error
      return this.getFallbackDestinations(query, type);
    }
  }

  /**
   * Get fallback destinations when API fails
   */
  getFallbackDestinations(query = "", type = "") {
    const fallbackDestinations = [
      {
        id: "BOM",
        code: "BOM",
        name: "Mumbai Airport",
        country: "India",
        type: "airport",
        popular: true,
      },
      {
        id: "DEL",
        code: "DEL",
        name: "Delhi Airport",
        country: "India",
        type: "airport",
        popular: true,
      },
      {
        id: "BLR",
        code: "BLR",
        name: "Bangalore Airport",
        country: "India",
        type: "airport",
        popular: true,
      },
      {
        id: "MAA",
        code: "MAA",
        name: "Chennai Airport",
        country: "India",
        type: "airport",
        popular: true,
      },
      {
        id: "mumbai-taj",
        code: "mumbai-taj",
        name: "Hotel Taj Mahal Palace",
        country: "India",
        type: "hotel",
        popular: true,
      },
      {
        id: "mumbai-oberoi",
        code: "mumbai-oberoi",
        name: "The Oberoi Mumbai",
        country: "India",
        type: "hotel",
        popular: true,
      },
      {
        id: "mumbai-city",
        code: "mumbai-city",
        name: "Mumbai City Center",
        country: "India",
        type: "city",
        popular: true,
      },
      {
        id: "delhi-city",
        code: "delhi-city",
        name: "Delhi City Center",
        country: "India",
        type: "city",
        popular: true,
      },
    ];

    let filtered = fallbackDestinations;

    if (type) {
      filtered = filtered.filter((dest) => dest.type === type.toLowerCase());
    }

    if (query) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(queryLower) ||
          dest.code.toLowerCase().includes(queryLower),
      );
    }

    return filtered;
  }

  /**
   * Normalize API errors to standard format
   */
  normalizeError(error) {
    const errorMap = {
      400: "INVALID_REQUEST",
      401: "AUTHENTICATION_FAILED",
      403: "ACCESS_DENIED",
      404: "NOT_FOUND",
      429: "RATE_LIMIT_EXCEEDED",
      500: "SUPPLIER_ERROR",
      502: "SUPPLIER_UNAVAILABLE",
      503: "SERVICE_UNAVAILABLE",
      504: "TIMEOUT",
    };

    const status = error.response?.status;
    const code = errorMap[status] || "UNKNOWN_ERROR";

    let message = error.message;

    if (error.response?.data?.error) {
      message =
        error.response.data.error.description ||
        error.response.data.error.message ||
        message;
    }

    return {
      code,
      message,
      status,
      originalError: error.response?.data || error.message,
    };
  }

  /**
   * Health check for the adapter
   */
  async healthCheck() {
    try {
      // Simple destinations call to check API health
      await this.getDestinations("", "", 1);
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = HotelbedsTransfersAdapter;
