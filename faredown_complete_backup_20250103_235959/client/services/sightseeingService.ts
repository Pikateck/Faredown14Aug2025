/**
 * Sightseeing API Service
 * Handles sightseeing activities search and destination management using Hotelbeds Activities API
 */

import { apiClient, ApiResponse } from "@/lib/api";

// Types for sightseeing destinations
export interface SightseeingDestination {
  id: string;
  code: string;
  name: string;
  type: "city" | "region" | "country" | "destination";
  country: string;
  countryCode: string;
  popular?: boolean;
}

export interface SightseeingSearchRequest {
  destination: string;
  destinationCode: string;
  visitDate: string;
  endDate?: string;
  adults: number;
  children: number;
  experienceType?: string;
  duration?: string;
}

class SightseeingService {
  /**
   * Search destinations using Hotelbeds Activities API
   * Matches hotels service signature exactly
   */
  async searchDestinations(query: string): Promise<SightseeingDestination[]> {
    try {
      console.log(`🎯 Searching sightseeing destinations: "${query}"`);

      let response;
      try {
        // Call the backend Hotelbeds Activities API
        response = await apiClient.post<{
          success: boolean;
          data: { destinations: any[] };
        }>("/api/sightseeing/destinations", {
          query,
          limit: 15, // Fixed limit like hotels
          popularOnly: query === "", // Popular when empty query
        });
      } catch (apiError) {
        console.warn(
          "❌ Sightseeing destinations API request failed:",
          apiError,
        );
        return this.getFallbackDestinations(query);
      }

      // Check if response or response.data is null/undefined
      if (!response || !response.data) {
        console.warn("❌ Sightseeing destinations API returned null response");
        return this.getFallbackDestinations(query);
      }

      if (!response.data.success) {
        console.warn("❌ Sightseeing destinations API failed:", response.data);
        return this.getFallbackDestinations(query);
      }

      // Check if destinations data exists
      const destinationsData = response.data.data?.destinations;
      if (!destinationsData || !Array.isArray(destinationsData)) {
        console.warn(
          "❌ Sightseeing destinations data is invalid:",
          response.data.data,
        );
        return this.getFallbackDestinations(query);
      }

      const destinations = destinationsData.map((dest: any) => ({
        id: dest.code,
        code: dest.code,
        name: dest.name,
        type: dest.type || "destination",
        country: dest.countryName || dest.country,
        countryCode: dest.countryCode,
        popular: dest.popular || false,
      }));

      console.log(
        `✅ Found ${destinations.length} sightseeing destinations from API`,
      );
      return destinations;
    } catch (error) {
      console.error("❌ Sightseeing destinations search error:", error);
      return this.getFallbackDestinations(query);
    }
  }

  /**
   * Fallback destinations when API fails
   */
  private getFallbackDestinations(
    query: string = "",
  ): SightseeingDestination[] {
    const fallbackDestinations: SightseeingDestination[] = [
      {
        id: "DXB",
        code: "DXB",
        name: "Dubai",
        type: "city",
        country: "United Arab Emirates",
        countryCode: "AE",
        popular: true,
      },
      {
        id: "LON",
        code: "LON",
        name: "London",
        type: "city",
        country: "United Kingdom",
        countryCode: "GB",
        popular: true,
      },
      {
        id: "PAR",
        code: "PAR",
        name: "Paris",
        type: "city",
        country: "France",
        countryCode: "FR",
        popular: true,
      },
      {
        id: "BCN",
        code: "BCN",
        name: "Barcelona",
        type: "city",
        country: "Spain",
        countryCode: "ES",
        popular: true,
      },
      {
        id: "NYC",
        code: "NYC",
        name: "New York",
        type: "city",
        country: "United States",
        countryCode: "US",
        popular: true,
      },
      {
        id: "BOM",
        code: "BOM",
        name: "Mumbai",
        type: "city",
        country: "India",
        countryCode: "IN",
        popular: true,
      },
      {
        id: "SIN",
        code: "SIN",
        name: "Singapore",
        type: "city",
        country: "Singapore",
        countryCode: "SG",
        popular: true,
      },
      {
        id: "BKK",
        code: "BKK",
        name: "Bangkok",
        type: "city",
        country: "Thailand",
        countryCode: "TH",
        popular: true,
      },
    ];

    // Filter based on query if provided
    if (query && query.length > 0) {
      const filtered = fallbackDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query.toLowerCase()) ||
          dest.country.toLowerCase().includes(query.toLowerCase()) ||
          dest.code.toLowerCase().includes(query.toLowerCase()),
      );
      return filtered.slice(0, 15); // Fixed limit like hotels
    }

    return fallbackDestinations.slice(0, 15); // Fixed limit like hotels
  }

  /**
   * Search sightseeing activities
   */
  async searchActivities(searchRequest: SightseeingSearchRequest) {
    try {
      console.log("🎯 Searching sightseeing activities:", searchRequest);

      const response = await apiClient.post("/api/sightseeing/search", {
        destination: searchRequest.destinationCode,
        checkIn: searchRequest.visitDate,
        checkOut: searchRequest.endDate,
        adults: searchRequest.adults,
        children: searchRequest.children,
        experienceType: searchRequest.experienceType,
        duration: searchRequest.duration,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Sightseeing search error:", error);
      throw error;
    }
  }

  /**
   * Calculate price for sightseeing activities
   */
  calculatePrice(
    basePrice: number,
    adults: number = 1,
    children: number = 0,
    currency: string = "INR",
  ) {
    const adultPrice = basePrice * adults;
    const childPrice = basePrice * 0.7 * children; // 30% discount for children
    const subtotal = adultPrice + childPrice;
    const taxes = subtotal * 0.18; // 18% GST
    const totalPrice = subtotal + taxes;

    return {
      adultPrice,
      childPrice,
      subtotal,
      taxes,
      totalPrice,
      currency,
      priceBreakdown: {
        adults: {
          count: adults,
          pricePerPerson: basePrice,
          total: adultPrice,
        },
        children: {
          count: children,
          pricePerPerson: basePrice * 0.7,
          total: childPrice,
        },
      },
    };
  }
}

export const sightseeingService = new SightseeingService();
