/**
 * Hotelbeds Booking API Service
 * Handles hotel availability, pricing, and booking operations
 * Part of the production integration for Faredown booking system
 */

const axios = require('axios');
const crypto = require('crypto');
const db = require('../../database/connection');

class HotelbedsBookingService {
  constructor() {
    // Hotelbeds API Configuration
    this.baseURL = process.env.HOTELBEDS_BOOKING_API || 'https://api.test.hotelbeds.com/hotel-api/1.0';
    this.apiKey = process.env.HOTELBEDS_API_KEY;
    this.sharedSecret = process.env.HOTELBEDS_SECRET;
    
    // Cache settings for availability (short-lived)
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes for availability
    this.availabilityCache = new Map();
    
    // Request settings
    this.timeout = 45000; // 45 seconds for booking operations
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
    
    console.log('🏨 Hotelbeds Booking Service initialized');
  }

  /**
   * Generate Hotelbeds API signature
   */
  generateSignature() {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = this.apiKey + this.sharedSecret + timestamp;
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');
    
    return {
      signature,
      timestamp
    };
  }

  /**
   * Get request headers for Hotelbeds API
   */
  getHeaders() {
    const { signature, timestamp } = this.generateSignature();
    
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Api-key': this.apiKey,
      'X-Signature': signature,
      'Accept-Encoding': 'gzip',
      'User-Agent': 'Faredown/1.0'
    };
  }

  /**
   * Make authenticated request to Hotelbeds API
   */
  async makeRequest(endpoint, method = 'GET', data = null, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      console.log(`🔄 Hotelbeds Booking API Request: ${method} ${endpoint}`);
      
      const config = {
        method,
        url,
        headers: this.getHeaders(),
        timeout: this.timeout,
        validateStatus: (status) => status < 500 // Retry on 5xx errors
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }
      
      const response = await axios(config);
      
      if (response.status >= 400) {
        throw new Error(`Hotelbeds Booking API Error: ${response.status} - ${response.statusText}`);
      }
      
      console.log(`✅ Hotelbeds Booking API Success: ${response.status}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Hotelbeds Booking API Error:`, error.message);
      
      // Retry logic for transient errors
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        console.log(`🔄 Retrying request (${retryCount + 1}/${this.retryAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.makeRequest(endpoint, method, data, retryCount + 1);
      }
      
      if (error.response) {
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Data:`, error.response.data);
      }
      
      throw error;
    }
  }

  /**
   * Determine if error should be retried
   */
  shouldRetry(error) {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    if (error.response && error.response.status >= 500) {
      return true;
    }
    return false;
  }

  /**
   * Search hotel availability and pricing
   */
  async searchAvailability(searchParams) {
    try {
      const {
        destination,
        checkIn,
        checkOut,
        rooms = 1,
        adults = 2,
        children = 0,
        childAges = [],
        currency = 'USD'
      } = searchParams;

      console.log('🔍 Searching hotel availability:', searchParams);

      // Generate cache key
      const cacheKey = `availability_${destination}_${checkIn}_${checkOut}_${rooms}_${adults}_${children}_${currency}`;
      
      // Check cache first
      if (this.availabilityCache.has(cacheKey)) {
        const cached = this.availabilityCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Using cached availability data`);
          return cached.data;
        }
      }

      // Prepare occupancies for API
      const occupancies = [];
      for (let i = 0; i < rooms; i++) {
        const occupancy = {
          rooms: 1,
          adults: Math.floor(adults / rooms) + (i < adults % rooms ? 1 : 0),
          children: Math.floor(children / rooms) + (i < children % rooms ? 1 : 0)
        };
        
        // Add child ages if provided
        if (childAges.length > 0) {
          const startIdx = i * Math.floor(childAges.length / rooms);
          const endIdx = Math.min(startIdx + occupancy.children, childAges.length);
          occupancy.paxes = [];
          
          // Add adults
          for (let a = 0; a < occupancy.adults; a++) {
            occupancy.paxes.push({
              type: 'AD',
              age: 30
            });
          }
          
          // Add children with ages
          for (let c = startIdx; c < endIdx; c++) {
            occupancy.paxes.push({
              type: 'CH',
              age: childAges[c]
            });
          }
        }
        
        occupancies.push(occupancy);
      }

      // Prepare request payload
      const requestData = {
        stay: {
          checkIn: checkIn.split('T')[0], // Format: YYYY-MM-DD
          checkOut: checkOut.split('T')[0]
        },
        occupancies: occupancies,
        destination: {
          code: destination
        },
        // Optional parameters
        dailyRate: false,
        packaging: false,
        currency: currency
      };

      const endpoint = '/hotel-api/1.0/hotels';
      const response = await this.makeRequest(endpoint, 'POST', requestData);

      // Transform the response for frontend compatibility
      const transformedResults = this.transformAvailabilityResponse(response, searchParams);

      // Cache the result
      this.availabilityCache.set(cacheKey, {
        data: transformedResults,
        timestamp: Date.now()
      });

      // Log to database for analytics
      await this.logSearchRequest(searchParams, transformedResults.length);

      return transformedResults;

    } catch (error) {
      console.error('❌ Failed to search hotel availability:', error);
      
      // Return empty array with error info for graceful degradation
      return {
        hotels: [],
        error: error.message,
        searchParams: searchParams
      };
    }
  }

  /**
   * Transform Hotelbeds availability response to frontend format
   */
  transformAvailabilityResponse(response, searchParams) {
    if (!response.hotels || !response.hotels.hotels) {
      return { hotels: [], total: 0 };
    }

    const hotels = response.hotels.hotels.map(hotel => {
      // Get the best rate from available rooms
      const bestRoom = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : null;
      const totalPrice = bestRoom ? bestRoom.rates[0].net : 0;
      const nights = this.calculateNights(searchParams.checkIn, searchParams.checkOut);
      const pricePerNight = nights > 0 ? totalPrice / nights : 0;

      return {
        // Basic information
        id: hotel.code,
        code: hotel.code,
        name: hotel.name,
        categoryCode: hotel.categoryCode,
        destinationCode: hotel.destinationCode,
        zoneCode: hotel.zoneCode,
        
        // Location
        location: {
          coordinates: hotel.coordinates,
          address: {
            street: '',
            city: hotel.destinationName || '',
            country: ''
          }
        },
        
        // Pricing
        currentPrice: Math.round(pricePerNight),
        originalPrice: Math.round(pricePerNight * 1.2), // Add markup for display
        totalPrice: Math.round(totalPrice),
        currency: bestRoom ? bestRoom.rates[0].rateKey.split('|')[1] : searchParams.currency,
        
        // Availability info
        available: true,
        lastRoom: hotel.lastRoom || false,
        
        // Room information
        availableRooms: this.transformRooms(hotel.rooms),
        roomTypes: this.transformRoomTypes(hotel.rooms),
        
        // Basic hotel data (will be enriched by content API)
        rating: this.parseRating(hotel.categoryCode),
        starRating: this.parseRating(hotel.categoryCode),
        images: [],
        amenities: [],
        features: [],
        description: '',
        reviews: 0,
        
        // Booking metadata
        rateKey: bestRoom ? bestRoom.rates[0].rateKey : null,
        searchDate: new Date().toISOString(),
        
        // Frontend compatibility
        priceRange: {
          min: Math.round(pricePerNight),
          max: Math.round(pricePerNight * 1.5),
          currency: searchParams.currency
        }
      };
    });

    return {
      hotels: hotels,
      total: hotels.length,
      searchParams: searchParams,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Transform room data
   */
  transformRooms(rooms) {
    if (!rooms) return [];
    
    return rooms.map(room => ({
      code: room.code,
      name: room.name,
      rates: room.rates.map(rate => ({
        rateKey: rate.rateKey,
        net: rate.net,
        sellingRate: rate.sellingRate,
        hotelMandatory: rate.hotelMandatory,
        hotelSellingRate: rate.hotelSellingRate,
        boardCode: rate.boardCode,
        boardName: rate.boardName,
        cancellationPolicies: rate.cancellationPolicies || [],
        paymentType: rate.paymentType,
        packaging: rate.packaging,
        allotment: rate.allotment
      }))
    }));
  }

  /**
   * Transform room types for frontend
   */
  transformRoomTypes(rooms) {
    if (!rooms) return [];
    
    return rooms.map(room => ({
      name: room.name,
      price: room.rates[0].net,
      pricePerNight: room.rates[0].net,
      features: [
        room.rates[0].boardName || 'Room Only',
        room.rates[0].paymentType || 'Pay at Hotel'
      ]
    }));
  }

  /**
   * Get rate details for booking
   */
  async getRateDetails(rateKey) {
    try {
      console.log('🔍 Getting rate details for:', rateKey);

      const requestData = {
        rateKey: rateKey
      };

      const endpoint = '/hotel-api/1.0/checkrates';
      const response = await this.makeRequest(endpoint, 'POST', requestData);

      return this.transformRateDetails(response);

    } catch (error) {
      console.error('❌ Failed to get rate details:', error);
      throw error;
    }
  }

  /**
   * Create hotel booking
   */
  async createBooking(bookingData) {
    try {
      console.log('🏨 Creating hotel booking:', bookingData);

      const {
        rateKey,
        holder,
        rooms,
        clientReference,
        currency = 'USD'
      } = bookingData;

      // Prepare booking request
      const requestData = {
        clientReference: clientReference,
        creationDate: new Date().toISOString().split('T')[0],
        rateKey: rateKey,
        holder: {
          name: holder.firstName,
          surname: holder.lastName,
          email: holder.email,
          phone: holder.phone
        },
        rooms: rooms.map(room => ({
          rateKey: room.rateKey,
          paxes: room.guests.map(guest => ({
            roomId: room.roomId || 1,
            type: guest.type, // AD for adult, CH for child
            name: guest.firstName,
            surname: guest.lastName,
            age: guest.age
          }))
        })),
        currency: currency
      };

      const endpoint = '/hotel-api/1.0/bookings';
      const response = await this.makeRequest(endpoint, 'POST', requestData);

      // Save booking to database
      const dbBooking = await this.saveBookingToDatabase(response, bookingData);

      return {
        ...this.transformBookingResponse(response),
        databaseId: dbBooking.id
      };

    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingReference) {
    try {
      console.log('🔍 Getting booking details for:', bookingReference);

      const endpoint = `/hotel-api/1.0/bookings/${bookingReference}`;
      const response = await this.makeRequest(endpoint, 'GET');

      return this.transformBookingResponse(response);

    } catch (error) {
      console.error('❌ Failed to get booking details:', error);
      throw error;
    }
  }

  /**
   * Cancel hotel booking
   */
  async cancelBooking(bookingReference, cancellationFlag = 'CANCELLATION') {
    try {
      console.log('❌ Cancelling booking:', bookingReference);

      const requestData = {
        flag: cancellationFlag
      };

      const endpoint = `/hotel-api/1.0/bookings/${bookingReference}`;
      const response = await this.makeRequest(endpoint, 'DELETE', requestData);

      // Update booking status in database
      await this.updateBookingStatus(bookingReference, 'CANCELLED');

      return this.transformBookingResponse(response);

    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      throw error;
    }
  }

  /**
   * Save booking to database
   */
  async saveBookingToDatabase(hotelbedsResponse, originalRequest) {
    try {
      const booking = hotelbedsResponse.booking;
      
      const query = `
        INSERT INTO hotel_bookings (
          booking_reference, supplier_reference, hotel_code, hotel_name,
          check_in_date, check_out_date, total_amount, currency,
          guest_name, guest_email, guest_phone, booking_status,
          supplier_name, room_details, guest_details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        RETURNING id, booking_reference, created_at
      `;

      const values = [
        booking.reference,
        booking.reference, // Supplier reference same as booking reference
        booking.hotel.code,
        booking.hotel.name,
        booking.hotel.checkIn,
        booking.hotel.checkOut,
        booking.totalNet,
        booking.currency,
        `${originalRequest.holder.firstName} ${originalRequest.holder.lastName}`,
        originalRequest.holder.email,
        originalRequest.holder.phone,
        booking.status,
        'Hotelbeds',
        JSON.stringify(booking.hotel.rooms),
        JSON.stringify(originalRequest.rooms),
      ];

      const result = await db.query(query, values);
      console.log('✅ Booking saved to database:', result.rows[0]);
      
      return result.rows[0];

    } catch (error) {
      console.error('❌ Failed to save booking to database:', error);
      throw error;
    }
  }

  /**
   * Update booking status in database
   */
  async updateBookingStatus(bookingReference, status) {
    try {
      const query = `
        UPDATE hotel_bookings 
        SET booking_status = $1, updated_at = NOW()
        WHERE booking_reference = $2 OR supplier_reference = $2
        RETURNING id, booking_reference, booking_status
      `;

      const result = await db.query(query, [status, bookingReference]);
      console.log('✅ Booking status updated:', result.rows[0]);
      
      return result.rows[0];

    } catch (error) {
      console.error('❌ Failed to update booking status:', error);
      throw error;
    }
  }

  /**
   * Log search request for analytics
   */
  async logSearchRequest(searchParams, resultCount) {
    try {
      // This can be used for analytics and monitoring
      console.log(`📊 Search logged: ${searchParams.destination} - ${resultCount} results`);
      
      // Optional: Store in analytics table for business intelligence
      // await db.query('INSERT INTO search_analytics (destination, check_in, check_out, result_count, created_at) VALUES ($1, $2, $3, $4, NOW())', 
      //   [searchParams.destination, searchParams.checkIn, searchParams.checkOut, resultCount]);
      
    } catch (error) {
      console.error('❌ Failed to log search request:', error);
      // Don't throw - analytics failure shouldn't break search
    }
  }

  /**
   * Transform booking response
   */
  transformBookingResponse(response) {
    const booking = response.booking || response;
    
    return {
      reference: booking.reference,
      clientReference: booking.clientReference,
      creationDate: booking.creationDate,
      status: booking.status,
      hotel: {
        code: booking.hotel.code,
        name: booking.hotel.name,
        checkIn: booking.hotel.checkIn,
        checkOut: booking.hotel.checkOut,
        address: booking.hotel.address,
        rooms: booking.hotel.rooms
      },
      holder: booking.holder,
      totalNet: booking.totalNet,
      pendingAmount: booking.pendingAmount,
      currency: booking.currency,
      cancellationPolicies: booking.cancellationPolicies || []
    };
  }

  /**
   * Transform rate details response
   */
  transformRateDetails(response) {
    return {
      rateKey: response.rateKey,
      status: response.status,
      hotel: response.hotel
    };
  }

  /**
   * Calculate number of nights
   */
  calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Parse rating from category code
   */
  parseRating(categoryCode) {
    const categoryMap = {
      '1EST': 1, '2EST': 2, '3EST': 3, '4EST': 4, '5EST': 5,
      '1*': 1, '2*': 2, '3*': 3, '4*': 4, '5*': 5
    };
    return categoryMap[categoryCode] || 4;
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    try {
      // Test with a simple availability search
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const testSearch = {
        destination: 'PMI', // Palma de Mallorca - common test destination
        checkIn: tomorrow.toISOString(),
        checkOut: dayAfter.toISOString(),
        rooms: 1,
        adults: 2,
        children: 0,
        currency: 'USD'
      };

      await this.searchAvailability(testSearch);
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hotelbeds-booking'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        service: 'hotelbeds-booking'
      };
    }
  }

  /**
   * Clear availability cache
   */
  clearCache() {
    this.availabilityCache.clear();
    console.log('🗑️ Hotelbeds availability cache cleared');
  }
}

module.exports = new HotelbedsBookingService();
