/**
 * Amadeus Supplier Adapter
 * Integrates with Amadeus API for flight data
 */

const BaseSupplierAdapter = require("./baseSupplierAdapter");
const axios = require("axios");

class AmadeusAdapter extends BaseSupplierAdapter {
  constructor(config = {}) {
    super("AMADEUS", {
      baseUrl: process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com",
      apiKey: process.env.AMADEUS_API_KEY,
      apiSecret: process.env.AMADEUS_API_SECRET,
      requestsPerSecond: 10,
      ...config,
    });

    this.accessToken = null;
    this.tokenExpiry = null;

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Faredown-AI-Bargaining/1.0",
      },
    });
  }

  /**
   * Get or refresh access token
   */
  async getAccessToken() {
    try {
      // Check if token is still valid
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      this.logger.info("Refreshing Amadeus access token");

      const response = await this.httpClient.post(
        "/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.apiKey,
          client_secret: this.config.apiSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Set expiry 5 minutes before actual expiry for safety
        this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

        // Update HTTP client default headers
        this.httpClient.defaults.headers.common["Authorization"] =
          `Bearer ${this.accessToken}`;

        this.logger.info("Amadeus access token refreshed successfully");
        return this.accessToken;
      } else {
        throw new Error("No access token received from Amadeus");
      }
    } catch (error) {
      this.logger.error(
        "Failed to get Amadeus access token:",
        error.response?.data || error.message,
      );
      throw new Error("Authentication failed with Amadeus API");
    }
  }

  /**
   * Search flights using Amadeus Flight Offers Search API
   */
  async searchFlights(searchParams) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const {
        origin,
        destination,
        departureDate,
        returnDate,
        adults = 1,
        children = 0,
        infants = 0,
        travelClass = "ECONOMY",
        maxResults = 20,
      } = searchParams;

      const params = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults,
        max: maxResults,
        travelClass: travelClass,
      };

      if (returnDate) {
        params.returnDate = returnDate;
      }

      if (children > 0) {
        params.children = children;
      }

      if (infants > 0) {
        params.infants = infants;
      }

      this.logger.info("Searching Amadeus flights", params);

      const response = await this.httpClient.get("/v2/shopping/flight-offers", {
        params: params,
      });

      const flightOffers = response.data.data || [];

      // Transform Amadeus response to our standard format
      const normalizedFlights = flightOffers.map((offer) =>
        this.transformAmadeusFlightOffer(offer),
      );

      // Store in repository and create snapshots
      await this.storeProductsAndSnapshots(normalizedFlights, "flight");

      this.logger.info(
        `Retrieved ${normalizedFlights.length} flight offers from Amadeus`,
      );
      return normalizedFlights;
    });
  }

  /**
   * Get flight details by offer ID
   */
  async getFlightDetails(offerId) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const response = await this.httpClient.get(
        `/v1/shopping/flight-offers/${offerId}`,
      );

      if (response.data.data) {
        return this.transformAmadeusFlightOffer(response.data.data);
      }

      return null;
    });
  }

  /**
   * Book flight through Amadeus
   */
  async bookFlight(bookingData) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const { flightOffer, travelers, contacts, remarks = {} } = bookingData;

      const bookingRequest = {
        data: {
          type: "flight-order",
          flightOffers: [flightOffer],
          travelers: travelers,
          contacts: contacts,
          remarks: remarks,
        },
      };

      this.logger.info("Booking flight with Amadeus", {
        offerId: flightOffer.id,
      });

      const response = await this.httpClient.post(
        "/v1/booking/flight-orders",
        bookingRequest,
      );

      if (response.data.data) {
        this.logger.info("Flight booking successful", {
          orderId: response.data.data.id,
          reference: response.data.data.associatedRecords?.[0]?.reference,
        });

        return {
          success: true,
          bookingId: response.data.data.id,
          reference: response.data.data.associatedRecords?.[0]?.reference,
          status: "confirmed",
          supplier: "AMADEUS",
          bookingData: response.data.data,
        };
      }

      throw new Error("Invalid booking response from Amadeus");
    });
  }

  /**
   * Transform Amadeus flight offer to standard format
   */
  transformAmadeusFlightOffer(offer) {
    try {
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary.segments[0];
      const lastSegment =
        firstItinerary.segments[firstItinerary.segments.length - 1];

      return {
        id: offer.id,
        airline: firstSegment.carrierCode,
        flightNumber: firstSegment.number,
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureDate: firstSegment.departure.at.split("T")[0],
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        durationMinutes: this.parseDuration(firstItinerary.duration),
        stops: firstItinerary.segments.length - 1,
        class: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
        bookingClass: offer.travelerPricings[0].fareDetailsBySegment[0].class,
        fareBasis: offer.travelerPricings[0].fareDetailsBySegment[0].fareBasis,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        netPrice: parseFloat(offer.price.base),
        taxes: parseFloat(offer.price.total) - parseFloat(offer.price.base),
        fees: 0,
        inventoryState: "AVAILABLE",
        aircraftType: firstSegment.aircraft?.code,
        fareRules: offer.travelerPricings[0].fareDetailsBySegment.map(
          (segment) => ({
            cabin: segment.cabin,
            class: segment.class,
            fareBasis: segment.fareBasis,
            brandedFare: segment.brandedFare,
            includedCheckedBags: segment.includedCheckedBags,
          }),
        ),
        baggageAllowance:
          offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags,
        originalId: offer.id,
        supplierCode: "AMADEUS",
        rateKey: offer.id,
        policyFlags: {
          refundable: offer.price.refundableTaxes ? true : false,
          changeable: true, // Default assumption for Amadeus
          lastTicketingDate: offer.lastTicketingDate,
        },
      };
    } catch (error) {
      this.logger.error("Failed to transform Amadeus flight offer:", error);
      throw error;
    }
  }

  /**
   * Parse ISO 8601 duration to minutes
   */
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    return hours * 60 + minutes;
  }

  /**
   * Hotel search (Amadeus doesn't provide hotels, return empty)
   */
  async searchHotels(searchParams) {
    this.logger.warn("Hotel search not supported by Amadeus adapter");
    return [];
  }

  /**
   * Sightseeing search (Amadeus doesn't provide sightseeing, return empty)
   */
  async searchSightseeing(searchParams) {
    this.logger.warn("Sightseeing search not supported by Amadeus adapter");
    return [];
  }

  /**
   * Get hotel details (not supported)
   */
  async getHotelDetails(hotelId) {
    throw new Error("Hotel details not supported by Amadeus adapter");
  }

  /**
   * Get sightseeing details (not supported)
   */
  async getSightseeingDetails(activityId) {
    throw new Error("Sightseeing details not supported by Amadeus adapter");
  }

  /**
   * Book hotel (not supported)
   */
  async bookHotel(bookingData) {
    throw new Error("Hotel booking not supported by Amadeus adapter");
  }

  /**
   * Book sightseeing (not supported)
   */
  async bookSightseeing(bookingData) {
    throw new Error("Sightseeing booking not supported by Amadeus adapter");
  }

  /**
   * Health check implementation
   */
  async performHealthCheck() {
    try {
      await this.getAccessToken();

      // Test API with a simple request
      const response = await this.httpClient.get(
        "/v1/reference-data/locations",
        {
          params: {
            keyword: "NYC",
            subType: "AIRPORT",
          },
        },
      );

      if (response.status === 200) {
        return true;
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error("Amadeus health check failed:", error.message);
      throw error;
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(airlineCode) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const response = await this.httpClient.get(
        "/v1/reference-data/airlines",
        {
          params: {
            airlineCodes: airlineCode,
          },
        },
      );

      return response.data.data?.[0] || null;
    });
  }

  /**
   * Get airport information
   */
  async getAirportInfo(airportCode) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const response = await this.httpClient.get(
        "/v1/reference-data/locations",
        {
          params: {
            keyword: airportCode,
            subType: "AIRPORT",
          },
        },
      );

      return response.data.data?.[0] || null;
    });
  }

  /**
   * Get flight price analysis
   */
  async getFlightPriceAnalysis(searchParams) {
    return await this.executeWithRetry(async () => {
      await this.getAccessToken();

      const { origin, destination, departureDate } = searchParams;

      const response = await this.httpClient.get(
        "/v1/analytics/itinerary-price-metrics",
        {
          params: {
            originIataCode: origin,
            destinationIataCode: destination,
            departureDate: departureDate,
          },
        },
      );

      return response.data.data || null;
    });
  }
}

module.exports = AmadeusAdapter;
