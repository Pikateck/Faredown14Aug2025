/**
 * Comparable Product Object (CPO) Service
 * Canonicalizes products from different suppliers into standardized format
 * Implements the CPO specification from the AI Bargaining Platform
 */

const crypto = require("crypto");
const winston = require("winston");

class CPOService {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Generate canonical key for flight products
   * Format: FL:{airline}-{origin}-{dest}-{departure_date}-{fare_basis}
   */
  generateFlightKey(flightData) {
    const {
      airline,
      origin,
      destination,
      departureDate,
      fareBasis = "Y",
    } = flightData;

    // Normalize inputs
    const normalizedAirline = (airline || "").toUpperCase().trim();
    const normalizedOrigin = (origin || "").toUpperCase().trim();
    const normalizedDest = (destination || "").toUpperCase().trim();
    const normalizedDate = this.normalizeDate(departureDate);
    const normalizedFareBasis = (fareBasis || "Y").toUpperCase().trim();

    if (
      !normalizedAirline ||
      !normalizedOrigin ||
      !normalizedDest ||
      !normalizedDate
    ) {
      throw new Error(
        "Missing required flight data for canonical key generation",
      );
    }

    return `FL:${normalizedAirline}-${normalizedOrigin}-${normalizedDest}-${normalizedDate}-${normalizedFareBasis}`;
  }

  /**
   * Generate canonical key for hotel products
   * Format: HT:{hotel_id}:{room_code}:{rate_code}
   */
  generateHotelKey(hotelData) {
    const {
      hotelId,
      roomCode,
      rateCode,
      boardCode = "RO",
      cancellationPolicy = "STANDARD",
    } = hotelData;

    // Normalize inputs
    const normalizedHotelId = String(hotelId || "").trim();
    const normalizedRoomCode = (roomCode || "STD").toUpperCase().trim();
    const normalizedRateCode = (rateCode || "STANDARD").toUpperCase().trim();
    const normalizedBoard = (boardCode || "RO").toUpperCase().trim();
    const cancelHash = this.hashCancellationPolicy(cancellationPolicy);

    if (!normalizedHotelId) {
      throw new Error("Missing hotel ID for canonical key generation");
    }

    return `HT:${normalizedHotelId}:${normalizedRoomCode}:${normalizedRateCode}-${normalizedBoard}:${cancelHash}`;
  }

  /**
   * Generate canonical key for sightseeing products
   * Format: ST:{location}-{activity}:{category}:{duration}
   */
  generateSightseeingKey(sightseeingData) {
    const {
      location,
      activityName,
      category = "GENERAL",
      duration = "4H",
    } = sightseeingData;

    // Normalize inputs
    const normalizedLocation = (location || "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .trim();
    const normalizedActivity = (activityName || "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .trim();
    const normalizedCategory = (category || "GENERAL").toLowerCase().trim();
    const normalizedDuration = (duration || "4H").toUpperCase().trim();

    if (!normalizedLocation || !normalizedActivity) {
      throw new Error(
        "Missing required sightseeing data for canonical key generation",
      );
    }

    return `ST:${normalizedLocation}-${normalizedActivity}:${normalizedCategory}:${normalizedDuration}`;
  }

  /**
   * Create standardized CPO from flight data
   */
  createFlightCPO(flightData, supplierData = {}) {
    try {
      const canonicalKey = this.generateFlightKey(flightData);

      return {
        type: "flight",
        canonical_key: canonicalKey,
        attrs: {
          airline: flightData.airline?.toUpperCase(),
          origin: flightData.origin?.toUpperCase(),
          dest: flightData.destination?.toUpperCase(),
          dep_date: this.normalizeDate(flightData.departureDate),
          fare_basis: flightData.fareBasis || "Y",
          class: flightData.class || "Economy",
          flight_number: flightData.flightNumber,
          departure_time: flightData.departureTime,
          arrival_time: flightData.arrivalTime,
          duration_minutes: flightData.durationMinutes,
          stops: flightData.stops || 0,
          aircraft_type: flightData.aircraftType,
        },
        displayed_price: parseFloat(flightData.price || 0),
        currency: flightData.currency || "USD",
        supplier_metadata: {
          supplier_id: supplierData.supplierId,
          supplier_code: supplierData.supplierCode,
          original_id: flightData.originalId,
          booking_class: flightData.bookingClass,
          fare_rules: flightData.fareRules,
          baggage_allowance: flightData.baggageAllowance,
        },
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to create flight CPO:", error);
      throw error;
    }
  }

  /**
   * Create standardized CPO from hotel data
   */
  createHotelCPO(hotelData, supplierData = {}) {
    try {
      const canonicalKey = this.generateHotelKey(hotelData);

      return {
        type: "hotel",
        canonical_key: canonicalKey,
        attrs: {
          hotel_id: String(hotelData.hotelId),
          hotel_name: hotelData.hotelName,
          city: hotelData.city?.toUpperCase(),
          country: hotelData.country?.toUpperCase(),
          room_code: hotelData.roomCode?.toUpperCase(),
          room_name: hotelData.roomName,
          rate_code: hotelData.rateCode?.toUpperCase(),
          board: hotelData.boardCode?.toUpperCase() || "RO",
          cancel_policy: hotelData.cancellationPolicy,
          star_rating: parseFloat(hotelData.starRating || 0),
          check_in: this.normalizeDate(hotelData.checkIn),
          check_out: this.normalizeDate(hotelData.checkOut),
          nights: hotelData.nights || 1,
          guests: {
            adults: hotelData.adults || 1,
            children: hotelData.children || 0,
          },
        },
        displayed_price: parseFloat(hotelData.price || 0),
        currency: hotelData.currency || "USD",
        supplier_metadata: {
          supplier_id: supplierData.supplierId,
          supplier_code: supplierData.supplierCode,
          original_id: hotelData.originalId,
          hotel_code: hotelData.hotelCode,
          rate_key: hotelData.rateKey,
          booking_remarks: hotelData.bookingRemarks,
        },
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to create hotel CPO:", error);
      throw error;
    }
  }

  /**
   * Create standardized CPO from sightseeing data
   */
  createSightseeingCPO(sightseeingData, supplierData = {}) {
    try {
      const canonicalKey = this.generateSightseeingKey(sightseeingData);

      return {
        type: "sightseeing",
        canonical_key: canonicalKey,
        attrs: {
          location: sightseeingData.location?.toUpperCase(),
          activity: sightseeingData.activityName,
          category: sightseeingData.category?.toLowerCase() || "general",
          duration: sightseeingData.duration || "4H",
          city: sightseeingData.city?.toUpperCase(),
          country: sightseeingData.country?.toUpperCase(),
          activity_date: this.normalizeDate(sightseeingData.activityDate),
          time_slot: sightseeingData.timeSlot,
          language: sightseeingData.language || "EN",
          inclusions: sightseeingData.inclusions || [],
          exclusions: sightseeingData.exclusions || [],
          pickup_point: sightseeingData.pickupPoint,
          difficulty_level: sightseeingData.difficultyLevel || "easy",
        },
        displayed_price: parseFloat(sightseeingData.price || 0),
        currency: sightseeingData.currency || "USD",
        supplier_metadata: {
          supplier_id: supplierData.supplierId,
          supplier_code: supplierData.supplierCode,
          original_id: sightseeingData.originalId,
          activity_code: sightseeingData.activityCode,
          modality_code: sightseeingData.modalityCode,
          booking_remarks: sightseeingData.bookingRemarks,
        },
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to create sightseeing CPO:", error);
      throw error;
    }
  }

  /**
   * Validate CPO structure
   */
  validateCPO(cpo) {
    const errors = [];

    // Required fields
    if (!cpo.type || !["flight", "hotel", "sightseeing"].includes(cpo.type)) {
      errors.push("Invalid or missing type");
    }

    if (!cpo.canonical_key || typeof cpo.canonical_key !== "string") {
      errors.push("Invalid or missing canonical_key");
    }

    if (!cpo.attrs || typeof cpo.attrs !== "object") {
      errors.push("Invalid or missing attrs");
    }

    if (typeof cpo.displayed_price !== "number" || cpo.displayed_price < 0) {
      errors.push("Invalid displayed_price");
    }

    if (!cpo.currency || typeof cpo.currency !== "string") {
      errors.push("Invalid or missing currency");
    }

    // Type-specific validations
    if (cpo.type === "flight") {
      const required = ["airline", "origin", "dest", "dep_date"];
      for (const field of required) {
        if (!cpo.attrs[field]) {
          errors.push(`Missing required flight field: ${field}`);
        }
      }
    }

    if (cpo.type === "hotel") {
      const required = ["hotel_id", "city"];
      for (const field of required) {
        if (!cpo.attrs[field]) {
          errors.push(`Missing required hotel field: ${field}`);
        }
      }
    }

    if (cpo.type === "sightseeing") {
      const required = ["location", "activity"];
      for (const field of required) {
        if (!cpo.attrs[field]) {
          errors.push(`Missing required sightseeing field: ${field}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Bulk process CPOs from multiple suppliers
   */
  async processBulkCPOs(products, supplierMapping = {}) {
    const results = {
      success: [],
      failed: [],
      duplicates: [],
    };

    const seenKeys = new Set();

    for (const product of products) {
      try {
        let cpo;
        const supplierData = supplierMapping[product.supplier] || {};

        switch (product.type) {
          case "flight":
            cpo = this.createFlightCPO(product, supplierData);
            break;
          case "hotel":
            cpo = this.createHotelCPO(product, supplierData);
            break;
          case "sightseeing":
            cpo = this.createSightseeingCPO(product, supplierData);
            break;
          default:
            throw new Error(`Unsupported product type: ${product.type}`);
        }

        // Validate CPO
        const validation = this.validateCPO(cpo);
        if (!validation.valid) {
          results.failed.push({
            original: product,
            errors: validation.errors,
          });
          continue;
        }

        // Check for duplicates
        if (seenKeys.has(cpo.canonical_key)) {
          results.duplicates.push({
            canonical_key: cpo.canonical_key,
            original: product,
          });
          continue;
        }

        seenKeys.add(cpo.canonical_key);
        results.success.push(cpo);
      } catch (error) {
        results.failed.push({
          original: product,
          error: error.message,
        });
      }
    }

    this.logger.info(
      `CPO processing complete: ${results.success.length} success, ${results.failed.length} failed, ${results.duplicates.length} duplicates`,
    );

    return results;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Normalize date to YYYY-MM-DD format
   */
  normalizeDate(dateInput) {
    if (!dateInput) return null;

    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch (error) {
      this.logger.warn("Failed to normalize date:", dateInput);
      return null;
    }
  }

  /**
   * Create hash for cancellation policy
   */
  hashCancellationPolicy(policy) {
    if (!policy || typeof policy !== "object") {
      return "STD";
    }

    // Create deterministic hash of policy object
    const policyString = JSON.stringify(policy, Object.keys(policy).sort());
    const hash = crypto.createHash("md5").update(policyString).digest("hex");
    return hash.substring(0, 8).toUpperCase();
  }

  /**
   * Extract route information from canonical key
   */
  parseCanonicalKey(canonicalKey) {
    try {
      const parts = canonicalKey.split(":");
      const type = parts[0].toLowerCase();

      switch (type) {
        case "fl":
          const [, flightInfo, fareBasis] = parts;
          const [airline, origin, dest, date] = flightInfo.split("-");
          return {
            type: "flight",
            airline,
            origin,
            dest,
            date,
            fare_basis: fareBasis,
          };

        case "ht":
          const [, hotelId, roomInfo, policyInfo] = parts;
          const [rateCode, board] = roomInfo.split("-");
          return {
            type: "hotel",
            hotel_id: hotelId,
            rate_code: rateCode,
            board,
            policy_hash: policyInfo,
          };

        case "st":
          const [, locationActivity, category, duration] = parts;
          const [location, activity] = locationActivity.split("-");
          return {
            type: "sightseeing",
            location,
            activity,
            category,
            duration,
          };

        default:
          throw new Error(`Unknown canonical key type: ${type}`);
      }
    } catch (error) {
      this.logger.error("Failed to parse canonical key:", canonicalKey, error);
      return null;
    }
  }

  /**
   * Generate search-friendly attributes for indexing
   */
  generateSearchableAttrs(cpo) {
    const searchable = {
      type: cpo.type,
      canonical_key: cpo.canonical_key,
    };

    switch (cpo.type) {
      case "flight":
        searchable.route = `${cpo.attrs.origin}-${cpo.attrs.dest}`;
        searchable.airline = cpo.attrs.airline;
        searchable.date = cpo.attrs.dep_date;
        searchable.class = cpo.attrs.class;
        break;

      case "hotel":
        searchable.destination = cpo.attrs.city;
        searchable.hotel_name = cpo.attrs.hotel_name;
        searchable.star_rating = cpo.attrs.star_rating;
        searchable.board = cpo.attrs.board;
        break;

      case "sightseeing":
        searchable.destination = cpo.attrs.location;
        searchable.activity = cpo.attrs.activity;
        searchable.category = cpo.attrs.category;
        searchable.duration = cpo.attrs.duration;
        break;
    }

    return searchable;
  }
}

// Export singleton instance
const cpoService = new CPOService();

module.exports = cpoService;
