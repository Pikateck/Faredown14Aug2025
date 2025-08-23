/**
 * Hotelbeds Activities API Service
 * Handles all interactions with Hotelbeds Activities (Sightseeing) API
 * Includes content retrieval and booking functionality
 */

const axios = require("axios");
const crypto = require("crypto");

class HotelbedsActivitiesService {
  constructor() {
    this.config = {
      apiKey:
        process.env.HOTELBEDS_API_KEY || "4ad3d9b2d55424b58fdd61dcaeba81f8",
      secret: process.env.HOTELBEDS_SECRET || "5283c0c124",
      baseUrl:
        process.env.HOTELBEDS_BASE_URL || "https://api.test.hotelbeds.com",
      environment: process.env.HOTELBEDS_ENVIRONMENT || "test",
      timeout: 30000,
      rateLimit: {
        requests: 16,
        interval: 4000, // 4 seconds
        dailyLimit: 5000,
      },
    };

    this.endpoints = {
      activities: "/activity-content-api/1.0/activities",
      activityDetail: "/activity-content-api/1.0/activities/{activityCode}",
      destinations: "/activity-content-api/1.0/destinations",
      categories: "/activity-content-api/1.0/categories",
      booking: "/activity-booking-api/1.0/bookings",
      bookingDetail: "/activity-booking-api/1.0/bookings/{bookingId}",
      bookingCancel: "/activity-booking-api/1.0/bookings/{bookingId}",
    };
  }

  /**
   * Generate authentication headers for Hotelbeds API
   */
  generateAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha256")
      .update(this.config.apiKey + this.config.secret + timestamp)
      .digest("hex");

    return {
      "Api-key": this.config.apiKey,
      "X-Signature": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip",
    };
  }

  /**
   * Make HTTP request to Hotelbeds API with error handling
   */
  async makeRequest(endpoint, method = "GET", data = null) {
    try {
      const config = {
        method,
        url: `${this.config.baseUrl}${endpoint}`,
        headers: this.generateAuthHeaders(),
        timeout: this.config.timeout,
      };

      if (data) {
        config.data = data;
      }

      console.log(`Hotelbeds API Request: ${method} ${endpoint}`);

      const response = await axios(config);

      console.log(
        `Hotelbeds API Response: ${response.status} - ${response.data?.activities?.length || 0} items`,
      );

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("Hotelbeds API Error:", {
        endpoint,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });

      return {
        success: false,
        error: error.message,
        status: error.response?.status || 500,
        details: error.response?.data,
      };
    }
  }

  /**
   * Search activities by destination and criteria
   */
  async searchActivities(searchParams) {
    const {
      destination,
      from,
      to,
      adults = 2,
      children = 0,
      childrenAges = [],
      language = "en",
      limit = 20,
      filters = {},
    } = searchParams;

    // Build request payload
    const requestData = {
      destination: {
        code: destination,
        type: "DESTINATION",
      },
      from: from,
      to: to || from,
      paxes: [
        {
          type: "AD",
          amount: adults,
        },
      ],
      language: language,
    };

    // Add children if specified
    if (children > 0) {
      requestData.paxes.push({
        type: "CH",
        amount: children,
        ages: childrenAges.slice(0, children),
      });
    }

    // Add filters
    if (filters.category) {
      requestData.filters = {
        category: filters.category,
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      requestData.filters = {
        ...requestData.filters,
        price: {
          ...(filters.minPrice && { minimum: filters.minPrice }),
          ...(filters.maxPrice && { maximum: filters.maxPrice }),
        },
      };
    }

    const result = await this.makeRequest(
      this.endpoints.activities,
      "POST",
      requestData,
    );

    if (!result.success) {
      return result;
    }

    // Process and normalize the response
    const activities = (result.data.activities || [])
      .slice(0, limit)
      .map((activity) => ({
        code: activity.code,
        name: activity.name,
        description: activity.description,
        type: activity.type,
        category: activity.category?.name,
        destination: activity.destination,
        duration: this.formatDuration(activity.duration),
        price: {
          amount: activity.price?.amount || 0,
          currency: activity.price?.currency || "EUR",
        },
        images: this.extractImages(activity.images),
        rating: activity.rating || 4.5,
        reviewCount: activity.reviewCount || 0,
        highlights: this.extractHighlights(activity),
        includes: this.extractIncludes(activity),
        location: {
          latitude: activity.geoLocation?.latitude,
          longitude: activity.geoLocation?.longitude,
          address: activity.address,
        },
        availability: {
          openingTimes: activity.openingTimes,
          operatingDays: activity.operatingDays,
        },
        modalities:
          activity.modalities?.map((mod) => ({
            code: mod.code,
            name: mod.name,
            description: mod.description,
            price: mod.price,
            duration: mod.duration,
          })) || [],
      }));

    return {
      success: true,
      data: {
        activities,
        total: result.data.total || activities.length,
        destination: result.data.destination,
      },
    };
  }

  /**
   * Get detailed information for a specific activity
   */
  async getActivityDetail(activityCode, language = "en") {
    const endpoint = this.endpoints.activityDetail.replace(
      "{activityCode}",
      activityCode,
    );
    const requestData = { language };

    const result = await this.makeRequest(endpoint, "POST", requestData);

    if (!result.success) {
      return result;
    }

    const activity = result.data.activity;

    return {
      success: true,
      data: {
        code: activity.code,
        name: activity.name,
        description: activity.description,
        longDescription: activity.longDescription,
        type: activity.type,
        category: activity.category,
        destination: activity.destination,
        duration: this.formatDuration(activity.duration),
        price: activity.price,
        images: this.extractImages(activity.images),
        rating: activity.rating || 4.5,
        reviewCount: activity.reviewCount || 0,
        highlights: this.extractHighlights(activity),
        includes: this.extractIncludes(activity),
        excludes: this.extractExcludes(activity),
        requirements: this.extractRequirements(activity),
        location: {
          latitude: activity.geoLocation?.latitude,
          longitude: activity.geoLocation?.longitude,
          address: activity.address,
        },
        availability: {
          openingTimes: activity.openingTimes,
          operatingDays: activity.operatingDays,
          schedule: activity.schedule,
        },
        modalities:
          activity.modalities?.map((mod) => ({
            code: mod.code,
            name: mod.name,
            description: mod.description,
            price: mod.price,
            duration: mod.duration,
            includes: mod.includes,
            excludes: mod.excludes,
          })) || [],
        cancellationPolicy: activity.cancellationPolicy,
      },
    };
  }

  /**
   * Create a booking for an activity
   */
  async createBooking(bookingData) {
    const {
      activityCode,
      modalityCode,
      from,
      to,
      adults = 2,
      children = 0,
      childrenAges = [],
      holder,
      paxes,
      clientReference,
      language = "en",
    } = bookingData;

    const requestData = {
      clientReference: clientReference,
      holder: {
        name: holder.firstName,
        surname: holder.lastName,
        email: holder.email,
        phone: holder.phone,
      },
      activities: [
        {
          code: activityCode,
          modality: modalityCode,
          from: from,
          to: to || from,
          paxes: [
            {
              type: "AD",
              amount: adults,
            },
          ],
          language: language,
        },
      ],
    };

    // Add children if specified
    if (children > 0) {
      requestData.activities[0].paxes.push({
        type: "CH",
        amount: children,
        ages: childrenAges.slice(0, children),
      });
    }

    // Add detailed pax information if provided
    if (paxes && paxes.length > 0) {
      requestData.activities[0].paxes = paxes.map((pax) => ({
        type: pax.type,
        name: pax.firstName,
        surname: pax.lastName,
        age: pax.age,
        documentType: pax.documentType,
        documentNumber: pax.documentNumber,
      }));
    }

    const result = await this.makeRequest(
      this.endpoints.booking,
      "POST",
      requestData,
    );

    if (!result.success) {
      return result;
    }

    const booking = result.data.booking;

    return {
      success: true,
      data: {
        bookingId: booking.reference,
        clientReference: booking.clientReference,
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        activities: booking.activities?.map((activity) => ({
          code: activity.code,
          name: activity.name,
          status: activity.status,
          amount: activity.amount,
          voucher: activity.voucher,
        })),
        cancellationPolicy: booking.cancellationPolicy,
        creationDate: booking.creationDate,
      },
    };
  }

  /**
   * Get booking details
   */
  async getBookingDetail(bookingId) {
    const endpoint = this.endpoints.bookingDetail.replace(
      "{bookingId}",
      bookingId,
    );

    const result = await this.makeRequest(endpoint, "GET");

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data.booking,
    };
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId, cancellationFlag = "CANCELLATION") {
    const endpoint = this.endpoints.bookingCancel.replace(
      "{bookingId}",
      bookingId,
    );
    const requestData = { flag: cancellationFlag };

    const result = await this.makeRequest(endpoint, "DELETE", requestData);

    return result;
  }

  /**
   * Get available destinations
   */
  async getDestinations(language = "en", limit = 100) {
    const requestData = { language };

    const result = await this.makeRequest(
      this.endpoints.destinations,
      "POST",
      requestData,
    );

    if (!result.success) {
      return result;
    }

    const destinations = (result.data.destinations || [])
      .slice(0, limit)
      .map((dest) => ({
        code: dest.code,
        name: dest.name,
        countryCode: dest.countryCode,
        countryName: dest.countryName,
        type: dest.type,
      }));

    return {
      success: true,
      data: { destinations },
    };
  }

  /**
   * Helper methods for data processing
   */
  formatDuration(duration) {
    if (!duration) return "Variable";

    if (duration.includes("hours")) return duration;
    if (duration.includes("minutes")) {
      const minutes = parseInt(duration);
      if (minutes < 60) return `${minutes} minutes`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours} hours`;
    }

    return duration;
  }

  extractImages(images) {
    if (!images || !Array.isArray(images)) return [];

    return images
      .map((img) => ({
        url: img.url,
        type: img.type,
        order: img.order,
      }))
      .sort((a, b) => a.order - b.order);
  }

  extractHighlights(activity) {
    const highlights = [];

    if (activity.highlights) {
      highlights.push(...activity.highlights);
    }

    if (activity.description) {
      // Extract key points from description
      const keyPoints = activity.description
        .split(/[.!?]/)
        .filter((point) => point.length > 20 && point.length < 100)
        .slice(0, 3);
      highlights.push(...keyPoints);
    }

    return highlights.slice(0, 6);
  }

  extractIncludes(activity) {
    const includes = [];

    if (activity.includes) {
      includes.push(...activity.includes);
    }

    if (activity.modalities) {
      activity.modalities.forEach((mod) => {
        if (mod.includes) {
          includes.push(...mod.includes);
        }
      });
    }

    return [...new Set(includes)]; // Remove duplicates
  }

  extractExcludes(activity) {
    const excludes = [];

    if (activity.excludes) {
      excludes.push(...activity.excludes);
    }

    return excludes;
  }

  extractRequirements(activity) {
    const requirements = [];

    if (activity.requirements) {
      requirements.push(...activity.requirements);
    }

    if (activity.restrictions) {
      requirements.push(...activity.restrictions);
    }

    return requirements;
  }
}

module.exports = new HotelbedsActivitiesService();
