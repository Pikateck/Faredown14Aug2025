// shared/airportSearch.ts
export type Airport = {
  code: string;        // "BOM"
  name: string;        // "Chhatrapati Shivaji Intl"
  city: string;        // "Mumbai"
  country?: string;    // "India"
};

export async function searchAirports(q: string, signal?: AbortSignal): Promise<Airport[]> {
  const query = q.trim();
  if (!query) return [];

  // Try the existing flights API endpoint first
  try {
    const url = `/api/flights/airports/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Airport search failed (${res.status})`);
    const data = await res.json();

    // Normalize to Airport[] - handle the API response format
    const airports = data?.data || data?.results || data || [];
    return airports.map((a: any) => ({
      code: a.code ?? a.iataCode ?? a.airportCode ?? "",
      name: a.name ?? a.airportName ?? a.label ?? "",
      city: a.city ?? a.cityName ?? a.municipality ?? "",
      country: a.country ?? a.countryName ?? a.cc ?? "",
    })).filter((a: Airport) => a.code && (a.city || a.name));
  } catch (error) {
    // Fallback to popular airports if API fails
    console.warn('Airport API failed, using fallback airports:', error);
    return getPopularAirports().filter(airport => 
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Fallback popular airports
function getPopularAirports(): Airport[] {
  return [
    { code: "BOM", name: "Chhatrapati Shivaji Intl", city: "Mumbai", country: "India" },
    { code: "DEL", name: "Indira Gandhi Intl", city: "Delhi", country: "India" },
    { code: "DXB", name: "Dubai Intl", city: "Dubai", country: "UAE" },
    { code: "LHR", name: "Heathrow", city: "London", country: "UK" },
    { code: "JFK", name: "John F Kennedy Intl", city: "New York", country: "USA" },
    { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "USA" },
    { code: "SIN", name: "Changi", city: "Singapore", country: "Singapore" },
    { code: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "Hong Kong" },
    { code: "NRT", name: "Narita Intl", city: "Tokyo", country: "Japan" },
    { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
    { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany" },
    { code: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia" },
  ];
}
