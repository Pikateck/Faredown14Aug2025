/**
 * Hotelbeds Content API Service
 * Handles hotel content, descriptions, images, and static data
 * Part of the production integration for Faredown booking system
 */

const axios = require('axios');
const crypto = require('crypto');

class HotelbedsContentService {
  constructor() {
    // Hotelbeds API Configuration
    this.baseURL = process.env.HOTELBEDS_CONTENT_API || 'https://api.test.hotelbeds.com/hotel-content-api/1.0';
    this.apiKey = process.env.HOTELBEDS_API_KEY;
    this.sharedSecret = process.env.HOTELBEDS_SECRET;
    
    // Cache settings
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours for content
    this.contentCache = new Map();
    
    // Request settings
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    console.log('🏨 Hotelbeds Content Service initialized');
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
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      console.log(`🔄 Hotelbeds API Request: ${method} ${endpoint}`);
      
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
        throw new Error(`Hotelbeds API Error: ${response.status} - ${response.statusText}`);
      }
      
      console.log(`✅ Hotelbeds API Success: ${response.status}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Hotelbeds API Error:`, error.message);
      
      if (error.response) {
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Data:`, error.response.data);
      }
      
      throw error;
    }
  }

  /**
   * Get destinations (countries, cities, zones)
   */
  async getDestinations(countryCode = null) {
    try {
      const cacheKey = `destinations_${countryCode || 'all'}`;
      
      // Check cache first
      if (this.contentCache.has(cacheKey)) {
        const cached = this.contentCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Using cached destinations`);
          return cached.data;
        }
      }
      
      let endpoint = '/hotel-content-api/1.0/locations/destinations';
      if (countryCode) {
        endpoint += `?countryCodes=${countryCode}`;
      }
      
      const response = await this.makeRequest(endpoint);
      
      // Transform data for frontend compatibility
      const destinations = this.transformDestinations(response);
      
      // Cache the result
      this.contentCache.set(cacheKey, {
        data: destinations,
        timestamp: Date.now()
      });
      
      return destinations;
      
    } catch (error) {
      console.error('❌ Failed to fetch destinations:', error);
      throw error;
    }
  }

  /**
   * Get hotel details by hotel codes
   */
  async getHotels(hotelCodes, language = 'ENG') {
    try {
      const cacheKey = `hotels_${hotelCodes.join('_')}_${language}`;
      
      // Check cache first
      if (this.contentCache.has(cacheKey)) {
        const cached = this.contentCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Using cached hotel data`);
          return cached.data;
        }
      }
      
      const endpoint = '/hotel-content-api/1.0/hotels';
      const requestData = {
        hotelCodes: hotelCodes,
        language: language,
        from: 1,
        to: Math.min(hotelCodes.length, 100) // API limit
      };
      
      const response = await this.makeRequest(endpoint, 'POST', requestData);
      
      // Transform data for frontend compatibility
      const hotels = this.transformHotels(response);
      
      // Cache the result
      this.contentCache.set(cacheKey, {
        data: hotels,
        timestamp: Date.now()
      });
      
      return hotels;
      
    } catch (error) {
      console.error('❌ Failed to fetch hotels:', error);
      throw error;
    }
  }

  /**
   * Get hotels by destination
   */
  async getHotelsByDestination(destinationCode, language = 'ENG') {
    try {
      const cacheKey = `hotels_destination_${destinationCode}_${language}`;
      
      // Check cache first
      if (this.contentCache.has(cacheKey)) {
        const cached = this.contentCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Using cached destination hotels`);
          return cached.data;
        }
      }
      
      const endpoint = '/hotel-content-api/1.0/hotels';
      const requestData = {
        destinationCodes: [destinationCode],
        language: language,
        from: 1,
        to: 100
      };
      
      const response = await this.makeRequest(endpoint, 'POST', requestData);
      
      // Transform data for frontend compatibility
      const hotels = this.transformHotels(response);
      
      // Cache the result
      this.contentCache.set(cacheKey, {
        data: hotels,
        timestamp: Date.now()
      });
      
      return hotels;
      
    } catch (error) {
      console.error('❌ Failed to fetch hotels by destination:', error);
      throw error;
    }
  }

  /**
   * Transform Hotelbeds destinations data to frontend format
   */
  transformDestinations(response) {
    if (!response.destinations) {
      return [];
    }
    
    return response.destinations.map(dest => ({
      code: dest.code,
      name: dest.name,
      countryCode: dest.countryCode,
      isoCode: dest.isoCode,
      type: dest.type, // city, zone, etc.
      description: dest.description || '',
      // Additional fields for frontend compatibility
      id: dest.code,
      fullName: `${dest.name}, ${dest.countryCode}`,
      displayName: dest.name
    }));
  }

  /**
   * Transform Hotelbeds hotels data to frontend format
   */
  transformHotels(response) {
    if (!response.hotels) {
      return [];
    }
    
    return response.hotels.map(hotel => ({
      // Basic hotel information
      id: hotel.code,
      code: hotel.code,
      name: hotel.name.content || hotel.name,
      description: hotel.description?.content || '',
      
      // Location information
      location: {
        destinationCode: hotel.destinationCode,
        zoneCode: hotel.zoneCode,
        coordinates: hotel.coordinates,
        address: {
          street: hotel.address?.content || '',
          city: hotel.city?.content || '',
          country: hotel.country?.description?.content || '',
          postalCode: hotel.postalCode
        }
      },
      
      // Hotel details
      categoryCode: hotel.categoryCode,
      categoryGroupCode: hotel.categoryGroupCode,
      chainCode: hotel.chainCode,
      accommodationTypeCode: hotel.accommodationTypeCode,
      
      // Rating
      rating: this.parseRating(hotel.categoryCode),
      starRating: this.parseRating(hotel.categoryCode),
      
      // Images
      images: this.transformImages(hotel.images),
      
      // Facilities/Amenities
      amenities: this.transformFacilities(hotel.facilities),
      facilities: this.transformFacilities(hotel.facilities),
      
      // Additional information
      phones: hotel.phones || [],
      emails: hotel.emails || [],
      web: hotel.web || '',
      lastUpdate: hotel.lastUpdate,
      
      // Frontend compatibility fields
      originalPrice: null, // Will be set by booking API
      currentPrice: null,  // Will be set by booking API
      priceRange: {
        min: null,
        max: null,
        currency: 'USD'
      },
      reviews: 0,
      reviewCount: 0,
      features: this.extractFeatures(hotel),
      roomTypes: [] // Will be populated by booking API
    }));
  }

  /**
   * Transform hotel images with enhanced URL processing for gallery
   */
  transformImages(images) {
    if (!images) return [];

    const transformedImages = images
      .filter(img => img.path) // Only include images with valid paths
      .map(img => {
        // Construct full image URL
        let imageUrl = img.path;

        // If path is relative, make it absolute
        if (!imageUrl.startsWith('http')) {
          // Hotelbeds images are typically served from their CDN
          imageUrl = `https://photos.hotelbeds.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }

        // Add size parameters for different use cases
        const baseUrl = imageUrl.split('?')[0]; // Remove existing query params

        return {
          // High resolution for gallery/lightbox
          url: `${baseUrl}?width=1200&height=800&crop=fill&quality=85`,
          // Standard resolution for general use
          urlStandard: `${baseUrl}?width=600&height=400&crop=fill&quality=80`,
          // Thumbnail for previews
          urlThumbnail: `${baseUrl}?width=300&height=200&crop=fill&quality=75`,
          // Original URL
          urlOriginal: imageUrl,

          // Metadata
          type: img.imageTypeCode,
          typeCode: img.imageTypeCode,
          order: img.order || 999,
          visualOrder: img.visualOrder || img.order || 999,
          roomCode: img.roomCode,
          roomType: img.roomType,
          characteristicCode: img.characteristicCode,

          // Image categories for filtering
          category: this.getImageCategory(img.imageTypeCode),
          description: this.getImageDescription(img.imageTypeCode, img.characteristicCode),

          // Alt text for accessibility
          alt: img.roomType ? `${img.roomType} room` : 'Hotel image'
        };
      })
      .sort((a, b) => (a.visualOrder || a.order) - (b.visualOrder || b.order)); // Sort by visual order

    console.log(`📸 Processed ${transformedImages.length} hotel images`);
    return transformedImages;
  }

  /**
   * Get image category for filtering
   */
  getImageCategory(imageTypeCode) {
    const categoryMap = {
      'GEN': 'general',
      'HAB': 'room',
      'SUI': 'suite',
      'RES': 'restaurant',
      'BAR': 'bar',
      'SPA': 'spa',
      'PIS': 'pool',
      'PLY': 'beach',
      'DEP': 'sports',
      'SAL': 'meeting',
      'HAL': 'lobby',
      'EXT': 'exterior',
      'INT': 'interior'
    };

    return categoryMap[imageTypeCode] || 'general';
  }

  /**
   * Get user-friendly image description
   */
  getImageDescription(imageTypeCode, characteristicCode) {
    const descriptions = {
      'GEN': 'Hotel view',
      'HAB': 'Room',
      'SUI': 'Suite',
      'RES': 'Restaurant',
      'BAR': 'Bar & Lounge',
      'SPA': 'Spa & Wellness',
      'PIS': 'Swimming Pool',
      'PLY': 'Beach',
      'DEP': 'Sports & Recreation',
      'SAL': 'Meeting Room',
      'HAL': 'Lobby',
      'EXT': 'Hotel Exterior',
      'INT': 'Hotel Interior'
    };

    return descriptions[imageTypeCode] || 'Hotel Image';
  }

  /**
   * Transform hotel facilities to amenities
   */
  transformFacilities(facilities) {
    if (!facilities) return [];
    
    // Map common facility codes to frontend amenity names
    const facilityMap = {
      '10': 'WiFi',
      '20': 'Parking',
      '30': 'Restaurant', 
      '40': 'Bar',
      '50': 'Pool',
      '60': 'Spa',
      '70': 'Gym',
      '80': 'Air Conditioning',
      '90': 'Room Service',
      '100': 'Business Center'
    };
    
    return facilities.map(facility => {
      const name = facilityMap[facility.facilityCode] || facility.description?.content || `Facility ${facility.facilityCode}`;
      return {
        code: facility.facilityCode,
        name: name,
        groupCode: facility.facilityGroupCode,
        description: facility.description?.content || ''
      };
    });
  }

  /**
   * Parse rating from category code
   */
  parseRating(categoryCode) {
    // Hotelbeds category codes to star ratings mapping
    const categoryMap = {
      '1EST': 1,
      '2EST': 2,
      '3EST': 3,
      '4EST': 4,
      '5EST': 5,
      '1*': 1,
      '2*': 2,
      '3*': 3,
      '4*': 4,
      '5*': 5
    };
    
    return categoryMap[categoryCode] || 4; // Default to 4 stars
  }

  /**
   * Extract key features from hotel data
   */
  extractFeatures(hotel) {
    const features = [];
    
    // Add category-based features
    if (hotel.categoryCode && hotel.categoryCode.includes('5')) {
      features.push('Luxury');
    }
    if (hotel.categoryCode && hotel.categoryCode.includes('4')) {
      features.push('Premium');
    }
    
    // Add location-based features
    if (hotel.coordinates) {
      features.push('City Center');
    }
    
    // Add facility-based features
    if (hotel.facilities) {
      hotel.facilities.forEach(facility => {
        if (facility.facilityCode === '50') features.push('Swimming Pool');
        if (facility.facilityCode === '60') features.push('Spa & Wellness');
        if (facility.facilityCode === '70') features.push('Fitness Center');
      });
    }
    
    return features.slice(0, 5); // Limit to 5 features
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    try {
      // Simple destinations call to test API connectivity
      await this.makeRequest('/hotel-content-api/1.0/types/countries');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hotelbeds-content'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        service: 'hotelbeds-content'
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.contentCache.clear();
    console.log('🗑️ Hotelbeds content cache cleared');
  }
}

module.exports = new HotelbedsContentService();
