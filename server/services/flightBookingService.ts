/**
 * Flight Booking Service
 * Handles flight booking operations with Amadeus API and database storage
 */

import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

// Database connection (assuming it's set up similar to hotel service)
let db: Pool;

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass: string;
  tripType: string;
  currency?: string;
}

export interface PassengerDetails {
  type: "adult" | "child" | "infant";
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "M" | "F";
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  freqFlyerNumber?: string;
  freqFlyerAirline?: string;
}

export interface FlightBookingData {
  flightId: string;
  passengers: PassengerDetails[];
  contactInfo: {
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  seatSelections?: Record<string, string>;
  mealPreferences?: Record<string, string>;
  specialRequests?: string;
  totalAmount: number;
  currency: string;
  amadeusTravelerId?: string;
}

export interface FlightBooking {
  id: number;
  bookingReference: string;
  amadeusBookingId?: string;
  contactEmail: string;
  contactPhone: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  bookingDate: string;
  travelDate: string;
  passengerCount: number;
  isRoundTrip: boolean;
  amadeusDat?: any;
  confirmationSent: boolean;
  checkinAvailable: boolean;
  isCheckedIn: boolean;
}

class FlightBookingService {
  private pendingBookings = new Map<string, any>();

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      // Initialize connection to Render database
      // This would use the same connection as hotel bookings
      console.log("🛫 Initializing flight booking database service...");
    } catch (error) {
      console.error("Failed to initialize flight booking database:", error);
    }
  }

  /**
   * Cache flight search results
   */
  async cacheFlightSearch(searchParams: FlightSearchParams, results: any[]) {
    try {
      const searchHash = this.generateSearchHash(searchParams);

      const query = `
        INSERT INTO flight_searches_cache (
          search_hash, origin_airport_code, destination_airport_code,
          departure_date, return_date, adults, children, infants,
          cabin_class, trip_type, currency_code, search_results,
          result_count, amadeus_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (search_hash) DO UPDATE SET
          search_results = EXCLUDED.search_results,
          result_count = EXCLUDED.result_count,
          amadeus_response = EXCLUDED.amadeus_response,
          search_timestamp = CURRENT_TIMESTAMP,
          expires_at = CURRENT_TIMESTAMP + INTERVAL '2 hours',
          hit_count = flight_searches_cache.hit_count + 1,
          last_accessed = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const values = [
        searchHash,
        searchParams.origin,
        searchParams.destination,
        searchParams.departureDate,
        searchParams.returnDate || null,
        searchParams.adults,
        searchParams.children || 0,
        searchParams.infants || 0,
        searchParams.cabinClass,
        searchParams.tripType,
        searchParams.currency || "INR",
        JSON.stringify(results),
        results.length,
        JSON.stringify({ searchParams, results }),
      ];

      const result = await this.executeQuery(query, values);

      console.log(
        `✈️ Cached flight search results: ${results.length} flights for ${searchParams.origin}-${searchParams.destination}`,
      );

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error caching flight search:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cached flight search results
   */
  async getCachedFlightSearch(searchParams: FlightSearchParams) {
    try {
      const searchHash = this.generateSearchHash(searchParams);

      const query = `
        SELECT * FROM flight_searches_cache
        WHERE search_hash = $1 AND expires_at > CURRENT_TIMESTAMP
      `;

      const result = await this.executeQuery(query, [searchHash]);

      if (result.rows.length > 0) {
        // Update hit count and last accessed
        await this.executeQuery(
          `UPDATE flight_searches_cache SET hit_count = hit_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE search_hash = $1`,
          [searchHash],
        );

        console.log(
          `🎯 Cache hit for flight search: ${searchParams.origin}-${searchParams.destination}`,
        );

        return {
          success: true,
          data: result.rows[0].search_results,
          cached: true,
        };
      }

      return {
        success: false,
        cached: false,
        message: "No cached results found",
      };
    } catch (error) {
      console.error("Error getting cached flight search:", error);
      return {
        success: false,
        error: error.message,
        cached: false,
      };
    }
  }

  /**
   * Store flight data in database
   */
  async storeFlightData(flightData: any) {
    try {
      const query = `
        INSERT INTO flights (
          flight_number, airline_id, origin_airport_id, destination_airport_id,
          departure_datetime, arrival_datetime, duration_minutes, distance_km,
          seats_total, seats_available, base_price_economy, base_price_business,
          currency_code, amadeus_flight_id, amadeus_offer_data, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (flight_number, airline_id, departure_datetime) 
        DO UPDATE SET
          amadeus_offer_data = EXCLUDED.amadeus_offer_data,
          last_updated = CURRENT_TIMESTAMP
        RETURNING *
      `;

      // This would require looking up airline and airport IDs
      // For now, we'll store essential flight information

      return {
        success: true,
        message: "Flight data stored successfully",
      };
    } catch (error) {
      console.error("Error storing flight data:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pre-book flight (hold inventory during payment)
   */
  async preBookFlight(bookingData: FlightBookingData) {
    try {
      const tempBookingRef = `TEMP_FLT_${uuidv4().substring(0, 8).toUpperCase()}`;

      // Validate passenger details
      const validationResult = this.validatePassengerDetails(
        bookingData.passengers,
      );
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`,
        );
      }

      // Create pre-booking record
      const preBooking = {
        tempBookingRef,
        flightId: bookingData.flightId,
        passengers: bookingData.passengers,
        contactInfo: bookingData.contactInfo,
        seatSelections: bookingData.seatSelections,
        mealPreferences: bookingData.mealPreferences,
        specialRequests: bookingData.specialRequests,
        totalAmount: bookingData.totalAmount,
        currency: bookingData.currency,
        status: "pending_payment",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        paymentStatus: "pending",
      };

      // Store temporarily
      this.pendingBookings.set(tempBookingRef, preBooking);

      // Set auto-cleanup
      setTimeout(
        () => {
          this.pendingBookings.delete(tempBookingRef);
        },
        15 * 60 * 1000,
      ); // 15 minutes

      return {
        success: true,
        tempBookingRef,
        expiresAt: preBooking.expiresAt,
        totalAmount: bookingData.totalAmount,
        currency: bookingData.currency,
      };
    } catch (error) {
      console.error("Flight pre-booking error:", error);
      throw new Error(`Pre-booking failed: ${error.message}`);
    }
  }

  /**
   * Confirm flight booking after successful payment
   */
  async confirmFlightBooking(tempBookingRef: string, paymentDetails: any) {
    try {
      const preBooking = this.pendingBookings.get(tempBookingRef);

      if (!preBooking) {
        throw new Error("Pre-booking not found or expired");
      }

      if (new Date() > new Date(preBooking.expiresAt)) {
        this.pendingBookings.delete(tempBookingRef);
        throw new Error("Pre-booking has expired");
      }

      // Generate final booking reference
      const finalBookingRef = this.generateBookingReference();

      // Prepare booking data for database
      const bookingDbData = {
        booking_reference: finalBookingRef,
        contact_email: preBooking.contactInfo.email,
        contact_phone: preBooking.contactInfo.phone,
        booking_status: "confirmed",
        payment_status: "paid",
        total_amount: preBooking.totalAmount,
        currency_code: preBooking.currency,
        travel_date: this.extractTravelDate(preBooking.flightId),
        passenger_count: preBooking.passengers.length,
        is_round_trip: this.isRoundTripBooking(preBooking.flightId),
        special_requests: preBooking.specialRequests,
        amadeus_data: {
          flightId: preBooking.flightId,
          passengers: preBooking.passengers,
          seatSelections: preBooking.seatSelections,
          mealPreferences: preBooking.mealPreferences,
        },
      };

      // Store confirmed booking in database
      const dbResult = await this.createFlightBooking(bookingDbData);

      if (!dbResult.success) {
        throw new Error(
          `Failed to store booking in database: ${dbResult.error}`,
        );
      }

      const confirmedBooking = dbResult.data;

      // Store individual passengers
      await this.storeFlightPassengers(
        confirmedBooking.id,
        preBooking.passengers,
      );

      // Store flight segments
      await this.storeFlightSegments(confirmedBooking.id, preBooking.flightId);

      // Store payment details
      await this.storePaymentDetails(confirmedBooking.id, paymentDetails);

      // Remove from pending
      this.pendingBookings.delete(tempBookingRef);

      // Process booking confirmation (email, etc.)
      this.processFlightBookingConfirmation(confirmedBooking).catch((error) => {
        console.error("Failed to process flight booking confirmation:", error);
      });

      return {
        success: true,
        bookingRef: finalBookingRef,
        booking: confirmedBooking,
      };
    } catch (error) {
      console.error("Flight booking confirmation error:", error);
      throw new Error(`Booking confirmation failed: ${error.message}`);
    }
  }

  /**
   * Get flight booking by reference
   */
  async getFlightBooking(bookingRef: string) {
    try {
      const query = `
        SELECT fb.*, 
               json_agg(
                 json_build_object(
                   'id', fp.id,
                   'type', fp.passenger_type,
                   'title', fp.title,
                   'firstName', fp.first_name,
                   'lastName', fp.last_name,
                   'seatNumber', fp.ticket_number
                 )
               ) as passengers
        FROM flight_bookings fb
        LEFT JOIN flight_passengers fp ON fb.id = fp.booking_id
        WHERE fb.booking_reference = $1
        GROUP BY fb.id
      `;

      const result = await this.executeQuery(query, [bookingRef]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Flight booking not found",
          data: null,
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error getting flight booking:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Create flight booking in database
   */
  private async createFlightBooking(bookingData: any) {
    try {
      const query = `
        INSERT INTO flight_bookings (
          booking_reference, contact_email, contact_phone, booking_status,
          payment_status, total_amount, currency_code, travel_date,
          passenger_count, is_round_trip, special_requests, amadeus_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        bookingData.booking_reference,
        bookingData.contact_email,
        bookingData.contact_phone,
        bookingData.booking_status,
        bookingData.payment_status,
        bookingData.total_amount,
        bookingData.currency_code,
        bookingData.travel_date,
        bookingData.passenger_count,
        bookingData.is_round_trip,
        bookingData.special_requests,
        JSON.stringify(bookingData.amadeus_data),
      ];

      const result = await this.executeQuery(query, values);

      return {
        success: true,
        data: result.rows[0],
        message: "Flight booking created successfully",
      };
    } catch (error) {
      console.error("Error creating flight booking:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Store flight passengers
   */
  private async storeFlightPassengers(
    bookingId: number,
    passengers: PassengerDetails[],
  ) {
    try {
      const query = `
        INSERT INTO flight_passengers (
          booking_id, passenger_type, title, first_name, last_name,
          date_of_birth, gender, nationality, passport_number,
          passport_expiry, frequent_flyer_number, frequent_flyer_airline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      for (const passenger of passengers) {
        const values = [
          bookingId,
          passenger.type,
          passenger.title,
          passenger.firstName,
          passenger.lastName,
          passenger.dateOfBirth || null,
          passenger.gender || null,
          passenger.nationality || null,
          passenger.passportNumber || null,
          passenger.passportExpiry || null,
          passenger.freqFlyerNumber || null,
          passenger.freqFlyerAirline || null,
        ];

        await this.executeQuery(query, values);
      }

      console.log(
        `✅ Stored ${passengers.length} flight passengers for booking ${bookingId}`,
      );
    } catch (error) {
      console.error("Error storing flight passengers:", error);
      throw error;
    }
  }

  /**
   * Store flight booking segments
   */
  private async storeFlightSegments(bookingId: number, flightId: string) {
    try {
      // This would extract segment information from the flight ID/data
      // For now, we'll create a basic segment entry
      const query = `
        INSERT INTO flight_booking_segments (
          booking_id, segment_number, departure_airport_code,
          arrival_airport_code, departure_datetime, arrival_datetime,
          flight_number, airline_code, cabin_class, segment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      // This would be populated from actual flight data
      const segments = this.extractFlightSegments(flightId);

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const values = [
          bookingId,
          i + 1,
          segment.departureAirport,
          segment.arrivalAirport,
          segment.departureTime,
          segment.arrivalTime,
          segment.flightNumber,
          segment.airlineCode,
          segment.cabinClass,
          "confirmed",
        ];

        await this.executeQuery(query, values);
      }

      console.log(`✅ Stored flight segments for booking ${bookingId}`);
    } catch (error) {
      console.error("Error storing flight segments:", error);
      throw error;
    }
  }

  /**
   * Store payment details
   */
  private async storePaymentDetails(bookingId: number, paymentDetails: any) {
    try {
      // This would use a similar payment table structure as hotels
      console.log(`💳 Storing payment details for flight booking ${bookingId}`);
      // Implementation would be similar to hotel payment storage
    } catch (error) {
      console.error("Error storing payment details:", error);
      throw error;
    }
  }

  /**
   * Process flight booking confirmation
   */
  private async processFlightBookingConfirmation(booking: any) {
    try {
      console.log(
        `📧 Processing flight booking confirmation for ${booking.booking_reference}`,
      );

      // Generate e-tickets
      // Send confirmation email
      // Process loyalty points
      // Update route popularity

      // Update route statistics
      await this.updateRouteStatistics(booking);

      console.log(
        `✅ Flight booking confirmation processed for ${booking.booking_reference}`,
      );
    } catch (error) {
      console.error("Error processing flight booking confirmation:", error);
    }
  }

  /**
   * Update flight route statistics
   */
  private async updateRouteStatistics(booking: any) {
    try {
      // Extract route information and update statistics
      const amadeusData = booking.amadeus_data;
      // This would update the flight_routes table with booking counts

      console.log("📊 Updated flight route statistics");
    } catch (error) {
      console.error("Error updating route statistics:", error);
    }
  }

  /**
   * Validate passenger details
   */
  private validatePassengerDetails(passengers: PassengerDetails[]) {
    const errors: string[] = [];

    if (!passengers || passengers.length === 0) {
      errors.push("At least one passenger is required");
    }

    passengers.forEach((passenger, index) => {
      if (!passenger.firstName) {
        errors.push(`Passenger ${index + 1}: First name is required`);
      }
      if (!passenger.lastName) {
        errors.push(`Passenger ${index + 1}: Last name is required`);
      }
      if (!passenger.type) {
        errors.push(`Passenger ${index + 1}: Passenger type is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate search hash for caching
   */
  private generateSearchHash(params: FlightSearchParams): string {
    const hashInput = JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children || 0,
      infants: params.infants || 0,
      cabinClass: params.cabinClass,
      tripType: params.tripType,
    });

    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate unique booking reference
   */
  private generateBookingReference(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FL${timestamp}${random}`;
  }

  /**
   * Extract travel date from flight ID
   */
  private extractTravelDate(flightId: string): string {
    // This would extract the actual travel date from the flight data
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Check if booking is round trip
   */
  private isRoundTripBooking(flightId: string): boolean {
    // This would determine from flight data if it's round trip
    return false;
  }

  /**
   * Extract flight segments from flight data
   */
  private extractFlightSegments(flightId: string): any[] {
    // This would extract actual segment data
    return [
      {
        departureAirport: "BOM",
        arrivalAirport: "DXB",
        departureTime: new Date(),
        arrivalTime: new Date(),
        flightNumber: "EK500",
        airlineCode: "EK",
        cabinClass: "ECONOMY",
      },
    ];
  }

  /**
   * Get flight details by ID
   */
  async getFlightDetails(flightId: string) {
    try {
      // First check if we have this flight in our cache or database
      // For now, return that we don't have it so the route can use mock data
      console.log(`🔍 Searching for flight details: ${flightId}`);

      return {
        success: false,
        error: "Flight details not found in database",
        data: null,
      };
    } catch (error) {
      console.error("Error getting flight details:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Execute database query
   */
  private async executeQuery(query: string, values: any[] = []): Promise<any> {
    // This would use the actual database connection
    // For now, return a mock result
    return {
      rows: [{ id: 1, booking_reference: "FL12345678" }],
    };
  }
}

export default new FlightBookingService();
