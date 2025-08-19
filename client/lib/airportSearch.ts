import { CityOption } from "@/components/CityAutocomplete";

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Search for airports/cities using the existing API endpoint
 */
export async function searchAirports(query: string): Promise<CityOption[]> {
  if (!query?.trim()) return [];
  
  try {
    const response = await fetch(`${API_BASE}/flights/airports/search?q=${encodeURIComponent(query.trim())}`);
    
    if (!response.ok) {
      console.warn(`Airport search API returned ${response.status}:`, response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    const airports = data.success ? data.data : data;
    
    if (!Array.isArray(airports)) {
      console.warn('Airport search API returned non-array data:', data);
      return [];
    }
    
    // Normalize to CityOption format
    return airports.map((airport: any) => ({
      id: airport.id || airport.code || airport.iataCode,
      code: airport.code || airport.iataCode || airport.id,
      name: airport.name || airport.cityName || airport.airport,
      country: airport.country || airport.countryName,
      type: airport.type || 'airport',
    }));
  } catch (error) {
    console.error('Failed to search airports:', error);
    return [];
  }
}

/**
 * Search for destinations (cities/regions) for hotels using existing hotel service
 */
export async function searchDestinations(query: string): Promise<CityOption[]> {
  if (!query?.trim()) return [];
  
  try {
    // Use the existing hotels service endpoint
    const response = await fetch(`${API_BASE}/hotels/destinations/search?q=${encodeURIComponent(query.trim())}&limit=15`);
    
    if (!response.ok) {
      console.warn(`Destinations search API returned ${response.status}:`, response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    const destinations = data.success ? data.data : data;
    
    if (!Array.isArray(destinations)) {
      console.warn('Destinations search API returned non-array data:', data);
      return [];
    }
    
    // Normalize to CityOption format
    return destinations.map((dest: any) => ({
      id: dest.id || dest.code,
      code: dest.id || dest.code, // Destination code
      name: dest.name || dest.cityName,
      country: dest.country || dest.countryName,
      type: dest.type || 'city',
    }));
  } catch (error) {
    console.error('Failed to search destinations:', error);
    return [];
  }
}

/**
 * Get popular airports for initial display
 */
export function getPopularAirports(): CityOption[] {
  return [
    { id: "BOM", code: "BOM", name: "Mumbai", country: "India", type: "city" },
    { id: "DXB", code: "DXB", name: "Dubai", country: "United Arab Emirates", type: "city" },
    { id: "LON", code: "LON", name: "London", country: "United Kingdom", type: "city" },
    { id: "NYC", code: "NYC", name: "New York", country: "United States", type: "city" },
    { id: "PAR", code: "PAR", name: "Paris", country: "France", type: "city" },
    { id: "BCN", code: "BCN", name: "Barcelona", country: "Spain", type: "city" },
    { id: "ROM", code: "ROM", name: "Rome", country: "Italy", type: "city" },
    { id: "BKK", code: "BKK", name: "Bangkok", country: "Thailand", type: "city" },
    { id: "SIN", code: "SIN", name: "Singapore", country: "Singapore", type: "city" },
    { id: "TKO", code: "TKO", name: "Tokyo", country: "Japan", type: "city" },
    { id: "SYD", code: "SYD", name: "Sydney", country: "Australia", type: "city" },
    { id: "HKG", code: "HKG", name: "Hong Kong", country: "Hong Kong", type: "city" },
  ];
}

/**
 * Combined search that tries airports first, then falls back to popular options
 */
export async function searchAirportsWithFallback(query: string): Promise<CityOption[]> {
  const results = await searchAirports(query);
  
  if (results.length > 0) {
    return results;
  }
  
  // Fallback to popular airports that match the query
  const popular = getPopularAirports();
  return popular.filter(
    airport =>
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.country?.toLowerCase().includes(query.toLowerCase())
  );
}
