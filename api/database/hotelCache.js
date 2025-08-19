/**
 * Hotel Database Cache Module
 * Handles caching and storage of hotel data from Hotelbeds API
 */

class HotelCache {
  constructor() {
    // In-memory cache for quick access
    this.cache = new Map();
    this.destinationCache = new Map();
    this.searchCache = new Map();

    // Cache TTL in milliseconds
    this.HOTEL_TTL = 24 * 60 * 60 * 1000; // 24 hours
    this.DESTINATION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.SEARCH_TTL = 30 * 60 * 1000; // 30 minutes

    // Maximum cache sizes
    this.MAX_HOTELS = 10000;
    this.MAX_DESTINATIONS = 1000;
    this.MAX_SEARCHES = 500;
  }

  /**
   * Generate cache key for hotel data
   */
  generateHotelKey(hotelCode) {
    return `hotel:${hotelCode}`;
  }

  /**
   * Generate cache key for destination data
   */
  generateDestinationKey(destinationCode) {
    return `destination:${destinationCode}`;
  }

  /**
   * Generate cache key for search results
   */
  generateSearchKey(searchParams) {
    const { destinationCode, checkIn, checkOut, rooms, adults, children } =
      searchParams;

    return `search:${destinationCode}:${checkIn}:${checkOut}:${rooms}:${adults}:${children}`;
  }

  /**
   * Store hotel data in cache
   */
  setHotel(hotelCode, hotelData) {
    const key = this.generateHotelKey(hotelCode);
    const cacheEntry = {
      data: hotelData,
      timestamp: Date.now(),
      ttl: this.HOTEL_TTL,
    };

    this.cache.set(key, cacheEntry);

    // Cleanup if cache is too large
    if (this.cache.size > this.MAX_HOTELS) {
      this.cleanupCache(this.cache, this.MAX_HOTELS * 0.8);
    }

    return true;
  }

  /**
   * Retrieve hotel data from cache
   */
  getHotel(hotelCode) {
    const key = this.generateHotelKey(hotelCode);
    const cacheEntry = this.cache.get(key);

    if (!cacheEntry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Store destination data in cache
   */
  setDestination(destinationCode, destinationData) {
    const key = this.generateDestinationKey(destinationCode);
    const cacheEntry = {
      data: destinationData,
      timestamp: Date.now(),
      ttl: this.DESTINATION_TTL,
    };

    this.destinationCache.set(key, cacheEntry);

    if (this.destinationCache.size > this.MAX_DESTINATIONS) {
      this.cleanupCache(this.destinationCache, this.MAX_DESTINATIONS * 0.8);
    }

    return true;
  }

  /**
   * Retrieve destination data from cache
   */
  getDestination(destinationCode) {
    const key = this.generateDestinationKey(destinationCode);
    const cacheEntry = this.destinationCache.get(key);

    if (!cacheEntry) {
      return null;
    }

    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.destinationCache.delete(key);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Store search results in cache
   */
  setSearchResults(searchParams, searchResults) {
    const key = this.generateSearchKey(searchParams);
    const cacheEntry = {
      data: searchResults,
      timestamp: Date.now(),
      ttl: this.SEARCH_TTL,
      searchParams: { ...searchParams },
    };

    this.searchCache.set(key, cacheEntry);

    if (this.searchCache.size > this.MAX_SEARCHES) {
      this.cleanupCache(this.searchCache, this.MAX_SEARCHES * 0.8);
    }

    return true;
  }

  /**
   * Retrieve search results from cache
   */
  getSearchResults(searchParams) {
    const key = this.generateSearchKey(searchParams);
    const cacheEntry = this.searchCache.get(key);

    if (!cacheEntry) {
      return null;
    }

    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.searchCache.delete(key);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Store batch of hotels
   */
  setHotelBatch(hotels) {
    let stored = 0;
    for (const hotel of hotels) {
      if (hotel.code) {
        this.setHotel(hotel.code, hotel);
        stored++;
      }
    }
    return stored;
  }

  /**
   * Get batch of hotels
   */
  getHotelBatch(hotelCodes) {
    const hotels = [];
    const missingCodes = [];

    for (const code of hotelCodes) {
      const hotel = this.getHotel(code);
      if (hotel) {
        hotels.push(hotel);
      } else {
        missingCodes.push(code);
      }
    }

    return {
      cached: hotels,
      missing: missingCodes,
    };
  }

  /**
   * Cleanup cache by removing oldest entries
   */
  cleanupCache(cache, targetSize) {
    // Convert cache to array and sort by timestamp
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we reach target size
    const toRemove = entries.length - targetSize;
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0]);
    }
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.cache.clear();
    this.destinationCache.clear();
    this.searchCache.clear();
  }

  /**
   * Clear hotel cache only
   */
  clearHotels() {
    this.cache.clear();
  }

  /**
   * Clear destination cache only
   */
  clearDestinations() {
    this.destinationCache.clear();
  }

  /**
   * Clear search cache only
   */
  clearSearches() {
    this.searchCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();

    // Count valid (non-expired) entries
    let validHotels = 0;
    let validDestinations = 0;
    let validSearches = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp <= entry.ttl) {
        validHotels++;
      }
    }

    for (const [key, entry] of this.destinationCache.entries()) {
      if (now - entry.timestamp <= entry.ttl) {
        validDestinations++;
      }
    }

    for (const [key, entry] of this.searchCache.entries()) {
      if (now - entry.timestamp <= entry.ttl) {
        validSearches++;
      }
    }

    return {
      hotels: {
        total: this.cache.size,
        valid: validHotels,
        maxSize: this.MAX_HOTELS,
        ttl: this.HOTEL_TTL,
      },
      destinations: {
        total: this.destinationCache.size,
        valid: validDestinations,
        maxSize: this.MAX_DESTINATIONS,
        ttl: this.DESTINATION_TTL,
      },
      searches: {
        total: this.searchCache.size,
        valid: validSearches,
        maxSize: this.MAX_SEARCHES,
        ttl: this.SEARCH_TTL,
      },
      totalMemoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage of all caches
   */
  estimateMemoryUsage() {
    let totalSize = 0;

    // Rough estimation based on JSON string length
    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry).length;
    }

    for (const [key, entry] of this.destinationCache.entries()) {
      totalSize += JSON.stringify(entry).length;
    }

    for (const [key, entry] of this.searchCache.entries()) {
      totalSize += JSON.stringify(entry).length;
    }

    return Math.round(totalSize / 1024); // Return in KB
  }

  /**
   * Perform cache maintenance
   * Removes expired entries and optimizes memory usage
   */
  performMaintenance() {
    const now = Date.now();
    let removed = 0;

    // Clean expired hotels
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    // Clean expired destinations
    for (const [key, entry] of this.destinationCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.destinationCache.delete(key);
        removed++;
      }
    }

    // Clean expired searches
    for (const [key, entry] of this.searchCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.searchCache.delete(key);
        removed++;
      }
    }

    return {
      expiredEntriesRemoved: removed,
      remainingEntries:
        this.cache.size + this.destinationCache.size + this.searchCache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }
}

// Create singleton instance
const hotelCache = new HotelCache();

// Schedule periodic maintenance every 30 minutes
setInterval(
  () => {
    const result = hotelCache.performMaintenance();
    console.log("Hotel cache maintenance completed:", result);
  },
  30 * 60 * 1000,
);

module.exports = hotelCache;
