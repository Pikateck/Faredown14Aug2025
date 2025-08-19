import { CityOption } from "@/components/CityAutocomplete";

export interface FlightSearchParams {
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  cabinClass: string;
  tripType: string;
}

/**
 * Build flight search URL with selected airports
 */
export function buildFlightSearchUrl(
  fromAirport: CityOption | null,
  toAirport: CityOption | null,
  departureDate: Date | null,
  returnDate: Date | null,
  travelers: { adults: number; children: number },
  selectedClass: string,
  tripType: string
): string {
  if (!fromAirport || !toAirport || !departureDate) {
    throw new Error("Missing required flight search parameters");
  }

  const params = new URLSearchParams({
    departure: fromAirport.code,
    arrival: toAirport.code,
    departureDate: departureDate.toISOString().split('T')[0],
    adults: travelers.adults.toString(),
    children: travelers.children.toString(),
    cabinClass: selectedClass.toLowerCase().replace(' ', '_'),
    tripType: tripType.replace('-', '_'),
  });

  if (returnDate && tripType === "round-trip") {
    params.set("returnDate", returnDate.toISOString().split('T')[0]);
  }

  return `/flights/results?${params.toString()}`;
}

/**
 * Validate flight search parameters
 */
export function validateFlightSearch(
  fromAirport: CityOption | null,
  toAirport: CityOption | null,
  departureDate: Date | null,
  returnDate: Date | null,
  tripType: string
): string | null {
  if (!fromAirport) {
    return "Please select a departure airport";
  }

  if (!toAirport) {
    return "Please select an arrival airport";
  }

  if (fromAirport.code === toAirport.code) {
    return "Departure and arrival airports cannot be the same";
  }

  if (!departureDate) {
    return "Please select a departure date";
  }

  if (departureDate < new Date()) {
    return "Departure date cannot be in the past";
  }

  if (tripType === "round-trip") {
    if (!returnDate) {
      return "Please select a return date for round trip";
    }

    if (returnDate <= departureDate) {
      return "Return date must be after departure date";
    }
  }

  return null;
}
