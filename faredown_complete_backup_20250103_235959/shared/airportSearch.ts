export type Airport = {
  code: string;
  name: string;
  city?: string;
  country?: string;
};

// Popular airports fallback list
const POPULAR_AIRPORTS: Airport[] = [
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Intl",
    city: "Mumbai",
    country: "India",
  },
  { code: "DEL", name: "Indira Gandhi Intl", city: "Delhi", country: "India" },
  { code: "DXB", name: "Dubai Intl", city: "Dubai", country: "UAE" },
  { code: "LHR", name: "Heathrow", city: "London", country: "UK" },
  {
    code: "JFK",
    name: "John F Kennedy Intl",
    city: "New York",
    country: "USA",
  },
  {
    code: "LAX",
    name: "Los Angeles Intl",
    city: "Los Angeles",
    country: "USA",
  },
  { code: "SIN", name: "Changi", city: "Singapore", country: "Singapore" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "NRT", name: "Narita Intl", city: "Tokyo", country: "Japan" },
  {
    code: "SYD",
    name: "Kingsford Smith",
    city: "Sydney",
    country: "Australia",
  },
  {
    code: "HKG",
    name: "Hong Kong Intl",
    city: "Hong Kong",
    country: "Hong Kong",
  },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany" },
];

export async function searchAirports(query: string): Promise<Airport[]> {
  // If query is empty, return popular airports
  if (!query || query.trim().length === 0) {
    return POPULAR_AIRPORTS;
  }

  const searchTerm = query.trim().toLowerCase();

  try {
    // Try to call the existing backend search API
    const response = await fetch(
      `/api/flights/airports/search?q=${encodeURIComponent(query)}`,
    );

    if (response.ok) {
      const data = await response.json();

      // Normalize the API response to our Airport type
      const airports = (data?.data || data?.results || data || [])
        .map((item: any) => ({
          code: item.code || item.iataCode || item.airportCode || "",
          name: item.name || item.airportName || item.label || "",
          city: item.city || item.cityName || item.municipality || "",
          country: item.country || item.countryName || item.cc || "",
        }))
        .filter((airport: Airport) => airport.code && airport.name);

      return airports.length > 0 ? airports : filterPopularAirports(searchTerm);
    }
  } catch (error) {
    console.warn("Airport search API failed, using fallback:", error);
  }

  // Fallback to filtered popular airports
  return filterPopularAirports(searchTerm);
}

function filterPopularAirports(searchTerm: string): Airport[] {
  return POPULAR_AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city?.toLowerCase().includes(searchTerm) ||
      airport.country?.toLowerCase().includes(searchTerm),
  );
}
