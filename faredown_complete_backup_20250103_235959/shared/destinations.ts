/**
 * Master destinations data for Faredown
 * Based on popular Hotelbeds destinations and travel hubs
 */

export interface DestinationData {
  id: string;
  code: string;
  name: string;
  country: string;
  countryCode: string;
  type: "city" | "region" | "island" | "district";
  zone?: string;
  popular: boolean;
  imageUrl?: string;
}

export const MASTER_DESTINATIONS: DestinationData[] = [
  // United Arab Emirates
  {
    id: "DXB",
    code: "DXB",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    type: "city",
    popular: true,
  },
  {
    id: "AUH",
    code: "AUH",
    name: "Abu Dhabi",
    country: "United Arab Emirates",
    countryCode: "AE",
    type: "city",
    popular: true,
  },
  {
    id: "SHJ",
    code: "SHJ",
    name: "Sharjah",
    country: "United Arab Emirates",
    countryCode: "AE",
    type: "city",
    popular: false,
  },

  // Spain
  {
    id: "BCN",
    code: "BCN",
    name: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    type: "city",
    popular: true,
  },
  {
    id: "MAD",
    code: "MAD",
    name: "Madrid",
    country: "Spain",
    countryCode: "ES",
    type: "city",
    popular: true,
  },
  {
    id: "PMI",
    code: "PMI",
    name: "Palma",
    country: "Spain",
    countryCode: "ES",
    type: "island",
    popular: true,
  },
  {
    id: "SVQ",
    code: "SVQ",
    name: "Seville",
    country: "Spain",
    countryCode: "ES",
    type: "city",
    popular: true,
  },
  {
    id: "AGP",
    code: "AGP",
    name: "Malaga",
    country: "Spain",
    countryCode: "ES",
    type: "city",
    popular: true,
  },
  {
    id: "VLC",
    code: "VLC",
    name: "Valencia",
    country: "Spain",
    countryCode: "ES",
    type: "city",
    popular: true,
  },
  {
    id: "IBZ",
    code: "IBZ",
    name: "Ibiza",
    country: "Spain",
    countryCode: "ES",
    type: "island",
    popular: true,
  },

  // United Kingdom
  {
    id: "LON",
    code: "LON",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    type: "city",
    popular: true,
  },
  {
    id: "EDI",
    code: "EDI",
    name: "Edinburgh",
    country: "United Kingdom",
    countryCode: "GB",
    type: "city",
    popular: true,
  },
  {
    id: "MAN",
    code: "MAN",
    name: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
    type: "city",
    popular: false,
  },

  // France
  {
    id: "PAR",
    code: "PAR",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    type: "city",
    popular: true,
  },
  {
    id: "NCE",
    code: "NCE",
    name: "Nice",
    country: "France",
    countryCode: "FR",
    type: "city",
    popular: true,
  },
  {
    id: "LYS",
    code: "LYS",
    name: "Lyon",
    country: "France",
    countryCode: "FR",
    type: "city",
    popular: false,
  },

  // Italy
  {
    id: "ROM",
    code: "ROM",
    name: "Rome",
    country: "Italy",
    countryCode: "IT",
    type: "city",
    popular: true,
  },
  {
    id: "MIL",
    code: "MIL",
    name: "Milan",
    country: "Italy",
    countryCode: "IT",
    type: "city",
    popular: true,
  },
  {
    id: "VEN",
    code: "VEN",
    name: "Venice",
    country: "Italy",
    countryCode: "IT",
    type: "city",
    popular: true,
  },
  {
    id: "FLR",
    code: "FLR",
    name: "Florence",
    country: "Italy",
    countryCode: "IT",
    type: "city",
    popular: true,
  },

  // Germany
  {
    id: "BER",
    code: "BER",
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    type: "city",
    popular: true,
  },
  {
    id: "MUC",
    code: "MUC",
    name: "Munich",
    country: "Germany",
    countryCode: "DE",
    type: "city",
    popular: true,
  },
  {
    id: "FRA",
    code: "FRA",
    name: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    type: "city",
    popular: false,
  },

  // United States
  {
    id: "NYC",
    code: "NYC",
    name: "New York",
    country: "United States",
    countryCode: "US",
    type: "city",
    popular: true,
  },
  {
    id: "LAX",
    code: "LAX",
    name: "Los Angeles",
    country: "United States",
    countryCode: "US",
    type: "city",
    popular: true,
  },
  {
    id: "MIA",
    code: "MIA",
    name: "Miami",
    country: "United States",
    countryCode: "US",
    type: "city",
    popular: true,
  },
  {
    id: "LAS",
    code: "LAS",
    name: "Las Vegas",
    country: "United States",
    countryCode: "US",
    type: "city",
    popular: true,
  },

  // India
  {
    id: "BOM",
    code: "BOM",
    name: "Mumbai",
    country: "India",
    countryCode: "IN",
    type: "city",
    popular: true,
  },
  {
    id: "DEL",
    code: "DEL",
    name: "Delhi",
    country: "India",
    countryCode: "IN",
    type: "city",
    popular: true,
  },
  {
    id: "BLR",
    code: "BLR",
    name: "Bangalore",
    country: "India",
    countryCode: "IN",
    type: "city",
    popular: true,
  },
  {
    id: "GOI",
    code: "GOI",
    name: "Goa",
    country: "India",
    countryCode: "IN",
    type: "region",
    popular: true,
  },

  // Thailand
  {
    id: "BKK",
    code: "BKK",
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    type: "city",
    popular: true,
  },
  {
    id: "HKT",
    code: "HKT",
    name: "Phuket",
    country: "Thailand",
    countryCode: "TH",
    type: "island",
    popular: true,
  },
  {
    id: "CNX",
    code: "CNX",
    name: "Chiang Mai",
    country: "Thailand",
    countryCode: "TH",
    type: "city",
    popular: true,
  },

  // Singapore
  {
    id: "SIN",
    code: "SIN",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    type: "city",
    popular: true,
  },

  // Japan
  {
    id: "TYO",
    code: "TYO",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    type: "city",
    popular: true,
  },
  {
    id: "OSA",
    code: "OSA",
    name: "Osaka",
    country: "Japan",
    countryCode: "JP",
    type: "city",
    popular: true,
  },
  {
    id: "KYO",
    code: "KYO",
    name: "Kyoto",
    country: "Japan",
    countryCode: "JP",
    type: "city",
    popular: true,
  },

  // Australia
  {
    id: "SYD",
    code: "SYD",
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    type: "city",
    popular: true,
  },
  {
    id: "MEL",
    code: "MEL",
    name: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    type: "city",
    popular: true,
  },

  // Greece
  {
    id: "ATH",
    code: "ATH",
    name: "Athens",
    country: "Greece",
    countryCode: "GR",
    type: "city",
    popular: true,
  },
  {
    id: "JMK",
    code: "JMK",
    name: "Mykonos",
    country: "Greece",
    countryCode: "GR",
    type: "island",
    popular: true,
  },
  {
    id: "JTR",
    code: "JTR",
    name: "Santorini",
    country: "Greece",
    countryCode: "GR",
    type: "island",
    popular: true,
  },

  // Turkey
  {
    id: "IST",
    code: "IST",
    name: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    type: "city",
    popular: true,
  },
  {
    id: "AYT",
    code: "AYT",
    name: "Antalya",
    country: "Turkey",
    countryCode: "TR",
    type: "city",
    popular: true,
  },
];

export const getPopularDestinations = (): DestinationData[] => {
  return MASTER_DESTINATIONS.filter((dest) => dest.popular);
};

export const searchDestinations = (query: string): DestinationData[] => {
  const searchTerm = query.toLowerCase();
  return MASTER_DESTINATIONS.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm) ||
      dest.country.toLowerCase().includes(searchTerm) ||
      dest.code.toLowerCase().includes(searchTerm),
  );
};

export const getDestinationByCode = (
  code: string,
): DestinationData | undefined => {
  return MASTER_DESTINATIONS.find((dest) => dest.code === code);
};
