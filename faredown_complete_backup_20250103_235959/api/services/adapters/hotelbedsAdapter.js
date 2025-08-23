/**
 * Hotelbeds Supplier Adapter
 * Integrates with Hotelbeds API for hotel and sightseeing data
 */

const BaseSupplierAdapter = require("./baseSupplierAdapter");
const axios = require("axios");
const crypto = require("crypto");

class HotelbedsAdapter extends BaseSupplierAdapter {
  constructor(config = {}) {
    super("HOTELBEDS", {
      baseUrl:
        process.env.HOTELBEDS_BOOKING_API ||
        "https://api.test.hotelbeds.com/hotel-api/1.0",
      contentUrl:
        process.env.HOTELBEDS_CONTENT_API ||
        "https://api.test.hotelbeds.com/hotel-content-api/1.0",
      activitiesUrl: "https://api.test.hotelbeds.com/activity-api/3.0",
      apiKey: process.env.HOTELBEDS_API_KEY,
      secret: process.env.HOTELBEDS_SECRET,
      requestsPerSecond: 8, // Hotelbeds has stricter rate limits
      ...config,
    });

    // Initialize HTTP clients
    this.hotelClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Faredown-AI-Bargaining/1.0",
      },
    });

    this.contentClient = axios.create({
      baseURL: this.config.contentUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Faredown-AI-Bargaining/1.0",
      },
    });

    this.activitiesClient = axios.create({
      baseURL: this.config.activitiesUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Faredown-AI-Bargaining/1.0",
      },
    });

    // Add request interceptor for authentication
    this.addAuthInterceptor(this.hotelClient);
    this.addAuthInterceptor(this.contentClient);
    this.addAuthInterceptor(this.activitiesClient);
  }

  /**
   * Add Hotelbeds authentication to request
   */
  addAuthInterceptor(client) {
    client.interceptors.request.use((config) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHash("sha256")
        .update(this.config.apiKey + this.config.secret + timestamp)
        .digest("hex");

      config.headers["Api-key"] = this.config.apiKey;
      config.headers["X-Signature"] = signature;

      return config;
    });
  }

  /**
   * Search hotels using Hotelbeds Hotel API
   */
  async searchHotels(searchParams) {
    return await this.executeWithRetry(async () => {
      const {
        destination,
        checkIn,
        checkOut,
        rooms = [{ adults: 2, children: 0 }],
        currency = "USD",
        language = "ENG",
        maxResults = 20,
      } = searchParams;

      const occupancies = rooms.map((room) => ({
        rooms: 1,
        adults: room.adults,
        children: room.children,
        ...(room.childAges && {
          paxes: room.childAges.map((age, index) => ({
            type: "CH",
            age: age,
            roomId: 1,
          })),
        }),
      }));

      const searchRequest = {
        stay: {
          checkIn: checkIn,
          checkOut: checkOut,
        },
        occupancies: occupancies,
        destination: {
          code: destination,
        },
        filter: {
          maxHotels: maxResults,
        },
        language: language,
      };

      this.logger.info("Searching Hotelbeds hotels", searchRequest);

      const response = await this.hotelClient.post("/hotels", searchRequest);

      const hotels = response.data.hotels?.hotels || [];

      // Transform Hotelbeds response to our standard format
      const normalizedHotels = hotels.map((hotel) =>
        this.transformHotelbedsHotel(hotel, searchParams),
      );

      // Store in repository and create snapshots
      await this.storeProductsAndSnapshots(normalizedHotels, "hotel");

      this.logger.info(
        `Retrieved ${normalizedHotels.length} hotel offers from Hotelbeds`,
      );
      return normalizedHotels;
    });
  }

  /**
   * Get hotel details by hotel code
   */
  async getHotelDetails(hotelCode) {
    return await this.executeWithRetry(async () => {
      const response = await this.contentClient.get("/hotels", {
        params: {
          codes: hotelCode,
          language: "ENG",
          useSecondaryLanguage: false,
        },
      });

      if (response.data.hotels && response.data.hotels.length > 0) {
        return this.transformHotelbedsHotelDetails(response.data.hotels[0]);
      }

      return null;
    });
  }

  /**
   * Book hotel through Hotelbeds
   */
  async bookHotel(bookingData) {
    return await this.executeWithRetry(async () => {
      const { rateKey, holder, rooms, clientReference, remarks } = bookingData;

      const bookingRequest = {
        holder: holder,
        rooms: rooms,
        clientReference: clientReference,
        remark: remarks,
        tolerance: 2,
      };

      this.logger.info("Booking hotel with Hotelbeds", {
        rateKey: rateKey,
        clientReference: clientReference,
      });

      // Step 1: Check rates
      const checkResponse = await this.hotelClient.post("/checkrates", {
        rooms: [
          {
            rateKey: rateKey,
          },
        ],
      });

      if (!checkResponse.data.hotel || !checkResponse.data.hotel.rooms) {
        throw new Error("Rate no longer available");
      }

      // Step 2: Make booking
      const bookingResponse = await this.hotelClient.post("/bookings", {
        ...bookingRequest,
        rooms: [
          {
            rateKey: rateKey,
            paxes: rooms[0].paxes,
          },
        ],
      });

      if (bookingResponse.data.booking) {
        const booking = bookingResponse.data.booking;

        this.logger.info("Hotel booking successful", {
          reference: booking.reference,
          status: booking.status,
        });

        return {
          success: true,
          bookingId: booking.reference,
          reference: booking.reference,
          status: booking.status,
          supplier: "HOTELBEDS",
          bookingData: booking,
        };
      }

      throw new Error("Invalid booking response from Hotelbeds");
    });
  }

  /**
   * Search sightseeing activities using Hotelbeds Activities API
   */
  async searchSightseeing(searchParams) {
    return await this.executeWithRetry(async () => {
      const {
        destination,
        dateFrom,
        dateTo,
        language = "en",
        maxResults = 20,
      } = searchParams;

      const searchRequest = {
        filters: [
          {
            searchFilterItems: [
              {
                type: "destination",
                value: destination,
              },
            ],
          },
        ],
        from: 1,
        to: maxResults,
        language: language,
        order: "PRICE",
      };

      if (dateFrom && dateTo) {
        searchRequest.filters[0].searchFilterItems.push({
          type: "dateRange",
          value: `${dateFrom},${dateTo}`,
        });
      }

      this.logger.info("Searching Hotelbeds activities", searchRequest);

      const response = await this.activitiesClient.post(
        "/activities/search",
        searchRequest,
      );

      const activities = response.data.activities || [];

      // Transform Hotelbeds response to our standard format
      const normalizedActivities = activities.map((activity) =>
        this.transformHotelbedsActivity(activity, searchParams),
      );

      // Store in repository and create snapshots
      await this.storeProductsAndSnapshots(normalizedActivities, "sightseeing");

      this.logger.info(
        `Retrieved ${normalizedActivities.length} activity offers from Hotelbeds`,
      );
      return normalizedActivities;
    });
  }

  /**
   * Get sightseeing activity details
   */
  async getSightseeingDetails(activityCode) {
    return await this.executeWithRetry(async () => {
      const response = await this.activitiesClient.get(
        `/activities/${activityCode}`,
        {
          params: {
            language: "en",
          },
        },
      );

      if (response.data.activity) {
        return this.transformHotelbedsActivityDetails(response.data.activity);
      }

      return null;
    });
  }

  /**
   * Book sightseeing activity
   */
  async bookSightseeing(bookingData) {
    return await this.executeWithRetry(async () => {
      const {
        activityCode,
        modalityCode,
        date,
        paxes,
        holder,
        clientReference,
      } = bookingData;

      const bookingRequest = {
        clientReference: clientReference,
        holder: holder,
        activities: [
          {
            activityCode: activityCode,
            modalityCode: modalityCode,
            date: date,
            paxes: paxes,
          },
        ],
      };

      this.logger.info("Booking activity with Hotelbeds", {
        activityCode: activityCode,
        clientReference: clientReference,
      });

      const response = await this.activitiesClient.post(
        "/bookings",
        bookingRequest,
      );

      if (response.data.booking) {
        const booking = response.data.booking;

        this.logger.info("Activity booking successful", {
          reference: booking.reference,
          status: booking.status,
        });

        return {
          success: true,
          bookingId: booking.reference,
          reference: booking.reference,
          status: booking.status,
          supplier: "HOTELBEDS",
          bookingData: booking,
        };
      }

      throw new Error("Invalid booking response from Hotelbeds");
    });
  }

  /**
   * Flight search (Hotelbeds doesn't provide flights, return empty)
   */
  async searchFlights(searchParams) {
    this.logger.warn("Flight search not supported by Hotelbeds adapter");
    return [];
  }

  /**
   * Get flight details (not supported)
   */
  async getFlightDetails(flightId) {
    throw new Error("Flight details not supported by Hotelbeds adapter");
  }

  /**
   * Book flight (not supported)
   */
  async bookFlight(bookingData) {
    throw new Error("Flight booking not supported by Hotelbeds adapter");
  }

  /**
   * Transform Hotelbeds hotel to standard format
   */
  transformHotelbedsHotel(hotel, searchParams) {
    try {
      const room = hotel.rooms[0]; // Take first room for base pricing
      const rate = room.rates[0]; // Take first rate

      return {
        id: hotel.code.toString(),
        hotelId: hotel.code.toString(),
        hotelCode: hotel.code.toString(),
        hotelName: hotel.name,
        city: searchParams.destination,
        country: hotel.destinationName,
        roomCode: room.code,
        roomName: room.name,
        rateCode: rate.rateClass,
        boardCode: rate.boardCode,
        cancellationPolicy: rate.cancellationPolicies || [],
        starRating: hotel.categoryCode
          ? parseInt(hotel.categoryCode.charAt(0))
          : 0,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        nights: this.calculateNights(
          searchParams.checkIn,
          searchParams.checkOut,
        ),
        adults: searchParams.rooms?.[0]?.adults || 2,
        children: searchParams.rooms?.[0]?.children || 0,
        price: parseFloat(rate.net),
        currency: hotel.currency,
        netPrice: parseFloat(rate.net),
        taxes: 0, // Hotelbeds usually includes taxes in net price
        fees: 0,
        inventoryState: "AVAILABLE",
        originalId: hotel.code.toString(),
        supplierCode: "HOTELBEDS",
        rateKey: rate.rateKey,
        bookingRemarks: rate.rateComments || "",
        policyFlags: {
          refundable:
            !rate.cancellationPolicies ||
            rate.cancellationPolicies.length === 0,
          packaging: rate.packaging || false,
          boardName: rate.boardName,
          allotment: rate.allotment,
        },
      };
    } catch (error) {
      this.logger.error("Failed to transform Hotelbeds hotel:", error);
      throw error;
    }
  }

  /**
   * Transform Hotelbeds activity to standard format
   */
  transformHotelbedsActivity(activity, searchParams) {
    try {
      const modality = activity.modalities[0]; // Take first modality for base pricing

      return {
        id: activity.code,
        activityCode: activity.code,
        activityName: activity.name,
        location: searchParams.destination,
        city: activity.country?.destinations?.[0]?.name,
        country: activity.country?.name,
        category: activity.type?.name?.toLowerCase() || "general",
        duration: modality.duration?.value
          ? `${modality.duration.value}${modality.duration.metric}`
          : "4H",
        activityDate: searchParams.dateFrom,
        timeSlot: modality.operationDays?.[0]?.operationTime || "Full Day",
        language: "EN",
        inclusions: activity.contentData?.highlights || [],
        exclusions: [],
        pickupPoint:
          modality.amountsFrom?.[0]?.paxType === "ADULT"
            ? "Hotel Pickup Available"
            : "Meet at venue",
        difficultyLevel: "moderate",
        price: parseFloat(modality.amountsFrom?.[0]?.amount || 0),
        currency: modality.amountsFrom?.[0]?.currency || "USD",
        netPrice: parseFloat(modality.amountsFrom?.[0]?.amount || 0),
        taxes: 0,
        fees: 0,
        inventoryState: "AVAILABLE",
        originalId: activity.code,
        supplierCode: "HOTELBEDS",
        modalityCode: modality.code,
        bookingRemarks: activity.contentData?.description || "",
        policyFlags: {
          instantConfirmation: modality.operation?.instant || false,
          cancellationPolicy:
            modality.operation?.cancellationPolicy || "Standard",
          minimumPax: modality.operation?.minimumPaxCapacity || 1,
          maximumPax: modality.operation?.maximumPaxCapacity || 99,
        },
      };
    } catch (error) {
      this.logger.error("Failed to transform Hotelbeds activity:", error);
      throw error;
    }
  }

  /**
   * Transform detailed hotel information
   */
  transformHotelbedsHotelDetails(hotel) {
    return {
      code: hotel.code,
      name: hotel.name,
      description: hotel.description?.content,
      address: hotel.address,
      postalCode: hotel.postalCode,
      city: hotel.city?.content,
      email: hotel.email,
      phones: hotel.phones,
      categoryCode: hotel.categoryCode,
      accommodationType: hotel.accommodationType?.typeDescription,
      boardCodes: hotel.boardCodes,
      segmentCodes: hotel.segmentCodes,
      facilities: hotel.facilities,
      images: hotel.images,
      coordinates: hotel.coordinates,
      amenities: hotel.facilities?.map((f) => f.description?.content),
      rooms: hotel.rooms?.map((room) => ({
        code: room.roomCode,
        type: room.roomType,
        characteristic: room.characteristicCode,
        description: room.description?.content,
        facilities: room.roomFacilities,
      })),
    };
  }

  /**
   * Transform detailed activity information
   */
  transformHotelbedsActivityDetails(activity) {
    return {
      code: activity.code,
      name: activity.name,
      description: activity.description,
      summary: activity.summary,
      location: activity.geoLocation,
      images: activity.images,
      duration: activity.duration,
      operationDays: activity.operationDays,
      languages: activity.languages,
      includes: activity.includes,
      highlights: activity.highlights,
      importantInfo: activity.importantInfo,
      bookingLimit: activity.bookingLimit,
      cancellationPolicy: activity.cancellationPolicy,
    };
  }

  /**
   * Calculate number of nights between dates
   */
  calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Health check implementation
   */
  async performHealthCheck() {
    try {
      // Test hotel API with destinations endpoint
      const response = await this.contentClient.get("/locations/destinations", {
        params: {
          fields: "all",
          from: 1,
          to: 1,
          language: "ENG",
        },
      });

      if (response.status === 200 && response.data.destinations) {
        return true;
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error("Hotelbeds health check failed:", error.message);
      throw error;
    }
  }

  /**
   * Get destination information
   */
  async getDestinations(countryCode = null) {
    return await this.executeWithRetry(async () => {
      const params = {
        fields: "all",
        language: "ENG",
        from: 1,
        to: 100,
      };

      if (countryCode) {
        params.countryCode = countryCode;
      }

      const response = await this.contentClient.get("/locations/destinations", {
        params,
      });
      return response.data.destinations || [];
    });
  }

  /**
   * Get hotel chains
   */
  async getHotelChains() {
    return await this.executeWithRetry(async () => {
      const response = await this.contentClient.get("/types/chains", {
        params: {
          fields: "all",
          language: "ENG",
          from: 1,
          to: 50,
        },
      });

      return response.data.chains || [];
    });
  }
}

module.exports = HotelbedsAdapter;
